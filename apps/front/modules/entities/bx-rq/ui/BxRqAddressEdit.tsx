'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@workspace/ui/components/card'
import { Button } from '@workspace/ui/components/button'
import { Badge } from '@workspace/ui/components/badge'
import { BxRqEditModal } from './BxRqEditModal'
import { AddressRqItem, RqItem, RQ_TYPE, BX_ADDRESS_TYPE, isFieldsEmpty } from '@workspace/bx-rq'
import { Edit2, Copy, CheckCircle } from 'lucide-react'

interface BxRqAddressEditProps {
  addresses: AddressRqItem[]
  // currentClientType: RQ_TYPE
  onSave: (typeId: BX_ADDRESS_TYPE, fields: RqItem[]) => void
  onCopy: (fromTypeId: BX_ADDRESS_TYPE, toTypeId: BX_ADDRESS_TYPE) => void
  onCancel: () => void
  isLoading?: boolean
}

export const BxRqAddressEdit = ({
  addresses,
  // currentClientType,
  onSave,
  onCopy,
  onCancel,
  isLoading = false
}: BxRqAddressEditProps) => {
  const [editingTypeId, setEditingTypeId] = useState<BX_ADDRESS_TYPE | null>(null)
  const [editedFields, setEditedFields] = useState<Record<BX_ADDRESS_TYPE, RqItem[]>>({} as Record<BX_ADDRESS_TYPE, RqItem[]>)

  const handleFieldChange = (typeId: BX_ADDRESS_TYPE, code: string, value: string) => {
    setEditedFields(prev => ({
      ...prev,
      [typeId]: (prev[typeId] || addresses.find(addr => addr.type_id === typeId)?.fields || []).map(field =>
        field.code === code ? { ...field, value: value as any } : field
      )
    }))
  }

  const handleSave = (typeId: BX_ADDRESS_TYPE) => {
    const fields = editedFields[typeId] || addresses.find(addr => addr.type_id === typeId)?.fields || []
    onSave(typeId, fields)
    setEditingTypeId(null)
  }

  const handleCancel = () => {
    setEditingTypeId(null)
    setEditedFields({} as Record<BX_ADDRESS_TYPE, RqItem[]>)
    onCancel()
  }

  const handleEdit = (typeId: BX_ADDRESS_TYPE) => {
    setEditingTypeId(typeId)
    const address = addresses.find(addr => addr.type_id === typeId)
    if (address) {
      setEditedFields(prev => ({
        ...prev,
        [typeId]: address.fields
      }))
    }
  }

  const handleCopy = (fromTypeId: BX_ADDRESS_TYPE, toTypeId: BX_ADDRESS_TYPE) => {
    onCopy(fromTypeId, toTypeId)
  }

  const getAddressDisplayName = (typeId: BX_ADDRESS_TYPE) => {
    switch (typeId) {
      case BX_ADDRESS_TYPE.PRIMARY:
        return 'Фактический адрес'
      case BX_ADDRESS_TYPE.REGISTERED:
        return 'Юридический адрес'
      case BX_ADDRESS_TYPE.REGISTERED_FIZ:
        return 'Адрес прописки'
      default:
        return 'Адрес'
    }
  }

  const getSourceTypeForCopy = (typeId: BX_ADDRESS_TYPE) => {
    switch (typeId) {
      case BX_ADDRESS_TYPE.PRIMARY:
        return BX_ADDRESS_TYPE.REGISTERED
      case BX_ADDRESS_TYPE.REGISTERED:
        return BX_ADDRESS_TYPE.PRIMARY
      default:
        return BX_ADDRESS_TYPE.REGISTERED
    }
  }

  return (
    <div className="space-y-4">
      {addresses.map((address) => {
        const isEmpty = isFieldsEmpty(address.fields)
        const otherIsFull = addresses.some((otherAddress) =>
          otherAddress.type_id !== address.type_id && !isFieldsEmpty(otherAddress.fields)
        )
        const sourceType = getSourceTypeForCopy(address.type_id)
        const canCopy = otherIsFull && isEmpty

        return (
          <Card key={address.type_id}>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className={isEmpty ? 'text-red-500' : ''}>
                    {getAddressDisplayName(address.type_id)}
                  </span>
                  {!isEmpty && (
                    <Badge variant="secondary">Заполнено</Badge>
                  )}
                  {isEmpty && (
                    <Badge variant="destructive">Не заполнено</Badge>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  {canCopy && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleCopy(sourceType, address.type_id)}
                      disabled={isLoading}
                      title={`Скопировать из ${getAddressDisplayName(sourceType)}`}
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  )}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleEdit(address.type_id)}
                    disabled={isLoading}
                  >
                    <Edit2 className="h-4 w-4 mr-2" />
                    {isEmpty ? 'Добавить' : 'Редактировать'}
                  </Button>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {!isEmpty ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {address.fields.map((field) => (
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
                    Адрес не заполнен
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        )
      })}

      {editingTypeId && (
        <BxRqEditModal
          title={`Редактирование ${getAddressDisplayName(editingTypeId)}`}
          fields={editedFields[editingTypeId] || []}
          isOpen={!!editingTypeId}
          isLoading={isLoading}
          onSave={() => handleSave(editingTypeId)}
          onCancel={handleCancel}
          onFieldChange={(code, value) => handleFieldChange(editingTypeId, code, value)}
        />
      )}
    </div>
  )
} 