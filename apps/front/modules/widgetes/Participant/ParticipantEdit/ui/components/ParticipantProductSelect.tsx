import { useAlfaProducts } from "@/modules/entities/product/hook/useAlfaProducts"
import { getProductFieldByCodeValue } from "@/modules/entities"
import { ISelectItem, Select } from "@/modules/shared/Select/Select"
import { useState } from "react"
import { AlfaParticipantSmartItemUserFieldsEnum, BxParticipantsDataKeys, IParticipantField } from "@alfa/entities"
import { Button } from "@workspace/ui/components/button"
import { Edit2Icon, Trash2Icon, PackageIcon } from "lucide-react"
import { Textarea } from "@workspace/ui/components/textarea"
import { Badge } from "@workspace/ui/components/badge"
import { Card, CardContent } from "@workspace/ui/components/card"

export const ParticipantProductPpkSelect = ({ field, changeEditable }: { field: IParticipantField<AlfaParticipantSmartItemUserFieldsEnum>, changeEditable: (code: BxParticipantsDataKeys, value: string) => void }) => {
    const [isEdit, setIsEdit] = useState(false)
    const { ppkProducts } = useAlfaProducts()
    const ppkProductItems = ppkProducts.map(product => ({
        value: `${getProductFieldByCodeValue(product, 'SEMINAR_TOPIC')?.value}` || '',
        code: product.id?.toString() || '',
        label: `${product.id} ${getProductFieldByCodeValue(product, 'SEMINAR_TOPIC')?.value} ${product.productName}`,
        bitrixId: product.id,
    } as ISelectItem))

    const setSelect = (value: string) => {
        changeEditable(field.code, value)
        setIsEdit(false)
    }

    const handleDelete = () => {
        changeEditable(field.code, '')
    }
    const isFieldEmpty = !field.value || field.value.length === 0
    return (
        <div className="w-full">
            {isEdit ? (
                <div className="space-y-3">
                    <div className="flex items-center gap-2">
                        <PackageIcon className="w-4 h-4 text-muted-foreground" />
                        <span className="text-sm font-medium text-muted-foreground">Выберите продукт ППК</span>
                    </div>
                    <Select
                        currentValue={field.value || ''}
                        onValueChange={(value) => setSelect(value)}
                        options={ppkProductItems}
                    />
                    <div className="flex gap-2">
                        <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => setIsEdit(false)}
                            className="flex-1"
                        >
                            Отмена
                        </Button>
                        <Button 
                            size="sm"
                            onClick={() => setIsEdit(false)}
                            className="flex-1"
                        >
                            Сохранить
                        </Button>
                    </div>
                </div>
            ) : (
                <Card className="relative group hover:shadow-md transition-all duration-200 border-l-4 border-l-primary/20">
                    <CardContent className="p-4">
                        <div className="flex items-start justify-between gap-3">
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-2">
                                    <PackageIcon className="w-4 h-4 text-primary" />
                                    <span className="text-sm font-medium text-foreground">Продукт ППК</span>
                                    {/* {field.value && (
                                        <Badge variant="secondary" className="text-xs">
                                            Назначен
                                        </Badge>
                                    )} */}
                                </div>
                                
                                {field.value && field.value.length > 0 ? (
                                    <div className="space-y-2">
                                        <Textarea
                                            className="min-h-[40px] resize-none bg-muted/30 border-0 text-sm leading-relaxed"
                                            value={field.value}
                                            readOnly
                                        />
                                        <div className="text-xs text-muted-foreground">
                                            Нажмите кнопку редактирования для изменения
                                        </div>
                                    </div>
                                ) : (
                                    <div className="flex items-center justify-center h-20 bg-muted/20 rounded-md border-2 border-dashed border-muted-foreground/20">
                                        <div className="text-center">
                                            <PackageIcon className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                                            <p className="text-sm text-muted-foreground">Продукт не выбран</p>
                                        </div>
                                    </div>
                                )}
                            </div>
                            
                            <div className="flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                                <Button
                                    size="sm"
                                    variant="ghost"
                                    onClick={() => setIsEdit(true)}
                                    className="h-8 w-8 p-0 hover:bg-primary/10 hover:text-primary"
                                >
                                    <Edit2Icon className="w-4 h-4" />
                                </Button>
                                {field.value && (
                                    <Button 
                                        size="sm"
                                        variant="ghost" 
                                        onClick={handleDelete}
                                        className="h-8 w-8 p-0 hover:bg-destructive/10 hover:text-destructive"
                                    >
                                        <Trash2Icon className="w-4 h-4" />
                                    </Button>
                                )}
                            </div>
                        </div>
                    </CardContent>
                </Card>
            )}
        </div>
    )
}