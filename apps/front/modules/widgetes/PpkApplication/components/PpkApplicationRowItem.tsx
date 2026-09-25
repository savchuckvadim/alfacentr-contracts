'use client';

import { TableCell, TableRow } from '@workspace/ui/components/table';
import { Input } from '@workspace/ui/components/input';
import { Label } from '@workspace/ui/components/label';
import { KeyboardEvent, memo } from 'react';
import {
    IPpkApplicationRow,
    TPpkContactField,
} from '@/modules/entities/participant/lib/ppk-application-rows';
import { TruncatedText } from '@/modules/shared/Text';
import { TPpkRowSaveState } from '../hooks/use-ppk-application-live';
import { PpkApplicationRowSaveControl } from './PpkApplicationRowSaveControl';

export interface PpkApplicationRowItemProps {
    row: IPpkApplicationRow;
    dirty: boolean;
    saveState: TPpkRowSaveState | undefined;
    saveError: string | undefined;
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
    onSave: (participantId: number) => void;
    onDiscard: (participantId: number) => void;
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
        dirty,
        saveState,
        saveError,
        datesInvalid,
        fioMissing,
        onDatesChange,
        onContactChange,
        onSave,
        onDiscard,
    }) => {
        //Enter в любом поле строки — записать участника, как кнопкой
        const saveOnEnter = (event: KeyboardEvent<HTMLInputElement>) => {
            if (event.key !== 'Enter' || !dirty) return;
            event.preventDefault();
            onSave(row.participantId);
        };

        return (
            <TableRow>
                <TableCell>
                    <Input
                        value={row.fio}
                        title={row.fio}
                        onChange={e =>
                            onContactChange(
                                row.participantId,
                                'fio',
                                e.target.value,
                            )
                        }
                        onKeyDown={saveOnEnter}
                        className={fioMissing ? 'border-red-500' : ''}
                    />
                    {fioMissing && (
                        <Label className="text-xs text-red-500">
                            Без ФИО строка не попадёт в документ
                        </Label>
                    )}
                </TableCell>

                {/*
                    Название программы длинное, а ячейки таблицы по умолчанию
                    не переносят строки — без обрезки колонка растягивала
                    таблицу за пределы окна
                */}
                <TableCell className="whitespace-normal text-xs text-muted-foreground">
                    <TruncatedText text={row.topic} />
                </TableCell>

                <TableCell>
                    <Input
                        type="date"
                        value={row.dateFrom}
                        onChange={e =>
                            onDatesChange(row, e.target.value, row.dateTo)
                        }
                        onKeyDown={saveOnEnter}
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
                        onKeyDown={saveOnEnter}
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
                        title={row.email}
                        onChange={e =>
                            onContactChange(
                                row.participantId,
                                'email',
                                e.target.value,
                            )
                        }
                        onKeyDown={saveOnEnter}
                    />
                </TableCell>

                <TableCell>
                    <Input
                        value={row.phone}
                        title={row.phone}
                        onChange={e =>
                            onContactChange(
                                row.participantId,
                                'phone',
                                e.target.value,
                            )
                        }
                        onKeyDown={saveOnEnter}
                    />
                </TableCell>

                <TableCell>
                    <PpkApplicationRowSaveControl
                        participantId={row.participantId}
                        dirty={dirty}
                        saveState={saveState}
                        error={saveError}
                        onSave={onSave}
                        onDiscard={onDiscard}
                    />
                </TableCell>
            </TableRow>
        );
    },
);

PpkApplicationRowItem.displayName = 'PpkApplicationRowItem';
