import { useSelector, useDispatch } from 'react-redux';
 import {
       selectBXRQState, 
       selectBXRQData, 
     //   selectBXRQLoading, 
     //   selectBXRQError,
     setLoading,

     setError,
    //  clearError
 } from '../model/bx-rq-slice';
import { fetchBXRQ } from '../model/bx-rq-thunk';
import { AppThunkDispatch } from '../model/bx-rq-thunk-types';

// // Хук для получения всего состояния
export const useBXRQState = () => {
    return useSelector(selectBXRQState);
};

// // Хук для получения данных
export const useBXRQData = () => {
    return useSelector(selectBXRQData);
};

// // Хук для получения состояния загрузки
// export const useBXRQLoading = () => {
//     return useSelector(selectBXRQLoading);
// };

// // Хук для получения ошибки
// export const useBXRQError = () => {
//     return useSelector(selectBXRQError);
// };

// // Хук для действий
export const useBXRQActions = () => {
    const dispatch = useDispatch();

    return {
        setLoading: (loading: boolean) => dispatch(setLoading(loading)),
        // setData: (data: any[]) => dispatch(setData(data)),
        // setError: (error: string) => dispatch(setError(error)),
        // clearError: () => dispatch(clearError()),
    };
};

// // Комбинированный хук
export const useBXRQ = () => {
    
    const state = useBXRQState();
 
    const actions = useBXRQActions();

    return {
        ...state,
        ...actions,
    };
}; 


export const useBxRq = () => {
    const dispatch = useDispatch() as AppThunkDispatch;
    const state = useSelector(selectBXRQState);
    const actions = useBXRQActions();

    return {
        ...state,
        ...actions,
        fetchBXRQ: (domain: string, companyId: number) => dispatch(fetchBXRQ(domain, companyId)),
        // Заглушки для методов сохранения - их нужно будет реализовать
        saveBase: async (fields: any[]) => {
            console.log('saveBase called with:', fields);
            // TODO: Реализовать сохранение основных полей
        },
        saveAddress: async (typeId: any, fields: any[]) => {
            console.log('saveAddress called with:', typeId, fields);
            // TODO: Реализовать сохранение адреса
        },
        saveBank: async (bankId: number, fields: any[]) => {
            console.log('saveBank called with:', bankId, fields);
            // TODO: Реализовать сохранение банковских реквизитов
        },
        copyAddress: async (fromTypeId: any, toTypeId: any) => {
            console.log('copyAddress called with:', fromTypeId, toTypeId);
            // TODO: Реализовать копирование адреса
        },
    };
};
