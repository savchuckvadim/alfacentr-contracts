'use client'

import { getParticipantAddress, getParticipantDays, getParticipantEmail, getParticipantFormat, getParticipantIsPpk, getParticipantName, getParticipantPhone, getParticipantPrograms, getProductFieldByCodeValue, getProductFieldValue, useParticipant } from "@/modules/entities"
import { useParticipantPpk } from "@/modules/features/participant-product"
import { getMissingProductsByParticipantPpkThemes } from "@/modules/features/participant-product/lib/utils/participant-products"

import { Badge } from "@workspace/ui/components/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@workspace/ui/components/card"
import { Button } from "@workspace/ui/components/button"
import {
    User,
    BookOpen,
    Package,
    AlertTriangle,
    CheckCircle,
    XCircle,
    Trash2,
    Plus,
    Users,
    Calendar,
    Phone,
    Mail,
    MapPin,
    ChevronUp,
    ChevronDown,
    AlertCircle,
    Link2,
    Edit
} from "lucide-react"
import { useEffect, useState } from "react"
import { useAlfaProducts } from "@/modules/entities/product/hook/useAlfaProducts"
import Link from "next/link"
import { IParticipant } from "@alfa/entities/dist/entities/smart/participant.interface"
import { cn } from "@workspace/ui/lib/utils"
import { cutString } from "@/modules/lib"
import { Tooltip } from "@/modules/shared"
import { useApp } from "@/modules/app"
import { useParticipantInfo } from "../ParticipantInfoCard/hook/useParticipantInfo"
import { useEditParticipant } from "../ParticipantEdit/hook/useParticipantEdit"
import { ParticipalEditModal } from "../ParticipantEdit/ui/ParticipalEditModal"

