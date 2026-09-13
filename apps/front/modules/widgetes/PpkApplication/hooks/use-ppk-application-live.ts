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

/** Через сколько после последнего нажатия писать в CRM */
const SAVE_DELAY_MS = 700;

export type TPpkRowSaveState = 'idle' | 'saving' | 'saved' | 'error';

/**
 * Приложение ППК в отдельном табе: то же, что менеджер видит перед отправкой,
 * но правки уходят в CRM сразу, а не по кнопке подтверждения. Смысл таба —
 * готовить даты заранее, не открывая окно отправки.
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
     * портала и бывают неожиданной формы. Если разбор упал — таб просто
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
     * Пока запрос в CRM летит, в поле должно оставаться то, что набрали.
     * Держим введённое поверх сохранённого и снимаем после успешной записи.
     */
    const [pending, setPending] = useState<
        Record<string, Partial<IPpkApplicationRow>>
    >({});
    const [saveState, setSaveState] = useState<
        Record<number, TPpkRowSaveState>
    >({});
    const timers = useRef<Record<number, ReturnType<typeof setTimeout>>>({});

    useEffect(
        () => () => {
            for (const timer of Object.values(timers.current)) {
                clearTimeout(timer);
            }
        },
        [],
    );

    const rowKey = (participantId: number, topic: string) =>
        `${participantId}|${topic}`;

    const rows = useMemo(
        () =>
            storedRows.map(row => ({
                ...row,
                ...(pending[rowKey(row.participantId, row.topic)] || {}),
                ...(pending[`contacts|${row.participantId}`] || {}),
            })),
        [storedRows, pending],
    );

    /**
     * Даты всех программ участника лежат в одном служебном поле, поэтому
     * пишем их вместе — берём актуальные строки этого участника целиком.
     */
    const scheduleSave = useCallback(
        (participantId: number) => {
            clearTimeout(timers.current[participantId]);
            timers.current[participantId] = setTimeout(() => {
                void (async () => {
                    setSaveState(prev => ({
                        ...prev,
                        [participantId]: 'saving',
                    }));

                    const own = rows.filter(
                        row => row.participantId === participantId,
                    );
                    const first = own[0];
                    if (!first) {
                        //строк по участнику уже нет — например, программу
                        //убрали, пока правка ждала отправки
                        setSaveState(prev => ({
                            ...prev,
                            [participantId]: 'idle',
                        }));
                        return;
                    }

                    const events: IPpkEvent[] = own.map(row => ({
                        topic: row.topic,
                        dateFrom: row.dateFrom,
                        dateTo: row.dateTo,
                    }));

                    //email и телефон чистим здесь же, а не только внутри
                    //записи: в стор должно лечь то же, что ушло в CRM —
                    //из стора собираются документы
                    const fields = normalizeParticipantFields({
                        [AlfaParticipantSmartItemUserFieldsEnum.ufCrm12PpkEvents]:
                            serializePpkEvents(events),
                        [PPK_CONTACT_BITRIX_ID.fio]: first.fio,
                        [PPK_CONTACT_BITRIX_ID.email]: first.email,
                        [PPK_CONTACT_BITRIX_ID.phone]: first.phone,
                    } as Record<string, string>);

                    try {
                        await dispatch(
                            updateParticipantFields({ participantId, fields }),
                        ).unwrap();

                        //документы собираются из состояния, поэтому сразу
                        //применяем записанное — иначе в приложение уйдут
                        //прежние даты
                        dispatch(
                            applyParticipantFields({ participantId, fields }),
                        );

                        setPending(prev => {
                            const next = { ...prev };
                            delete next[`contacts|${participantId}`];
                            for (const row of own) {
                                delete next[
                                    rowKey(participantId, row.topic)
                                ];
                            }
                            return next;
                        });
                        setSaveState(prev => ({
                            ...prev,
                            [participantId]: 'saved',
                        }));
                    } catch (error) {
                        //правку не выбрасываем: она остаётся в поле, и её
                        //можно отправить повторно кнопкой
                        console.error(
                            'Приложение ППК: не удалось сохранить участника ' +
                                String(participantId),
                            error,
                        );
                        setSaveState(prev => ({
                            ...prev,
                            [participantId]: 'error',
                        }));
                    }
                })();
            }, SAVE_DELAY_MS);
        },
        [dispatch, rows],
    );

    const setRowDates = useCallback(
        (row: IPpkApplicationRow, dateFrom: string, dateTo: string) => {
            setPending(prev => ({
                ...prev,
                [rowKey(row.participantId, row.topic)]: { dateFrom, dateTo },
            }));
            scheduleSave(row.participantId);
        },
        [scheduleSave],
    );

    const setContact = useCallback(
        (participantId: number, field: TPpkContactField, value: string) => {
            setPending(prev => ({
                ...prev,
                [`contacts|${participantId}`]: {
                    ...prev[`contacts|${participantId}`],
                    [field]: value,
                },
            }));
            scheduleSave(participantId);
        },
        [scheduleSave],
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

    /** Повтор после неудачной записи: правка всё ещё в поле */
    const retrySave = useCallback(
        (participantId: number) => scheduleSave(participantId),
        [scheduleSave],
    );

    return {
        isPpkContract,
        isLoading,
        /**
         * Таб и виджет показываем, только когда есть что показывать: нет
         * участников или ни у кого нет программ ППК — строк не будет.
         */
        hasRows: rows.length > 0,
        rows,
        orphanedTopics,
        buildError,
        notReadyCount,
        saveState,
        setRowDates,
        setContact,
        retrySave,
        isRowDatesInvalid,
        isFioMissing,
    };
};

export type TPpkApplicationLive = ReturnType<typeof usePpkApplicationLive>;
