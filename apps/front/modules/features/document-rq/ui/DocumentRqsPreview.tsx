'use client';
import { useState } from 'react';
import { useDocumentRq } from '../hooks/use-document-rq.hook';
import {
    BX_ADDRESS_TYPE,
    RQ_ITEM_CODE,
    RQ_TYPE,
    useBxRq,
    useBxRqEditAddress,
    useBxRqEditBase,
} from '@workspace/bx-rq';
import { useApp } from '@/modules/app';
import { useClientType } from '@/modules/features/client-type/hook/useClientType';
import { BxRqEditModal } from '@/modules/entities/bx-rq';
import { type DocumentPreviewLineKey } from '../utils/document-rq.util';
import { ClientRqHeader } from './rqs-preview/components/ClientRqHeader';
import { ClientRqViewLines } from './rqs-preview/components/ClientRqViewLines';
import { useOwnBank } from '../../own-bank/';

export const DocumentRqsPreview = () => {
    const { client, provider, clientPreviewLines } = useDocumentRq();
    const { domain, companyId } = useApp();
    const { clientType } = useClientType();
    const { current, errors } = useBxRq();
    const { ownBankString, ownBank } = useOwnBank()
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

        //одной строке предпросмотра может соответствовать несколько полей
        //(«кем и когда выдан» — это дата выдачи + подразделение)
        const codesByKey: Partial<Record<DocumentPreviewLineKey, string[]>> = {
            inn: [RQ_ITEM_CODE.INN],
            kpp: [RQ_ITEM_CODE.KPP],
            phone: [RQ_ITEM_CODE.PHONE],
            //у физлица имя лежит в personName, а не в fullname
            fullname:
                clientType === RQ_TYPE.FIZ
                    ? [RQ_ITEM_CODE.PERSON_NAME]
                    : [RQ_ITEM_CODE.FULLNAME],
            base_other: [RQ_ITEM_CODE.BASE_OTHER],
            documentType: [RQ_ITEM_CODE.DOCUMENT],
            docSeries: [RQ_ITEM_CODE.DOCUMENT_SERIES],
            docNumber: [RQ_ITEM_CODE.DOCUMENT_NUMBER],
            docDate: [RQ_ITEM_CODE.DOCUMENT_DATE, RQ_ITEM_CODE.ISSUED_BY],
            depCode: [RQ_ITEM_CODE.DEPARTMENT_CODE],
        };

        const fieldCodes = codesByKey[activeKey];
        if (!fieldCodes) return creating.fields;
        const filteredFields = creating.fields.filter(field =>
            fieldCodes.includes(field.code),
        );

        return filteredFields;
    };

    const handleClientLineClick = (line: {
        key: DocumentPreviewLineKey;
        section: 'base' | 'address' | 'bankComment';
        canEdit: boolean;
    }) => {
        console.log('line', line);
        console.log('clientType', clientType);
        console.log('line.canEdit', line.canEdit);

        if (!clientType || !line.canEdit) {
            return;
        }
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

    const handleClickEditOrCreateBaseRq = () => {
        if (!clientType) {
            return;
        }
        initBaseCreating(clientType);
    }
    if (!client || !provider) {
        return null;
    }

    return (
        <div className="flex flex-row justify-between gap-4">
            <div className="w-1/2">
                <h2 className='pb-3'>Поставщик</h2>
                {provider.map((item, index) => {
                    return <p key={`provider-rq-item-${index}`}>{item}</p>;
                })}
                Банковские реквизиты:
                {ownBank && ownBank.bank && (
                    <>
                        <p>р/с: {ownBank.bank.rs} </p>
                        <p>в банке {ownBank.bank.bankName} {ownBank.bank.bankAddress}</p>
                        <p>БИК: {ownBank.bank.bik} </p>
                        <p>к/с: {ownBank.bank.ks} </p>
                    </>

                )}
            </div>
            <div className="w-1/2">
                <ClientRqHeader
                    handleClickEditOrCreateBaseRq={handleClickEditOrCreateBaseRq}
                    hasRq={isRqCreated}
                />

                <ClientRqViewLines
                    lines={clientPreviewLines}
                    handleClientLineClick={handleClientLineClick}
                />

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
