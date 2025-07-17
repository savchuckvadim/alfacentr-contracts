'use client'
import { TableBody } from "@workspace/ui/components/table";
import { IAlfaProduct } from "@/modules/entities";
import { ProductsTableRow } from "../Row/ProductRow";

export const ProductsTableBody = ({ items }: { items: IAlfaProduct[] }) => {



    return (<TableBody>
        {items.map((product, index) => {
            return <ProductsTableRow key={product.id} product={product} index={index} />
        })}
    </TableBody>)
}