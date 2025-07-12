"use client"
import { ModalMenu, Select } from "@/modules/shared"
import { useEditParticipant } from "../hook/useParticipantEdit"
import { BxParticipantsData, BxParticipantsDataKeys, getParticipantSelect, getParticipantSelectItemByValue, IParticipant } from "@alfa/entities"
import { Input } from "@workspace/ui/components/input"
import { Label } from "@workspace/ui/components/label"
import { Button } from "@workspace/ui/components/button"
import { Textarea } from "@workspace/ui/components/textarea"
import { useEffect, useState } from "react"
import { Edit2Icon, Trash2Icon, XIcon } from "lucide-react"
import { useAlfaProducts } from "@/modules/entities/product/hook/useAlfaProducts"
import { getProductFieldByCodeValue } from "@/modules/entities"
import { ISelectItem } from "@/modules/shared/Select/Select"
import { ParticipantProductPpkSelect } from "./components/ParticipantProductSelect"
import { DialogDescription, DialogHeader } from "@workspace/ui/components/dialog"
import { DialogTitle } from "@workspace/ui/components/dialog"
import { ModalScreen } from "@/modules/shared"
interface ParticipalEditModalProps {
    isActive: boolean
    // onClose: () => void
    editable: IParticipant
}

const generalCodes = [
    BxParticipantsDataKeys.name,
    BxParticipantsDataKeys.email,
    BxParticipantsDataKeys.phone,
    BxParticipantsDataKeys.format,
    BxParticipantsDataKeys.address_for_udost,

]
const ppkCodes = [
    BxParticipantsDataKeys.is_ppk,
    BxParticipantsDataKeys.days,

]
export const ppkProgramCodes = [

    BxParticipantsDataKeys.accountant_gos,
    BxParticipantsDataKeys.accountant_medical,
    BxParticipantsDataKeys.kadry,
    BxParticipantsDataKeys.zakupki,
    BxParticipantsDataKeys.corruption,

]

