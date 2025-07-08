'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@workspace/ui/components/card'
import { Button } from '@workspace/ui/components/button'
import { Badge } from '@workspace/ui/components/badge'
import { BxRqEditModal } from './BxRqEditModal'
import { EvsRqItem, RqItem, RQ_TYPE, CONTRACT_LTYPE, SupplyTypesType, filterFieldItems } from '@workspace/bx-rq'
import { Edit2, Save, X } from 'lucide-react'

interface BxRqBaseEditProps {
  rq: EvsRqItem
  fields: RqItem[]
  isEmpty: boolean
  // currentClientType: RQ_TYPE
  // contractType: CONTRACT_LTYPE
  // supplyType: SupplyTypesType
  onSave: (fields: RqItem[]) => void
  onCancel: () => void
  isLoading?: boolean
}

export const BxRqBaseEdit = ({
  rq,
  fields,
  isEmpty,
  // currentClientType,
  // contractType,
  // supplyType,
  onSave,
  onCancel,
  isLoading = false
}: BxRqBaseEditProps) => {
  const [isEditMode, setIsEditMode] = useState(false)
  const [editedFields, setEditedFields] = useState<RqItem[]>(fields)

  const handleFieldChange = (code: string, value: string) => {
    setEditedFields(prev => 
      prev.map(field => 
        field.code === code 
          ? { ...field, value: value as any } 
          : field
      )
    )
  }

  const handleSave = () => {
    onSave(editedFields)
    setIsEditMode(false)
  }

  const handleCancel = () => {
    setEditedFields(fields)
    setIsEditMode(false)
    onCancel()
  }

  const handleEdit = () => {
    setIsEditMode(true)
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span>Основная информация</span>
              {!isEmpty && (
                <Badge variant="secondary">Заполнено</Badge>
              )}
            </div>
            {!isEmpty && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleEdit}
                disabled={isLoading}
              >
                <Edit2 className="h-4 w-4 mr-2" />
                Редактировать
              </Button>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {!isEmpty ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {fields.map((field) => (
                <div key={field.code} className="space-y-1">
                  <label className="text-sm text-muted-foreground">
                    {field.name}
                  </label>
                  <div className="text-sm font-medium">
                    {(field.value as string) || <span className="text-muted-foreground">Не заполнено</span>}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center p-6">
              <p className="text-muted-foreground">
                Реквизиты отсутствуют
              </p>
              <Button
                variant="outline"
                size="sm"
                onClick={handleEdit}
                className="mt-2"
                disabled={isLoading}
              >
                <Edit2 className="h-4 w-4 mr-2" />
                Добавить реквизиты
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      <BxRqEditModal
        title="Редактирование основной информации"
        fields={editedFields}
        isOpen={isEditMode}
        isLoading={isLoading}
        onSave={handleSave}
        onCancel={handleCancel}
        onFieldChange={handleFieldChange}
      />
    </>
  )
} 