'use client';

import { useEffect, useState } from 'react';
import { Button } from '@workspace/ui/components/button';
import { Textarea } from '@workspace/ui/components/textarea';
import { Loader2, PencilLine } from 'lucide-react';
import { cn } from '@workspace/ui/lib/utils';

import { useDealEdoComment } from '@/modules/features/deal-edo-comment';

export interface EdoCommentEditorProps {
    /** Сколько строк показывать до «Показать всё». 0 — показывать целиком */
    previewLines?: 3 | 4 | 6 | 0;
    className?: string;
}

/**
 * Классы обрезки заданы списком, а не строкой с подстановкой: Tailwind
 * собирает классы статическим поиском по исходникам, и `line-clamp-${n}`
 * в сборку не попал бы — обрезка молча перестала бы работать.
 */
const CLAMP_CLASS: Record<number, string> = {
    3: 'line-clamp-3',
    4: 'line-clamp-4',
    6: 'line-clamp-6',
};

/**
 * Комментарий для сотрудника ОДО: чтение и правка.
 *
 * Поле в карточке сделки узкое, и отдел продаж писать в него не мог —
 * настолько, что начал писать важное в «Участник 1 Комментарий», которое
 * шире. Здесь поле широкое, а в ОДО его читают прямо в приложении, не
 * возвращаясь в сделку.
 *
 * Текста бывает и две строки, и несколько абзацев, поэтому длинный
 * сворачивается до previewLines с кнопкой «Показать всё». Обрезаем по
 * высоте, а не по символам: три строки читаются одинаково, сколько бы
 * слов в них ни было.
 */
export const EdoCommentEditor = ({
    previewLines = 4,
    className,
}: EdoCommentEditorProps) => {
    const { comment, isUpdating, error, update } = useDealEdoComment();

    const [isEditing, setIsEditing] = useState(false);
    const [isExpanded, setIsExpanded] = useState(false);
    const [draft, setDraft] = useState(comment);

    //правку в соседней вкладке или в карточке сделки подхватываем, но не
    //поверх набранного: иначе у того, кто сейчас пишет, текст подменится
    useEffect(() => {
        if (!isEditing) setDraft(comment);
    }, [comment, isEditing]);

    const startEditing = () => {
        setDraft(comment);
        setIsEditing(true);
    };

    const cancelEditing = () => {
        setDraft(comment);
        setIsEditing(false);
    };

    const save = () => {
        update(draft);
        setIsEditing(false);
    };

    if (isEditing) {
        return (
            <div className={cn('flex flex-col gap-3', className)}>
                <Textarea
                    value={draft}
                    onChange={event => setDraft(event.target.value)}
                    //минимум восемь строк: поле в карточке сделки низкое, и
                    //именно поэтому им не пользовались
                    className="min-h-45 resize-y"
                    placeholder="Что важно знать сотруднику ОДО по этой заявке"
                    autoFocus
                />

                {error && <p className="text-sm text-red-500">{error}</p>}

                <div className="flex flex-row gap-2 justify-end">
                    <Button
                        variant="outline"
                        onClick={cancelEditing}
                        disabled={isUpdating}
                    >
                        Отмена
                    </Button>
                    <Button onClick={save} disabled={isUpdating}>
                        {isUpdating && (
                            <Loader2 className="w-4 h-4 animate-spin" />
                        )}
                        Сохранить
                    </Button>
                </div>
            </div>
        );
    }

    if (!comment) {
        return (
            <div className={cn('flex flex-col gap-3', className)}>
                <p className="text-sm text-gray-500">
                    Комментарий пока не заполнен.
                </p>
                <div className="flex flex-row justify-start">
                    <Button variant="outline" onClick={startEditing}>
                        <PencilLine className="w-4 h-4" />
                        Добавить комментарий
                    </Button>
                </div>
            </div>
        );
    }

    const clampClass = CLAMP_CLASS[previewLines];
    const isCollapsible = Boolean(clampClass);

    return (
        <div className={cn('flex flex-col gap-3', className)}>
            {/*
                whitespace-pre-wrap: комментарий пишут строчками и абзацами,
                и без этого он склеивается в сплошной текст.
                line-clamp обрезает по строкам, поэтому короткий текст
                остаётся как есть, а длинный сворачивается ровно
            */}
            <p
                className={cn(
                    'text-sm whitespace-pre-wrap break-words',
                    isCollapsible && !isExpanded && clampClass,
                )}
            >
                {comment}
            </p>

            <div className="flex flex-row gap-2 items-center justify-between">
                {isCollapsible ? (
                    <Button
                        variant="link"
                        className="px-0 h-auto"
                        onClick={() => setIsExpanded(value => !value)}
                    >
                        {isExpanded ? 'Свернуть' : 'Показать всё'}
                    </Button>
                ) : (
                    <span />
                )}

                <Button variant="outline" onClick={startEditing}>
                    <PencilLine className="w-4 h-4" />
                    Редактировать
                </Button>
            </div>
        </div>
    );
};
