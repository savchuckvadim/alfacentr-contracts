'use client';

import React from 'react';
import { Button } from '@workspace/ui/components/button';
import { cn } from '@workspace/ui/lib/utils';
import { Loader2, MailCheck, RotateCw } from 'lucide-react';

import { useSendOnly } from '@/modules/process/document/hook/useSendOnly';

export interface SummarySendOnlyButtonProps {
    /** Пока идёт генерация пакета, повторная отправка бессмысленна */
    isDisabled?: boolean;
}

/**
 * Поле в Битриксе называется «Текущий акт» — так было, пока акт не
 * заменили на УПД. Переименовывать поле нельзя, оно в шаблонах и в
 * роботе, но менеджеру показываем нынешнее название документа
 */
const getDocumentLabel = (name: string): string =>
    name === 'Текущий акт' ? 'УПД' : name;

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
    const { sendOnly, isSending, isSent, result } = useSendOnly();
    const missing = result?.missing ?? [];

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
                Перечисляем поимённо: «комплект неполный» не говорит, что
                делать, а «нет приложения ППК» — говорит.
                После отправки это предупреждение, до — причина отказа:
                отказываем только когда в сделке нет ни одного документа
            */}
            {missing.length > 0 && (
                <div
                    className={cn(
                        'text-xs',
                        isSent ? 'text-amber-600' : 'text-red-600',
                    )}
                >
                    <p>
                        {isSent
                            ? 'Отправлено без этих документов:'
                            : 'Отправлять нечего, не сформированы документы:'}
                    </p>
                    <ul className="list-disc list-inside">
                        {missing.map(field => (
                            <li key={field.bitrixId}>
                                {getDocumentLabel(field.name)}
                            </li>
                        ))}
                    </ul>
                    {!isSent && (
                        <p className="mt-1 text-gray-500">
                            Нажмите «Отправить» выше — документы соберутся
                            заново.
                        </p>
                    )}
                </div>
            )}
        </div>
    );
};
