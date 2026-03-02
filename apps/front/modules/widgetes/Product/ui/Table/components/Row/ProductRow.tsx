'use client';
import { TableCell, TableRow } from '@workspace/ui/components/table';
import { Badge } from '@workspace/ui/components/badge';
import { IAlfaProduct } from '@/modules/entities';
import { useProductPpk } from '@/modules/features/participant-product/hook/useProductPpk';
import {
    ProductParticipantQuantityBadge,
    ProductParticipantStatusBadge,
    useIsUpContractType,
} from '@/modules/features/';
import { memo } from 'react';

export const ProductsTableRow = memo(
    ({ product, index }: { product: IAlfaProduct; index: number }) => {
        const {
            productType,
            productName,
            formattedQuantity,
            formattedPrice,

            getTypeBadgeColor,
        } = useProductPpk(product);
        const { isUp } = useIsUpContractType();
        return (
            <TableRow key={product.id || index} className="">
                <TableCell className="font-medium text-gray-500">
                    {index + 1}
                </TableCell>

                <TableCell>
                    <div className="flex items-center justify-between">
                        <div>
                            <div className="font-medium"> {productName} </div>
                            <div className="text-sm text-gray-500">
                                {' '}
                                ID: {product.id || 'Не указан'}{' '}
                            </div>
                        </div>
                        <Badge
                            variant={'default'}
                            className={`text-xs ${getTypeBadgeColor()}`}
                        >
                            {productType}
                        </Badge>
                    </div>
                </TableCell>
                <TableCell>
                    <span className="font-medium text-foreground text-sm">
                        {formattedPrice}
                    </span>
                </TableCell>
                <TableCell align="center">
                    <span className="text-foreground text-sm">
                        {formattedQuantity}
                    </span>
                </TableCell>

                {!isUp && (
                    <TableCell>
                        {/* feature */}
                        <ProductParticipantQuantityBadge product={product} />
                    </TableCell>
                )}
                {!isUp && (
                    <TableCell>
                        {/* feature */}
                        <ProductParticipantStatusBadge
                            product={product}
                            index={index}
                        />
                    </TableCell>
                )}
            </TableRow>
        );
    },
);
