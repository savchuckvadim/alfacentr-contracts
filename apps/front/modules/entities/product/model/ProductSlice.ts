import { createSlice, PayloadAction } from "@reduxjs/toolkit";

import { fetchProducts, createProduct, updateProduct, deleteProduct } from "./ProductThunk";
import { handleSliceError } from "@/modules/app/lib/thunk-error-handler";

// Временный тип для продукта, пока не создадим в alfa пакете
export interface IProduct {
    id: string;
    title: string;
    price?: number;
    quantity?: number;
    [key: string]: any;
}

export type IProductState = {
    items: IProduct[]
    editable: IProduct | null
    loading: boolean
    error: null | string
}

const initialState = {
    items: [] as IProduct[],
    editable: null as IProduct | null,
    loading: false,
    error: null as null | string
}

const productSlice = createSlice({
    name: 'product',
    initialState,
    reducers: {
        setProducts: (state, action: PayloadAction<IProduct[]>) => {
            state.items = action.payload
        },
        setEditableProduct: (state, action: PayloadAction<IProduct | null>) => {
            state.editable = action.payload
        },
        clearError: (state) => {
            state.error = null
        }
    },
    extraReducers: (builder) => {
        // fetchProducts
        builder.addCase(fetchProducts.pending, (state: IProductState) => {
            state.loading = true
            state.error = null
        })
        builder.addCase(fetchProducts.fulfilled, (state: IProductState, action: PayloadAction<IProduct[]>) => {
            state.items = action.payload
            state.loading = false
            state.error = null
        })
        builder.addCase(fetchProducts.rejected, (state: IProductState, action) => {
            state.loading = false
            state.error = handleSliceError(action, 'Ошибка загрузки продуктов')
        })

        // createProduct
        builder.addCase(createProduct.pending, (state: IProductState) => {
            state.loading = true
            state.error = null
        })
        builder.addCase(createProduct.fulfilled, (state: IProductState, action: PayloadAction<IProduct>) => {
            state.items.push(action.payload)
            state.loading = false
            state.error = null
        })
        builder.addCase(createProduct.rejected, (state: IProductState, action) => {
            state.loading = false
            state.error = handleSliceError(action, 'Ошибка создания продукта')
        })

        // updateProduct
        builder.addCase(updateProduct.pending, (state: IProductState) => {
            state.loading = true
            state.error = null
        })
        builder.addCase(updateProduct.fulfilled, (state: IProductState, action: PayloadAction<IProduct>) => {
            const index = state.items.findIndex(product => product.id === action.payload.id)
            if (index !== -1) {
                state.items[index] = action.payload
            }
            state.loading = false
            state.error = null
        })
        builder.addCase(updateProduct.rejected, (state: IProductState, action) => {
            state.loading = false
            state.error = handleSliceError(action, 'Ошибка обновления продукта')
        })

        // deleteProduct
        builder.addCase(deleteProduct.pending, (state: IProductState) => {
            state.loading = true
            state.error = null
        })
        builder.addCase(deleteProduct.fulfilled, (state: IProductState, action: PayloadAction<string>) => {
            state.items = state.items.filter(product => product.id !== action.payload)
            state.loading = false
            state.error = null
        })
        builder.addCase(deleteProduct.rejected, (state: IProductState, action) => {
            state.loading = false
            state.error = handleSliceError(action, 'Ошибка удаления продукта')
        })
    }
})

export const {
    setProducts,
    setEditableProduct,
    clearError
} = productSlice.actions

export const productReducer = productSlice.reducer 