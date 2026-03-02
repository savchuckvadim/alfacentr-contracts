'use client';

import {
    getParticipantAddress,
    getParticipantDaysArray,
    getParticipantEmail,
    getParticipantFormat,
    getParticipantIsPpk,
    getParticipantName,
    getParticipantPhone,
    getParticipantPrograms,
} from '@/modules/entities';
import {
    useParticipantPpk,
    useParticipantSeminar,
} from '@/modules/features/participant-product';
import { getMissingProductsByParticipantPpkThemes } from '@/modules/features/participant-product/lib/utils/participant-products';

import { Badge } from '@workspace/ui/components/badge';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@workspace/ui/components/card';
import { Button } from '@workspace/ui/components/button';
import {
    User,
    Package,
    AlertTriangle,
    Plus,
    Calendar,
    Phone,
    Mail,
    MapPin,
    ChevronUp,
    ChevronDown,
    AlertCircle,
    Link2,
    Edit,
    PointerIcon,
    Check,
    Dot,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { IParticipant } from '@alfa/entities/';
import { cn } from '@workspace/ui/lib/utils';
import { Tooltip } from '@/modules/shared';
import { useApp } from '@/modules/app';
import { useParticipantInfo } from '../ParticipantInfoCard/hook/useParticipantInfo';
import { useEditParticipant } from '../ParticipantEdit/hook/useParticipantEdit';
import { ParticipalEditModal } from '../ParticipantEdit/ui/ParticipalEditModal';
import { Programs } from './components/Programs/Programs';
import { Products } from './components/Products/Products';
import { ParticipantPpkProducts } from './components/Products/ParticipantPpkProducts';
import { ParticipantSeminarProducts } from './components/Products/ParticipantSeminarProducts';

export const ParticipantPpkInfo = ({
    participant,
    loading,
    loadingProducts,
}: {
    participant: IParticipant;
    loading: boolean;
    loadingProducts: boolean;
}) => {
    const { isClient } = useApp();

    const id = participant.id;

    // const { loading: loadingProducts } = useAlfaProducts();
    const { participantToProducts } = useParticipantPpk();
    const { participantToProducts: participantToSeminars } =
        useParticipantSeminar();

    let missingProducts: string[] = [];
    // const [hasProblems, setHasProblems] = useState(false)
    const { hasProblems, problems, isParticipantPpkLoading } =
        useParticipantInfo(participant.id);
    const { activateEditable, editable } = useEditParticipant(participant.id);
    const onEdit = (participantId: number) => {
        activateEditable(participantId);
    };
    useEffect(() => {
        const products = participantToProducts[id];
        const seminars = participantToSeminars[id];
        const programs = getParticipantPrograms(participant as IParticipant);
        const programsThemes = programs?.map(program => program.value);
        missingProducts = products
            ? getMissingProductsByParticipantPpkThemes(programsThemes, products)
            : [];
        // if (missingProducts && missingProducts.length > 0) {
        //     setHasProblems(true)
        // }
    }, [participant, participantToProducts, participantToSeminars]);

    const [expandedSections, setExpandedSections] = useState<{
        programs: boolean;
        products: boolean;
        missing: boolean;
        participantInfo: boolean;
    }>({
        programs: true,
        products: true,
        missing: true,
        participantInfo: true,
    });

    const products = participantToProducts[id];
    const seminars = participantToSeminars[id];

    // if (loading || !isClient) {
    //     return (
    //         <div className="flex items-center justify-center h-64">
    //             <div className="text-center">
    //                 <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
    //                 <p className="text-muted-foreground">
    //                     Загрузка участника...
    //                 </p>
    //             </div>
    //         </div>
    //     );
    // }

    // if (error) {
    //     return (
    //         <div className="flex items-center justify-center h-64">
    //             <div className="text-center">
    //                 <XCircle className="h-8 w-8 text-destructive mx-auto mb-4" />
    //                 <p className="text-destructive">
    //                     Ошибка загрузки участника
    //                 </p>
    //             </div>
    //         </div>
    //     );
    // }

    // if (!participant) {
    //     return (
    //         <div className="flex items-center justify-center h-64">
    //             <div className="text-center">
    //                 <User className="h-8 w-8 text-muted-foreground mx-auto mb-4" />
    //                 <p className="text-muted-foreground">Участник не найден</p>
    //             </div>
    //         </div>
    //     );
    // }

    const programs = getParticipantPrograms(participant);
    const programsThemes = programs?.map(program => program.value);
    missingProducts = products
        ? getMissingProductsByParticipantPpkThemes(programsThemes, products)
        : [];

    const toggleSection = (section: keyof typeof expandedSections) => {
        setExpandedSections(prev => ({
            ...prev,
            [section]: !prev[section],
        }));
    };

    const handleRemoveProgram = (index: number) => {
        // TODO: Добавить логику удаления программы
        console.log('Remove program at index:', index);
    };

    const handleRemoveProduct = (index: number) => {
        // TODO: Добавить логику удаления продукта
        console.log('Remove product at index:', index);
    };

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
                                <Link
                                    target="_blank"
                                    href={`https://alfacentr.bitrix24.ru/crm/type/1036/details/${participant.id}/`}
                                >
                                    <div className="cursor-pointer flex items-center gap-2 hover:underline hover:text-indigo-600">
                                        <Tooltip
                                            content={
                                                <p className="text-sm">
                                                    Открыть в битриксе{' '}
                                                </p>
                                            }
                                        >
                                            <CardTitle className="text-xl">
                                                {getParticipantName(
                                                    participant,
                                                )}
                                            </CardTitle>
                                        </Tooltip>
                                        {hasProblems && (
                                            <div className="p-1 bg-destructive/10 rounded">
                                                <AlertTriangle className="h-4 w-4 text-destructive" />
                                            </div>
                                        )}
                                    </div>
                                    <CardDescription className="text-sm hover:underline hover:text-indigo-600">
                                        ID: {participant.id}
                                    </CardDescription>
                                </Link>

                                {/* Контактная информация */}
                                {expandedSections.participantInfo && (
                                    <>
                                        <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
                                            <div className="w-screen flex items-center gap-2">
                                                <div className="p-1.5 bg-blue-100 rounded">
                                                    <Phone className="h-3 w-3 text-blue-600" />
                                                </div>
                                                <div>
                                                    <p className="text-xs text-muted-foreground">
                                                        Телефон
                                                    </p>
                                                    <p className="text-sm font-medium">
                                                        {getParticipantPhone(
                                                            participant,
                                                        ) || 'Не указан'}
                                                    </p>
                                                </div>
                                            </div>

                                            <div className="min-w-fit flex items-center gap-2">
                                                <div className="p-1.5 bg-green-100 rounded">
                                                    <Mail className="h-3 w-3 text-green-600" />
                                                </div>
                                                <div>
                                                    <p className="text-xs text-muted-foreground">
                                                        Email
                                                    </p>
                                                    <p className="text-sm font-medium">
                                                        {getParticipantEmail(
                                                            participant,
                                                        ) || 'Не указан'}
                                                    </p>
                                                </div>
                                            </div>

                                            <div className="min-w-fit flex items-center gap-2">
                                                <div className="p-1.5 bg-purple-100 rounded">
                                                    <MapPin className="h-3 w-3 text-purple-600" />
                                                </div>
                                                <div>
                                                    <p className="text-xs text-muted-foreground">
                                                        Адрес
                                                    </p>
                                                    <p className="text-sm font-medium">
                                                        {getParticipantAddress(
                                                            participant,
                                                        ) || 'Не указан'}
                                                    </p>
                                                </div>
                                            </div>

                                            <div className="min-w-fit flex items-center gap-2">
                                                <div className="p-1.5 bg-orange-100 rounded">
                                                    <Calendar className="h-3 w-3 text-orange-600" />
                                                </div>
                                                <div>
                                                    <p className="text-xs text-muted-foreground">
                                                        Дни участия
                                                    </p>
                                                    {getParticipantDaysArray(
                                                        participant,
                                                    ).map(day => (
                                                        <div
                                                            key={day}
                                                            className="text-sm font-medium flex items-center gap-2 mb-2 mt-1"
                                                        >
                                                            <div className="w-5 h-5">
                                                                <Dot
                                                                    size={16}
                                                                    className=" text-primary"
                                                                />
                                                            </div>

                                                            <p className="text-xs font-medium flex items-center gap-2">
                                                                {' '}
                                                                {day}
                                                            </p>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>

                                        {/* Статус и формат */}
                                        <div className="flex items-center gap-3 pt-2">
                                            <div className="flex items-center gap-2">
                                                <Badge
                                                    variant={
                                                        getParticipantIsPpk(
                                                            participant,
                                                        )
                                                            ? 'default'
                                                            : 'secondary'
                                                    }
                                                    className="text-xs"
                                                >
                                                    {getParticipantIsPpk(
                                                        participant,
                                                    )
                                                        ? 'ППК'
                                                        : 'Без ППК'}
                                                </Badge>
                                            </div>

                                            <div className="flex items-center gap-2">
                                                <Badge
                                                    variant="outline"
                                                    className="text-xs"
                                                >
                                                    {getParticipantFormat(
                                                        participant,
                                                    ) || 'Формат не указан'}
                                                </Badge>
                                            </div>
                                        </div>
                                    </>
                                )}
                            </div>
                        </div>

                        <div className="flex items-center gap-2">
                            {hasProblems && (
                                <Badge
                                    variant="destructive"
                                    className="text-xs flex items-center gap-1"
                                >
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
                                    onClick={() => onEdit(participant.id)}
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

            <Programs
                isPpk={false}
                programs={getParticipantDaysArray(participant).map(day => ({
                    // type: 'семинар',
                    value: day,
                }))}
                id={id}
                handleRemoveProgram={handleRemoveProgram}
                expandedSections={expandedSections}
                toggleSection={toggleSection}
            />

            <ParticipantSeminarProducts
                loading={loadingProducts || !participant || !isClient}
                participant={participant}
                participantId={id}
            />

            <Programs
                isPpk={true}
                programs={programs}
                id={id}
                handleRemoveProgram={handleRemoveProgram}
                expandedSections={expandedSections}
                toggleSection={toggleSection}
            />

            <ParticipantPpkProducts
                loading={
                    loadingProducts || !participant || !isClient || loading
                }
                participant={participant}
                participantId={id}
            />

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
            {editable && (
                <ParticipalEditModal
                    isActive={!!editable}
                    editable={editable}
                />
            )}
        </div>
    );
};
