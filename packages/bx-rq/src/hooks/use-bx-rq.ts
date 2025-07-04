// import { useSelector, useDispatch } from 'react-redux';
// import { 
// //   selectBXRQState, 
// //   selectBXRQData, 
// //   selectBXRQLoading, 
// //   selectBXRQError,
//   setLoading,
//   setData,
//   setError,
//   clearError
// } from '../model/bx-rq-slice';

// // Хук для получения всего состояния
// export const useBXRQState = () => {
//   return useSelector(selectBXRQState);
// };

// // Хук для получения данных
// export const useBXRQData = () => {
//   return useSelector(selectBXRQData);
// };

// // Хук для получения состояния загрузки
// export const useBXRQLoading = () => {
//   return useSelector(selectBXRQLoading);
// };

// // Хук для получения ошибки
// export const useBXRQError = () => {
//   return useSelector(selectBXRQError);
// };

// // Хук для действий
// export const useBXRQActions = () => {
//   const dispatch = useDispatch();
  
//   return {
//     setLoading: (loading: boolean) => dispatch(setLoading(loading)),
//     setData: (data: any[]) => dispatch(setData(data)),
//     setError: (error: string) => dispatch(setError(error)),
//     clearError: () => dispatch(clearError()),
//   };
// };

// // Комбинированный хук
// export const useBXRQ = () => {
//   const state = useBXRQState();
//   const actions = useBXRQActions();
  
//   return {
//     ...state,
//     ...actions,
//   };
// }; 