export const ParticipantPpkInfo = ({ participantId }: { participantId: number }) => {
    const { isClient } = useApp()

    const id = participantId
    const { participant, loading, error } = useParticipant(id)
    const { loading: loadingProducts } = useAlfaProducts()
    const { participantToProducts } = useParticipantPpk()
    let missingProducts: string[] = []
    // const [hasProblems, setHasProblems] = useState(false)
    const { hasProblems, problems, isParticipantPpkLoading } = useParticipantInfo(participantId)
    const { activateEditable, editable } = useEditParticipant(participantId)
    const onEdit = (participantId: number) => {
        activateEditable(participantId)
    }
    useEffect(() => {
        const products = participantToProducts[id]
        const programs = getParticipantPrograms(participant as IParticipant)
        const programsThemes = programs?.map((program) => program.value)
        missingProducts = products ? getMissingProductsByParticipantPpkThemes(programsThemes, products) : []
        // if (missingProducts && missingProducts.length > 0) {
        //     setHasProblems(true)
        // }
    }, [participant, participantToProducts])

    const [expandedSections, setExpandedSections] = useState<{
        programs: boolean;
        products: boolean;
        missing: boolean;
        participantInfo: boolean;
    }>({
        programs: true,
        products: true,
        missing: true,
        participantInfo: true
    })

    const products = participantToProducts[id]

    if (loading || !isClient) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
                    <p className="text-muted-foreground">Загрузка участника...</p>
                </div>
            </div>
        )
    }

    if (error) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="text-center">
                    <XCircle className="h-8 w-8 text-destructive mx-auto mb-4" />
                    <p className="text-destructive">Ошибка загрузки участника</p>
                </div>
            </div>
        )
    }

    if (!participant) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="text-center">
                    <User className="h-8 w-8 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">Участник не найден</p>
                </div>
            </div>
        )
    }

    const programs = getParticipantPrograms(participant)
    const programsThemes = programs?.map((program) => program.value)
    missingProducts = products ? getMissingProductsByParticipantPpkThemes(programsThemes, products) : []

    const toggleSection = (section: keyof typeof expandedSections) => {
        setExpandedSections(prev => ({
            ...prev,
            [section]: !prev[section]
        }))
    }

    const handleRemoveProgram = (index: number) => {
        // TODO: Добавить логику удаления программы
        console.log('Remove program at index:', index)
    }

    const handleRemoveProduct = (index: number) => {
        // TODO: Добавить логику удаления продукта
        console.log('Remove product at index:', index)
    }

    return (
        <div className="space-y-6">
            {/* Заголовок участника */}
            <Card className={cn(hasProblems && 'border-destructive/50 ')}>
                <CardHeader className="pb-4">
                    <div className="flex items-start justify-between">
                        <div className="flex items-start gap-4">
                            <div className="p-3 bg-primary/10 rounded-lg">
                                <User className="h-6 w-6 text-primary" />
                            </div>
                            <div className="space-y-2">

                                <Link target="_blank" href={`https://alfacentr.bitrix24.ru/crm/type/1036/details/${participant.id}/`}>
                                    <div className="cursor-pointer flex items-center gap-2 hover:underline hover:text-indigo-600">
                                        <Tooltip content={<p className="text-sm">Открыть в битриксе </p>}>
                                            <CardTitle className="text-xl">{getParticipantName(participant)}</CardTitle>
                                        </Tooltip>
                                        {hasProblems && (
                                            <div className="p-1 bg-destructive/10 rounded">
                                                <AlertTriangle className="h-4 w-4 text-destructive" />
                                            </div>
                                        )}
                                    </div>
                                    <CardDescription className="text-sm hover:underline hover:text-indigo-600">ID: {participant.id}</CardDescription>
                                </Link>

                                {/* Контактная информация */}
                                {expandedSections.participantInfo && (
                                    <>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
                                            <div className="flex items-center gap-2">
                                                <div className="p-1.5 bg-blue-100 rounded">
                                                    <Phone className="h-3 w-3 text-blue-600" />
                                                </div>
                                                <div>
                                                    <p className="text-xs text-muted-foreground">Телефон</p>
                                                    <p className="text-sm font-medium">{getParticipantPhone(participant) || 'Не указан'}</p>
                                                </div>
                                            </div>

                                            <div className="flex items-center gap-2">
                                                <div className="p-1.5 bg-green-100 rounded">
                                                    <Mail className="h-3 w-3 text-green-600" />
                                                </div>
                                                <div>
                                                    <p className="text-xs text-muted-foreground">Email</p>
                                                    <p className="text-sm font-medium">{getParticipantEmail(participant) || 'Не указан'}</p>
                                                </div>
                                            </div>

                                            <div className="flex items-center gap-2">
                                                <div className="p-1.5 bg-purple-100 rounded">
                                                    <MapPin className="h-3 w-3 text-purple-600" />
                                                </div>
                                                <div>
                                                    <p className="text-xs text-muted-foreground">Адрес</p>
                                                    <p className="text-sm font-medium">{getParticipantAddress(participant) || 'Не указан'}</p>
                                                </div>
                                            </div>

                                            <div className="flex items-center gap-2">
                                                <div className="p-1.5 bg-orange-100 rounded">
                                                    <Calendar className="h-3 w-3 text-orange-600" />
                                                </div>
                                                <div>
                                                    <p className="text-xs text-muted-foreground">Дни участия</p>
                                                    <p className="text-sm font-medium">{getParticipantDays(participant) || 'Не указаны'}</p>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Статус и формат */}
                                        <div className="flex items-center gap-3 pt-2">
                                            <div className="flex items-center gap-2">
                                                <Badge variant={getParticipantIsPpk(participant) ? "default" : "secondary"} className="text-xs">
                                                    {getParticipantIsPpk(participant) ? 'ППК' : 'Без ППК'}
                                                </Badge>
                                            </div>

                                            <div className="flex items-center gap-2">
                                                <Badge variant="outline" className="text-xs">
                                                    {getParticipantFormat(participant) || 'Формат не указан'}
                                                </Badge>
                                            </div>
                                        </div>
                                    </>
                                )}
                            </div>
                        </div>

                        <div className="flex items-center gap-2">
                            {hasProblems && (
                                <Badge variant="destructive" className="text-xs flex items-center gap-1">
                                    <AlertCircle className="h-3 w-3" />
                                    Требует внимания
                                </Badge>
                            )}
                            {/* <Badge variant="outline" className="text-sm shrink-0">
                                Участник
                            </Badge> */}
                            <Tooltip content="Редактировать">
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => onEdit(participantId)}
                                    className="h-8 w-8 p-0 hover:bg-primary/10"
                                >
                                    <Edit className="w-4 h-4" />
                                </Button>
                            </Tooltip>
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => toggleSection('participantInfo')}
                                className="h-8 w-8 p-0"
                            >
                                {expandedSections.participantInfo ? (
                                    <ChevronUp className="h-4 w-4" />
                                ) : (
                                    <ChevronDown className="h-4 w-4" />
                                )}
                            </Button>
                        </div>
                    </div>
                </CardHeader>
            </Card>

            {/* ППК программы из заявки */}
            <Card>
                <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <BookOpen className="h-4 w-4 text-muted-foreground" />
                            <CardTitle className="text-lg">ППК программы из заявки</CardTitle>
                            <Badge variant="secondary" className="text-xs">
                                {programs?.length || 0}
                            </Badge>
                        </div>
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => toggleSection('programs')}
                        >
                            {expandedSections.programs ? 'Скрыть' : 'Показать'}
                        </Button>
                    </div>
                </CardHeader>

                {expandedSections.programs && (
                    <CardContent className="space-y-3">
                        {programs && programs.length > 0 ? (
                            <div className="grid gap-3">
                                {programs.map((program, index) => (
                                    <div key={`participant-${id}-program-${index}`} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg border">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2 mb-1">
                                                <Badge variant="outline" className="text-xs">
                                                    {program.type}
                                                </Badge>
                                            </div>
                                            <p className="text-sm font-medium">{program.value}</p>
                                        </div>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => handleRemoveProgram(index)}
                                            className="text-destructive hover:text-destructive"
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-6">
                                <BookOpen className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                                <p className="text-muted-foreground">Нет ППК программ</p>
                            </div>
                        )}
                    </CardContent>
                )}
            </Card>

            {/* Назначенные продукты */}
            {loadingProducts ?
                <div className="flex items-center justify-center h-64">
                    <div className="text-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
                        <p className="text-muted-foreground">Загрузка продуктов...</p>
                    </div>
                </div>
                : <Card>
                    <CardHeader className="pb-3">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <Package className="h-4 w-4 text-muted-foreground" />
                                <CardTitle className="text-lg">Назначенные продукты</CardTitle>
                                <Badge variant="default" className="text-xs">
                                    {products?.length || 0}
                                </Badge>
                            </div>
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => toggleSection('products')}
                            >
                                {expandedSections.products ? 'Скрыть' : 'Показать'}
                            </Button>
                        </div>
                    </CardHeader>

                    {expandedSections.products && (
                        <CardContent className="space-y-3">
                            {products && products.length > 0 ? (
                                <div className="grid gap-3">
                                    {products.map((product, index) => {
                                        const productTopicName = getProductFieldByCodeValue(product, 'SEMINAR_TOPIC')?.value
                                        if (!productTopicName) return null

                                        return (
                                            <div key={`participant-${id}-product-${index}`} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg border">
                                                <div className="flex-1">
                                                    <div className="flex items-center gap-2 mb-1">
                                                        <CheckCircle className="h-4 w-4 text-green-600" />
                                                        <Badge variant="default" className="text-xs">
                                                            Назначен
                                                        </Badge>
                                                    </div>
                                                    <p className="text-sm font-medium">{productTopicName}</p>
                                                    <p className="text-xs text-muted-foreground">
                                                        ID: {product.id} • Цена: {product.price || 0} ₽
                                                    </p>
                                                </div>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => handleRemoveProduct(index)}
                                                    className="text-destructive hover:text-destructive"
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        )
                                    })}
                                </div>
                            ) : (
                                <div className="text-center py-6">
                                    <Package className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                                    <p className="text-muted-foreground">Нет назначенных продуктов</p>
                                </div>
                            )}
                        </CardContent>
                    )}
                </Card>}

            {/* Отсутствующие продукты */}
            {missingProducts && missingProducts.length > 0 && (
                <Card className="border-destructive/50 bg-destructive/5">
                    <CardHeader className="pb-3">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <AlertTriangle className="h-4 w-4 text-destructive" />
                                <CardTitle className="text-lg text-destructive">Отсутствующие продукты</CardTitle>
                                <Badge variant="destructive" className="text-xs">
                                    {missingProducts.length}
                                </Badge>
                            </div>
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => toggleSection('missing')}
                            >
                                {expandedSections.missing ? 'Скрыть' : 'Показать'}
                            </Button>
                        </div>
                    </CardHeader>

                    {expandedSections.missing && (
                        <CardContent className="space-y-3">
                            <p className="text-sm text-destructive mb-3">
                                Следующие продукты отсутствуют в списке товаров или их количество ограничено:
                            </p>
                            <div className="grid gap-2">
                                {missingProducts.map((productName, index) => (
                                    <Tooltip key={`participant-${id}-missing-${index}`} content={<p className="text-sm max-w-[300px]">{productName}</p>}>
                                        <div key={`participant-${id}-missing-${index}`} className="flex items-center gap-2 p-2 bg-destructive/10 rounded border border-destructive/20">
                                            <XCircle size={16} className=" text-destructive" />
                                            <span className="text-sm font-medium">{cutString(productName, 150)}</span>
                                        </div>
                                    </Tooltip>
                                ))}
                            </div>
                        </CardContent>
                    )}
                </Card>
            )}

            {/* Действия */}
            <Card>
                <CardContent className="pt-6">
                    <div className="flex gap-3">
                        <Button className="flex-1" variant="outline">
                            <Plus className="h-4 w-4 mr-2" />
                            Добавить программу
                        </Button>
                        <Button className="flex-1" variant="outline">
                            <Package className="h-4 w-4 mr-2" />
                            Назначить продукт
                        </Button>
                    </div>
                </CardContent>
            </Card>
            {editable && <ParticipalEditModal
                isActive={!!editable}
                editable={editable}


            />}
        </div>
    )
}