export const ParticipalEditModal = ({
    isActive,
    
    editable
}: ParticipalEditModalProps) => {

    const { cancelEditable, changeEditable, editParticipantTopic, updateParticipant, name } = useEditParticipant(editable.id)
    const [isPpk, setIsPpk] = useState(false)
    debugger


    useEffect(() => {
        editable.fields.forEach(field => {
            if (field.code === BxParticipantsDataKeys.is_ppk) {
                const value = getParticipantSelectItemByValue(field.code, field.value)

                if (value?.code === 'yes') {

                    setIsPpk(true)
                } else {
                    setIsPpk(false)
                }
            }
        })
        console.log(isPpk)
    }, [editable])

    return (<ModalScreen

        isActive={isActive}
        title={`Редактирование участника`}
        description={`Вы уверены, что хотите изменить данные участника ${name}?`}
        onClose={cancelEditable}
        FooterComponent={(
            <div className="flex flex-row gap-5 w-full justify-end items-end mt-auto">
                <div className="flex flex-row gap-5 w-1/2">
                    <div className="flex flex-col gap-5 w-1/2">
                        <Button variant="outline" onClick={cancelEditable}>Отмена</Button>
                    </div>
                    <div className="flex flex-col gap-5 w-1/2">
                        <Button onClick={updateParticipant}>Отправить</Button>
                    </div>
                </div>
            </div>
        )}
    >
        <div className="flex flex-row justify-between gap-5 w-full h-[77vh] overflow-y-auto">
            <div className="flex flex-col gap-5 w-full">
                <h2>Основные данные</h2>
                {
                    editable.fields
                        .filter(field => generalCodes.includes(field.code))
                        .sort((a, b) => generalCodes.indexOf(a.code) - generalCodes.indexOf(b.code))
                        .map(field => {
                            const isSelect = field.code === BxParticipantsDataKeys.format || field.code === BxParticipantsDataKeys.is_ppk
                            const selectOptions = isSelect ? getParticipantSelect(field.code) : []
                            return <div key={field.bitrixId} className="flex flex-col gap-5">
                                <div className="flex flex-col gap-2 mt-2">
                                    <Label>{field.name}</Label>
                                    {isSelect && selectOptions ? <Select
                                        currentValue={String(getParticipantSelectItemByValue(field.code, field.value)?.value || '')}
                                        onValueChange={(value) => changeEditable(field.code, value)}
                                        options={selectOptions}
                                    />
                                        : <Input
                                            value={field.value}
                                            onChange={(e) => changeEditable(field.code, e.target.value)}
                                        />
                                    }
                                </div>
                            </div>
                        })
                }
            </div>
            <div className="flex flex-col gap-5 w-full">
                <h2>ППК</h2>
                {
                    editable.fields
                        .filter(field => ppkCodes.includes(field.code))
                        .sort((a, b) => ppkCodes.indexOf(a.code) - ppkCodes.indexOf(b.code))
                        .map(field => {
                            const isSelect = field.code === BxParticipantsDataKeys.format || field.code === BxParticipantsDataKeys.is_ppk
                            const selectOptions = isSelect ? getParticipantSelect(field.code) : []
                            return <div key={field.bitrixId} className="flex flex-col gap-2 mt-2">
                                <Label>{field.name}</Label>
                                {isSelect ? selectOptions && selectOptions.length > 0 && <Select
                                    currentValue={String(getParticipantSelectItemByValue(field.code, field.value)?.value || '')}
                                    onValueChange={(value) => changeEditable(field.code, value)}
                                    options={selectOptions}
                                /> : <Textarea
                                    className="w-full h-20"
                                    value={field.value}
                                    onChange={(e) => changeEditable(field.code, e.target.value)}
                                />
                                }
                            </div>
                        })
                }
            </div>

            {isPpk && <div className="flex flex-col gap-5 w-full">
                <h2>ППК программы</h2>
                {
                    editable.fields
                        .filter(field => ppkProgramCodes.includes(field.code))
                        .map(field => {
                            return <div key={field.bitrixId} className="flex flex-col gap-2 mt-2">
                                <Label>{field.name.split('Программы повышения квалификации')[1]}</Label>
                                <ParticipantProductPpkSelect field={field} changeEditable={editParticipantTopic} />
                            </div>

                        })
                }
            </div>}
        </div>
    </ModalScreen>



        // <ModalMenu
        //     isOpen={isActive && !!editable}
        //     onOpenChange={cancelEditable}
        //     onSubmit={() => updateParticipant()}
        //     title="Редактирование участника"
        //     description="Вы уверены, что хотите изменить данные участника?"
        // >
        // <div className="fixed h-screen w-screen inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50">
        //     <div className="bg-card rounded-lg p-6 w-3/4 min-h-[80vh]  mx-4 flex flex-col justify-start items-center z-150 shadow-xl scrollbar-hide">
        //         <div className="header flex flex-row gap-2 justify-between items-start w-full mb-4  "> 
        //             <div className="flex flex-col gap-2 justify-start items-start w-1/2 ">
        //                 <h1 className="text-2xl font-bold">{"Редактирование участника"}</h1>
        //                 <p className="text-sm text-gray-500">{"Вы уверены, что хотите изменить данные участника?"}</p>
        //             </div>
        //             <div className="flex flex-row gap-2 justify-end items-end w-1/2">
        //                 <div className="rounded-md hover:bg-zinc-200 p-3 cursor pointer" onClick={cancelEditable}>
        //                     <XIcon className="w-4 h-4" />
        //                 </div>

        //             </div>
        //         </div>

        //         <div className="flex items-center space-x-3 mb-4  max-h-[80vh] overflow-y-auto">
        //             <div className="flex flex-row justify-between gap-5 w-full">
        //                 <div className="flex flex-col gap-5 w-full">
        //                     <h2>Основные данные</h2>
        //                     {
        //                         editable.fields
        //                             .filter(field => generalCodes.includes(field.code))
        //                             .map(field => {
        //                                 const isSelect = field.code === BxParticipantsDataKeys.format || field.code === BxParticipantsDataKeys.is_ppk
        //                                 const selectOptions = isSelect ? getParticipantSelect(field.code) : []
        //                                 return <div key={field.bitrixId} className="flex flex-col gap-5">
        //                                     <div className="flex flex-col gap-2 mt-2">
        //                                         <Label>{field.name}</Label>
        //                                         {isSelect && selectOptions ? <Select
        //                                             currentValue={String(getParticipantSelectItemByValue(field.code, field.value)?.value || '')}
        //                                             onValueChange={(value) => changeEditable(field.code, value)}
        //                                             options={selectOptions}
        //                                         />
        //                                             : <Input
        //                                                 value={field.value}
        //                                                 onChange={(e) => changeEditable(field.code, e.target.value)}
        //                                             />
        //                                         }
        //                                     </div>
        //                                 </div>
        //                             })
        //                     }
        //                 </div>
        //                 <div className="flex flex-col gap-5 w-full">
        //                     <h2>ППК</h2>
        //                     {
        //                         editable.fields
        //                             .filter(field => ppkCodes.includes(field.code))
        //                             .map(field => {
        //                                 const isSelect = field.code === BxParticipantsDataKeys.format || field.code === BxParticipantsDataKeys.is_ppk
        //                                 const selectOptions = isSelect ? getParticipantSelect(field.code) : []
        //                                 return <div key={field.bitrixId} className="flex flex-col gap-2 mt-2">
        //                                     <Label>{field.name}</Label>
        //                                     {isSelect ? selectOptions && selectOptions.length > 0 && <Select
        //                                         currentValue={String(getParticipantSelectItemByValue(field.code, field.value)?.value || '')}
        //                                         onValueChange={(value) => changeEditable(field.code, value)}
        //                                         options={selectOptions}
        //                                     /> : <Textarea
        //                                         className="w-full h-20"
        //                                         value={field.value}
        //                                         onChange={(e) => changeEditable(field.code, e.target.value)}
        //                                     />
        //                                     }
        //                                 </div>
        //                             })
        //                     }
        //                 </div>

        //                 {isPpk && <div className="flex flex-col gap-5 w-full">
        //                     <h2>ППК программы</h2>
        //                     {
        //                         editable.fields
        //                             .filter(field => ppkProgramCodes.includes(field.code))
        //                             .map(field => {
        //                                 return <div key={field.bitrixId} className="flex flex-col gap-2 mt-2">
        //                                     <Label>{field.name.split('Программы повышения квалификации')[1]}</Label>
        //                                     <ParticipantProductPpkSelect field={field} changeEditable={changeEditable} />
        //                                 </div>
        //                                 // console.log(field.value)
        //                                 // const isSelect = field.code === BxParticipantsDataKeys.format || field.code === BxParticipantsDataKeys.is_ppk
        //                                 // const selectOptions = isSelect ? getParticipantSelect(field.code) : []
        //                                 // return <div key={field.bitrixId} className="flex flex-col gap-2 mt-2">
        //                                 //     <Label>{field.name.split('Программы повышения квалификации')[1]}</Label>
        //                                 //     {isSelect ? selectOptions && selectOptions.length > 0 && <Select
        //                                 //         currentValue={String(getParticipantSelectItemByValue(field.code, field.value)?.value || '')}
        //                                 //         onValueChange={(value) => changeEditable(field.code, value)}
        //                                 //         options={selectOptions}
        //                                 //     /> : !field.value || field.value.length === 0
        //                                 //         ? <Select
        //                                 //             currentValue={('')}
        //                                 //             onValueChange={(value) => changeEditable(field.code, value)}
        //                                 //             options={ppkProductItems}
        //                                 //         />
        //                                 //         : <div className="flex flex-col gap-2 mt-2 relative">
        //                                 //             <div className="absolute top-0 right-0 flex flex-row gap-2  p-1 bg-gray-200 rounded-md  z-100">
        //                                 //                 <Button className="h-6 w-6 cursor-pointer hover:bg-primary hover:text-background" variant="outline" onClick={() => changeEditable(field.code, '')}>
        //                                 //                     <Edit2Icon className="w-4 h-4" />
        //                                 //                 </Button>
        //                                 //                 <Button className="h-6 w-6 cursor-pointer hover:bg-red-100 hover:text-red-500" variant="outline" onClick={() => changeEditable(field.code, '')}>
        //                                 //                     <Trash2Icon className="w-4 h-4" />
        //                                 //                 </Button>
        //                                 //             </div>
        //                                 //             <Textarea

        //                                 //                 className="w-full h-20 bg-white-100 opacity-30"
        //                                 //                 value={field.value}
        //                                 //             // onChange={(e) => changeEditable(field.code, e.target.value)}
        //                                 //             />
        //                                 //         </div>
        //                                 //     }
        //                                 // </div>
        //                             })
        //                     }
        //                 </div>}
        //             </div>

        //         </div>
        //         <div className="flex flex-row gap-5 w-full justify-end items-end mt-auto">
        //             <div className="flex flex-row gap-5 w-1/2">
        //                 <div className="flex flex-col gap-5 w-1/2">
        //                     <Button variant="outline" onClick={cancelEditable}>Отмена</Button>
        //                 </div>
        //                 <div className="flex flex-col gap-5 w-1/2">
        //                     <Button onClick={updateParticipant}>Отправить</Button>
        //                 </div>
        //             </div>
        //         </div>
        //     </div>
        // </div>
        // </ModalMenu>
    )
}