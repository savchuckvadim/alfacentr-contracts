'use client';

import React from 'react';
import { Button } from '@workspace/ui/components/button';
import { Loader2, MailCheck, RotateCw } from 'lucide-react';

import { useSendOnly } from '@/modules/process/document/hook/useSendOnly';

export interface SummarySendOnlyButtonProps {
    /** Пока идёт генерация пакета, повторная отправка бессмысленна */
    isDisabled?: boolean;
}

/**
 * Повторная отправка уже сформированных документов.
 *
 * Отдельная кнопка, а не режим основной: у них разные последствия, и по
 * надписи должно быть видно, что произойдёт. Основная пересобирает пакет
 * заново, эта отправляет тот же — с тем же номером договора и теми же
 * файлами.
 *
 * Нужна, когда письмо ушло не тому человеку: контакт из заявки вытесняют
 * контакты компании, если менеджер привязывает её вручную.
 */
export const SummarySendOnlyButton: React.FC<SummarySendOnlyButtonProps> = ({
    isDisabled,
}) => {
    const { sendOnly, isSending, isSent, missing } = useSendOnly();

    return (
        <div className="flex flex-col gap-2">
            <Button
                onClick={() => void sendOnly()}
                disabled={isDisabled || isSending}
                variant="outline"
                size="sm"
                type="button"
                className="w-full"
                aria-busy={isSending}
            >
                {isSending ? (
                    <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Отправка...</span>
                    </>
                ) : (
                    <>
                        <RotateCw className="w-4 h-4" />
                        <span>Отправить повторно</span>
                    </>
                )}
            </Button>

            <p className="text-xs text-gray-500">
                Отправит те же документы, не пересобирая их. Номер договора
                не изменится.
            </p>

            {isSent && (
                <p className="flex items-center gap-1.5 text-xs text-green-600">
                    <MailCheck className="w-3.5 h-3.5" />
                    Документы отправлены повторно
                </p>
            )}

            {/*
                Перечисляем поимённо: «не готово к отправке» не говорит,
                что делать, а «нет приложения ППК» — говорит
            */}
            {missing.length > 0 && (
                <div className="text-xs text-red-600">
                    <p>Отправлять нечего, не сформированы документы:</p>
                    <ul className="list-disc list-inside">
                        {missing.map(field => (
                            <li key={field.bitrixId}>{field.name}</li>
                        ))}
                    </ul>
                    <p className="mt-1 text-gray-500">
                        Нажмите «Отправить» выше — документы соберутся заново.
                    </p>
                </div>
            )}
        </div>
    );
};
