'use client';

import { Button } from '@workspace/ui/components/button';
import { Tooltip } from '@/modules/shared';
import {
    CheckIcon,
    LoaderIcon,
    RotateCcwIcon,
    SaveIcon,
    XIcon,
} from 'lucide-react';
import { memo } from 'react';
import { TPpkRowSaveState } from '../hooks/use-ppk-application-live';

export interface PpkApplicationRowSaveControlProps {
    participantId: number;
    /** Есть расхождение с CRM — можно сохранять или отменить */
    dirty: boolean;
    saveState: TPpkRowSaveState | undefined;
    error: string | undefined;
    onSave: (participantId: number) => void;
    onDiscard: (participantId: number) => void;
}

/**
 * Состояние записи одной строки и микрокнопки к нему.
 *
 * Даты и контакты участника уходят в CRM одним запросом, поэтому кнопка
 * сохраняет все строки участника сразу — у его строк она появляется
 * синхронно. Порядок проверки состояний важен: идущая запись перекрывает
 * всё, ошибка — расхождение (оно при ошибке есть всегда), и только потом
 * обычные «не сохранено» и «записано».
 */
export const PpkApplicationRowSaveControl =
    memo<PpkApplicationRowSaveControlProps>(
        ({ participantId, dirty, saveState, error, onSave, onDiscard }) => {
            if (saveState === 'saving') {
                return (
                    <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                        <LoaderIcon className="h-4 w-4 animate-spin" />
                        Пишем
                    </span>
                );
            }

            if (saveState === 'error') {
                return (
                    <div className="flex items-center gap-1">
                        <Tooltip
                            content={
                                <div className="max-w-[320px] whitespace-normal">
                                    {error || 'Не удалось записать в CRM'}
                                </div>
                            }
                        >
                            <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={() => onSave(participantId)}
                                className="h-7 gap-1 px-2 text-xs text-red-600"
                            >
                                <RotateCcwIcon className="h-3 w-3" />
                                Повторить
                            </Button>
                        </Tooltip>
                        <DiscardButton
                            participantId={participantId}
                            onDiscard={onDiscard}
                        />
                    </div>
                );
            }

            if (dirty) {
                return (
                    <div className="flex items-center gap-1">
                        <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => onSave(participantId)}
                            className="h-7 gap-1 px-2 text-xs"
                        >
                            <SaveIcon className="h-3 w-3" />
                            Сохранить
                        </Button>
                        <DiscardButton
                            participantId={participantId}
                            onDiscard={onDiscard}
                        />
                    </div>
                );
            }

            if (saveState === 'saved') {
                return (
                    <span className="inline-flex items-center gap-1 text-xs text-green-600">
                        <CheckIcon className="h-4 w-4" />
                        Записано
                    </span>
                );
            }

            return null;
        },
    );

PpkApplicationRowSaveControl.displayName = 'PpkApplicationRowSaveControl';

const DiscardButton = ({
    participantId,
    onDiscard,
}: {
    participantId: number;
    onDiscard: (participantId: number) => void;
}) => (
    <Tooltip content="Отменить правки участника">
        <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => onDiscard(participantId)}
            className="h-7 w-7 p-0 text-muted-foreground"
            aria-label="Отменить правки"
        >
            <XIcon className="h-3 w-3" />
        </Button>
    </Tooltip>
);
