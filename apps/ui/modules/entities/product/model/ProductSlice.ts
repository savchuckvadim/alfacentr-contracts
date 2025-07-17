import { createSlice, PayloadAction } from "@reduxjs/toolkit";
// import { fetchProducts } from "./ProductThunk";
import { IBXProduct } from "@bitrix/domain/catalog/interface/bx-product.interface";
import { IBXProductRowRow } from "@bitrix/domain/crm/product-row/interface/bx-product-row.interface";
import { BitrixOwnerType } from "@bitrix/domain/enums/bitrix-constants.enum";
import { fetchProducts } from "./ProductThunk";
import { handleSliceError } from "@/modules/app/lib/thunk-error-handler";

// Временный тип для продукта, пока не создадим в alfa пакете

export interface BxProductRowWithProduct extends IBXProductRowRow {
    ownerType: BitrixOwnerType;
    ownerId: string | number;
    id?: number;
    ownerTypeId?: string | BitrixOwnerType;
    price?: number;
    productId?: number;
    measureCode?: number | string;
    measureId?: number | string;
    product: IBXProduct;
}

export interface IProductField {
    bitrixId: string 
    name: string
    userType: string
    isMultiple: boolean
    value: string | string[] | {
        value: string
        valueId: string
        valueEnum?: string
    }
}

export type IProductState = {
    items: BxProductRowWithProduct[]
    editable: BxProductRowWithProduct | null
    loading: boolean
    error: null | string
}
export interface IAlfaProduct extends BxProductRowWithProduct {
    fields: IProductField[]
}
const initialState = {
    items: [] as IAlfaProduct[],
    editable: null as IAlfaProduct | null,
    loading: false,
    error: null as null | string
}

const productSlice = createSlice({
    name: 'product',
    initialState,
    reducers: {
        setProducts: (state, action: PayloadAction<IAlfaProduct[]>) => {
            state.items = action.payload
        },
        setEditableProduct: (state, action: PayloadAction<IAlfaProduct | null>) => {
            state.editable = action.payload
        },
        setFetchedProducts: (state, action: PayloadAction<IAlfaProduct[]>) => {
            state.items = action.payload
        }
       
    },
    extraReducers: (builder) => {
        // fetchProducts
        builder.addCase(fetchProducts.pending, (state: IProductState) => {
            state.loading = true
            state.error = null
        })
        builder.addCase(fetchProducts.fulfilled, (state: IProductState, action: PayloadAction<IAlfaProduct[]>) => {
            state.items = action.payload
            
            state.loading = false
            state.error = null
        })
        builder.addCase(fetchProducts.rejected, (state: IProductState, action) => {
            state.loading = false
            state.error = handleSliceError(action, 'Ошибка загрузки продуктов')
        })

        // // createProduct
        // builder.addCase(createProduct.pending, (state: IProductState) => {
        //     state.loading = true
        //     state.error = null
        // })
        // builder.addCase(createProduct.fulfilled, (state: IProductState, action: PayloadAction<BxProductRowWithProduct>) => {
        //     state.items.push(action.payload)
        //     state.loading = false
        //     state.error = null
        // })
        // builder.addCase(createProduct.rejected, (state: IProductState, action) => {
        //     state.loading = false
        //     state.error = handleSliceError(action, 'Ошибка создания продукта')
        // })

        // // updateProduct
        // builder.addCase(updateProduct.pending, (state: IProductState) => {
        //     state.loading = true
        //     state.error = null
        // })
        // builder.addCase(updateProduct.fulfilled, (state: IProductState, action: PayloadAction<BxProductRowWithProduct>) => {
        //     const index = state.items.findIndex(product => product.id === action.payload.id)
        //     if (index !== -1) {
        //         state.items[index] = action.payload
        //     }
        //     state.loading = false
        //     state.error = null
        // })
        // builder.addCase(updateProduct.rejected, (state: IProductState, action) => {
        //     state.loading = false
        //     state.error = handleSliceError(action, 'Ошибка обновления продукта')
        // })

        // // deleteProduct
        // builder.addCase(deleteProduct.pending, (state: IProductState) => {
        //     state.loading = true
        //     state.error = null
        // })
        // builder.addCase(deleteProduct.fulfilled, (state: IProductState, action: PayloadAction<number>) => {
        //     state.items = state.items.filter(product => product.id !== action.payload)
        //     state.loading = false
        //     state.error = null
        // })
        // builder.addCase(deleteProduct.rejected, (state: IProductState, action) => {
        //     state.loading = false
        //     state.error = handleSliceError(action, 'Ошибка удаления продукта')
        // })
    }
})

export const {
    setProducts,
    setEditableProduct,
    setFetchedProducts,
} = productSlice.actions

export const productReducer = productSlice.reducer 