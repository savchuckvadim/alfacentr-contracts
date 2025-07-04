import { bitrixInit } from "@/modules/app/lib/bitrix-init/bitrix-init.util";
import { EntityTypeIdEnum } from "@alfa/entities";
import { createAsyncThunk } from "@reduxjs/toolkit";
import { bxAPI } from "@workspace/api";
import { TESTING_DOMAIN } from "@/modules/app/consts/app-global";
import { validateApiResponse } from "@/modules/app/lib/thunk-error-handler";
import { IProduct } from "./ProductSlice";

// Временный тип для продукта из Bitrix
interface IAlfaProductSmartItem {
    id: string;
    title: string;
    price?: number;
    quantity?: number;
    [key: string]: any;
}

// Временная функция для преобразования продукта
const getProduct = (product: IAlfaProductSmartItem): IProduct => {
    return {
        ...product,
        id: product.id,
        title: product.title,
        price: product.price,
        quantity: product.quantity
    };
};

// Временный ID для продуктов (нужно будет добавить в EntityTypeIdEnum)
const PRODUCT_ENTITY_ID = 1037;

export const fetchProducts = createAsyncThunk(
    'product/fetchProducts',
    async (dealId: string, { rejectWithValue }) => {
        try {
            const domain = TESTING_DOMAIN
            const response = await bxAPI.getProtectedMethod(
                'crm.item.list',
                {
                    entityTypeId: PRODUCT_ENTITY_ID,
                    filter: {
                        parentId2: dealId
                    }
                },
                domain
            )
            
            // Проверяем различные случаи ошибок с помощью утилиты
            const validResponse = validateApiResponse(response, 'Ошибка получения продуктов: пустой ответ от сервера')
            const validItems = validateApiResponse(validResponse.items, 'Ошибка получения продуктов: отсутствуют данные в ответе')
            
            const products = validItems.map((product: IAlfaProductSmartItem) => getProduct(product))
            return products;
        } catch (error) {
            // Обрабатываем сетевые ошибки и другие исключения
            const errorMessage = error instanceof Error ? error.message : 'Неизвестная ошибка при получении продуктов'
            return rejectWithValue(errorMessage)
        }
    }
);

export const createProduct = createAsyncThunk(
    'product/createProduct',
    async (productData: any, { rejectWithValue }) => {
        try {
            const domain = TESTING_DOMAIN
            const response = await bxAPI.getProtectedMethod(
                'crm.item.add',
                {
                    entityTypeId: PRODUCT_ENTITY_ID,
                    fields: productData
                },
                domain
            )
            
            const validResponse = validateApiResponse(response, 'Ошибка создания продукта: пустой ответ от сервера')
            const product = getProduct(validResponse)
            return product;
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Неизвестная ошибка при создании продукта'
            return rejectWithValue(errorMessage)
        }
    }
);

export const updateProduct = createAsyncThunk(
    'product/updateProduct',
    async ({ productId, productData }: { productId: string; productData: any }, { rejectWithValue }) => {
        try {
            const domain = TESTING_DOMAIN
            const response = await bxAPI.getProtectedMethod(
                'crm.item.update',
                {
                    entityTypeId: PRODUCT_ENTITY_ID,
                    id: productId,
                    fields: productData
                },
                domain
            )
            
            const validResponse = validateApiResponse(response, 'Ошибка обновления продукта: пустой ответ от сервера')
            const product = getProduct(validResponse)
            return product;
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Неизвестная ошибка при обновлении продукта'
            return rejectWithValue(errorMessage)
        }
    }
);

export const deleteProduct = createAsyncThunk(
    'product/deleteProduct',
    async (productId: string, { rejectWithValue }) => {
        try {
            const domain = TESTING_DOMAIN
            const response = await bxAPI.getProtectedMethod(
                'crm.item.delete',
                {
                    entityTypeId: PRODUCT_ENTITY_ID,
                    id: productId
                },
                domain
            )
            
            const validResponse = validateApiResponse(response, 'Ошибка удаления продукта: пустой ответ от сервера')
            return productId; // Возвращаем ID удаленного продукта
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Неизвестная ошибка при удалении продукта'
            return rejectWithValue(errorMessage)
        }
    }
); 