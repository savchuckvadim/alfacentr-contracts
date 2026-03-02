'use client';
import { useAppDispatch, useAppSelector } from '@/modules/app';
import { updateDealActDate } from '../../model/thunk/update-deal-act-date.thunk';

export const useDealActDate = () => {
    const { dealActDate, isUpdating, error } = useAppSelector(
        state => state.dealActDate,
    );
    const dispatch = useAppDispatch();
    const update = (date: Date | undefined) => {
        dispatch(updateDealActDate({ value: date as Date }));
    };
    return { dealActDate, isUpdating, error, update };
};
