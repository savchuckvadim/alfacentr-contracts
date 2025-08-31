'use client';

import { ModalMenu } from '@/modules/shared';
import { BxDealDataKeys } from '@alfa/entities';
import { Input } from '@workspace/ui/components/input';
import { Label } from '@workspace/ui/components/label';
import useCommunications from '../../hook/useCommunications';
import { Checkbox } from '@workspace/ui/components/checkbox';


export const CommunicationsConfirmMenu = () => {

    const {
        needEmail,
        email,
        phone,
        name,
        confirm,
        errors,
        cancelEmailConfirm,
        generateDocument,
        setEmailConfirmConfirmed,
        setNeedEmail,
        updateField,
        updateFieldWithAPI,
    } = useCommunications();


    return (
        <ModalMenu
            isOpen={confirm.isActive}
            onOpenChange={cancelEmailConfirm}
            onSubmit={() => {
                setEmailConfirmConfirmed();
                generateDocument();
            }}
            // cancelName="Не отправлять"
            submitName={needEmail ? "Сделать и отправить" : "Сделать документы"}
            title={needEmail ? "Подтверждение email" : "Сделать документы"}
            description={needEmail ? "Подтвердите email для получения документов" : "Сделать документы и НЕ отправлять email"}
        >
            {needEmail && <div className="flex flex-col gap-4">

                <div className="flex flex-row gap-2 items-center">
                    <Label>Контактное лицо для обмена документами</Label>
                    {!name?.value && (
                        <Label className="text-red-500">
                            Необходимо заполнить
                        </Label>
                    )}
                </div>

                <Input
                    className={!name?.value ? 'border-red-500' : ''}
                    value={name?.value as string}
                    onChange={e =>
                        updateField(
                            BxDealDataKeys.exchange_doc_name,
                            e.target.value,
                        )
                    }
                    onBlur={e =>
                        updateFieldWithAPI(
                            BxDealDataKeys.exchange_doc_name,
                            e.target.value,
                        )
                    }
                />



                <Label>Email</Label>
                {errors.email && (
                    <Label className="text-red-500">
                        {errors.email}
                    </Label>
                )}
                <Input
                    value={email?.value as string}
                    onChange={e =>
                        updateField(
                            BxDealDataKeys.exchange_doc_email,
                            e.target.value,
                        )
                    }
                    onBlur={e =>
                        updateFieldWithAPI(
                            BxDealDataKeys.exchange_doc_email,
                            e.target.value,
                        )
                    }
                />
                <div className="flex flex-row gap-2 items-center">
                    <Label>Телефон</Label>
                    {errors.phone && (
                        <Label className="text-red-500">
                            {errors.phone}
                        </Label>
                    )}
                </div>

                <Input
                    className={errors.phone ? 'border-red-500' : ''}
                    value={phone?.value as string}
                    onChange={e =>
                        updateField(
                            BxDealDataKeys.exchange_doc_phone,
                            e.target.value,
                        )
                    }
                    onBlur={e =>
                        updateFieldWithAPI(
                            BxDealDataKeys.exchange_doc_phone,
                            e.target.value,
                        )
                    }
                />
            </div>}
            <div className="flex flex-row gap-2 items-center">


                <Checkbox id="needEmail" checked={!needEmail} onCheckedChange={() => {
                    setNeedEmail(!needEmail);
                }}>

                </Checkbox>
                <Label htmlFor="needEmail">Не отправлять email</Label>
            </div>
        </ModalMenu >
    );
};
