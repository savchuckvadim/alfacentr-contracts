'use client';

import { useAppDispatch, useAppSelector } from '@/modules/app/';
import {
    AlfaParticipantSmartItemUserFieldsEnum,
    IPpkEvent,
    isPpkEventDatesValid,
    serializePpkEvents,
} from '@alfa/entities';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { updateParticipantFields } from '@/modules/entities/participant/model/ParticipantThunk';
import { applyParticipantFields } from '@/modules/entities/participant/model/ParticipantSlice';
import { withPpkContractTypeSelector } from '@/modules/features/contract-type';
import {
    buildPpkApplicationRows,
    IPpkApplicationRow,
    PPK_CONTACT_BITRIX_ID,
    TPpkContactField,
} from '@/modules/entities/participant/lib/ppk-application-rows';
import { normalizeParticipantFields } from '@/modules/entities/participant/lib/normalize-participant-fields';

/** Сколько держать отметку «записано», прежде чем убрать её из строки */
const SAVED_BADGE_MS = 2500;

export type TPpkRowSaveState = 'idle' | 'saving' | 'saved' | 'error';

type TPendingEdits = Record<string, Partial<IPpkApplicationRow>>;

const dateKey = (participantId: number, topic: string) =>
    `${participantId}|${topic}`;
const contactKey = (participantId: number) => `contacts|${participantId}`;

const ROW_FIELDS: (keyof IPpkApplicationRow)[] = [
    'fio',
    'email',
    'phone',
    'dateFrom',
    'dateTo',
];

/**
 * Приложение ППК в табе и на главном: то же, что менеджер видит перед
 * отправкой, но правки уходят в CRM по кнопке в строке, а не по кнопке
 * подтверждения. Смысл — готовить даты заранее, не открывая окно отправки.
 *
 * Запись явная, а не по таймеру после набора: у менеджера должен быть виден
 * признак «не сохранено», запись не должна стартовать посреди набора, а
 * ответ CRM не должен стирать то, что набрали, пока запрос летел.
 *
 * Окно подтверждения живёт своей жизнью и здесь не участвует: там правки
 * намеренно держатся локально до отправки.
 */
