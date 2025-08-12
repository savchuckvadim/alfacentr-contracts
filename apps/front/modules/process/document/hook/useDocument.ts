'use client';
import { useAppDispatch, useAppSelector } from '@/modules/app/lib/hooks/redux';
import { documentGenerate } from '../model/DocumentThunk';
import { useEffect, useState } from 'react';

export const useDocument = () => {
    const dispatch = useAppDispatch();
    const [isLoading, setIsLoading] = useState(false);

    const { document, email } = useAppSelector(state => state.document);

    useEffect(() => {
        setIsLoading(document.isGenerating || email.isSending);
    }, [document.isGenerating, email.isSending]);

    const generateDocument = () => {
        dispatch(documentGenerate());
    };

    return {
        generateDocument,
        isLoading,
    };
};

export default useDocument;
