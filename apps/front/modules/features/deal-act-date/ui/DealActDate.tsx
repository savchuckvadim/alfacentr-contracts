import { DatePickerInput } from '@workspace/ui/components/date-picker';
import { ru } from 'date-fns/locale';
import { useDealActDate } from '../lib/hook/deal-act-date.hook';
import type { ComponentProps } from 'react';
import { cn } from '@workspace/ui/lib/utils';

export interface DealActDateProps
    extends Omit<
        ComponentProps<typeof DatePickerInput>,
        'locale' | 'label' | 'placeholder' | 'initialValue' | 'onDateChange'
    > {
    /** Если передан name (из react-hook-form), внутренний хук не используется для управления состоянием */
    errorMessage?: string;
}

export function DealActDate({
    name,
    className,
    errorMessage,
    ...props
}: DealActDateProps) {
    const { dealActDate, update } = useDealActDate();

    // Если передан name (из react-hook-form), используем только пропсы
    // Иначе используем внутренний хук для управления состоянием
    const hasReactHookForm = Boolean(name);

    return (
        <DatePickerInput
            locale={ru}
            label={errorMessage || 'Дата акта'}
            // isError передаем только если НЕ используется react-hook-form
            // При использовании react-hook-form aria-invalid обновляется автоматически
            isError={hasReactHookForm ? undefined : !!errorMessage}
            placeholder="Выберите дату"
            initialValue={hasReactHookForm ? '' : dealActDate || ''}
            onDateChange={hasReactHookForm ? undefined : date => update(date)}
            name={name}
            {...props}
            className={cn(
                className,
                (props as { className?: string }).className,
            )}
        />
    );
}
