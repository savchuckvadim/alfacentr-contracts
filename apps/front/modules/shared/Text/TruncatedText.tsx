'use client';

import { cn } from '@workspace/ui/lib/utils';
import { FC, useEffect, useRef, useState } from 'react';
import { Tooltip } from '../Tooltip';

export interface TruncatedTextProps {
    text: string;
    className?: string;
    tooltipClassName?: string;
    side?: 'top' | 'right' | 'bottom' | 'left';
}

/**
 * Текст в одну строку с многоточием и полным значением в подсказке.
 *
 * Для ячеек таблиц с длинными значениями — названиями программ, адресами.
 * Подсказка вешается только когда текст действительно не влез: на коротких
 * значениях она была бы шумом. Ширину задаёт родитель — ячейка с фиксированной
 * раскладкой таблицы или любой блок с ограниченной шириной.
 */
export const TruncatedText: FC<TruncatedTextProps> = ({
    text,
    className,
    tooltipClassName,
    side = 'top',
}) => {
    const ref = useRef<HTMLSpanElement>(null);
    const [isOverflowing, setIsOverflowing] = useState(false);

    useEffect(() => {
        const element = ref.current;
        if (!element) return;

        const measure = () =>
            setIsOverflowing(element.scrollWidth > element.clientWidth);
        measure();

        //ширина ячейки меняется вместе с окном и соседними колонками
        const observer = new ResizeObserver(measure);
        observer.observe(element);
        return () => observer.disconnect();
    }, [text]);

    const content = (
        <span
            ref={ref}
            className={cn('block min-w-0 max-w-full truncate', className)}
        >
            {text}
        </span>
    );

    if (!isOverflowing) return content;

    return (
        <Tooltip
            side={side}
            content={
                <div
                    className={cn(
                        'max-w-[480px] whitespace-normal break-words text-sm',
                        tooltipClassName,
                    )}
                >
                    {text}
                </div>
            }
        >
            {content}
        </Tooltip>
    );
};
