import { eventServiceAPI, EVS_ENDPOINT, RQStore } from "@workspace/api/src/services/april-service-event-api";
import { API_METHOD } from "@workspace/api";
import { AddressRqItem, EvsResponse, EvsRqItem, getEntityTypeId, ResolvedRQType } from "../type/evs-rq-type";
import { filterFieldItems, getFullName } from "../lib/field-items-util";

import { getResolvedType } from "../lib/rq-util";
import { 
  setLoading, 
  setFetched, 
  setFetchedStatus, 
  setCreatingLoadingStatus,
  setCurrentRqItems,
  saveCurrentRqItems,
  setCurrentItem,
  initBaseCreating,
  saveBaseCreating,
  cancelBaseCreating,
  initAddressCreating,
  initCopyAddressCreating,
  saveAddressCreating,
  cancelAddressCreating,
  initBankCreating,
  saveBankCreating,
  cancelBankCreating,
  setBaseProp as setBasePropAction,
  setAddressProp as setAddressPropAction,
  setBankProp as setBankPropAction,
  setError,
  cleanError,
  cleanErrors,
  setRequired,
  setRequiredUnderstand,
  BXRQState
} from "./bx-rq-slice";
import { AppThunkDispatch, AppThunkGetState } from "./bx-rq-thunk-types";
import { CONTRACT_LTYPE, RQ_TYPE, SupplyTypesType } from "@/type/input-type";
import { BX_ADDRESS_TYPE } from "@/type/evs-address-type";

export const fetchBXRQ = (
  domain: string,
  companyId: number,
) => async (dispatch: AppThunkDispatch, getState: AppThunkGetState) => {
  const state = getState();
 
  const isLoading = state.bxrq.isLoading;
  if (!isLoading) {
    dispatch(setLoading(true));
    dispatch(setRequiredUnderstand({ status: false }));
    
    const rqRequestData = {
      domain,
      company_id: companyId,
      iswait: true,
    };

    const rqData = (await eventServiceAPI.service(
      EVS_ENDPOINT.GET_RQS,
      API_METHOD.POST,
      rqRequestData
    )) as EvsResponse | null;

    if (rqData) {
      if (rqData.rqs) {
        dispatch(setFetched({ bxrq: rqData.rqs }));
        return;
      }
    }
    dispatch(setFetchedStatus(true));
  }
};

export const saveBXRQ = (
  domain: string,
  companyId: number,
  currentClientType: RQ_TYPE,
  contractType: CONTRACT_LTYPE,
  supplyType: SupplyTypesType,
) => async (dispatch: AppThunkDispatch, getState: AppThunkGetState) => {
  const state = getState();

  const rqsState = state.bxrq as BXRQState;

  const rqCreatingBase = rqsState.creating.base;
  const resolvedType = getResolvedType(currentClientType) as ResolvedRQType;

  dispatch(setCreatingLoadingStatus(true));
  dispatch(setRequiredUnderstand({ status: false }));

  if (rqsState && rqsState.rqs && rqCreatingBase) {
    const fields = filterFieldItems(
      rqCreatingBase.fields,
      currentClientType,
      contractType,
      supplyType,
    );
    
    const entityTypeId = getEntityTypeId(currentClientType);
    const data = {
      domain,
      company_id: companyId,
      preset_id: entityTypeId,
      bx_id: rqCreatingBase.bx_id,  // -1 если новый
      rq: {
        fields,
      },
      iswait: true
    };

    const result = await eventServiceAPI.service(
      EVS_ENDPOINT.STORE_RQ, 
      API_METHOD.POST, 
      data
    ) as RQStore | null;

    let rq_id = rqCreatingBase.bx_id;
    if (result && result.data.bx_id) {
      rq_id = result.data.bx_id;
    }

    const currentItem = {
      ...rqsState.current.item,
      bx_id: rq_id,
      fields: fields
    };
    
    const currentItems = rqsState.current.items.map((item: EvsRqItem) => {
      if (item.bx_id == -1 || item.bx_id == rq_id) {
        return { ...item, bx_id: rq_id, fields: fields };
      }
      return item;
    });

    const updatedState = {
      ...rqsState,
      creating: {
        ...rqsState.creating,
        base: null,
      },
      current: {
        ...rqsState.current,
        item: currentItem,
        items: currentItems
      },
      rqs: {
        ...rqsState.rqs,
        [resolvedType]: {
          ...rqsState.rqs[resolvedType],
          items: currentItems,
        },
      }
    } as BXRQState;

    dispatch(setCreatingLoadingStatus(false));
    dispatch(saveBaseCreating({ updatedState }));
  }
};

