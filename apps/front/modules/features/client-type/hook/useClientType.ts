import { useDeal } from "@/modules/entities"
import { getDealClientType } from "@/modules/entities/deal/lib/utils/get-deal-client-type.util";


export const useClientType = () => {
   const {
    dealData,
 
   } = useDeal()

   const clientType = dealData ? getDealClientType(dealData) : null;   

    return {
        clientType
    };
}

