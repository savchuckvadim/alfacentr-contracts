'use client';

import { useCallback } from 'react';
import { useAppDispatch, useAppSelector } from '@/modules/app/lib/hooks/redux';

import { documentSendOnly } from '../model/thunk/SendOnlyThunk';
import { sendOnlyReset } from '../model/slice/SendOnlySlice';

/**
 * Повторная отправка уже сформированных документов.
 *
 * Состояние в сторе: отправка идёт в очереди, а результат приходит по
 * веб-сокету отдельным событием — компонент к этому моменту мог
 * перерисоваться.
 */
export const useSendOnly = () => {
    const dispatch = useAppDispatch();
    const { isSending, isSent, missing, error } = useAppSelector(
        state => state.sendOnly,
    );

    const sendOnly = useCallback(() => {
        void dispatch(documentSendOnly());
    }, [dispatch]);

    const reset = useCallback(() => {
        dispatch(sendOnlyReset());
    }, [dispatch]);

    return { sendOnly, reset, isSending, isSent, missing, error };
};

export default useSendOnly;
