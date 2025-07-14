'use client';

import React from 'react';

import { IProductState, BxProductRowWithProduct } from '../model/ProductSlice';
import { useAppDispatch, useAppSelector } from '@/modules/app/lib/hooks/redux';
import { ProductsTable } from './components/ProductsTable';

export const ProductList: React.FC = () => {

  const { items: products, loading, error } = useAppSelector((state) => state.product as IProductState);



  const handleEdit = (product: BxProductRowWithProduct) => {
    console.log('Редактирование товара:', product);
    // Здесь будет логика открытия модального окна редактирования
    alert(`Редактирование товара: ${product.id}`);
  };

  const handleDelete = async (productId: number) => {
    try {
      // Здесь будет логика удаления товара
      console.log('Удаление товара:', productId);
      alert(`Удаление товара: ${productId}`);
    } catch (error) {
      console.error('Ошибка при удалении товара:', error);
      alert('Ошибка при удалении товара');
    }
  };

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <div className="flex items-center space-x-2">
          <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
          <span className="text-red-800 font-medium">Ошибка загрузки</span>
        </div>
        <p className="text-red-700 mt-1">{error}</p>
      </div>
    );
  }

  return (
    <div>
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Товары</h3>
      <ProductsTable
        // products={products}
        // onEdit={handleEdit}
        // onDelete={handleDelete}
        // isLoading={loading}
      />
    </div>
  );
}; 