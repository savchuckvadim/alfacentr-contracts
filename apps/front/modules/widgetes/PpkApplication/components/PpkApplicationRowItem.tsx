'use client';

import { TableCell, TableRow } from '@workspace/ui/components/table';
import { Input } from '@workspace/ui/components/input';
import { Label } from '@workspace/ui/components/label';
import { Button } from '@workspace/ui/components/button';
import { CheckIcon, LoaderIcon, RotateCcwIcon } from 'lucide-react';
import { memo } from 'react';
import {
    IPpkApplicationRow,
    TPpkContactField,
} from '@/modules/entities/participant/lib/ppk-application-rows';
import { TPpkRowSaveState } from '../hooks/use-ppk-application-live';

export interface PpkApplicationRowItemProps {
    row: IPpkApplicationRow;
    saveState: TPpkRowSaveState | undefined;
    datesInvalid: boolean;
    fioMissing: boolean;
    onDatesChange: (
        row: IPpkApplicationRow,
        dateFrom: string,
        dateTo: string,
    ) => void;
    onContactChange: (
        participantId: number,
        field: TPpkContactField,
        value: string,
    ) => void;
    onRetry: (participantId: number) => void;
}

/**
 * Одна пара «участник — программа».
 *
 * Вынесена в memo-компонент намеренно: участников с программами бывает
 * десятки, а ввод в одном поле иначе перерисовывал бы всю таблицу на каждое
 * нажатие клавиши.
 */
export const PpkApplicationRowItem = memo<PpkApplicationRowItemProps>(
    ({
        row,
        saveState,
        datesInvalid,
        fioMissing,
        onDatesChange,
        onContactChange,
        onRetry,
    }) => (
        <TableRow>
            <TableCell>
                <Input
                    value={row.fio}
                    onChange={e =>
                        onContactChange(
                            row.participantId,
                            'fio',
                            e.target.value,
                        )
                    }
                    className={fioMissing ? 'border-red-500' : ''}
                />
                {fioMissing && (
                    <Label className="text-xs text-red-500">
                        Без ФИО строка не попадёт в документ
                    </Label>
                )}
            </TableCell>

            <TableCell className="text-xs text-muted-foreground">
                {row.topic}
            </TableCell>

            <TableCell>
                <Input
                    type="date"
                    value={row.dateFrom}
                    onChange={e =>
                        onDatesChange(row, e.target.value, row.dateTo)
                    }
                    className={datesInvalid ? 'border-red-500' : ''}
                />
            </TableCell>

            <TableCell>
                <Input
                    type="date"
                    value={row.dateTo}
                    onChange={e =>
                        onDatesChange(row, row.dateFrom, e.target.value)
                    }
                    className={datesInvalid ? 'border-red-500' : ''}
                />
                {datesInvalid && (
                    <Label className="text-xs text-red-500">
                        {row.dateFrom && row.dateTo
                            ? 'Начало позже окончания'
                            : 'Заполните обе даты'}
                    </Label>
                )}
            </TableCell>

            <TableCell>
                <Input
                    value={row.email}
                    onChange={e =>
                        onContactChange(
                            row.participantId,
                            'email',
                            e.target.value,
                        )
                    }
                />
            </TableCell>

            <TableCell>
                <Input
                    value={row.phone}
                    onChange={e =>
                        onContactChange(
                            row.participantId,
                            'phone',
                            e.target.value,
                        )
                    }
                />
            </TableCell>

            <TableCell>
                {saveState === 'saving' && (
                    <LoaderIcon className="h-4 w-4 animate-spin text-muted-foreground" />
                )}
                {saveState === 'saved' && (
                    <CheckIcon className="h-4 w-4 text-green-600" />
                )}
                {saveState === 'error' && (
                    <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => onRetry(row.participantId)}
                        className="h-7 gap-1 px-2 text-xs text-red-600"
                    >
                        <RotateCcwIcon className="h-3 w-3" />
                        Повторить
                    </Button>
                )}
            </TableCell>
        </TableRow>
    ),
);

PpkApplicationRowItem.displayName = 'PpkApplicationRowItem';
