'use client';

import React from 'react';
import { Button } from '@workspace/ui/components/button';
import { cn } from '@workspace/ui/lib/utils';
import { AlertTriangle, Loader2, MailCheck, RotateCw } from 'lucide-react';

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
    const { sendOnly, isSending, isSent, missing, error } = useSendOnly();

    return (
        <div className="flex flex-col gap-2">
            <Button
                onClick={sendOnly}
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
                        <span>
                            {error
                                ? 'Повторить попытку'
                                : 'Отправить повторно'}
                        </span>
                    </>
                )}
            </Button>

            <p className="text-xs text-gray-500">
                Отправит те же документы, не пересобирая их. Номер договора
                не изменится.
            </p>

            {isSent && !error && (
                <p className="flex items-center gap-1.5 text-xs text-green-600">
                    <MailCheck className="w-3.5 h-3.5" />
                    Документы отправлены повторно
                </p>
            )}

            {/*
                Отправка идёт в очереди и трогает портал трижды. Если он
                недоступен — менеджер должен узнать об этом и повторить, а
                не считать, что письмо ушло: 20.11.2026 портал сорок минут
                отдавал ошибки, и отправка падала на смене стадии
            */}
            {error && (
                <div className="flex gap-1.5 text-xs text-red-600">
                    <AlertTriangle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                    <div>
                        <p className="font-medium">Отправить не получилось</p>
                        <p className="text-gray-500">{error}</p>
                        <p className="text-gray-500">
                            Письмо не ушло. Нажмите «Повторить попытку».
                        </p>
                    </div>
                </div>
            )}

            {/*
                Перечисляем поимённо: «комплект неполный» не говорит, что
                делать, а «нет приложения ППК» — говорит
            */}
            {missing.length > 0 && !error && (
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
