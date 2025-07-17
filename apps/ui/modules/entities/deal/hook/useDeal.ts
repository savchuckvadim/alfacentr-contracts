import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '@/modules/app/model/store';
import {
    setDealData,
    setDealId,
    updateFieldValue,
    clearDeal,
    setError,
    clearError
} from '../model/DealSlice';
import { updateDealField, UpdateDealFieldPayload } from '../model/DealThunk';
import { TDealData, BxDealDataKeys } from '@alfa/entities';
import { IDealFieldsData } from '../type/deal-field.type';
import { useAppDispatch, useAppSelector } from '@/modules/app/lib/hooks/redux';

export const useDeal = () => {
    const dispatch = useAppDispatch();
    const dealState = useSelector((state: RootState) => state.deal);
    const dealId = useAppSelector(state => state.app.bitrix.deal?.ID)


    const getFieldByCode = (code: BxDealDataKeys) => {
        return dealState.dealData?.find(field => field.code === code);
    };

    const setDeal = (dealData: IDealFieldsData[]) => {
        dispatch(setDealData(dealData));
    };

    const setDealIdAction = (dealId: number) => {
        dispatch(setDealId(dealId));
    };

    const updateField = (fieldKey: BxDealDataKeys, value: string) => {
        
        dispatch(updateFieldValue({ fieldKey, value }));
    };

    const updateFieldWithAPI = async (fieldKey: BxDealDataKeys, value: string | number) => {
        const field = getFieldByCode(fieldKey);
        if (!field) {
            throw new Error(`Field ${fieldKey} not found`);
        }
        const payload: UpdateDealFieldPayload = {
          
            fieldKey,
            value,
            field
        }
        
        dispatch(updateFieldValue({ fieldKey, value }));
        return dispatch(updateDealField(payload));
    };

    const clearDealAction = () => {
        dispatch(clearDeal());
    };

    const setErrorAction = (error: string) => {
        dispatch(setError(error));
    };

    const clearErrorAction = () => {
        dispatch(clearError());
    };

    return {
        //app state
        dealId,

        // State
        dealData: dealState.dealData,
        
        loading: dealState.loading,
        error: dealState.error,
        isUpdating: dealState.isUpdating,


        //utils
        getFieldByCode,
        // Actions
        setDeal,
        setDealId: setDealIdAction,
        updateField,
        updateFieldWithAPI,
        clearDeal: clearDealAction,
        setError: setErrorAction,
        clearError: clearErrorAction,
    };
}; 