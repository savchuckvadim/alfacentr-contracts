import { useDeal } from "@/modules/entities"
import { getDealClientType } from "@/modules/entities/deal/lib/utils/get-deal-client-type.util";
import { BxDealDataKeys } from "@alfa/entities";

export const useClientType = () => {
   const {
    dealData,
    getFieldByCode
   } = useDeal()

   const clientType = dealData ? getDealClientType(dealData) : null;   

    return {
        clientType
    };
}

