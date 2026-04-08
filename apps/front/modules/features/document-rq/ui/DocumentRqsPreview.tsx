'use client';
import { useState } from 'react';
import { useDocumentRq } from '../hooks/use-document-rq.hook';
import {
    BX_ADDRESS_TYPE,
    RQ_ITEM_CODE,
    useBxRq,
    useBxRqEditAddress,
    useBxRqEditBase,
} from '@workspace/bx-rq';
import { useApp } from '@/modules/app';
import { useClientType } from '@/modules/features/client-type/hook/useClientType';
import { BxRqEditModal } from '@/modules/entities/bx-rq';
import { Tooltip } from '@/modules/shared';
import { type DocumentPreviewLineKey } from '../utils/document-rq.util';

export const DocumentRqsPreview = () => {
    const { client, provider, clientPreviewLines } = useDocumentRq();
    const { domain, companyId } = useApp();
    const { clientType } = useClientType();
    const { current, errors } = useBxRq();
    const {
        creating,
        isCreatingLoading,
        initBaseCreating,
        cancelBaseCreating,
        saveBase,
        setBaseProp,
        blurCase,
        isSimpleBankCommentMode,
        simpleBankComment,
        setSimpleBankComment,
    } = useBxRqEditBase();
    const saveError = errors?.save ?? null;
    const {
        creating: creatingAddress,
        isCreatingLoading: isAddressLoading,
        initAddressCreating,
        cancelAddressCreating,
        saveAddress,
        setAddressProp,
    } = useBxRqEditAddress();
    const [activeKey, setActiveKey] = useState<DocumentPreviewLineKey | null>(
        null,
    );

    const isRqCreated = Boolean(current.item && current.item.bx_id > 0);

    const getFilteredBaseFields = () => {
        if (!creating?.fields) return [];
        if (!isRqCreated || !activeKey) return creating.fields;

        if (activeKey === 'other') return [];

        const codeByKey: Partial<Record<DocumentPreviewLineKey, string>> = {
            inn: RQ_ITEM_CODE.INN,
            kpp: RQ_ITEM_CODE.KPP,
            phone: RQ_ITEM_CODE.PHONE,
            fullname: RQ_ITEM_CODE.FULLNAME,
        };

        const fieldCode = codeByKey[activeKey];
        if (!fieldCode) return creating.fields;
        return creating.fields.filter(field => field.code === fieldCode);
    };

    const handleClientLineClick = (line: {
        key: DocumentPreviewLineKey;
        section: 'base' | 'address' | 'bankComment';
        canEdit: boolean;
    }) => {
        console.log('line', line);
        console.log('clientType', clientType);
        console.log('line.canEdit', line.canEdit);

        if (!clientType || !line.canEdit) return;
        setActiveKey(line.key);

        if (line.section === 'address') {
            initAddressCreating(BX_ADDRESS_TYPE.REGISTERED);
            return;
        }

        if (line.section === 'bankComment') {
            const commentValue = current.item?.bank?.current?.fields?.find(
                item => item.code === 'comments',
            )?.value;
            setSimpleBankComment(
                typeof commentValue === 'string' ? commentValue : '',
            );
            initBaseCreating(clientType);
            return;
        }

        initBaseCreating(clientType);
    };

    if (!client || !provider) {
        return null;
    }

    return (
        <div className="flex flex-row justify-between gap-4">
            <div className="w-1/2">
                <h2>Поставщик</h2>
                {provider.map((item, index) => {
                    return <p key={`provider-rq-item-${index}`}>{item}</p>;
                })}
            </div>
            <div className="w-1/2">
                <h2>Заказчик</h2>
                {clientPreviewLines.map((line, index) => {
                    return (
                        <Tooltip
                            key={`client-rq-item-${index}`}
                            content={line.tooltip}
                        >
                            <p
                                className={
                                    line.canEdit
                                        ? 'cursor-pointer hover:text-primary whitespace-pre-wrap'
                                        : 'cursor-not-allowed text-muted-foreground whitespace-pre-wrap'
                                }
                                onClick={() => handleClientLineClick(line)}
                            >
                                {line.value}
                            </p>
                        </Tooltip>
                    );
                })}
            </div>
            {creating && creating.fields && (
                <BxRqEditModal
                    title="Редактирование реквизитов"
                    fields={getFilteredBaseFields()}
                    isOpen={!!creating}
                    isLoading={isCreatingLoading}
                    onSave={() => {
                        if (!clientType) return;
                        saveBase(domain, companyId, clientType);
                    }}
                    onCancel={() => {
                        cancelBaseCreating();
                        setActiveKey(null);
                    }}
                    onFieldChange={setBaseProp}
                    onFieldBlur={blurCase}
                    type="base"
                    isSimpleBankCommentMode={
                        isSimpleBankCommentMode &&
                        (activeKey === 'other' || !isRqCreated)
                    }
                    simpleBankCommentValue={simpleBankComment}
                    onSimpleBankCommentChange={setSimpleBankComment}
                    submitError={saveError}
                />
            )}
            {creatingAddress && (
                <BxRqEditModal
                    title="Редактирование юридического адреса"
                    fields={creatingAddress.fields || []}
                    isOpen={!!creatingAddress}
                    isLoading={isAddressLoading}
                    onSave={() => {
                        if (!clientType) return;
                        saveAddress(
                            domain,
                            companyId,
                            clientType,
                            BX_ADDRESS_TYPE.REGISTERED,
                            creatingAddress.fields || [],
                        );
                    }}
                    onCancel={() => {
                        cancelAddressCreating();
                        setActiveKey(null);
                    }}
                    onFieldChange={setAddressProp}
                    type="address"
                />
            )}
        </div>
    );
};
