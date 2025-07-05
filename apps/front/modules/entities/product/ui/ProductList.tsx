'use client';

import React from 'react';
// import { useDispatch, useSelector } from 'react-redux';
// import { fetchProducts } from '../model/ProductThunk';
import { IProductState } from '../model/ProductSlice';
import { useAppDispatch, useAppSelector } from '@/modules/app/lib/hooks/redux';

interface ProductListProps {
  dealId: string;
}

export const ProductList: React.FC<ProductListProps> = ({ dealId }) => {
  const dispatch = useAppDispatch();
  const { items: products, loading, error } = useAppSelector((state) => state.product as IProductState);

  // useEffect(() => {
  //   if (dealId) {
  //     dispatch(fetchProducts(dealId) as any);
  //   }
  // }, [dealId, dispatch]);

  if (loading) {
    return <div>Загрузка продуктов...</div>;
  }

  if (error) {
    return <div style={{ color: 'red' }}>Ошибка: {error}</div>;
  }

  if (!products || products.length === 0) {
    return <div>Продукты не найдены</div>;
  }

  return (
    <div>
      <h3>Продукты</h3>
      <div style={{ display: 'grid', gap: '16px' }}>
        {products.map((product) => (
          <div 
            key={product.id} 
            style={{ 
              border: '1px solid #ddd', 
              padding: '16px', 
              borderRadius: '8px',
              background: '#fff'
            }}
          >
            {/* <h4>{product.title}</h4>
            {product.price && (
              <p>Цена: {product.price} ₽</p>
            )}
            {product.quantity && (
              <p>Количество: {product.quantity}</p>
            )} */}
          </div>
        ))}
      </div>
    </div>
  );
}; 