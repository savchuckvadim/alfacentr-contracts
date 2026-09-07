'use client';

import { useAppDispatch, useAppSelector } from '@/modules/app/';
import {
    AlfaParticipantSmartItemUserFieldsEnum,
    EContractType,
    IParticipant,
    IPpkEvent,
    isPpkEventDatesValid,
    mergePpkEventsWithTopics,
    parsePpkEvents,
    serializePpkEvents,
} from '@alfa/entities';
import { useCallback, useMemo, useState } from 'react';
import { updateParticipantFields } from '@/modules/entities/participant/model/ParticipantThunk';
import { applyParticipantFields } from '@/modules/entities/participant/model/ParticipantSlice';

export interface PpkConfirmRow {
    participantId: number;
    topic: string;
    fio: string;
    email: string;
    phone: string;
    dateFrom: string;
    dateTo: string;
}

type ContactField = 'fio' | 'email' | 'phone';

const CONTACT_BITRIX_ID: Record<
    ContactField,
    AlfaParticipantSmartItemUserFieldsEnum
> = {
    fio: AlfaParticipantSmartItemUserFieldsEnum.ufCrm12Name,
    email: AlfaParticipantSmartItemUserFieldsEnum.ufCrm12Email,
    phone: AlfaParticipantSmartItemUserFieldsEnum.ufCrm12Phone,
};

const getFieldValue = (
    participant: IParticipant,
    bitrixId: AlfaParticipantSmartItemUserFieldsEnum,
): string => {
    const field = participant.fields.find(f => f.bitrixId === bitrixId);
    return (field?.value as string) || '';
};

/**
 * Данные приложения ППК для модалки перед отправкой: пары «участник —
 * программа» с личными датами обучения и контактами участника.
 *
 * Правки живут в локальном состоянии, пока менеджер не подтвердит отправку:
 * так закрытая модалка не оставляет недописанных значений в CRM.
 */
