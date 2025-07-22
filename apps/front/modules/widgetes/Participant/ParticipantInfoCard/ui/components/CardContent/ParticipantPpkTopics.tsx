import { ComponentPreloader } from '@/modules/shared/Preloader/ComponentPreloader';
import { useParticipantInfo } from '../../../hook/useParticipantInfo';
import { MicroPreloader } from '@/modules/shared/Preloader/MicroPreloader';
import { BookOpen } from 'lucide-react';
import { Badge } from '@workspace/ui/components/badge';
import { Tooltip } from '@/modules/shared';
import { cutString } from '@/modules/lib';

export const ParticipantPpkTopics = ({
    participantId,
}: {
    participantId: number;
}) => {
    const {
        isParticipantPpkLoading,

        programsThemes,
    } = useParticipantInfo(participantId);

    return programsThemes.length > 0 ? (
        <div className="space-y-2 h-20">
            <div className="flex items-center gap-2">
                <BookOpen className="h-3 w-3 text-green-600" />
                <span className="text-xs font-medium">Темы ППК:</span>
                <Badge variant="outline" className="text-xs">
                    {programsThemes.length}
                </Badge>
            </div>
            {isParticipantPpkLoading ? (
                <MicroPreloader />
            ) : (
                <div className="flex flex-wrap gap-1">
                    {programsThemes.slice(0, 3).map((theme, index) => (
                        <Tooltip
                            key={index}
                            content={
                                <p className="text-sm max-w-[300px]">{theme}</p>
                            }
                        >
                            <Badge
                                key={index}
                                variant="outline"
                                className="text-xs "
                            >
                                {cutString(theme, 27)}
                            </Badge>
                        </Tooltip>
                    ))}
                    {programsThemes.length > 2 && (
                        <Badge variant="outline" className="text-xs">
                            +{programsThemes.length - 3}
                        </Badge>
                    )}
                </div>
            )}
        </div>
    ) : (
        <div className="space-y-2 h-20"></div>
    );
};
