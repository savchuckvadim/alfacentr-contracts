import { SelectItem } from '@workspace/ui/components/select';
import {
    Select as SelectPrimitive,
    SelectContent,
    SelectTrigger,
    SelectValue,
} from '@workspace/ui/components/select';
import { cn } from '@workspace/ui/lib/utils';

export interface ISelectItem {
    id?: string;
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
    className,
}: {
    className?: string;
    placeholder?: string;
    currentValue: string;
    onValueChange: (value: string) => void;
    options: ISelectItem[];
}) => {
    return (
        <SelectPrimitive value={currentValue} onValueChange={onValueChange}>
            <SelectTrigger size="sm" className={cn("h-5 border-primary/30 text-primary w-full max-w-[500px] h-9 cursor-pointer ", className)}>
                <SelectValue placeholder={placeholder || 'Выберите значение'} />
            </SelectTrigger>
            <SelectContent className="w-full max-w-[500px] cursor-pointer ">
                {options.map(option => (
                    <SelectItem className="text-primary cursor-pointer" key={option.code} value={String(option.value)}>
                        {option.label}
                    </SelectItem>
                ))}
            </SelectContent>
        </SelectPrimitive>
    );
};