export const usePpkApplicationConfirm = () => {
    const dispatch = useAppDispatch();
    const participants = useAppSelector(state => state.participant.items);
    const ppkDistribution = useAppSelector(
        state => state.participantProduct.ppkDistribution,
    );
    const contractType = useAppSelector(
        state => state.contractType.current?.code,
    );

    //несохраненные правки: ключ пары «участникId|программа» и контакты участника
    const [dateEdits, setDateEdits] = useState<
        Record<string, { dateFrom: string; dateTo: string }>
    >({});
    const [contactEdits, setContactEdits] = useState<
        Record<number, Partial<Record<ContactField, string>>>
    >({});

    const isPpkContract =
        contractType === EContractType.ppk ||
        contractType === EContractType.seminar_ppk;

    const { rows, orphanedTopics } = useMemo(() => {
        if (!isPpkContract) return { rows: [], orphanedTopics: [] };

        //какие программы у какого участника — берем из готового распределения
        const topicsByParticipant = new Map<number, string[]>();
        for (const stat of Object.values(ppkDistribution.topicStats || {})) {
            for (const participant of stat.participants || []) {
                const list = topicsByParticipant.get(participant.id) || [];
                list.push(stat.topic);
                topicsByParticipant.set(participant.id, list);
            }
        }

        const result: PpkConfirmRow[] = [];
        const orphaned = new Set<string>();

        for (const participant of participants) {
            const topics = topicsByParticipant.get(participant.id) || [];
            if (!topics.length) continue;

            const saved = parsePpkEvents(
                getFieldValue(
                    participant,
                    AlfaParticipantSmartItemUserFieldsEnum.ufCrm12PpkEvents,
                ),
            );
            const merged = mergePpkEventsWithTopics(saved, topics);
            for (const orphan of merged.orphanedEvents) {
                orphaned.add(orphan.topic);
            }

            const contacts = contactEdits[participant.id] || {};

            for (const event of merged.events) {
                const key = `${participant.id}|${event.topic}`;
                const edit = dateEdits[key];

                result.push({
                    participantId: participant.id,
                    topic: event.topic,
                    fio:
                        contacts.fio ??
                        getFieldValue(
                            participant,
                            CONTACT_BITRIX_ID.fio,
                        ),
                    email:
                        contacts.email ??
                        getFieldValue(participant, CONTACT_BITRIX_ID.email),
                    phone:
                        contacts.phone ??
                        getFieldValue(participant, CONTACT_BITRIX_ID.phone),
                    dateFrom: edit?.dateFrom ?? event.dateFrom,
                    dateTo: edit?.dateTo ?? event.dateTo,
                });
            }
        }

        return { rows: result, orphanedTopics: [...orphaned] };
    }, [
        isPpkContract,
        participants,
        ppkDistribution,
        dateEdits,
        contactEdits,
    ]);

    const setEventDate = useCallback(
        (row: PpkConfirmRow, dateFrom: string, dateTo: string) => {
            setDateEdits(prev => ({
                ...prev,
                [`${row.participantId}|${row.topic}`]: { dateFrom, dateTo },
            }));
        },
        [],
    );

    const setParticipantContact = useCallback(
        (participantId: number, field: ContactField, value: string) => {
            setContactEdits(prev => ({
                ...prev,
                [participantId]: { ...prev[participantId], [field]: value },
            }));
        },
        [],
    );

    const isRowDatesInvalid = useCallback(
        (row: PpkConfirmRow) =>
            !isPpkEventDatesValid({
                topic: row.topic,
                dateFrom: row.dateFrom,
                dateTo: row.dateTo,
            }),
        [],
    );

    const isContactInvalid = useCallback(
        (row: PpkConfirmRow, field: ContactField) =>
            !(row[field] || '').trim(),
        [],
    );

    /** Всё ли заполнено — по этому блокируется отправка */
    const isReady = useMemo(() => {
        if (!isPpkContract || !rows.length) return true;

        return rows.every(
            row =>
                !isRowDatesInvalid(row) &&
                (row.fio || '').trim() &&
                (row.email || '').trim() &&
                (row.phone || '').trim(),
        );
    }, [isPpkContract, rows, isRowDatesInvalid]);

    /** Пишет правки в смарт-элементы участников: один запрос на участника */
    const saveEdits = useCallback(async () => {
        if (!isPpkContract || !rows.length) return;

        const byParticipant = new Map<number, PpkConfirmRow[]>();
        for (const row of rows) {
            const list = byParticipant.get(row.participantId) || [];
            list.push(row);
            byParticipant.set(row.participantId, list);
        }

        for (const [participantId, participantRows] of byParticipant) {
            const participant = participants.find(p => p.id === participantId);
            if (!participant) continue;

            const events: IPpkEvent[] = participantRows.map(row => ({
                topic: row.topic,
                dateFrom: row.dateFrom,
                dateTo: row.dateTo,
            }));

            const first = participantRows[0];
            if (!first) continue;
            const fields: Record<string, string> = {
                [AlfaParticipantSmartItemUserFieldsEnum.ufCrm12PpkEvents]:
                    serializePpkEvents(events),
                [CONTACT_BITRIX_ID.fio]: first.fio,
                [CONTACT_BITRIX_ID.email]: first.email,
                [CONTACT_BITRIX_ID.phone]: first.phone,
            };

            await dispatch(
                updateParticipantFields({ participantId, fields }),
            ).unwrap();

            //документы собираются из состояния, поэтому сразу применяем
            //записанное — иначе в приложение уйдут прежние даты
            dispatch(applyParticipantFields({ participantId, fields }));
        }
    }, [dispatch, isPpkContract, participants, rows]);

    return {
        isPpkContract,
        rows,
        orphanedTopics,
        isReady,
        setEventDate,
        setParticipantContact,
        isRowDatesInvalid,
        isContactInvalid,
        saveEdits,
    };
};
