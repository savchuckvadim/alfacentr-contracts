'use client'
import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Button } from '@workspace/ui/components/button';
import { ProductsTable } from './components/ProductsTable';
import { fetchProducts } from '../model/ProductThunk';
import { RootState, AppDispatch } from '@/modules/app/model/store';
import { BxProductRowWithProduct } from '../model/ProductSlice';
import { Header } from '@/components';
import Link from 'next/link';
import { ArrowLeftIcon } from 'lucide-react';
import { ProductTable } from './ProductTable';
import { ModalMenu } from '@/modules/shared/modal/ModalMenu';

export function ProductsPage() {
  const dispatch = useDispatch<AppDispatch>();
  const { items: products, loading, error } = useSelector((state: RootState) => state.product);
  const { deal } = useSelector((state: RootState) => state.app.bitrix);
  const [isOpen, setIsOpen] = useState(false);
  useEffect(() => {
    if (deal?.ID) {
      dispatch(fetchProducts(deal.ID.toString()));
    }
  }, [dispatch, deal?.ID]);

  const handleEdit = (product: BxProductRowWithProduct) => {
    debugger
    console.log('Редактирование товара:', product);
    setIsOpen(true);

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

  const handleAddNew = () => {
    console.log('Добавление нового товара');
    // Здесь будет логика открытия модального окна добавления
    alert('Добавление нового товара');
  };

  const getActiveProductsCount = () => {
    return products.filter(p => p.product?.active === 'Y').length;
  };

  const getInactiveProductsCount = () => {
    return products.filter(p => p.product?.active === 'N').length;
  };

  const getTotalValue = () => {
    return products.reduce((total, product) => {
      const price = product.price || 0;
      const quantity = product.quantity || 0;
      return total + (price * quantity);
    }, 0);
  };

  return (
    <div className="space-y-6">
      <ModalMenu
        isOpen={isOpen}
        onOpenChange={setIsOpen}
      >
        <div>
          <h1>Product Table</h1>
        </div>
      </ModalMenu>
      <div className="flex items-center justify-between">
        <Link href="/bitrix" className="text-sm text-gray-500 hover:text-gray-700">
          <ArrowLeftIcon className="w-4 h-4" />
        </Link>
      </div>

      {/* Заголовок */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Товары</h1>
          <p className="text-gray-600 mt-1">
            Управление товарами проекта
          </p>
        </div>
        <Button onClick={handleAddNew} className="flex items-center space-x-2">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
          <span>Добавить товар</span>
        </Button>
      </div>

      {/* Статистика */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg border p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Всего товаров</p>
              <p className="text-2xl font-bold text-gray-900">{products.length}</p>
            </div>
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Активные</p>
              <p className="text-2xl font-bold text-green-600">
                {getActiveProductsCount()}
              </p>
            </div>
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
              <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Неактивные</p>
              <p className="text-2xl font-bold text-yellow-600">
                {getInactiveProductsCount()}
              </p>
            </div>
            <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
              <svg className="w-5 h-5 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Общая стоимость</p>
              <p className="text-2xl font-bold text-purple-600">
                {new Intl.NumberFormat('ru-RU', {
                  style: 'currency',
                  currency: 'RUB'
                }).format(getTotalValue())}
              </p>
            </div>
            <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
              <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Ошибка */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center space-x-2">
            <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
            <span className="text-red-800 font-medium">Ошибка загрузки</span>
          </div>
          <p className="text-red-700 mt-1">{error}</p>
          <Button
            variant="outline"
            size="sm"
            onClick={() => deal?.ID && dispatch(fetchProducts(deal.ID.toString()))}
            className="mt-2"
          >
            Попробовать снова
          </Button>
        </div>
      )}

      {/* Таблица товаров */}
      <ProductsTable
        products={products}
        onEdit={handleEdit}
        onDelete={handleDelete}
        isLoading={loading}
      />
      <ProductTable />
    </div>
  );
} 