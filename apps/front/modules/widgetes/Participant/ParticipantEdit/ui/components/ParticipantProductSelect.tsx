import { useAlfaProducts } from "@/modules/entities/product/hook/useAlfaProducts"
import { getProductFieldByCodeValue } from "@/modules/entities"
import { ISelectItem, Select } from "@/modules/shared/Select/Select"
import { useState } from "react"
import { AlfaParticipantSmartItemUserFieldsEnum, BxParticipantsDataKeys, IParticipantField } from "@alfa/entities/dist/entities/smart/participant.interface"
import { Button } from "@workspace/ui/components/button"
import { Edit2Icon } from "lucide-react"
import { Trash2Icon } from "lucide-react"
import { Textarea } from "@workspace/ui/components/textarea"

export const ParticipantProductPpkSelect = ({ field, changeEditable }: { field: IParticipantField<AlfaParticipantSmartItemUserFieldsEnum>, changeEditable: (code: BxParticipantsDataKeys, value: string) => void }) => {
    const [isEdit, setIsEdit] = useState(false)
    const { ppkProducts } = useAlfaProducts()
    const ppkProductItems = ppkProducts.map(product => ({
        value: `${getProductFieldByCodeValue(product, 'SEMINAR_TOPIC')?.value}` || '',
        code: product.id?.toString() || '',
        label: `${product.id} ${getProductFieldByCodeValue(product, 'SEMINAR_TOPIC')?.value} ${product.productName}`,
        bitrixId: product.id,
    } as ISelectItem))
 


    // const [currentValue, setCurrentValue] = useState('')
    const setSelect = (value: string) => {
        // setCurrentValue(value)
        changeEditable(field.code, value)
        setIsEdit(false)
    }
    return (
        <div className="">
            {
                isEdit 
                    ? <Select
                        currentValue={field.value || ''}
                        onValueChange={(value) => setSelect(value)}
                        options={ppkProductItems}
                    />

                    : <div className="flex flex-col gap-2 mt-2 relative">
                        <div className="absolute bottom-1 right-1 flex flex-row gap-2  p-1 bg-zinc-200 rounded-md  z-100">
                            <Button
                                className="h-6 w-6 cursor-pointer hover:bg-primary hover:text-background"
                                variant="outline"
                                onClick={() => setIsEdit(true)}>
                                <Edit2Icon className="w-4 h-4" />
                            </Button>
                            <Button className="h-6 w-6 cursor-pointer hover:bg-red-100 hover:text-red-500" variant="outline" onClick={() => changeEditable(field.code, '')}>
                                <Trash2Icon className="w-4 h-4" />
                            </Button>
                        </div>
                        <Textarea

                            className="w-full h-20 bg-white-100 opacity-30"
                            value={field.value}
                        // onChange={(e) => changeEditable(field.code, e.target.value)}
                        />
                    </div>
            }
        </div>


    )
}