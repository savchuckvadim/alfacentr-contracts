import React, { FC, useEffect, useState } from "react";
import { useAppDispatch, useAppSelector } from "@/hooks/redux";
import {
  RQ_TYPE,

} from "@/redux/reducers/document/contract/type/document-contract-type";

import { fetchBXRQ } from "@/modules/bx-rq/model/bx-rq-thunk";
import PreloaderComponent from "@/components/Common/Preloader/PreloaderComponent";
import { ROUTE } from "@/redux/reducers/router/router-reducer";
// import "./BXRQ.scss";
import "../../../components/Documents/DocumentContract/DocumentContract.scss";

import "../../../components/Documents/DocumentContract/Card/DocumentContractCard.scss";
import { CONTRACT_LTYPE } from "@/types/contract-type";
import { SupplyTypesType } from "@/types/supply-type";
import { BXRQState } from "../model/bx-rq-reducer";
import { EVSBXRQ } from "../type/evs-rq-type";
import BXRQ from "./BXRQ";
import { Col } from "reactstrap";
import './BXRQ.scss'

interface BXRQProps {
  title?: string;
  currentClientType: RQ_TYPE | undefined;
  contractType: CONTRACT_LTYPE;
  supplyType: SupplyTypesType;
}

const BXRQContainer: FC<BXRQProps> = ({
  currentClientType,
  contractType,
  supplyType,
}) => {
  const title = "Новые Реквизиты";
  const dispatch = useAppDispatch();
  const bxrq = useAppSelector((state) => state.bxrq) as BXRQState;
  // const isFetched = bxrq.isFetched;
  const isFetched = bxrq.isFetched;

  if (!isFetched) {
    dispatch(fetchBXRQ());
  }



  const rq = bxrq.rqs as EVSBXRQ



    return (
      <>
        {isFetched && currentClientType ? (<BXRQ
          rq={rq}
          currentClientType={currentClientType}
          contractType={contractType}
          supplyType={supplyType}
        />
        ) : (
          <Col className="rq__column p-3 m-1">
            <div className="rq__card_content__preloader">
              <PreloaderComponent currentRoute={ROUTE.DOCUMENT} />
            </div>
          </Col>
        )}
      </>
    );
  };

export default BXRQContainer;
