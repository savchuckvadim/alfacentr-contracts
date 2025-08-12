'use client';

import { TableCell, TableRow } from '@workspace/ui/components/table';
import { Badge } from '@workspace/ui/components/badge';
import { IAlfaProduct } from '@/modules/entities';

import { useProductPpk } from '@/modules/features/participant-product/hook/useProductPpk';
import { Tooltip } from '@/modules/shared';
import {
    ProductParticipantQuantityBadge,
    ProductParticipantStatusBadge,
} from '@/modules/features/';

export const ProductsTableRow = ({
    product,
    index,
}: {
    product: IAlfaProduct;
    index: number;
}) => {
    const {
        productType,
        isPpk,
        isSeminar,
        isUp,
        assignedCount,
        productName,
        quantity,
        formattedQuantity,
        price,
        formattedPrice,
        availabilityStatus,
        getTypeBadgeColor,
    } = useProductPpk(product);

    return (
        <TableRow key={product.id || index} className="">
            <TableCell className="font-medium text-gray-500">
                {index + 1}
            </TableCell>
            {/* < TableCell width={10} >
                <Tooltip content={'тип товара'}>
                    <Badge variant={'default'} className={`text-xs ${getTypeBadgeColor()}`} >
                        {productType}
                    </Badge>
                </Tooltip>
            </TableCell> */}
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

            <TableCell>
                {/* feature */}
                <ProductParticipantQuantityBadge product={product} />
            </TableCell>
            <TableCell>
                {/* feature */}
                <ProductParticipantStatusBadge
                    product={product}
                    index={index}
                />
            </TableCell>
            {/* < TableCell >
                <div className="flex items-center space-x-1" >
                    <ProductEditAction product={product} />
                    <ProductDeleteAction product={product} />

                </div>
            </TableCell> */}
        </TableRow>
    );
};
