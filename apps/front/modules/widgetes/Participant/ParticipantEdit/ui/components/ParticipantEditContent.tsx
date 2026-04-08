'use client';
import { Select } from '@/modules/shared';
import { useEditParticipant } from '../../hook/useParticipantEdit';
import {
    BxParticipantsDataKeys,
    getParticipantSelect,
    getParticipantSelectItemByValue,
    IParticipant,
} from '@alfa/entities';
import { Input } from '@workspace/ui/components/input';
import { Label } from '@workspace/ui/components/label';

import { Textarea } from '@workspace/ui/components/textarea';
import { useEffect, useState } from 'react';
import { UserIcon, GraduationCapIcon, BookOpenIcon } from 'lucide-react';

import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from '@workspace/ui/components/card';
import { ParticipantProductPpkSelect } from './ParticipantProductPpkSelect';
import { ParticipantDaysSelect } from './ParticipantDaysSelect';
import { useProductType } from '@/modules/entities/product/hook/useProductType';

export interface ParticipantEditContentProps {
    editable: IParticipant;
}

const generalCodes = [
    BxParticipantsDataKeys.name,
    BxParticipantsDataKeys.email,
    BxParticipantsDataKeys.phone,
    BxParticipantsDataKeys.format,
    BxParticipantsDataKeys.address_for_udost,
];

const seminarCodes = [BxParticipantsDataKeys.days];
const ppkCodes = [BxParticipantsDataKeys.is_ppk];
export const ppkProgramCodes = [
    BxParticipantsDataKeys.accountant_gos,
    BxParticipantsDataKeys.accountant_medical,
    BxParticipantsDataKeys.kadry,
    BxParticipantsDataKeys.zakupki,
    BxParticipantsDataKeys.corruption,
];

