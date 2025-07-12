'use client'

import { useParticipant } from "@/modules/entities"

import { Badge } from "@workspace/ui/components/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@workspace/ui/components/card"
import {
    XCircle,
    Users,
} from "lucide-react"

import { useAlfaProducts } from "@/modules/entities/product/hook/useAlfaProducts"

import { PagePreloader } from "@/modules/shared"

import { PartisipantProductSimpleStatistics } from "../PartisipantProductSimpleStatistics/PartisipantProductSimpleStatistics"
import { ParticipantInfoCard } from "../ParticipantInfoCard/ui/ParticipantInfoCard"
import { ParticipantsTable } from "../ParticipantsTable/ParticipantsTable"

export const ParticipantPpkListInfo = () => {
    const { participants, loading, error } = useParticipant()
    const { loading: loadingProducts } = useAlfaProducts()



    if (loading || loadingProducts) {
        return (
            <PagePreloader text="Загрузка участников..." />

        )
    }

    if (error) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="text-center">
                    <XCircle className="h-8 w-8 text-destructive mx-auto mb-4" />
                    <p className="text-destructive">Ошибка загрузки участников: {error}</p>
                </div>
            </div>
        )
    }

    // Статистика


    return (
        <>
            <ParticipantsTable />

            <div className="space-y-6">
                {/* Заголовок и статистика */}
                <Card>
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-primary/10 rounded-lg">
                                    <Users className="h-5 w-5 text-primary" />
                                </div>
                                <div>
                                    <CardTitle className="text-xl">Участники</CardTitle>
                                    <CardDescription>Управление участниками и их программами</CardDescription>
                                </div>
                            </div>
                            <Badge variant="outline" className="text-sm">
                                Всего: {participants.length}
                            </Badge>
                        </div>
                    </CardHeader>
                    <CardContent>

                        <PartisipantProductSimpleStatistics />
                    </CardContent>
                </Card>

                {/* Список участников */}
                <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
                    {participants.map((participant) => {
                        return <ParticipantInfoCard key={participant.id} participant={participant} />

                    })}
                </div>

                {participants.length === 0 && (
                    <Card>
                        <CardContent className="flex items-center justify-center h-32">
                            <div className="text-center">
                                <Users className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                                <p className="text-muted-foreground">Участники не найдены</p>
                            </div>
                        </CardContent>
                    </Card>
                )}
            </div>

        </>
    )
}