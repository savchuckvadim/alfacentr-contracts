'use client';

import { useAppDispatch, useAppSelector } from '@/modules/app/';
import {
    AlfaParticipantSmartItemUserFieldsEnum,
    EContractType,
    IPpkEvent,
    isPpkEventDatesValid,
    serializePpkEvents,
} from '@alfa/entities';
import {
    buildPpkApplicationRows,
    IPpkApplicationRow,
    PPK_CONTACT_BITRIX_ID,
    TPpkContactField,
} from '@/modules/entities/participant/lib/ppk-application-rows';
import { useCallback, useMemo, useState } from 'react';
import { updateParticipantFields } from '@/modules/entities/participant/model/ParticipantThunk';
import { applyParticipantFields } from '@/modules/entities/participant/model/ParticipantSlice';

/** Строка приложения ППК — та же, что в табе «Приложение ППК» */
export type PpkConfirmRow = IPpkApplicationRow;

type ContactField = TPpkContactField;

const CONTACT_BITRIX_ID = PPK_CONTACT_BITRIX_ID;

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

        //сборка пар «участник — программа» общая с табом «Приложение ППК»,
        //здесь поверх неё лежат несохраненные правки окна
        const built = buildPpkApplicationRows(participants, ppkDistribution);

        const result: PpkConfirmRow[] = built.rows.map(row => {
            const contacts = contactEdits[row.participantId] || {};
            const edit = dateEdits[`${row.participantId}|${row.topic}`];

            return {
                ...row,
                fio: contacts.fio ?? row.fio,
                email: contacts.email ?? row.email,
                phone: contacts.phone ?? row.phone,
                dateFrom: edit?.dateFrom ?? row.dateFrom,
                dateTo: edit?.dateTo ?? row.dateTo,
            };
        });

        return { rows: result, orphanedTopics: built.orphanedTopics };
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

    /**
     * Обязательно только ФИО: без него строка документа бессмысленна.
     * Почта и телефон — свободные строки, их допустимо оставить пустыми,
     * отправку они не блокируют и красным не подсвечиваются
     */
    const isContactInvalid = useCallback(
        (row: PpkConfirmRow, field: ContactField) =>
            field === 'fio' && !String(row[field] ?? '').trim(),
        [],
    );

    /** Всё ли заполнено — по этому блокируется отправка */
    const isReady = useMemo(() => {
        if (!isPpkContract || !rows.length) return true;

        return rows.every(
            row => !isRowDatesInvalid(row) && !!String(row.fio ?? '').trim(),
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
