'use client'

import { Table, TableHead, TableHeader, TableRow } from '@workspace/ui/components/table';
import { useAlfaProducts } from '@/modules/entities/product/hook/useAlfaProducts';

import { ProductsTableBody } from '../TableBody/ProductsTableBody';



export function ProductsTable() {
  const { items } = useAlfaProducts()




  return (<Table>
    <TableHeader>
      <TableRow>
        <TableHead className="w-12">#</TableHead>
     
        <TableHead>Название товара</TableHead>
        <TableHead>Цена</TableHead>
        <TableHead>Количество</TableHead>
   
        <TableHead>Участники</TableHead>
        <TableHead>Статус</TableHead>
        {/* <TableHead className="w-32">Действия</TableHead> */}
      </TableRow>
    </TableHeader>
    <ProductsTableBody items={items} />
  </Table>

  );
} 