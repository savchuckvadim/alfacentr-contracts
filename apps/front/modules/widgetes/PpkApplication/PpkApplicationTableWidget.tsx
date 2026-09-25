'use client';

import {
    Table,
    TableBody,
    TableHead,
    TableHeader,
    TableRow,
} from '@workspace/ui/components/table';
import { Button } from '@workspace/ui/components/button';
import { AlertTriangleIcon, LoaderIcon, SaveIcon } from 'lucide-react';
import { memo } from 'react';
import { TPpkApplicationLive } from './hooks/use-ppk-application-live';
import { PpkApplicationRowItem } from './components/PpkApplicationRowItem';

/**
 * Приложение ППК в табе и на главном: те же пары «участник — программа»,
 * что уйдут в документ, но правки записываются в CRM кнопкой в строке.
 * Смысл — готовить даты заранее, не открывая окно отправки.
 *
 * Состояние приходит сверху и НЕ создаётся здесь своим вызовом хука: иначе
 * главный таб, свой таб и условие показа жили бы в разных экземплярах
 * состояния, и правки из одного места не видел бы никто другой.
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
            saveErrors,
            dirtyParticipantIds,
            dirtyCount,
            isSavingAny,
            setRowDates,
            setContact,
            save,
            saveAll,
            discard,
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
            <div className="flex min-w-0 flex-col gap-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                    <p className="text-xs text-muted-foreground">
                        Даты у каждого участника свои — на одной программе можно
                        указать разные периоды. Правки записываются в CRM
                        кнопкой в строке или по Enter.
                    </p>
                    <div className="flex items-center gap-2">
                        {notReadyCount > 0 && (
                            <span className="rounded bg-yellow-100 px-2 py-0.5 text-xs text-yellow-800">
                                Не готово строк: {notReadyCount}
                            </span>
                        )}
                        {dirtyCount > 0 && (
                            <span className="rounded bg-blue-100 px-2 py-0.5 text-xs text-blue-800">
                                Не сохранено: {dirtyCount}
                            </span>
                        )}
                        {dirtyCount > 1 && (
                            <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() => void saveAll()}
                                disabled={isSavingAny}
                                className="h-7 gap-1 px-2 text-xs"
                            >
                                <SaveIcon className="h-3 w-3" />
                                Сохранить всё
                            </Button>
                        )}
                    </div>
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

                {/*
                    Фиксированная раскладка: ширину колонок задаёт таблица, а не
                    содержимое. Иначе длинное название программы растягивало
                    таблицу, а с ней и всю страницу за пределы окна. Ниже
                    минимальной ширины включается горизонтальная прокрутка
                    внутри виджета, а не страницы
                */}
                <div className="overflow-x-auto">
                    <Table className="min-w-[1000px] table-fixed">
                        <colgroup>
                            <col className="w-[17%]" />
                            <col className="w-[21%]" />
                            <col className="w-[13%]" />
                            <col className="w-[13%]" />
                            <col className="w-[14%]" />
                            <col className="w-[12%]" />
                            <col className="w-[10%]" />
                        </colgroup>
                        <TableHeader>
                            <TableRow>
                                <TableHead>ФИО</TableHead>
                                <TableHead>Программа</TableHead>
                                <TableHead>Дата начала</TableHead>
                                <TableHead>Дата окончания</TableHead>
                                <TableHead>Email</TableHead>
                                <TableHead>Телефон</TableHead>
                                <TableHead>Запись</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {rows.map(row => (
                                <PpkApplicationRowItem
                                    key={`${row.participantId}-${row.topic}`}
                                    row={row}
                                    dirty={dirtyParticipantIds.has(
                                        row.participantId,
                                    )}
                                    saveState={saveState[row.participantId]}
                                    saveError={saveErrors[row.participantId]}
                                    datesInvalid={isRowDatesInvalid(row)}
                                    fioMissing={isFioMissing(row)}
                                    onDatesChange={setRowDates}
                                    onContactChange={setContact}
                                    onSave={save}
                                    onDiscard={discard}
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
