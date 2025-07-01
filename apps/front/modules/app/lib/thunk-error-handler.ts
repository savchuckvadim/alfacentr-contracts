import { createAsyncThunk } from '@reduxjs/toolkit';
import { errorHandler } from './error-handler';

// Утилита для создания thunk'ов с автоматической обработкой ошибок
export const createErrorHandledThunk = <Returned, ThunkArg = void>(
  typePrefix: string,
  thunkFn: (arg: ThunkArg, thunkAPI: any) => Promise<Returned>
) => {
  return createAsyncThunk<Returned, ThunkArg>(
    typePrefix,
    async (arg, thunkAPI) => {
      try {
        return await thunkFn(arg, thunkAPI);
      } catch (error) {
        // Обрабатываем ошибку через ErrorHandler
        errorHandler.handleAsyncError(error);
        
        // Возвращаем ошибку в thunk
        return thunkAPI.rejectWithValue(
          error instanceof Error ? error.message : String(error)
        );
      }
    }
  );
};

// Утилита для обработки ошибок в существующих thunk'ах
export const handleThunkError = (error: unknown): string => {
  const errorMessage = error instanceof Error ? error.message : String(error);
  errorHandler.handleAsyncError(error);
  return errorMessage;
}; 