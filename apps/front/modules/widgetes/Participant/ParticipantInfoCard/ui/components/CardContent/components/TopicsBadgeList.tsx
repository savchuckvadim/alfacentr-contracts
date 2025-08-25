'use client';
import { MicroPreloader } from '@/modules/shared/Preloader/MicroPreloader';
import { BookOpen, Cat, Eye, EyeClosed, Package } from 'lucide-react';
import { Badge } from '@workspace/ui/components/badge';
import { Tooltip } from '@/modules/shared';
import { cutString } from '@/modules/lib';
import { useEffect, useState } from 'react';

export interface ITopicsBadgeList {
    title: string;
    participantId: number;
    themes: string[];
    type: 'ppk' | 'seminar' | 'product';
    isLoading: boolean;
}
export const TopicsBadgeList = ({
    title,
    participantId,
    themes,
    type,
    isLoading,
}: ITopicsBadgeList) => {
    const [isFullShowing, setIsFullShowing] = useState(false);
    const [showingThemes, setShowingThemes] = useState<string[]>(
        themes.slice(0, 3),
    );
    useEffect(() => {
        if (isFullShowing) {
            setShowingThemes(themes);
        } else {
            setShowingThemes(themes.slice(0, 3));
        }
    }, [isFullShowing]);

    return themes.length > 0 ? (
        <div className="space-y-2 ">
            <div className="flex items-center gap-2">
                {type === 'ppk' && (
                    <BookOpen className="h-3 w-3 text-green-600" />
                )}
                {type === 'product' && (
                    <Package className="h-3 w-3 text-blue-600" />
                )}
                {type === 'seminar' && <Cat className="h-3 w-3 text-primary" />}
                <span className="text-xs font-medium">{title}:</span>
                <Tooltip
                    key={`${type}-total-tooltip-${participantId}`}
                    content={
                        <div className="flex flex-col gap-1">
                            {themes.map(theme => (
                                <p className="text-sm max-w-[300px]">{theme}</p>
                            ))}
                        </div>
                    }
                >
                    <Badge variant="outline" className="text-xs">
                        {themes.length}
                    </Badge>
                </Tooltip>
            </div>
            {isLoading ? (
                <MicroPreloader />
            ) : (
                <div className="flex flex-wrap items-center gap-1">
                    {showingThemes.map((theme, index) => (
                        <Tooltip
                            key={`${type}-theme-tooltip-${index}`}
                            content={
                                <p className="text-sm max-w-[300px]">{theme}</p>
                            }
                        >
                            <Badge
                                key={index}
                                variant="outline"
                                className="text-xs "
                            >
                                {cutString(theme, isFullShowing ? 100 : 27)}
                            </Badge>
                        </Tooltip>
                    ))}
                    {themes.length > 3 && !isFullShowing && (
                        <Tooltip
                            key={`programsThemes-badge-tooltip-${participantId}`}
                            content={
                                <div className="flex flex-col gap-1">
                                    {themes.map(theme => (
                                        <p className="text-sm max-w-[300px]">
                                            {theme}
                                        </p>
                                    ))}
                                </div>
                            }
                        >
                            <Badge variant="outline" className="text-xs">
                                +{themes.length - 3}
                            </Badge>
                        </Tooltip>
                    )}

                    {isFullShowing ? (
                        <EyeClosed
                            onClick={() => setIsFullShowing(false)}
                            className="w-4 h-4"
                        />
                    ) : (
                        <Eye
                            onClick={() => setIsFullShowing(true)}
                            className="w-4 h-4"
                        />
                    )}
                </div>
            )}
        </div>
    ) : (
        <div className="space-y-2 h-20"></div>
    );
};
