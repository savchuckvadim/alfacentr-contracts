"use client"
import { ModalMenu, Select } from "@/modules/shared"
import { BxParticipantsData, BxParticipantsDataKeys, getParticipantSelect, getParticipantSelectItemByValue, IParticipant } from "@alfa/entities"
import { Input } from "@workspace/ui/components/input"
import { Label } from "@workspace/ui/components/label"
import { Button } from "@workspace/ui/components/button"
import { Textarea } from "@workspace/ui/components/textarea"
import { FC, ReactElement, useEffect, useState } from "react"
import { Edit2Icon, Trash2Icon, XIcon } from "lucide-react"
import { useAlfaProducts } from "@/modules/entities/product/hook/useAlfaProducts"
import { getProductFieldByCodeValue } from "@/modules/entities"
import { ISelectItem } from "@/modules/shared/Select/Select"


export interface IModalScreenProps {
    isActive: boolean;
    FooterComponent?: React.ReactNode;
    children: React.ReactNode;

    title?: string,
    description?: string,
    onClose: () => void
    onSubmit?: () => void

}
export const ModalScreen: FC<IModalScreenProps> = ({
    isActive,
    FooterComponent,
    children,
    title,
    description,
    onClose,
    onSubmit,
}) => {

    if (!isActive) {
        return null;
    }
    return (
        // <ModalMenu
        //     isOpen={isActive && !!editable}
        //     onOpenChange={cancelEditable}
        //     onSubmit={() => updateParticipant()}
        //     title="Редактирование участника"
        //     description="Вы уверены, что хотите изменить данные участника?"
        // >
        <div className="fixed h-screen w-screen inset-0 bg-black/30 backdrop-blur-xs flex items-center justify-center z-50">
            <div className="relative bg-card rounded-lg p-6 w-3/4 min-h-[80vh]  mx-4 flex flex-col justify-start items-center z-150 shadow-xl scrollbar-hide">
                <div className="header flex flex-row gap-2 justify-between items-start w-full mb-4  ">
                    <div className="flex flex-col gap-2 justify-start items-start w-1/2 ">
                        <h1 className="text-2xl font-bold">{title}</h1>
                        {description && <p className="text-sm text-gray-500">{description}</p>}
                    </div>
                    <div className="absolute right-0 top-0 flex flex-row gap-2 justify-end items-end w-1/2">
                        <div className="rounded-md hover:bg-zinc-100 p-3 cursor pointer" onClick={onClose}>
                            {/* <Button variant={'outline'}> */}
                                <XIcon className="w-4 h-4" />
                            {/* </Button> */}

                        </div>

                    </div>
                </div>

                <div className="flex items-center space-x-3 mb-4  max-h-[80vh] overflow-y-auto">
                    {children}

                </div>
                {FooterComponent
                    ? FooterComponent
                    : <div className="flex flex-row gap-5 w-full justify-end items-end mt-auto">
                        <div className="flex flex-row gap-5 w-1/2">
                            <div className="flex flex-col gap-5 w-1/2">
                                <Button variant="outline" onClick={onClose}>Отмена</Button>
                            </div>
                            {onSubmit && <div className="flex flex-col gap-5 w-1/2">
                                <Button onClick={onSubmit}>Отправить</Button>
                            </div>}
                        </div>
                    </div>}
            </div>
        </div>

    )
}