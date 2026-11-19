'use client';

import { useCallback, useState } from 'react';
import { useAppDispatch } from '@/modules/app/lib/hooks/redux';

import { documentSendOnly } from '../model/thunk/SendOnlyThunk';
import type { ISendOnlyResult } from '../lib/services/document-generate-own.service';

/**
 * Повторная отправка уже сформированных документов.
 *
 * Состояние держим в хуке, а не в сторе: оно нужно только кнопке и живёт
 * до следующего нажатия. В сторе ему пришлось бы заводить слайс и чистить
 * его при смене сделки.
 */
export const useSendOnly = () => {
    const dispatch = useAppDispatch();

    const [isSending, setIsSending] = useState(false);
    const [result, setResult] = useState<ISendOnlyResult | null>(null);

    const sendOnly = useCallback(async () => {
        setIsSending(true);
        setResult(null);

        try {
            const response = await dispatch(documentSendOnly()).unwrap();
            setResult(response);
            return response;
        } finally {
            setIsSending(false);
        }
    }, [dispatch]);

    const reset = useCallback(() => setResult(null), []);

    return {
        sendOnly,
        reset,
        isSending,
        result,
        /** Документы не сформированы — кнопка нажата, но отправлять нечего */
        missing: result && !result.sent ? result.missing : [],
        isSent: Boolean(result?.sent),
    };
};

export default useSendOnly;
