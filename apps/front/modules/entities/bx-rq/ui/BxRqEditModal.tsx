'use client'

import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@workspace/ui/components/dialog'
import { Button } from '@workspace/ui/components/button'
import { Input } from '@workspace/ui/components/input'
import { Label } from '@workspace/ui/components/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@workspace/ui/components/select'
import { Textarea } from '@workspace/ui/components/textarea'
import { RqItem } from '@workspace/bx-rq'
import { Loader2 } from 'lucide-react'

interface BxRqEditModalProps {
  title: string
  fields: RqItem[]
  isOpen: boolean
  isLoading?: boolean
  onSave: () => void
  onCancel: () => void
  onFieldChange: (code: string, value: string) => void
  onFieldBlur?: (code: string, value: string) => void
}

export const BxRqEditModal = ({
  title,
  fields,
  isOpen,
  isLoading = false,
  onSave,
  onCancel,
  onFieldChange,
  onFieldBlur
}: BxRqEditModalProps) => {
  const [localValues, setLocalValues] = useState<Record<string, string>>({})

  const handleFieldChange = (code: string, value: string) => {
    setLocalValues(prev => ({ ...prev, [code]: value }))
    onFieldChange(code, value)
  }

  const handleFieldBlur = (code: string, value: string) => {
    if (onFieldBlur) {
      onFieldBlur(code, value)
    }
  }

  const renderField = (field: RqItem) => {
    const value = localValues[field.code] || (typeof field.value === 'string' ? field.value : '') || ''

    switch (field.type) {
      case 'text':
        return (
          <div key={field.code} className="space-y-2">
            <Label htmlFor={field.code}>
              {field.name}
              {field.isRequired && <span className="text-red-500 ml-1">*</span>}
            </Label>
            <Textarea
              id={field.code}
              value={value}
              onChange={(e) => handleFieldChange(field.code, e.target.value)}
              onBlur={(e) => handleFieldBlur(field.code, e.target.value)}
              placeholder={`Введите ${field.name.toLowerCase()}`}
              disabled={field.isDisable}
            />
          </div>
        )

      case 'select':
        return (
          <div key={field.code} className="space-y-2">
            <Label htmlFor={field.code}>
              {field.name}
              {field.isRequired && <span className="text-red-500 ml-1">*</span>}
            </Label>
            <Select
              value={value}
              onValueChange={(newValue) => handleFieldChange(field.code, newValue)}
              disabled={field.isDisable}
            >
              <SelectTrigger>
                <SelectValue placeholder={`Выберите ${field.name.toLowerCase()}`} />
              </SelectTrigger>
              <SelectContent>
                {field.items?.map((item) => (
                  <SelectItem key={item.id} value={item.id.toString()}>
                    {item.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )

      case 'date':
        return (
          <div key={field.code} className="space-y-2">
            <Label htmlFor={field.code}>
              {field.name}
              {field.isRequired && <span className="text-red-500 ml-1">*</span>}
            </Label>
            <Input
              id={field.code}
              type="date"
              value={value}
              onChange={(e) => handleFieldChange(field.code, e.target.value)}
              onBlur={(e) => handleFieldBlur(field.code, e.target.value)}
              disabled={field.isDisable}
            />
          </div>
        )

      default:
        return (
          <div key={field.code} className="space-y-2">
            <Label htmlFor={field.code}>
              {field.name}
              {field.isRequired && <span className="text-red-500 ml-1">*</span>}
            </Label>
            <Input
              id={field.code}
              type="text"
              value={value}
              onChange={(e) => handleFieldChange(field.code, e.target.value)}
              onBlur={(e) => handleFieldBlur(field.code, e.target.value)}
              placeholder={`Введите ${field.name.toLowerCase()}`}
              disabled={field.isDisable}
            />
          </div>
        )
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onCancel}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          {fields.map(renderField)}
        </div>

        <div className="flex justify-end gap-2 pt-4">
          <Button variant="outline" onClick={onCancel} disabled={isLoading}>
            Отмена
          </Button>
          <Button onClick={onSave} disabled={isLoading}>
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Сохранение...
              </>
            ) : (
              'Сохранить'
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
} 