export const ParticipantEditContent = ({
    editable,
}: ParticipantEditContentProps) => {
    const [partsCount, setPartsCount] = useState(3);
    const { hasPpk, hasSeminar } = useProductType();
    const isCreating = editable.id === 0;

    useEffect(() => {
        let count = 2;
        if (hasPpk || isCreating) {
            count -= 1;
        }
        if (hasSeminar) {
            count++;
        }
        setPartsCount(count);
    }, [hasPpk, hasSeminar]);

    const gridColsClass =
        partsCount === 1
            ? 'lg:grid-cols-1 xl:grid-cols-1'
            : partsCount === 2
                ? 'lg:grid-cols-2 xl:grid-cols-2'
                : 'lg:grid-cols-2 xl:grid-cols-3';
    const containerWidthClass =
        partsCount === 1 ? 'w-full xl:w-2/3 xl:mx-auto' : 'w-full';
    const {
        changeEditable,
        editParticipantTopic,
    } = useEditParticipant(editable.id);
    const [isPpk, setIsPpk] = useState(false);

    useEffect(() => {
        editable.fields.forEach(field => {
            if (field.code === BxParticipantsDataKeys.is_ppk) {
                const value = getParticipantSelectItemByValue(
                    field.code,
                    field.value as string,
                );
                if (value?.code === 'yes') {
                    setIsPpk(true);
                } else {
                    setIsPpk(false);
                }
            }
        });
    }, [editable]);

    useEffect(() => {
        if (!isCreating || hasPpk) {
            return;
        }

        const isPpkField = editable.fields.find(
            field => field.code === BxParticipantsDataKeys.is_ppk,
        );

        if (isPpkField && isPpkField.value !== 'N') {
            changeEditable(BxParticipantsDataKeys.is_ppk, 'N');
        }
    }, [isCreating, hasPpk, editable.fields, changeEditable]);

    const renderField = (field: any) => {
        const isSelect =
            field.code === BxParticipantsDataKeys.format ||
            field.code === BxParticipantsDataKeys.is_ppk;
        const selectOptions = isSelect ? getParticipantSelect(field.code) : [];


        return (
            <div key={field.bitrixId} className="space-y-2">
                <Label className="text-sm font-medium text-foreground">
                    {field.name}
                </Label>
                {isSelect && selectOptions ? (
                    <Select
                        currentValue={String(
                            getParticipantSelectItemByValue(
                                field.code,
                                field.value,
                            )?.value || '',
                        )}
                        onValueChange={value =>
                            changeEditable(field.code, value)
                        }
                        options={selectOptions}
                    />
                ) : (
                    <Input
                        value={field.value}
                        onChange={e =>
                            changeEditable(field.code, e.target.value)
                        }
                        className="transition-all duration-200"
                    />
                )}
            </div>
        );
    };

    const renderPpkField = (field: any) => {
        const isSelect =
            field.code === BxParticipantsDataKeys.format ||
            field.code === BxParticipantsDataKeys.is_ppk;
        const selectOptions = isSelect ? getParticipantSelect(field.code) : [];

        return (
            <div key={field.bitrixId} className="space-y-2">
                <Label className="text-sm font-medium text-foreground">
                    {field.name}
                </Label>
                {isSelect ? (
                    selectOptions &&
                    selectOptions.length > 0 && (
                        <Select
                            currentValue={String(
                                getParticipantSelectItemByValue(
                                    field.code,
                                    field.value,
                                )?.value || '',
                            )}
                            onValueChange={value =>
                                changeEditable(field.code, value)
                            }
                            options={selectOptions}
                        />
                    )
                ) : (
                    <Textarea
                        className="min-h-[80px] resize-none transition-all duration-200"
                        value={field.value}
                        onChange={e =>
                            changeEditable(field.code, e.target.value)
                        }
                    />
                )}
            </div>
        );
    };

    return (
        <div
            className={`${containerWidthClass} grid grid-cols-1 ${gridColsClass} gap-6 h-[77vh]`}
        >
            <Card className="h-fit">
                <CardHeader className="pb-3">
                    <CardTitle className="flex items-center gap-2 text-lg">
                        <UserIcon className="w-5 h-5 text-primary" />
                        Основные данные
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    {editable.fields
                        .filter(field => generalCodes.includes(field.code))
                        .sort(
                            (a, b) =>
                                generalCodes.indexOf(a.code) -
                                generalCodes.indexOf(b.code),
                        )
                        .map(renderField)}
                </CardContent>
            </Card>

            {/* Семинары */}
            {hasSeminar && <Card className="h-fit">
                <CardHeader className="pb-3">
                    <CardTitle className="flex items-center gap-2 text-lg">
                        <GraduationCapIcon className="w-5 h-5 text-primary" />
                        Семинары
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    {/* {editable.fields
                        .filter(field => seminarCodes.includes(field.code))
                        .sort(
                            (a, b) =>
                                seminarCodes.indexOf(a.code) -
                                seminarCodes.indexOf(b.code),
                        )
                        .map(renderPpkField)} */}
                    <ParticipantDaysSelect editable={editable} />
                </CardContent>
            </Card>}

            {/* ППК программы */}
            {(hasPpk || !isCreating) && <Card className={`h-fit transition-all duration-300 ease-in-out `}>
                <CardHeader className="pb-3">
                    <CardTitle className="flex items-center gap-2 text-lg">
                        <BookOpenIcon className="w-5 h-5 text-primary" />
                        ППК программы
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    {editable.fields
                        .filter(field => ppkCodes.includes(field.code))
                        .sort(
                            (a, b) =>
                                ppkCodes.indexOf(a.code) -
                                ppkCodes.indexOf(b.code),
                        )
                        .map(renderPpkField)}
                    <div
                        className={`${isPpk
                                ? 'opacity-100 scale-100 translate-x-0'
                                : 'opacity-0 scale-95 translate-x-4 pointer-events-none'
                            }`}
                    >
                        {editable.fields
                            .filter(field =>
                                ppkProgramCodes.includes(field.code),
                            )
                            .map(field => (
                                <div key={field.bitrixId} className="space-y-2">
                                    <p className="text-sm  text-foreground">
                                        {
                                            field.name.split(
                                                'Программы повышения квалификации',
                                            )[1]
                                        }
                                    </p>
                                    <ParticipantProductPpkSelect
                                        field={field}
                                        changeEditable={editParticipantTopic}
                                    />
                                </div>
                            ))}
                    </div>
                </CardContent>
            </Card>}
        </div>
    );
};
