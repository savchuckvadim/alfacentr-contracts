import React, { FC, useEffect, useState } from "react";
import { useAppDispatch, useAppSelector } from "@/hooks/redux";
import {
  RQ_TYPE,
} from "@/redux/reducers/document/contract/type/document-contract-type";
import "../../../components/Documents/DocumentContract/DocumentContract.scss";
import "../../../components/Documents/DocumentContract/Card/DocumentContractCard.scss";
import { CONTRACT_LTYPE } from "@/types/contract-type";
import { SupplyTypesType } from "@/types/supply-type";
import { EVSBXRQ, EvsRqItem } from "../type/evs-rq-type";
import { filterFieldItems, getClinetTypeNameByCode, isFieldsEmpty } from "../lib/field-items-util";
import ACard from "@/components/Common/ACard/ACard";
import BXRQSelect from "./components/BXRQSelect";
import BXRQAddress from "./components/address/BXRQAddress";
import BXRQBank from "./components/bank/BXRQBank";
import BXRQBase from "./components/base/BXRQBase";
import { BXRQState } from "../model/bx-rq-reducer";
import { BXRQAC } from "../model/bx-rq-actions";
import BXRQErrors from "./components/common/BXRQErrors";

interface BXRQProps {
  title?: string;
  rq: EVSBXRQ;
  currentClientType: RQ_TYPE;
  contractType: CONTRACT_LTYPE;
  supplyType: SupplyTypesType;
}

// Тип для корректной обработки currentClientType



const BXRQ: FC<BXRQProps> = ({
  currentClientType,
  contractType,
  supplyType,
}) => {
  const title = "Новые Реквизиты";
  const dispatch = useAppDispatch();
  const currentRqs = useAppSelector(state => (state.bxrq as BXRQState).current.items)
  const currentRq = useAppSelector(state => (state.bxrq as BXRQState).current.item)

  const fields = currentRq && filterFieldItems(currentRq.fields,
    currentClientType,
    contractType,
    supplyType,
  )

  const isEmpty = fields ? isFieldsEmpty(fields) : false
  // || currentRq?.bx_id === -1;

  const setCurrentRqs = (currentClientType: RQ_TYPE) => dispatch(
    BXRQAC.setCurrentRqItems(currentClientType)
  )

  useEffect(() => {
    setCurrentRqs(
      currentClientType
    )
  }, [currentClientType]);


  const setSelectValue = (code: string, rq: EvsRqItem) => {

    dispatch(
      BXRQAC.setCurrentItem(rq.bx_id)
    )
  }
  const errors = useAppSelector(state => (state.bxrq as BXRQState).push.reqired)

  return (

    <>
      {currentRq &&

        <ACard
          title="Реквизиты"
        ><>
            {errors.length > 0 ? <BXRQErrors isActive={errors.length > 0} /> : <></>}


            <BXRQSelect
              size={"small"}
              name={getClinetTypeNameByCode(currentClientType)}
              code={'rqItem.code'}
              key={'${rqItem.group}-${rqItem.code}'}
              values={currentRqs}
              current={currentRq}
              selectCallback={setSelectValue}
              cleanError={() => console.log("cleanError")}
              isError={false}
            />

            {fields && <BXRQBase
              rq={currentRq}
              fields={fields}
              isEmpty={isEmpty}
              currentClientType={currentClientType}
              contractType={contractType}
              supplyType={supplyType}
            />}
            {!isEmpty && <BXRQAddress
              currentClientType={currentClientType}

              addresses={currentRq.address.items}
            />}
            {!isEmpty && currentRq.bank && <BXRQBank
              bank={currentRq.bank}
            />}



          </>
        </ACard>
      }

    </>
  );
};

export default BXRQ;
