'use client';

import { ModalMenu } from '@/modules/shared';
import { BxDealDataKeys } from '@alfa/entities';
import { Input } from '@workspace/ui/components/input';
import { Label } from '@workspace/ui/components/label';
import useCommunications from '../../hook/useCommunications';
import { Checkbox } from '@workspace/ui/components/checkbox';

import { useForm } from 'react-hook-form';

type FormValues = {
    name: string;
    email: string;
    phone: string;
};

export const CommunicationsConfirmMenu = () => {
    const {
        canSend,
        needEmail,
        email,
        phone,
        name,
        confirm,
        cancelEmailConfirm,
        generateDocument,
        setEmailConfirmConfirmed,
        setNeedEmail,
        updateField,
        updateFieldWithAPI,
    } = useCommunications();

    const {
        register,
        handleSubmit,
        formState: { errors, isValid },
    } = useForm<FormValues>({
        mode: 'onChange',
        defaultValues: {
            name: name?.value as string || '',
            email: email?.value as string || '',
            phone: phone?.value as string || '',
        },
    });

    const onSubmit = (data: FormValues) => {
        setEmailConfirmConfirmed();
        generateDocument();

        // можно пушить изменения и в deal API
        updateFieldWithAPI(BxDealDataKeys.exchange_doc_name, data.name);
        updateFieldWithAPI(BxDealDataKeys.exchange_doc_email, data.email);
        updateFieldWithAPI(BxDealDataKeys.exchange_doc_phone, data.phone);
    };

    return (
        <ModalMenu
            isOpen={confirm.isActive}
            onOpenChange={cancelEmailConfirm}
            onSubmit={handleSubmit(onSubmit)}
            submitName={needEmail ? 'Сделать и отправить' : 'Сделать документы'}
            title={needEmail ? 'Подтверждение email' : 'Сделать документы'}
            description={
                needEmail
                    ? 'Подтвердите email для получения документов'
                    : 'Сделать документы и НЕ отправлять email'
            }
            submitDisabled={!canSend}
        >
            <div className="flex flex-col gap-4">
                {/* name */}
                <div className="flex flex-row gap-2 items-center">
                    <Label>Контактное лицо</Label>
                    {errors.name && (
                        <Label className="text-red-500">{errors.name.message}</Label>
                    )}
                </div>
                <Input
                    {...register('name', {
                        required: 'Имя обязательно',
                        onBlur: (e) => {
                            updateField(
                                BxDealDataKeys.exchange_doc_name,
                                e.target.value,
                            )
                            // updateFieldWithAPI(
                            //     BxDealDataKeys.exchange_doc_name,
                            //     e.target.value,
                            // )
                        },
                    })}
                    className={errors.name ? 'border-red-500' : ''}
                />

                {/* email */}
                <div className="flex flex-row gap-2 items-center m-0 p-0">
                    <Label>Email</Label>
                    {errors.email && (
                        <Label className="text-red-500">{errors.email.message}</Label>
                    )}

                </div>

                <Input
                    {...register('email', {
                        required: 'Email обязателен',
                        pattern: {
                            value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                            message: 'Некорректный email',
                        },
                        onBlur: (e) => {
                            updateField(
                                BxDealDataKeys.exchange_doc_email,
                                e.target.value,
                            )
                            // updateFieldWithAPI(
                            //     BxDealDataKeys.exchange_doc_email,
                            //     e.target.value,
                            // )
                        },

                    })}
                    className={errors.email ? 'border-red-500' : ''}
                />

                {/* phone */}
                <div className="flex flex-row gap-2 items-center">
                    <Label>Телефон</Label>
                    {errors.phone && (
                        <Label className="text-red-500">{errors.phone.message}</Label>
                    )}
                </div>
                <Input
                    {...register('phone', {
                        required: 'Телефон обязателен',
                        pattern: {
                            value: /^(\+7|8)?[\s\-]?\(?\d{3}\)?[\s\-]?\d{3}[\s\-]?\d{2}[\s\-]?\d{2}$/,
                            message: 'Некорректный номер',
                        },
                        onBlur: (e) => {
                            updateField(
                                BxDealDataKeys.exchange_doc_phone,
                                e.target.value,
                            )
                            // updateFieldWithAPI(
                            //     BxDealDataKeys.exchange_doc_phone,
                            //     e.target.value,
                            // )
                        },
                    })}
                    className={errors.phone ? 'border-red-500' : ''}
                />
            </div>

            {/* needEmail */}
            <div className="flex flex-row gap-2 items-center justify-end mt-4 w-full">
                <Checkbox
                    id="needEmail"
                    checked={!needEmail}
                    onCheckedChange={() => {
                        setNeedEmail(!needEmail);
                    }}
                />
                <Label htmlFor="needEmail">Не отправлять email</Label>
            </div>
        </ModalMenu>
    );
};
