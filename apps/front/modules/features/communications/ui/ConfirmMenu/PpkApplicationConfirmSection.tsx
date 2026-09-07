'use client';

import { useAppSelector } from '@/modules/app/';
import { usePpkApplicationConfirm } from '../../hook/usePpkApplicationConfirm';
import { Input } from '@workspace/ui/components/input';
import { Label } from '@workspace/ui/components/label';
import { Card, CardContent } from '@workspace/ui/components/card';
import { AlertTriangleIcon, UserIcon } from 'lucide-react';
import { FC } from 'react';

/**
 * Приложение ППК перед отправкой: всё, что попадёт в документ, менеджер
 * видит и правит здесь.
 *
 * Даты обучения у каждого участника свои — двое на одной программе могут
 * учиться в разные периоды, поэтому даты задаются на паре
 * «участник — программа», а не у товара.
 */
export const PpkApplicationConfirmSection: FC = () => {
    const {
        rows,
        orphanedTopics,
        setEventDate,
        setParticipantContact,
        isRowDatesInvalid,
        isContactInvalid,
    } = usePpkApplicationConfirm();

    const isLoading = useAppSelector(
        state => state.participant.loading || state.product.loading,
    );

    if (isLoading) return null;
    if (!rows.length) return null;

    return (
        <div className="flex flex-col gap-3">
            <div className="flex items-center gap-2">
                <UserIcon className="w-4 h-4 text-muted-foreground" />
                <Label className="text-sm font-semibold">
                    Приложение ППК: участники и даты обучения
                </Label>
            </div>

            <p className="text-xs text-muted-foreground">
                Эти данные попадут в приложение к договору. Даты у каждого
                участника свои — можно указать разные периоды на одной
                программе.
            </p>

            {orphanedTopics.length > 0 && (
                <div className="flex items-start gap-2 rounded-md border border-yellow-400 bg-yellow-50 p-2">
                    <AlertTriangleIcon className="mt-0.5 h-4 w-4 shrink-0 text-yellow-600" />
                    <div className="text-xs text-yellow-800">
                        Для этих программ сохранены даты, но самих программ у
                        участников больше нет — проверьте, не переименовали ли
                        их: {orphanedTopics.join('; ')}
                    </div>
                </div>
            )}

            {rows.map(row => {
                const datesInvalid = isRowDatesInvalid(row);

                return (
                    <Card
                        key={`${row.participantId}-${row.topic}`}
                        className="border-l-4 border-l-primary/20"
                    >
                        <CardContent className="space-y-3 p-3">
                            <div className="text-sm font-medium">
                                {row.fio || (
                                    <span className="text-red-500">
                                        ФИО не заполнено
                                    </span>
                                )}
                            </div>
                            <div className="text-xs text-muted-foreground">
                                {row.topic}
                            </div>

                            <div className="grid grid-cols-2 gap-2">
                                <div className="space-y-1">
                                    <Label className="text-xs">
                                        Дата начала
                                    </Label>
                                    <Input
                                        type="date"
                                        value={row.dateFrom}
                                        onChange={e =>
                                            setEventDate(
                                                row,
                                                e.target.value,
                                                row.dateTo,
                                            )
                                        }
                                        className={
                                            datesInvalid ? 'border-red-500' : ''
                                        }
                                    />
                                </div>
                                <div className="space-y-1">
                                    <Label className="text-xs">
                                        Дата окончания
                                    </Label>
                                    <Input
                                        type="date"
                                        value={row.dateTo}
                                        onChange={e =>
                                            setEventDate(
                                                row,
                                                row.dateFrom,
                                                e.target.value,
                                            )
                                        }
                                        className={
                                            datesInvalid ? 'border-red-500' : ''
                                        }
                                    />
                                </div>
                            </div>

                            {datesInvalid && (
                                <Label className="text-xs text-red-500">
                                    {row.dateFrom && row.dateTo
                                        ? 'Дата начала позже даты окончания'
                                        : 'Заполните обе даты обучения'}
                                </Label>
                            )}

                            <div className="grid grid-cols-3 gap-2">
                                <div className="space-y-1">
                                    <Label className="text-xs">ФИО</Label>
                                    <Input
                                        value={row.fio}
                                        onChange={e =>
                                            setParticipantContact(
                                                row.participantId,
                                                'fio',
                                                e.target.value,
                                            )
                                        }
                                        className={
                                            isContactInvalid(row, 'fio')
                                                ? 'border-red-500'
                                                : ''
                                        }
                                    />
                                </div>
                                <div className="space-y-1">
                                    <Label className="text-xs">Email</Label>
                                    <Input
                                        value={row.email}
                                        onChange={e =>
                                            setParticipantContact(
                                                row.participantId,
                                                'email',
                                                e.target.value,
                                            )
                                        }
                                        className={
                                            isContactInvalid(row, 'email')
                                                ? 'border-red-500'
                                                : ''
                                        }
                                    />
                                </div>
                                <div className="space-y-1">
                                    <Label className="text-xs">Телефон</Label>
                                    <Input
                                        value={row.phone}
                                        onChange={e =>
                                            setParticipantContact(
                                                row.participantId,
                                                'phone',
                                                e.target.value,
                                            )
                                        }
                                        className={
                                            isContactInvalid(row, 'phone')
                                                ? 'border-red-500'
                                                : ''
                                        }
                                    />
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                );
            })}
        </div>
    );
};
