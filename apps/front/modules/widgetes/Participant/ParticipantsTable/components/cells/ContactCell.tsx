import { TableCell } from "@workspace/ui/components/table"
import { Mail, Phone } from "lucide-react"

interface ContactCellProps {
    value: string
    type: 'email' | 'phone'
}

export const ContactCell = ({ value, type }: ContactCellProps) => {
    if (!value) {
        return (
            <TableCell>
                <span className="text-muted-foreground text-sm">Не указан</span>
            </TableCell>
        )
    }

    const href = type === 'email' ? `mailto:${value}` : `tel:${value}`
    const icon = type === 'email' ? Mail : Phone
    const IconComponent = icon

    return (
        <TableCell>
            <a
                href={href}
                className="flex items-center gap-2 text-primary hover:text-primary/80 hover:underline transition-colors"
            >
                <IconComponent className="w-4 h-4" />
                <span className="text-sm">{value}</span>
            </a>
        </TableCell>
    )
} 