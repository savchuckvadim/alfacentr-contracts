'use client';

import { useAppDispatch, useAppSelector } from '@/modules/app/lib/hooks/redux';
import { useEffect, useState } from 'react';
import { documentGenerate } from '@/modules/process';
import { communicationsActions } from '../model/slice/CommunicationsSlice';
import { BxDealDataKeys } from '@alfa/entities';
import { useDeal } from '@/modules/entities';

export const useCommunications = () => {
    const dispatch = useAppDispatch();
    const { getFieldByCode, updateField, updateFieldWithAPI } = useDeal();
    const email = getFieldByCode(BxDealDataKeys.exchange_doc_email);
    const phone = getFieldByCode(BxDealDataKeys.exchange_doc_phone);
    const name = getFieldByCode(BxDealDataKeys.exchange_doc_name);

    const [isLoading, setIsLoading] = useState(false);

    const { confirm, errors } = useAppSelector(state => state.communications);

    useEffect(() => {
        setIsLoading(confirm.isActive);
    }, [confirm.isActive]);

    const generateDocument = () => {
        dispatch(documentGenerate());
    };

    return {
        email,
        phone,
        name,
        confirm,
        needEmail: confirm.needEmail,
        errors,
        generateDocument,
        isLoading,
        setEmailConfirmConfirmed: () => {
            dispatch(communicationsActions.setEmailConfirmConfirmed(true));
        },
        cancelEmailConfirm: () => {
            dispatch(communicationsActions.setConfirmCommunicationsActive(false));
            dispatch(communicationsActions.setEmailConfirmConfirmed(false));
        },
        setNeedEmail: (needEmail: boolean) => {
            dispatch(communicationsActions.setNeedEmail(needEmail));
        },
        updateField,
        updateFieldWithAPI,
    };
};

export default useCommunications;
