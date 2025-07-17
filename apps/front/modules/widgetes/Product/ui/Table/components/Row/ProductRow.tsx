'use client'
import { Button } from "@workspace/ui/components/button";
import { TableBody, TableCell, TableRow } from "@workspace/ui/components/table";
import { Badge } from "@workspace/ui/components/badge";
import { IAlfaProduct } from "@/modules/entities";
import { ProductEditAction } from "../Actions/EditAction/ProductDeleteAction";
import { ProductDeleteAction } from "../Actions/DeleteAction/ProductDeleteAction";
import { useProductPpk } from "@/modules/features/participant-product/hook/useProductPpk";
import { Tooltip } from "@/modules/shared";

export const ProductsTableRow = ({ product, index }: { product: IAlfaProduct, index: number }) => {



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

    } = useProductPpk(product)




    return (
        <TableRow key={product.id || index} className="" >
            <TableCell className="font-medium text-gray-500" >
                {index + 1
                }
            </TableCell>
            {/* < TableCell width={10} >
                <Tooltip content={'тип товара'}>
                    <Badge variant={'default'} className={`text-xs ${getTypeBadgeColor()}`} >
                        {productType}
                    </Badge>
                </Tooltip>
            </TableCell> */}
            < TableCell >
                <div className="flex items-center justify-between" >
                    <div>
                        <div className="font-medium" > {productName} </div>
                        < div className="text-sm text-gray-500" > ID: {product.id || 'Не указан'} </div>
                    </div>
                    <Badge variant={'default'} className={`text-xs ${getTypeBadgeColor()}`} >
                        {productType}
                    </Badge>
                </div>
            </TableCell>
            < TableCell >
                <span className="font-medium text-foreground text-sm" >
                    {formattedPrice}
                </span>
            </TableCell>
            < TableCell align="center">
                <span className="text-foreground text-sm" >
                    {formattedQuantity}
                </span>
            </TableCell>



            < TableCell >
                <Tooltip content={'количество участников'}>
                    {isPpk && <Badge variant={assignedCount > quantity ? 'destructive' : 'default'} className="text-xs" >
                        {assignedCount}
                    </Badge>}
                </Tooltip>
            </TableCell>
            < TableCell >
                <Tooltip content={isPpk ? availabilityStatus?.message : quantity > 0 ? 'не ППК' : 'количество 0'}>
                    <Badge variant={'default'}
                        className={`m-0 p-0 text-xs w-18 h-5 ${isPpk && availabilityStatus?.status === 'balanced'
                            ? 'bg-indigo-700 text-zinc-50'
                            : isPpk && availabilityStatus?.status !== 'balanced'
                                ? 'bg-red-500 text-zinc-50'
                                : quantity > 0 ? 'bg-green-500 text-zinc-50'
                                    : 'bg-red-500 text-zinc-50'
                            }`
                        } >
                        {isPpk && availabilityStatus?.status === 'balanced'
                            ? 'ок'
                            : isPpk && availabilityStatus?.status !== 'balanced'
                                ? 'проблема'
                                : quantity > 0
                                    ? 'ок'
                                    : 'проблема'
                        }
                    </Badge>
                </Tooltip>
            </TableCell>
            {/* < TableCell >
                <div className="flex items-center space-x-1" >
                    <ProductEditAction product={product} />
                    <ProductDeleteAction product={product} />

                </div>
            </TableCell> */}
        </TableRow>
    );

}