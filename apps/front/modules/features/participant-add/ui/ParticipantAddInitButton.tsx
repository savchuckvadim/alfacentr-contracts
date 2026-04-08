import { Button } from "@workspace/ui/components/button";
import { useAppDispatch } from '@/modules/app';
import { getCreatingParticipant, setEditable } from '@/modules/entities';
import { Tooltip } from '@/modules/shared';

export const ParticipantAddInitButton = ({ size }: { size?: 'small' | 'default' }) => {
    const dispatch = useAppDispatch();
    const isSmall = size === 'small';

    const handleAddNew = () => {
        dispatch(setEditable(getCreatingParticipant()));
    };


    const icon = (
        <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
        >
            <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 6v6m0 0v6m0-6h6m-6 0H6"
            />
        </svg>
    );

    if (isSmall) {
        return (
            <Tooltip content="Добавить участника">
                <Button
                    onClick={handleAddNew}
                    variant="outline"
                    size="icon"
                    className="h-8 w-8 p-0"
                    aria-label="Добавить участника"
                >
                    {icon}
                </Button>
            </Tooltip>
        );
    }

    return (
        <Button
            onClick={handleAddNew}
            className="flex items-center space-x-2"
        >
            {icon}
            <span>Добавить участника</span>
        </Button>
    );
};
