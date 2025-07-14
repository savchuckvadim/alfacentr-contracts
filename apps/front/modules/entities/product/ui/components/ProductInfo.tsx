// import { useAppSelector } from "@/modules/app/lib/hooks/redux";
// import { BxProductRowWithProduct } from "../../model/ProductSlice"
// import { IBXDeal } from "@bitrix/index";
// // import { BxDealDataKeys, TFieldSelect } from "@alfa/entities";
// import { getDealFieldsData } from "@/modules/entities/deal/lib/utils/get-deal-fields-data.util";


// export const ProductInfo = ({ product }: { product: BxProductRowWithProduct | null }) => {
//     const company = useAppSelector((state) => state.app.bitrix.company);
//     const deal = useAppSelector((state) => state.app.bitrix.deal);
//     const dealFields = getDealFieldsData(deal as IBXDeal);
//     return (
//         <div>
//             <h1>{product?.productName}</h1>
//             {dealFields.map(dealField => {
//                 // const preifix = dealField[BxDealDataKeys.prefix] as TFieldSelect

//                 return <p>{'field'}</p>
//             })}
//         </div>
//     )
// }