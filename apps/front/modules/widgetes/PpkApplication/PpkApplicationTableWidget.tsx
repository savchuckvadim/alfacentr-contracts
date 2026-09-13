'use client';

import {
    Table,
    TableBody,
    TableHead,
    TableHeader,
    TableRow,
} from '@workspace/ui/components/table';
import { AlertTriangleIcon, LoaderIcon } from 'lucide-react';
import { memo } from 'react';
import { TPpkApplicationLive } from './hooks/use-ppk-application-live';
import { PpkApplicationRowItem } from './components/PpkApplicationRowItem';

/**
 * Приложение ППК отдельным табом: те же пары «участник — программа», что
 * уйдут в документ, но правки сохраняются на лету. Смысл — готовить даты
 * заранее, не открывая окно отправки.
 *
 * Состояние приходит сверху и НЕ создаётся здесь своим вызовом хука: иначе
 * таб и его условие показа жили бы в разных экземплярах состояния, и правки
 * из таблицы не видел бы тот, кто решает, показывать таб или нет.
 */
export const PpkApplicationTableWidget = memo<{ ppk: TPpkApplicationLive }>(
    ({ ppk }) => {
        const {
            isLoading,
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
        } = ppk;

        if (isLoading) {
            return (
                <div className="flex items-center gap-2 p-4 text-sm text-muted-foreground">
                    <LoaderIcon className="h-4 w-4 animate-spin" />
                    Загружаем участников и программы
                </div>
            );
        }

        if (buildError) {
            return (
                <div className="flex items-start gap-2 rounded-md border border-red-300 bg-red-50 p-3">
                    <AlertTriangleIcon className="mt-0.5 h-4 w-4 shrink-0 text-red-600" />
                    <div className="text-xs text-red-800">
                        Не удалось собрать приложение ППК: {buildError}. Данные
                        в CRM не тронуты — откройте карточки участников и
                        проверьте программы.
                    </div>
                </div>
            );
        }

        //нет участников или ни у кого нет программ ППК — показывать нечего
        if (!rows.length) return null;

        return (
            <div className="flex flex-col gap-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                    <p className="text-xs text-muted-foreground">
                        Даты у каждого участника свои — на одной программе можно
                        указать разные периоды. Правки сохраняются сразу.
                    </p>
                    {notReadyCount > 0 && (
                        <span className="rounded bg-yellow-100 px-2 py-0.5 text-xs text-yellow-800">
                            Не готово строк: {notReadyCount}
                        </span>
                    )}
                </div>

                {orphanedTopics.length > 0 && (
                    <div className="flex items-start gap-2 rounded-md border border-yellow-400 bg-yellow-50 p-2">
                        <AlertTriangleIcon className="mt-0.5 h-4 w-4 shrink-0 text-yellow-600" />
                        <div className="text-xs text-yellow-800">
                            Для этих программ сохранены даты, но самих программ
                            у участников больше нет — проверьте, не
                            переименовали ли их: {orphanedTopics.join('; ')}
                        </div>
                    </div>
                )}

                <div className="overflow-x-auto">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="min-w-[180px]">
                                    ФИО
                                </TableHead>
                                <TableHead className="min-w-[200px]">
                                    Программа
                                </TableHead>
                                <TableHead className="min-w-[150px]">
                                    Дата начала
                                </TableHead>
                                <TableHead className="min-w-[150px]">
                                    Дата окончания
                                </TableHead>
                                <TableHead className="min-w-[180px]">
                                    Email
                                </TableHead>
                                <TableHead className="min-w-[150px]">
                                    Телефон
                                </TableHead>
                                <TableHead className="w-[90px]">
                                    Сохранено
                                </TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {rows.map(row => (
                                <PpkApplicationRowItem
                                    key={`${row.participantId}-${row.topic}`}
                                    row={row}
                                    saveState={saveState[row.participantId]}
                                    datesInvalid={isRowDatesInvalid(row)}
                                    fioMissing={isFioMissing(row)}
                                    onDatesChange={setRowDates}
                                    onContactChange={setContact}
                                    onRetry={retrySave}
                                />
                            ))}
                        </TableBody>
                    </Table>
                </div>
            </div>
        );
    },
);

PpkApplicationTableWidget.displayName = 'PpkApplicationTableWidget';
