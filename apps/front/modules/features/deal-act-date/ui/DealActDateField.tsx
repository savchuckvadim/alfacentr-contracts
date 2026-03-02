'use client';

import {
    Controller,
    Control,
    FieldPath,
    FieldValues,
    Path,
    RegisterOptions,
} from 'react-hook-form';
import { DatePickerInput } from '@workspace/ui/components/date-picker';
import { ru } from 'date-fns/locale';
import { useDealActDate } from '../lib/hook/deal-act-date.hook';
import type { ComponentProps } from 'react';

const toLocalIsoDate = (date: Date): string => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
};

export interface DealActDateFieldProps<T extends FieldValues>
    extends Omit<
        ComponentProps<typeof DatePickerInput>,
        | 'locale'
        | 'label'
        | 'placeholder'
        | 'initialValue'
        | 'onDateChange'
        | 'value'
        | 'onChange'
        | 'onBlur'
        | 'name'
    > {
    /** Control из react-hook-form */
    control: Control<T>;
    /** Имя поля в форме */
    name: Path<T>;
    /** Правила валидации */
    rules?: Omit<
        RegisterOptions<T, FieldPath<T>>,
        'valueAsNumber' | 'valueAsDate' | 'setValueAs' | 'disabled'
    >;
    /** Если true, не использует внутренний хук для управления состоянием */
    useHookFormOnly?: boolean;
}

/**
 * Компонент поля даты акта с интеграцией react-hook-form через Controller
 */
export function DealActDateField<T extends FieldValues>({
    control,
    name,
    rules,
    useHookFormOnly = true,
    className,
    ...rest
}: DealActDateFieldProps<T>) {
    const { dealActDate, update } = useDealActDate();

    return (
        <Controller
            control={control}
            name={name}
            rules={rules}
            render={({
                field: { onChange, onBlur, value },
                fieldState: { error },
            }) => {
                // Преобразуем значение из react-hook-form в формат для DatePickerInput
                // value может быть строкой (дата в формате YYYY-MM-DD) или пустой строкой
                const initialValue = value ? String(value) : '';

                // Обработчик изменения даты из календаря
                const handleDateChange = (date: Date | undefined) => {
                    if (date) {
                        // Локальная дата без UTC-сдвига (иначе возможен "-1 день")
                        const dateString = toLocalIsoDate(date);
                        onChange(dateString);
                    } else {
                        onChange('');
                    }

                    update(date);
                };

                return (
                    <DatePickerInput
                        locale={ru}
                        label={error?.message || 'Дата акта'}
                        placeholder="Выберите дату"
                        initialValue={
                            useHookFormOnly
                                ? initialValue
                                : dealActDate || initialValue
                        }
                        value={initialValue}
                        onChange={e => {
                            // Вызываем onChange из react-hook-form при ручном вводе
                            onChange(e.target.value);
                        }}
                        onDateChange={handleDateChange}
                        onBlur={onBlur}
                        name={name}
                        // aria-invalid={!!error}
                        className={className}
                        isError={!!error}
                        {...rest}
                    />
                );
            }}
        />
    );
}