export const saveAddress = (
  currentClientType: RQ_TYPE,
  typeId: BX_ADDRESS_TYPE,
) => async (dispatch: AppThunkDispatch, getState: AppThunkGetState) => {
  const state = getState();
  const domain = state.app.domain;
  const companyId = state.app.company;
  // const clientTypestate = state.documentClientType as ClientTypeState;
  // const currentClientTypeItem = clientTypestate.current;
  const rqsState = state.bxrq as BXRQState;

  const resolvedType = getResolvedType(currentClientType) as ResolvedRQType;

  dispatch(setRequiredUnderstand({ status: false }));

  const addressCreating = rqsState.creating.address as AddressRqItem;
  const rq = rqsState.current.item;

  if (rqsState && rqsState.rqs && addressCreating && rq) {
    const rq_id = rq.bx_id;
    const data = {
      domain,
      company_id: companyId,
      bx_id: rq_id,
      address: addressCreating,
      iswait: true
    };
    
    dispatch(setCreatingLoadingStatus(true));

    const result = await eventServiceAPI.service(
      EVS_ENDPOINT.STORE_RQ, 
      API_METHOD.POST, 
      data
    ) as RQStore | null;

    let address_id = addressCreating.id;
    if (result && result.data.id) {
      address_id = result.data.id;
    }

    const updatedAddress = {
      ...addressCreating,
      id: address_id
    };

    // Обновляем адреса в текущем элементе
    const updatedCurrentItem = {
      ...rq,
      address: {
        ...rq.address,
        items: rq.address.items.map((ad: AddressRqItem) => {
          if (ad.type_id === typeId) {
            return updatedAddress;
          }
          return ad;
        })
      }
    };

    // Обновляем элементы в current.items
    const updatedCurrentItems = rqsState.current.items.map((rqItem: EvsRqItem) => {
      if (rqItem.bx_id === rq.bx_id) {
        return updatedCurrentItem;
      }
      return rqItem;
    });

    // Обновляем rqs
    const updatedRqs = {
      ...rqsState.rqs,
      [resolvedType]: {
        ...rqsState.rqs[resolvedType],
        items: updatedCurrentItems,
      },
    };

    const updatedState = {
      ...rqsState,
      creating: {
        ...rqsState.creating,
        address: null,
      },
      current: {
        ...rqsState.current,
        item: updatedCurrentItem,
        items: updatedCurrentItems
      },
      rqs: updatedRqs
    } as BXRQState;

    dispatch(setCreatingLoadingStatus(false));
    dispatch(saveAddressCreating({ typeId, clientType: currentClientType }));
  }
};

export const saveBank = (
  domain: string,
  companyId: number,
  bankId: number,
) => async (dispatch: AppThunkDispatch, getState: AppThunkGetState) => {
  const state = getState();
  // const domain = state.app.domain;
  // const companyId = state.app.company;
  const rqsState = state.bxrq as BXRQState;

  dispatch(setRequiredUnderstand({ status: false }));

  const bankCreating = rqsState.creating.bank;
  const rq = rqsState.current.item;

  if (rqsState && rqsState.rqs && bankCreating && rq) {
    const rq_id = rq.bx_id;
    const data = {
      domain,
      company_id: companyId,
      bx_id: rq_id,
      bank: bankCreating,
      iswait: true
    };

    dispatch(setCreatingLoadingStatus(true));

    const result = await eventServiceAPI.service(
      EVS_ENDPOINT.STORE_RQ, 
      API_METHOD.POST, 
      data
    ) as RQStore | null;

    let newBankId = bankCreating.id;
    if (result && result.data.id) {
      newBankId = result.data.id;
    }

    const updatedBank = {
      ...bankCreating,
      id: newBankId
    };

    // Обновляем банк в текущем элементе
    const updatedCurrentItem = {
      ...rq,
      bank: {
        ...rq.bank,
        items: [updatedBank],
        current: updatedBank
      }
    };

    // Обновляем элементы в current.items
    const updatedCurrentItems = rqsState.current.items.map((rqItem: EvsRqItem) => {
      if (rqItem.bx_id === rq.bx_id) {
        return updatedCurrentItem;
      }
      return rqItem;
    });

    const updatedState = {
      ...rqsState,
      creating: {
        ...rqsState.creating,
        bank: null,
      },
      current: {
        ...rqsState.current,
        item: updatedCurrentItem,
        items: updatedCurrentItems
      },
      rqs: {
        ...rqsState.rqs,
        [getResolvedType(RQ_TYPE.ORGANIZATION) as ResolvedRQType]: {
          ...rqsState.rqs[getResolvedType(RQ_TYPE.ORGANIZATION) as ResolvedRQType],
          items: updatedCurrentItems,
        },
      }
    } as BXRQState;

    dispatch(setCreatingLoadingStatus(false));
    dispatch(saveBankCreating({ bankId: newBankId, clientType: RQ_TYPE.ORGANIZATION }));
  }
};

export const setBasePropThunk = (
  code: string,
  value: string
) => async (dispatch: AppThunkDispatch, getState: AppThunkGetState) => {
  dispatch(setBasePropAction({ code, value }));
};

export const blurCase = (
  code: string,
  value: string
) => async (dispatch: AppThunkDispatch, getState: AppThunkGetState) => {
  // Здесь можно добавить дополнительную логику для blur события
  dispatch(setBasePropAction({ code, value }));
};

