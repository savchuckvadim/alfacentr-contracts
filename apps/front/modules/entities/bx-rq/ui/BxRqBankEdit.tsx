'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@workspace/ui/components/card'
import { Button } from '@workspace/ui/components/button'
import { Badge } from '@workspace/ui/components/badge'
import { BxRqEditModal } from './BxRqEditModal'
import { BankRq, RqItem, isFieldsEmpty } from '@workspace/bx-rq'
import { Edit2, Plus } from 'lucide-react'

interface BxRqBankEditProps {
  bank: BankRq
  onSave: (bankId: number, fields: RqItem[]) => void
  onCancel: () => void
  isLoading?: boolean
}

export const BxRqBankEdit = ({
  bank,
  onSave,
  onCancel,
  isLoading = false
}: BxRqBankEditProps) => {
  const [editingBankId, setEditingBankId] = useState<number | null>(null)
  const [editedFields, setEditedFields] = useState<Record<number, RqItem[]>>({})

  const bankItems = bank.items && bank.items.length ? bank.items : [bank.current]

  const handleFieldChange = (bankId: number, code: string, value: string) => {
    setEditedFields(prev => ({
      ...prev,
      [bankId]: (prev[bankId] || bankItems.find(item => item.id === bankId)?.fields || []).map(field =>
        field.code === code ? { ...field, value: value as any } : field
      )
    }))
  }

  const handleSave = (bankId: number) => {
    const fields = editedFields[bankId] || bankItems.find(item => item.id === bankId)?.fields || []
    onSave(bankId, fields)
    setEditingBankId(null)
  }

  const handleCancel = () => {
    setEditingBankId(null)
    setEditedFields({})
    onCancel()
  }

  const handleEdit = (bankId: number) => {
    setEditingBankId(bankId)
    const bankItem = bankItems.find(item => item.id === bankId)
    if (bankItem) {
      setEditedFields(prev => ({
        ...prev,
        [bankId]: bankItem.fields
      }))
    }
  }

  const handleAddNew = () => {
    // Здесь можно добавить логику для создания нового банковского реквизита
    // Пока просто открываем редактирование текущего
    if (bank.current) {
      handleEdit(bank.current.id)
    }
  }

  return (
    <>
      <div className="space-y-4">
        {bankItems.map((bankItem) => {
          const isEmpty = isFieldsEmpty(bankItem.fields)

          return (
            <Card key={bankItem.id}>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className={isEmpty ? 'text-red-500' : ''}>
                      Банковские реквизиты
                    </span>
                    {!isEmpty && (
                      <Badge variant="secondary">Заполнено</Badge>
                    )}
                    {isEmpty && (
                      <Badge variant="destructive">Не заполнено</Badge>
                    )}
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleEdit(bankItem.id)}
                    disabled={isLoading}
                  >
                    <Edit2 className="h-4 w-4 mr-2" />
                    {isEmpty ? 'Добавить' : 'Редактировать'}
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {!isEmpty ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {bankItem.fields.map((field) => (
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
                      Банковские реквизиты не заполнены
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          )
        })}

        {bankItems.length === 0 && (
          <Card>
            <CardContent className="text-center p-6">
              <p className="text-muted-foreground mb-4">
                Банковские реквизиты отсутствуют
              </p>
              <Button
                variant="outline"
                onClick={handleAddNew}
                disabled={isLoading}
              >
                <Plus className="h-4 w-4 mr-2" />
                Добавить банковские реквизиты
              </Button>
            </CardContent>
          </Card>
        )}
        {editingBankId && (
          <BxRqEditModal
            title="Редактирование банковских реквизитов"
            fields={editedFields[editingBankId] || []}
            isOpen={!!editingBankId}
            isLoading={isLoading}
            onSave={() => handleSave(editingBankId)}
            onCancel={handleCancel}
            onFieldChange={(code, value) => handleFieldChange(editingBankId, code, value)}
          />
        )}
      </div>
    </>
  )
} 