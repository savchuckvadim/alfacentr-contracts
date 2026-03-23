'use client';
import { useAppDispatch, useAppSelector } from '@/modules/app';
import { updateDealEdoCommentThunk } from '../../model';

export const useDealEdoComment = () => {
    const { value, isUpdating, error } = useAppSelector(
        state => state.dealEdoComment,
    );
    const dispatch = useAppDispatch();
    const update = (value: string | null | undefined) => {
        dispatch(updateDealEdoCommentThunk({ value: value || null }));
    };
    return { comment: value || '', isUpdating, error, update };
};
