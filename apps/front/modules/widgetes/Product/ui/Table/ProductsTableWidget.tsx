'use client'
import React, { useState } from 'react';
import { Button } from '@workspace/ui/components/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@workspace/ui/components/table';
import { Badge } from '@workspace/ui/components/badge';
import { BxProductRowWithProduct } from '../../../../entities/product/model/ProductSlice';
import { DeleteConfirmModal } from '../DeleteConfirm/DeleteConfirmModal';

import { useAlfaProducts } from '../../../../entities/product/hook/useAlfaProducts';
import { useProductsByParticipants } from '@/modules/features/participant-product/hook/useProductsByParticipants';
import { ProductsTable } from './components/Table/ProductsTable';


export function ProductsTableWidget() {
  const { items, loading, error } = useAlfaProducts()
  const {} = useProductsByParticipants()

  const [onDelete, setOnDelete] = useState<number | null>(null)
  const [onEdit, setOnEdit] = useState<BxProductRowWithProduct | null>(null)
  const [deleteModal, setDeleteModal] = useState<{
    isOpen: boolean;
    product: BxProductRowWithProduct | null;
  }>({
    isOpen: false,
    product: null
  });

  const handleDeleteClick = (product: BxProductRowWithProduct) => {
    setDeleteModal({
      isOpen: true,
      product
    });
  };

  const handleDeleteConfirm = () => {
    if (deleteModal.product && deleteModal.product.id) {
      setOnDelete(deleteModal.product.id);
      setDeleteModal({ isOpen: false, product: null });
    }
  };

  const handleDeleteCancel = () => {
    setDeleteModal({ isOpen: false, product: null });
  };

  const formatPrice = (price?: number) => {
    if (!price) return 'Не указана';
    return new Intl.NumberFormat('ru-RU', {
      style: 'currency',
      currency: 'RUB'
    }).format(price);
  };

  const formatQuantity = (quantity?: number) => {
    if (!quantity) return 'Не указано';
    return quantity.toString();
  };

  const getProductStatus = (product: BxProductRowWithProduct) => {
    if (product.product?.active === 'Y') {
      return { label: 'Активен', variant: 'default' as const };
    }
    return { label: 'Неактивен', variant: 'secondary' as const };
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
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

      <div className="bg-background text-foreground rounded-lg border overflow-hidden p-4">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-12">#</TableHead>
              <TableHead>Название товара</TableHead>
              <TableHead>Цена</TableHead>
              <TableHead>Количество</TableHead>
              <TableHead>Статус</TableHead>
              <TableHead>Код</TableHead>
              <TableHead className="w-32">Действия</TableHead>
            </TableRow>
          </TableHeader>
          
          <ProductsTable products={items}/>
          {/* <TableBody>
            {items.map((product, index) => {
              const status = getProductStatus(product);
              const productName = product.productName || product.product?.name || 'Не указано';
              const productCode = product.product?.code || 'Не указан';

              return (
                <TableRow key={product.id || index} className="hover:bg-gray-50">
                  <TableCell className="font-medium text-gray-500">
                    {index + 1}
                  </TableCell>
                  <TableCell>
                    <div>
                      <div className="font-medium text-gray-900">{productName}</div>
                      <div className="text-sm text-gray-500">ID: {product.id || 'Не указан'}</div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className="font-medium text-gray-900">
                      {formatPrice(product.price)}
                    </span>
                  </TableCell>
                  <TableCell>
                    <span className="text-gray-900">
                      {formatQuantity(product.quantity)}
                    </span>
                  </TableCell>
                  <TableCell>
                    <Badge variant={status.variant} className="text-xs">
                      {status.label}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <span className="text-sm text-gray-600 font-mono">
                      {productCode}
                    </span>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setOnEdit(product)}
                        className="h-8 w-8 p-0"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteClick(product)}
                        className="h-8 w-8 p-0 text-red-600 hover:text-red-800 hover:bg-red-50"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody> */}
        </Table>
      </div>

      <DeleteConfirmModal
        isOpen={deleteModal.isOpen}
        onConfirm={handleDeleteConfirm}
        onCancel={handleDeleteCancel}
        title="Удаление товара"
        message={`Вы уверены, что хотите удалить товар "${deleteModal.product?.productName || deleteModal.product?.product?.name}"?`}
      />
    </>
  );
} 