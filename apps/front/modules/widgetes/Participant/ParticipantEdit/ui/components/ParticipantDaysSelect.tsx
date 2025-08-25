import { ParticipantEditContentProps } from './ParticipantEditContent';
import { useEditParticipant } from '../../hook/useParticipantEdit';
import { Checkbox } from '@workspace/ui/components/checkbox';
import { Label } from '@workspace/ui/components/label';
import { BxParticipantsDataKeys } from '@alfa/entities';
import { useCallback } from 'react';

export const ParticipantDaysSelect = ({
    editable,
}: ParticipantEditContentProps) => {
    const { daysSelect, changeMultipleField } = useEditParticipant(editable.id);

    // Получаем текущие выбранные дни из editable
    const currentDays =
        (editable?.fields.find(
            field => field.code === BxParticipantsDataKeys.days,
        )?.value as string[]) || [];

    // Обработчик изменения выбора дня
    const handleDayChange = useCallback(
        (dayName: string, checked: boolean) => {
            let newDays: string[];

            if (checked) {
                // Добавляем день, если его нет
                newDays = [...currentDays, dayName];
            } else {
                // Убираем день
                newDays = currentDays.filter(day => day !== dayName);
            }

            // Используем специальную функцию для множественных полей
            changeMultipleField(BxParticipantsDataKeys.days, newDays);
        },
        [currentDays, changeMultipleField],
    );

    // Проверяем, выбран ли конкретный день
    const isDaySelected = useCallback(
        (dayName: string) => {
            return currentDays.includes(dayName);
        },
        [currentDays],
    );

    if (!daysSelect || daysSelect.length === 0) {
        return (
            <div className="space-y-2">
                <Label className="text-sm font-medium text-muted-foreground">
                    Дни участия
                </Label>
                <p className="text-sm text-muted-foreground">
                    Нет доступных дней для выбора
                </p>
            </div>
        );
    }

    return (
        <div className="space-y-3">
            <Label className="text-sm font-medium">Дни участия</Label>
            <div className="space-y-2">
                {daysSelect.map(day => (
                    <div key={day.id} className="flex items-center space-x-2">
                        <Checkbox
                            id={`day-${day.id}`}
                            checked={isDaySelected(day.name)}
                            onCheckedChange={(
                                checked: boolean | 'indeterminate',
                            ) => handleDayChange(day.name, checked === true)}
                            className="data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                        />
                        <Label
                            htmlFor={`day-${day.id}`}
                            className="text-sm font-normal cursor-pointer select-none"
                        >
                            {day.name}
                        </Label>
                    </div>
                ))}
            </div>
            {currentDays.length > 0 && (
                <div className="pt-2">
                    <p className="text-xs text-muted-foreground">
                        Выбрано дней: {currentDays.length}
                    </p>
                </div>
            )}
        </div>
    );
};
