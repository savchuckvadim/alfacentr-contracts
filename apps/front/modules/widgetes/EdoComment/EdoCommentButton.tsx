'use client';

import { useState } from 'react';
import { MessageSquareText } from 'lucide-react';
import { cn } from '@workspace/ui/lib/utils';

import { ModalScreen } from '@/modules/shared';
import {
    DealEdoCommentName,
    useDealEdoComment,
} from '@/modules/features/deal-edo-comment';

import { EdoCommentEditor } from './EdoCommentEditor';

export interface EdoCommentButtonProps {
    className?: string;
}

/** Сколько символов показать в плашке, пока её не открыли */
const PREVIEW_LENGTH = 60;

/**
 * Плашка комментария ОДО в шапке приложения.
 *
 * Коллеги из ОДО читают комментарий, не заходя в сделку, поэтому он виден
 * сразу на главной. В шапке мало места, поэтому здесь только первая строка,
 * а полный текст и правка — в модальном окне: в узкой плашке длинный
 * комментарий не прочитать и тем более не отредактировать.
 */
export const EdoCommentButton = ({ className }: EdoCommentButtonProps) => {
    const { comment } = useDealEdoComment();
    const [isOpen, setIsOpen] = useState(false);

    //переносы в плашке превратились бы в обрывки строк — показываем одной
    const preview = comment.replace(/\s+/g, ' ').trim();
    const isLong = preview.length > PREVIEW_LENGTH;

    return (
        <>
            <button
                type="button"
                onClick={() => setIsOpen(true)}
                title={DealEdoCommentName}
                className={cn(
                    'flex flex-col items-start gap-0.5 rounded-md border px-3 py-1.5 text-left',
                    'hover:bg-accent transition-colors cursor-pointer max-w-70',
                    className,
                )}
            >
                <span className="flex flex-row items-center gap-1.5 text-xs font-medium">
                    <MessageSquareText className="w-3.5 h-3.5" />
                    Комментарий ОДО
                </span>

                <span className="text-xs text-gray-500 truncate max-w-full">
                    {preview
                        ? `${preview.slice(0, PREVIEW_LENGTH)}${isLong ? '…' : ''}`
                        : 'не заполнен'}
                </span>
            </button>

            <ModalScreen
                isActive={isOpen}
                title={DealEdoCommentName}
                description="Видно сотрудникам ОДО прямо в приложении — возвращаться в сделку не нужно"
                onClose={() => setIsOpen(false)}
                FooterComponent={<span />}
            >
                {/* в модалке места много — показываем целиком, без сворачивания */}
                <EdoCommentEditor previewLines={0} />
            </ModalScreen>
        </>
    );
};