export const usePpkApplicationLive = () => {
    const dispatch = useAppDispatch();
    const participants = useAppSelector(state => state.participant.items);
    const ppkDistribution = useAppSelector(
        state => state.participantProduct.ppkDistribution,
    );
    const isPpkContract = useAppSelector(withPpkContractTypeSelector);
    const isLoading = useAppSelector(
        state => state.participant.loading || state.product.loading,
    );

    /**
     * Сборка строк не должна ронять страницу: поля участника приходят из
     * портала и бывают неожиданной формы. Если разбор упал — виджет просто
     * не покажется, а причина уйдёт в консоль.
     */
    const { rows: storedRows, orphanedTopics, buildError } = useMemo(() => {
        if (!isPpkContract) {
            return { rows: [], orphanedTopics: [], buildError: null };
        }
        try {
            const built = buildPpkApplicationRows(
                participants || [],
                ppkDistribution || {},
            );
            return { ...built, buildError: null };
        } catch (error) {
            const message =
                error instanceof Error ? error.message : String(error);
            console.error('Приложение ППК: не удалось собрать строки', error);
            return { rows: [], orphanedTopics: [], buildError: message };
        }
    }, [isPpkContract, participants, ppkDistribution]);

    /**
     * Набранное лежит поверх сохранённого, пока участника не запишут.
     * Контакты участника — под одним ключом, даты каждой пары — под своим.
     */
    const [pending, setPending] = useState<TPendingEdits>({});
    const [saveState, setSaveState] = useState<
        Record<number, TPpkRowSaveState>
    >({});
    const [saveErrors, setSaveErrors] = useState<Record<number, string>>({});

    const savedTimers = useRef<Record<number, ReturnType<typeof setTimeout>>>(
        {},
    );
    const inFlight = useRef<Set<number>>(new Set());

    useEffect(
        () => () => {
            for (const timer of Object.values(savedTimers.current)) {
                clearTimeout(timer);
            }
        },
        [],
    );

    const rows = useMemo(
        () =>
            storedRows.map(row => ({
                ...row,
                ...(pending[dateKey(row.participantId, row.topic)] || {}),
                ...(pending[contactKey(row.participantId)] || {}),
            })),
        [storedRows, pending],
    );

    //запись читает строки в момент нажатия, а не те, что были при создании
    //колбэка — иначе после смены строк ушли бы устаревшие значения
    const rowsRef = useRef(rows);
    rowsRef.current = rows;

    /**
     * «Не сохранено» — по факту расхождения с CRM, а не по факту нажатия
     * клавиши: если менеджер вернул прежнее значение, сохранять нечего.
     */
    const dirtyParticipantIds = useMemo(() => {
        const storedByKey = new Map<string, IPpkApplicationRow>();
        for (const row of storedRows) {
            storedByKey.set(dateKey(row.participantId, row.topic), row);
        }
        const dirty = new Set<number>();
        for (const row of rows) {
            const stored = storedByKey.get(
                dateKey(row.participantId, row.topic),
            );
            if (!stored) continue;
            if (ROW_FIELDS.some(field => row[field] !== stored[field])) {
                dirty.add(row.participantId);
            }
        }
        return dirty;
    }, [rows, storedRows]);

    const isSavingAny = useMemo(
        () => Object.values(saveState).some(state => state === 'saving'),
        [saveState],
    );

    /**
     * Пишет участника целиком: даты всех его программ лежат в одном служебном
     * поле, а контакты — в личных полях, и всё это уходит одним запросом.
     *
     * Снимок отправленного нужен, чтобы после ответа CRM убрать из
     * несохранённого только то, что действительно ушло. Набранное за время
     * запроса остаётся «не сохранённым», и кнопка появляется снова.
     */
    const save = useCallback(
        async (participantId: number) => {
            if (inFlight.current.has(participantId)) return;

            const own = rowsRef.current.filter(
                row => row.participantId === participantId,
            );
            const first = own[0];
            //строк по участнику уже нет — например, программу убрали
            if (!first) return;

            const snapshot: TPendingEdits = {
                [contactKey(participantId)]: {
                    fio: first.fio,
                    email: first.email,
                    phone: first.phone,
                },
            };
            for (const row of own) {
                snapshot[dateKey(participantId, row.topic)] = {
                    dateFrom: row.dateFrom,
                    dateTo: row.dateTo,
                };
            }

            const events: IPpkEvent[] = own.map(row => ({
                topic: row.topic,
                dateFrom: row.dateFrom,
                dateTo: row.dateTo,
            }));

            //email и телефон чистим здесь же, а не только внутри записи:
            //в стор должно лечь то же, что ушло в CRM — из стора собираются
            //документы
            const fields = normalizeParticipantFields({
                [AlfaParticipantSmartItemUserFieldsEnum.ufCrm12PpkEvents]:
                    serializePpkEvents(events),
                [PPK_CONTACT_BITRIX_ID.fio]: first.fio,
                [PPK_CONTACT_BITRIX_ID.email]: first.email,
                [PPK_CONTACT_BITRIX_ID.phone]: first.phone,
            } as Record<string, string>);

            inFlight.current.add(participantId);
            clearTimeout(savedTimers.current[participantId]);
            setSaveState(prev => ({ ...prev, [participantId]: 'saving' }));
            setSaveErrors(prev => {
                if (!(participantId in prev)) return prev;
                const next = { ...prev };
                delete next[participantId];
                return next;
            });

            try {
                await dispatch(
                    updateParticipantFields({ participantId, fields }),
                ).unwrap();

                //документы собираются из состояния, поэтому сразу применяем
                //записанное — иначе в приложение уйдут прежние даты
                dispatch(applyParticipantFields({ participantId, fields }));

                setPending(prev => {
                    const next = { ...prev };
                    for (const [key, sent] of Object.entries(snapshot)) {
                        const current = next[key];
                        if (!current) continue;
                        const unchangedSinceSend = (
                            Object.entries(sent) as [
                                keyof IPpkApplicationRow,
                                string,
                            ][]
                        ).every(
                            ([field, value]) =>
                                current[field] === undefined ||
                                current[field] === value,
                        );
                        if (unchangedSinceSend) delete next[key];
                    }
                    return next;
                });

                setSaveState(prev => ({ ...prev, [participantId]: 'saved' }));
                savedTimers.current[participantId] = setTimeout(() => {
                    setSaveState(prev =>
                        prev[participantId] === 'saved'
                            ? { ...prev, [participantId]: 'idle' }
                            : prev,
                    );
                }, SAVED_BADGE_MS);
            } catch (error) {
                //правку не выбрасываем: она остаётся в поле, и её можно
                //отправить повторно кнопкой
                const message =
                    typeof error === 'string'
                        ? error
                        : error instanceof Error
                          ? error.message
                          : 'Не удалось записать в CRM';
                console.error(
                    'Приложение ППК: не удалось сохранить участника ' +
                        String(participantId),
                    error,
                );
                setSaveErrors(prev => ({ ...prev, [participantId]: message }));
                setSaveState(prev => ({ ...prev, [participantId]: 'error' }));
            } finally {
                inFlight.current.delete(participantId);
            }
        },
        [dispatch],
    );

    const saveAll = useCallback(
        () => Promise.all([...dirtyParticipantIds].map(id => save(id))),
        [dirtyParticipantIds, save],
    );

    /** Откатывает несохранённые правки участника к тому, что лежит в CRM */
    const discard = useCallback((participantId: number) => {
        setPending(prev => {
            const next: TPendingEdits = {};
            const contact = contactKey(participantId);
            const datePrefix = `${participantId}|`;
            for (const [key, value] of Object.entries(prev)) {
                if (key === contact || key.startsWith(datePrefix)) continue;
                next[key] = value;
            }
            return next;
        });
        setSaveState(prev =>
            prev[participantId] === 'error'
                ? { ...prev, [participantId]: 'idle' }
                : prev,
        );
    }, []);

    const setRowDates = useCallback(
        (row: IPpkApplicationRow, dateFrom: string, dateTo: string) => {
            setPending(prev => ({
                ...prev,
                [dateKey(row.participantId, row.topic)]: { dateFrom, dateTo },
            }));
        },
        [],
    );

    const setContact = useCallback(
        (participantId: number, field: TPpkContactField, value: string) => {
            setPending(prev => ({
                ...prev,
                [contactKey(participantId)]: {
                    ...prev[contactKey(participantId)],
                    [field]: value,
                },
            }));
        },
        [],
    );

    const isRowDatesInvalid = useCallback(
        (row: IPpkApplicationRow) =>
            !isPpkEventDatesValid({
                topic: row.topic,
                dateFrom: row.dateFrom,
                dateTo: row.dateTo,
            }),
        [],
    );

    /** Обязательно только ФИО: без него строка документа бессмысленна */
    const isFioMissing = useCallback(
        (row: IPpkApplicationRow) => !String(row.fio ?? '').trim(),
        [],
    );

    const notReadyCount = useMemo(
        () =>
            rows.filter(row => isRowDatesInvalid(row) || isFioMissing(row))
                .length,
        [rows, isRowDatesInvalid, isFioMissing],
    );

    return {
        isPpkContract,
        isLoading,
        /**
         * Виджет показываем, только когда есть что показывать: нет
         * участников или ни у кого нет программ ППК — строк не будет.
         */
        hasRows: rows.length > 0,
        rows,
        orphanedTopics,
        buildError,
        notReadyCount,
        saveState,
        saveErrors,
        dirtyParticipantIds,
        dirtyCount: dirtyParticipantIds.size,
        isSavingAny,
        setRowDates,
        setContact,
        save,
        saveAll,
        discard,
        isRowDatesInvalid,
        isFioMissing,
    };
};

export type TPpkApplicationLive = ReturnType<typeof usePpkApplicationLive>;
