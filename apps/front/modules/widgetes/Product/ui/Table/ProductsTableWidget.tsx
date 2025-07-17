'use client'

import { useAlfaProducts } from '@/modules/entities/product/hook/useAlfaProducts';
import { DeleteConfirmModal } from '../DeleteConfirm/DeleteConfirmModal';
import { ProductsTable } from './components/Table/ProductsTable';
import { useDeleteEditMode } from '@/modules/entities/product/hook/useDeleteEditMode';
import { LinkBadge } from '@/modules/shared';




export function ProductsTableWidget() {
  const { items, loading, error } = useAlfaProducts()


  const { deletingProduct, isDeleting, handleDeleteConfirm, handleDeleteCancel } = useDeleteEditMode()


  console.log('deletingProduct')
  console.log(deletingProduct)
  if (loading) {
    return (
      <div className="flex items-center justify-center py-8 h-[600px]">
        <div className="flex items-center space-x-2">
          <svg className="animate-spin w-5 h-5 text-blue-600" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <span className="text-gray-600">Загрузка товаров...</span>
        </div>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="text-center py-8">
        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
          </svg>
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">Товары не найдены</h3>
        <p className="text-gray-500">Добавьте первый товар для начала работы</p>
      </div>
    );
  }

  return (
    <>
      <div className="flex justify-end mb-4">
        <LinkBadge href="/bitrix/products" text="К товарам" name="Подробнее" />
      </div>
      <div className="bg-background text-foreground rounded-lg border overflow-hidden p-4">

        <ProductsTable />
      </div>

      {deletingProduct && <DeleteConfirmModal
        isOpen={isDeleting}
        onConfirm={handleDeleteConfirm}
        onCancel={handleDeleteCancel}
        title="Удаление товара"
        message={`Вы уверены, что хотите удалить товар "${deletingProduct?.productName || deletingProduct?.product?.name}"?`}
      />}
    </>
  );
} 