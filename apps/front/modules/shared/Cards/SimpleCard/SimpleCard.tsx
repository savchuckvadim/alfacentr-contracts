import { CardContent, CardHeader } from "@workspace/ui/components/card"

import { Card, CardTitle } from "@workspace/ui/components/card"

export interface SimpleCardProps {
    title: string
    description?: string
    children: React.ReactNode
}
export const SimpleCard = ({ title, description, children }: SimpleCardProps) => {
    return (
        <Card>
            <CardHeader>
                <CardTitle>{title}</CardTitle>
                {description && <p>{description}</p>}
            </CardHeader>
            <CardContent>
                {children}
            </CardContent>
        </Card>
    )
}