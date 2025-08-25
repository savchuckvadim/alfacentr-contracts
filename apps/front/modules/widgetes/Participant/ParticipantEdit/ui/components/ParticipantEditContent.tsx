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
    const {
        cancelEditable,
        changeEditable,
        editParticipantTopic,
        updateParticipant,
        name,
        isEditLoading,
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

    const renderField = (field: any) => {
        const isSelect =
            field.code === BxParticipantsDataKeys.format ||
            field.code === BxParticipantsDataKeys.is_ppk;
        const selectOptions = isSelect ? getParticipantSelect(field.code) : [];

        if (isSelect) {
        }
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
        <>
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
            <Card className="h-fit">
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
            </Card>

            {/* ППК программы */}
            <Card className={`h-fit transition-all duration-300 ease-in-out `}>
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
                        className={`${
                            isPpk
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
            </Card>
        </>
    );
};
