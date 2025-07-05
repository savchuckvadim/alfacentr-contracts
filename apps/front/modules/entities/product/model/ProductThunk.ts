
import { createAsyncThunk } from "@reduxjs/toolkit";

import { Bitrix } from "@bitrix/bitrix";
import { BxProductRowWithProduct } from "./ProductSlice";
import { AlfaBxProductService } from "../services/alfa-bx-product.service";



// export const setFetchedProducts = createAsyncThunk(
//     'product/fetchProducts',
//     async (rows: BxProductRowWithProduct[], { rejectWithValue }) => {
//         try {
//             console.log(rows)
          
//             // const response = await backAPI.service<{rowsWithProducts:BxProductRowWithProduct[] }| null>(
//             //     EBACK_ENDPOINT.ALFA_DEAL_PRODUCTS,
//             //     API_METHOD.GET,
//             //     {},
//             //     `${domain}/${dealId}`
//             // )
//             // // Проверяем различные случаи ошибок с помощью утилиты
//             // const validResponse = validateApiResponse(response, 'Ошибка получения продуктов: пустой ответ от сервера')
//             // const validResponseData = validateApiResponse(validResponse.data, 'Ошибка получения продуктов: пустой ответ от сервера')
//             // const validResponseDataRows = validateApiResponse(validResponse.data?.rowsWithProducts, 'Ошибка получения продуктов: пустой ответ от сервера')

//             // const products = validResponseDataRows as BxProductRowWithProduct[]
//             // console.log(products)
//             return rows;
//         } catch (error) {
//             // Обрабатываем сетевые ошибки и другие исключения
//             const errorMessage = error instanceof Error ? error.message : 'Неизвестная ошибка при получении продуктов'
//             return rejectWithValue(errorMessage)
//         }
//     }
// );

// export const fetchProducts = createAsyncThunk(
//     'product/fetchProducts',
//     async (dealId: string, { rejectWithValue }) => {
//         try {
//             console.log(dealId)
//             const bitrix = Bitrix.getService()
//             const domain = bitrix.api.getDomain()
//             const service = new AlfaBxProductService()
//             const response = await service.getDealProductRowsWithProducts(dealId)
            
//             // const response = await backAPI.service<{rowsWithProducts:BxProductRowWithProduct[] }| null>(
//             //     EBACK_ENDPOINT.ALFA_DEAL_PRODUCTS,
//             //     API_METHOD.GET,
//             //     {},
//             //     `${domain}/${dealId}`
//             // )
//             // // Проверяем различные случаи ошибок с помощью утилиты
//             // const validResponse = validateApiResponse(response, 'Ошибка получения продуктов: пустой ответ от сервера')
//             // const validResponseData = validateApiResponse(validResponse.data, 'Ошибка получения продуктов: пустой ответ от сервера')
//             // const validResponseDataRows = validateApiResponse(validResponse.data?.rowsWithProducts, 'Ошибка получения продуктов: пустой ответ от сервера')

//             // const products = validResponseDataRows as BxProductRowWithProduct[]
//             // console.log(products)
//             // return products;
//         } catch (error) {
//             // Обрабатываем сетевые ошибки и другие исключения
//             const errorMessage = error instanceof Error ? error.message : 'Неизвестная ошибка при получении продуктов'
//             return rejectWithValue(errorMessage)
//         }
//     }
// );

// export const createProduct = createAsyncThunk(
//     'product/createProduct',
//     async (productData: any, { rejectWithValue }) => {
//         try {
//             const domain = TESTING_DOMAIN
//             const response = await bxAPI.getProtectedMethod(
//                 'crm.item.add',
//                 {
//                     entityTypeId: PRODUCT_ENTITY_ID,
//                     fields: productData
//                 },
//                 domain
//             )
            
//             const validResponse = validateApiResponse(response, 'Ошибка создания продукта: пустой ответ от сервера')
//             const product = getProduct(validResponse)
//             return product;
//         } catch (error) {
//             const errorMessage = error instanceof Error ? error.message : 'Неизвестная ошибка при создании продукта'
//             return rejectWithValue(errorMessage)
//         }
//     }
// );

// export const updateProduct = createAsyncThunk(
//     'product/updateProduct',
//     async ({ productId, productData }: { productId: string; productData: any }, { rejectWithValue }) => {
//         try {
//             const domain = TESTING_DOMAIN
//             const response = await bxAPI.getProtectedMethod(
//                 'crm.item.update',
//                 {
//                     entityTypeId: PRODUCT_ENTITY_ID,
//                     id: productId,
//                     fields: productData
//                 },
//                 domain
//             )
            
//             const validResponse = validateApiResponse(response, 'Ошибка обновления продукта: пустой ответ от сервера')
//             const product = getProduct(validResponse)
//             return product;
//         } catch (error) {
//             const errorMessage = error instanceof Error ? error.message : 'Неизвестная ошибка при обновлении продукта'
//             return rejectWithValue(errorMessage)
//         }
//     }
// );

// export const deleteProduct = createAsyncThunk(
//     'product/deleteProduct',
//     async (productId: string, { rejectWithValue }) => {
//         try {
//             const domain = TESTING_DOMAIN
//             const response = await bxAPI.getProtectedMethod(
//                 'crm.item.delete',
//                 {
//                     entityTypeId: PRODUCT_ENTITY_ID,
//                     id: productId
//                 },
//                 domain
//             )
            
//             const validResponse = validateApiResponse(response, 'Ошибка удаления продукта: пустой ответ от сервера')
//             return productId; // Возвращаем ID удаленного продукта
//         } catch (error) {
//             const errorMessage = error instanceof Error ? error.message : 'Неизвестная ошибка при удалении продукта'
//             return rejectWithValue(errorMessage)
//         }
//     }
// ); 