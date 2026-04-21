'use client';
import { useAppDispatch, useAppSelector } from '@/modules/app/lib/hooks/redux';
import { documentGenerate } from '../model/thunk/DocumentThunk';
import { useEffect, useState } from 'react';

export const useDocument = () => {
    const dispatch = useAppDispatch();
    const [isLoading, setIsLoading] = useState(false);

    const { document } = useAppSelector(state => state.document);
    // const { confirm } = useAppSelector(state => state.communications);
    useEffect(() => {
        setIsLoading(document.isGenerating);
    }, [document.isGenerating]);

    const generateDocument = () => {
        dispatch(documentGenerate());
    };

    return {
        generateDocument,
        isLoading,
    };
};

export default useDocument;
