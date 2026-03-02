'use client';

import * as React from 'react';
import { Calendar } from '@workspace/ui/components/calendar';
import { Field, FieldLabel } from '@workspace/ui/components/field';

import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@workspace/ui/components/popover';
import { CalendarIcon } from 'lucide-react';
import {
    InputGroup,
    InputGroupInput,
    InputGroupAddon,
    InputGroupButton,
} from '@workspace/ui/components/input-group';
import { Locale } from 'node_modules/date-fns/types.js';

function formatDate(date: Date | undefined) {
    if (!date) {
        return '';
    }

    return date.toLocaleDateString('ru-RU', {
        day: '2-digit',
        month: 'long',
        year: 'numeric',
    });
}

function isValidDate(date: Date | undefined) {
    if (!date) {
        return false;
    }
    return !isNaN(date.getTime());
}
export interface DatePickerInputProps
    extends Omit<React.ComponentProps<'input'>, 'placeholder'> {
    locale: Locale | undefined;
    label: string;
    placeholder: string;
    initialValue: string;
    isError?: boolean;
    /** Обработчик изменения даты (опциональный, если используется react-hook-form) */
    onDateChange?: (date: Date | undefined) => void;
    className?: string;
}
export function DatePickerInput({
    locale,
    label,
    isError,
    placeholder,
    initialValue,
    onDateChange,
    className: inputClassName,
    id,
    name,
    onBlur: externalOnBlur,
    ref,
    value: controlledValue,
    onChange: externalOnChange,
    'aria-invalid': ariaInvalid,
    ...props
}: DatePickerInputProps) {
    const inputId = id || 'date-required';
    const [open, setOpen] = React.useState(false);
    const [month, setMonth] = React.useState<Date | undefined>(
        controlledValue
            ? new Date(String(controlledValue))
            : initialValue
              ? new Date(initialValue)
              : undefined,
    );

    // Если используется react-hook-form (есть controlledValue), используем его значение
    // Иначе используем внутреннее состояние
    const isControlled = controlledValue !== undefined;
    const [uncontrolledValue, setUncontrolledValue] = React.useState(
        initialValue ? formatDate(new Date(initialValue)) : '',
    );
    const [uncontrolledDate, setUncontrolledDate] = React.useState<
        Date | undefined
    >(initialValue ? new Date(initialValue) : undefined);

    // Определяем текущее значение и дату
    const currentValue = isControlled
        ? controlledValue
            ? formatDate(new Date(String(controlledValue)))
            : ''
        : uncontrolledValue;
    const currentDate = isControlled
        ? controlledValue
            ? new Date(String(controlledValue))
            : undefined
        : uncontrolledDate;

    // Синхронизируем month с текущей датой
    React.useEffect(() => {
        if (currentDate) {
            setMonth(currentDate);
        }
    }, [currentDate]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const inputValue = e.target.value;
        const date = new Date(inputValue);

        const isEmptyValue = !inputValue;
        const valideDateResult = isValidDate(date);
        const isValidChange = isEmptyValue || valideDateResult;

        // Вызываем onChange из react-hook-form ПЕРВЫМ (важно для валидации)
        if (externalOnChange) {
            externalOnChange(e);
        }

        if (isValidChange) {
            if (!isControlled) {
                setUncontrolledValue(inputValue);
                if (valideDateResult) {
                    setUncontrolledDate(date);
                    setMonth(date);
                } else {
                    setUncontrolledDate(undefined);
                }
            }

            if (onDateChange && valideDateResult) {
                onDateChange(date);
            } else if (onDateChange && isEmptyValue) {
                onDateChange(undefined);
            }
        }
    };

    const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
        // Вызываем onBlur из react-hook-form (важно для валидации)
        if (externalOnBlur) {
            externalOnBlur(e);
        }
    };

    const handleCalendarSelect = (selectedDate: Date | undefined) => {
        if (!selectedDate) return;

        const formattedValue = formatDate(selectedDate);

        if (!isControlled) {
            setUncontrolledDate(selectedDate);
            setUncontrolledValue(formattedValue);
        }
        setMonth(selectedDate);
        setOpen(false);

        // Создаем синтетическое событие для react-hook-form
        // Важно: вызываем onChange с правильным значением, чтобы react-hook-form обновил валидацию
        if (externalOnChange) {
            const syntheticEvent = {
                target: { value: formattedValue },
                currentTarget: { value: formattedValue },
            } as React.ChangeEvent<HTMLInputElement>;
            externalOnChange(syntheticEvent);
        }

        if (onDateChange) {
            onDateChange(selectedDate);
        }
    };

    // Используем aria-invalid из react-hook-form как основной источник истины
    // Он обновляется автоматически при изменении значения через react-hook-form
    // isError используется только как fallback для случаев без react-hook-form
    const hasError =
        ariaInvalid === true ||
        ariaInvalid === 'true' ||
        (ariaInvalid === undefined && isError);

    return (
        <Field>
            <FieldLabel
                className={hasError ? 'text-destructive' : ''}
                htmlFor={inputId}
            >
                {label}
            </FieldLabel>
            <InputGroup>
                <InputGroupInput
                    id={inputId}
                    name={name}
                    value={currentValue}
                    placeholder={placeholder}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    ref={ref}
                    aria-invalid={hasError}
                    onKeyDown={e => {
                        if (e.key === 'ArrowDown') {
                            e.preventDefault();
                            setOpen(true);
                        }
                        // Вызываем onKeyDown из пропсов, если он есть
                        if (props.onKeyDown) {
                            props.onKeyDown(e);
                        }
                    }}
                    {...props}
                    className={inputClassName}
                />
                <InputGroupAddon align="inline-end">
                    <Popover open={open} onOpenChange={setOpen}>
                        <PopoverTrigger asChild>
                            <InputGroupButton
                                id="date-picker"
                                variant="ghost"
                                size="icon-xs"
                                aria-label="Select date"
                            >
                                <CalendarIcon />
                                <span className="sr-only">Выбрать дату</span>
                            </InputGroupButton>
                        </PopoverTrigger>
                        <PopoverContent
                            className="w-auto overflow-hidden p-0"
                            align="end"
                            alignOffset={-8}
                            sideOffset={10}
                        >
                            <Calendar
                                mode="single"
                                selected={currentDate}
                                month={month}
                                onMonthChange={setMonth}
                                locale={locale}
                                onSelect={handleCalendarSelect}
                            />
                        </PopoverContent>
                    </Popover>
                </InputGroupAddon>
            </InputGroup>
        </Field>
    );
}
