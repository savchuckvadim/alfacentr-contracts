'use client';
import { useAppDispatch, useAppSelector } from '@/modules/app';
import { updateDealEmailSubjectThunk } from '../../model';

export const useDealEmailSubject = () => {
    const { value, isUpdating, error } = useAppSelector(
        state => state.dealEmailSubject,
    );
    const dispatch = useAppDispatch();
    const update = (value: string | null | undefined) => {
        dispatch(updateDealEmailSubjectThunk({ value: value || null }));
    };
    return { value: value || '', isUpdating, error, update };
};
