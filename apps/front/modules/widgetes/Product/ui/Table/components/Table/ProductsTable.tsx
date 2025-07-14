import { Table as TableComponent, TableBody, TableCell, TableHeader, TableRow } from "@workspace/ui/components/table";
import { TableHead } from "@workspace/ui/components/table";
import { BxProductRowWithProduct, IAlfaProduct } from "@/modules/entities/product/model/ProductSlice";
import { Button } from "@workspace/ui/components/button";
import { Badge } from "@workspace/ui/components/badge";
import { useState } from "react";

export const ProductsTable = ({ products }: { products: IAlfaProduct[] }) => {

    const [onDelete, setOnDelete] = useState<number | null>(null)
    const [onEdit, setOnEdit] = useState<BxProductRowWithProduct | null>(null)
    const [deleteModal, setDeleteModal] = useState<{
        isOpen: boolean;
        product: IAlfaProduct | null;
    }>({
        isOpen: false,
        product: null
    });

    const handleDeleteClick = (product: IAlfaProduct) => {
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

    return (
     
            <TableBody>
                {products.map((product, index) => {

                    const productName = product.productName || product.product?.name || 'Не указано';


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
                                <Badge variant={'default'} className="text-xs">
                                    {0}
                                </Badge>
                            </TableCell>
                            <TableCell>
                                <span className="text-sm text-gray-600 font-mono">
                                    {'productCode'}
                                </span>
                            </TableCell>
                            <TableCell>
                                <div className="flex items-center space-x-1">
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => {}}
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
            </TableBody>
      
    )
}