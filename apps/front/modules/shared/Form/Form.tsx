'use client';

import { useForm } from 'react-hook-form';
import { useState } from 'react';
import { Label } from '@workspace/ui/components/label';
import { Checkbox } from '@workspace/ui/components/checkbox';
import { Input } from '@workspace/ui/components/input';
import { Button } from '@workspace/ui/components/button';

type FormValues = {
    name: string;
    email: string;
    phone: string;
    extra: boolean;
};

export default function Form() {
    const { register, handleSubmit, watch } = useForm<FormValues>();
    const onSubmit = (data: FormValues) => console.log(data);

    // следим за чекбоксом
    const extraEnabled = watch('extra');

    return (
        <form
            onSubmit={handleSubmit(onSubmit)}
            className="space-y-4 max-w-sm mx-auto"
        >
            <div>
                <Label htmlFor="extra">Показать дополнительные поля</Label>
                <div className="flex items-center space-x-2">
                    <Checkbox id="extra" {...register('extra')} />
                    <span>Активировать</span>
                </div>
            </div>

            {extraEnabled && (
                <>
                    <div>
                        <Label htmlFor="name">Имя</Label>
                        <Input
                            id="name"
                            placeholder="Введите имя"
                            {...register('name')}
                        />
                    </div>

                    <div>
                        <Label htmlFor="email">Email</Label>
                        <Input
                            id="email"
                            type="email"
                            placeholder="Введите email"
                            {...register('email')}
                        />
                    </div>

                    <div>
                        <Label htmlFor="phone">Телефон</Label>
                        <Input
                            id="phone"
                            type="tel"
                            placeholder="+7..."
                            {...register('phone')}
                        />
                    </div>
                </>
            )}

            <Button type="submit">Отправить</Button>
        </form>
    );
}
