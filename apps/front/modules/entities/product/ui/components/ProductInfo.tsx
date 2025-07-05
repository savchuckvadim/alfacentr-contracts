import { useAppSelector } from "@/modules/app/lib/hooks/redux";
import { BxProductRowWithProduct } from "../../model/ProductSlice"
import { getDealFieldsFields } from "../../lib/product-row.helper"
import { IBXDeal } from "@bitrix/index";
import { BxDealDataKeys, TFieldSelect } from "@alfa/entities";


export const ProductInfo = ({ product }: { product: BxProductRowWithProduct | null }) => {
    const company = useAppSelector((state) => state.app.bitrix.company);
    const deal = useAppSelector((state) => state.app.bitrix.deal);
    const dealFields = getDealFieldsFields(deal as IBXDeal);
    return (
        <div>
            <h1>{product?.productName}</h1>
            {dealFields.map(dealField => {
                const preifix = dealField[BxDealDataKeys.prefix] as TFieldSelect

                return <p>{'field'}</p>
            })}
        </div>
    )
}