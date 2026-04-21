import { cn } from "@workspace/ui/lib/utils";
import { Pencil } from "lucide-react";
import { FC } from "react";

export interface ClientRqHeaderProps{
    handleClickEditOrCreateBaseRq: () => void;
    hasRq: boolean;
}
export const ClientRqHeader: FC<ClientRqHeaderProps> =
({ handleClickEditOrCreateBaseRq, hasRq }) => {
    return (
        <div className="flex flex-row justify-between items-start pb-3">
            <h2 className=''>Заказчик</h2>
            <div
                onClick={handleClickEditOrCreateBaseRq}
                className={
                    cn(
                        'hover:bg-primary/5 rounded-xl p-2 py-0',
                        'flex flex-row justify-between items-center',
                        'text-primary cursor-pointer '
                    )
                }
            >
                <p>
                    {hasRq ? 'Редактировать' : 'Создать'}
                </p>
                <Pencil className='w-4 h-4 ml-1' />
            </div>
        </div>
    );
};
