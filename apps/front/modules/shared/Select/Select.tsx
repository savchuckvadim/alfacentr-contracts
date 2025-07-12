import { SelectItem } from "@workspace/ui/components/select"
import { Select as SelectPrimitive, SelectContent, SelectTrigger, SelectValue } from "@workspace/ui/components/select"

export interface ISelectItem {
    id?: string
    bitrixId: string | number;
    value: string | number;
    label: string;
    code: string;
}
export const Select = ({
    currentValue,
 
    options,
    placeholder,
    onValueChange,
}: {
    placeholder?: string
    currentValue: string
    onValueChange: (value: string) => void
    options: ISelectItem[]
}) => {
    
    return <SelectPrimitive
       
        value={currentValue}
        onValueChange={onValueChange}
    >
        <SelectTrigger className="w-full max-w-[500px] ">
            <SelectValue placeholder={placeholder || 'Выберите значение'} />
        </SelectTrigger>
        <SelectContent className="w-full max-w-[500px] ">
            {options.map((option) => (
                <SelectItem key={option.code} value={String(option.value)}>
                    {option.label}
                </SelectItem>
            ))}
        </SelectContent>
    </SelectPrimitive>
}







