// import { AddressRqItem, BankRqItem, EVSBXRQ, EvsRqItem, ResolvedRQType } from "../type/evs-rq-type";
// import { getResolvedType } from "../lib/rq-util";
// import { addressMap } from "../type/evs-address-type";
// import { filterFieldItems } from "../lib/field-items-util";
// import { BXRQAC } from "./bx-rq-actions";
// import { RQ_TYPE } from "../type/input-type";

// //TYPES
// export type BXRQState = typeof initialState;
// type BXRQActions = InferActionsTypes<typeof BXRQAC>;

// const initialState = {
//   rqs: null as null | EVSBXRQ,
//   current: {
//     items: [] as EvsRqItem[],
//     item: null as EvsRqItem | null,


//   },
//   creating: {
//     base: null as EvsRqItem | null,
//     address: null as AddressRqItem | null,
//     bank: null as BankRqItem | null,
//   },
//   errors: null as null | { [key: string]: string },
//   push: {
//     reqired: [] as string[],
//     isUnderstanding: false,
//   },
//   isFetched: false,
//   isLoading: false,
//   isCreatingLoading: false,
// };


// const bxrq = (state: BXRQState = initialState, action: BXRQActions) => {
//   switch (action.type) {
//     case "bxrq/SET_FETCHED":
//       return {
//         ...state,
//         rqs: {
//           ...state.rqs,
//           [RQ_TYPE.ORGANIZATION]: action.bxrq?.[RQ_TYPE.ORGANIZATION],
//           [RQ_TYPE.IP]: action.bxrq[RQ_TYPE.IP],
//           [RQ_TYPE.FIZ]: action.bxrq[RQ_TYPE.FIZ],
//           current: action.bxrq.current,

//         },
//         isLoading: false,
//         isFetched: true,
//       };
//     case "bxrq/SET_FETCHED_STATUS":
//       return {
//         ...state,
//         isLoading: false,
//         isFetched: action.status,
//       };
//     case "bxrq/SET_LOADING_STATUS":
//       return {
//         ...state,
//         isLoading: true,

//       };
//     case "bxrq/SET_CREATING_LOADING_STATUS":
//       return {
//         ...state,
//         isCreatingLoading: action.status,
//       };


//     case "bxrq/SET_CURRENT_RQ_ITEMS":
//       if (state.rqs) {
//         const resolvedType = getResolvedType(action.clientType);

//         const isDefault = !state.rqs[resolvedType].items || !state.rqs[resolvedType].items.length || state.rqs[resolvedType].items[0].bx_id == -1
//         const items: EvsRqItem[] = !isDefault
//           ? state.rqs[resolvedType].items
//           : [state.rqs[resolvedType].default]


//         let item: EvsRqItem = state.rqs[resolvedType].default

//         if (items.length) {
//           item = items[0]
//         }

//         if (isDefault) {
//           item.bank
//         }

//         return {
//           ...state,
//           current: {
//             ...state.current,
//             items,
//             item
//           }

//         };
//       }
//       return {
//         ...state,

//       };

//     case "bxrq/SAVE_CURRENT_RQ_ITEMS":
//       if (state.rqs) {
//         const resolvedType = getResolvedType(action.clientType) as ResolvedRQType;

//         return {
//           ...state,
//           rqs: {
//             ...state.rqs,
//             [resolvedType]: {
//               ...state.rqs[resolvedType],
//               items: {
//                 ...state.current.items
//               }

//             }

//           }

//         };
//       }
//       return {
//         ...state,

//       };



//     case "bxrq/SET_CURRENT_ITEM":

//       const searchingCurrent = state.current.items.find(item => item.bx_id === action.rq_id) || state.current.item


//       return {
//         ...state,
//         current: {
//           ...state.current,
//           item: {
//             ...searchingCurrent
//           }
//         }

//       };



//     case "bxrq/INIT_BASE_CREATING":
//       const base = { ...state.current.item }

//       base.fields = base.fields ? filterFieldItems(
//         base.fields,
//         action.currentClientType,
//         action.contractType,
//         action.supplyType,

//       ) : base.fields

//       return {
//         ...state,
//         creating: {
//           ...state.creating,
//           base
//         }
//       }
//     case "bxrq/SAVE_BASE_CREATING":
   

//       return {
//         ...state,
//         ...action.updatedState

//       }
//     case "bxrq/CANCEL_BASE_CREATING":

//       return {
//         ...state,
//         creating: {
//           ...state.creating,
//           base: null
//         }
//       }
//     case "bxrq/INIT_ADDRESS_CREATING":

//       const searchingRq = state.current.item as EvsRqItem
//       const searchingCreating = searchingRq.address.items.find(address =>
//         address.type_id === action.typeId
//       )

//       if (!searchingCreating) {
//         return state
//       }

//       return {
//         ...state,
//         creating: {
//           ...state.creating,
//           address: { ...searchingCreating }

//         }
//       }
//     case "bxrq/INIT_COPY_ADDRESS_CREATING":
//       const copySearchingRq = state.current.item as EvsRqItem

//       const copySearchingCreating = copySearchingRq.address.items.find(address =>
//         address.type_id !== action.typeId
//       )

//       if (!copySearchingCreating) {
//         return state
//       }

//       return {
//         ...state,
//         creating: {
//           ...state.creating,
//           address: {
//             ...copySearchingCreating,
//             type_id: action.typeId,
//             name_type: addressMap[action.typeId].name_type,
//           }

//         }
//       }
//     case "bxrq/SAVE_ADDRESS_CREATING":

//       const saCreating = { ...state.creating }
//       const saCretingItem = { ...saCreating.address }
//       const currentRQ = { ...state.current.item } as EvsRqItem

//       if (!currentRQ) {
//         return state
//       }

//       currentRQ.address = { ...currentRQ.address }

//       const currentAdresses = currentRQ.address.items.map(ad => {
//         if (ad.type_id === action.typeId) {

//           return saCretingItem
//         } else {

//           return ad
//         }
//       }) as AddressRqItem[]

//       currentRQ.address.items = currentAdresses
//       const currentItems = state.current.items.map((rq: EvsRqItem) => {

//         if (rq.bx_id === currentRQ.bx_id) {

//           return currentRQ
//         }
//         return rq
//       })
//       const resolvedType = getResolvedType(action.clientType) as ResolvedRQType;
//       if (state.rqs) {
//         return {
//           ...state,
//           rqs: {
//             ...state.rqs,
//             [resolvedType]: {
//               ...state.rqs[resolvedType],
//               items: currentItems,
//             }

//           },
//           current: {
//             ...state.current,
//             item: currentRQ,
//             items: currentItems,

//           },
//           creating: {
//             ...state.creating,
//             address: null,

//           },

//         }
//       }
//       return state
//     case "bxrq/CANCEL_ADDRESS_CREATING":

//       return {
//         ...state,
//         creating: {
//           ...state.creating,
//           address: null
//         }
//       }

//     case "bxrq/INIT_BANK_CREATING":
//       let currentBank = state.current.item?.bank.items[0] //.find(b => b.id == action.bankId)
//       if (!currentBank) {
//         currentBank = state.current.item?.bank.current
//       }
//       if (!currentBank) {
//         return state
//       }

//       return {
//         ...state,
//         creating: {
//           ...state.creating,
//           bank: {
//             ...currentBank
//           }
//         }
//       }
//     case "bxrq/SAVE_BANK_CREATING":
//       if (state.creating.bank) {

//         const updatedBank: BankRqItem = {
//           ...state.creating.bank,
//           id: action.bankId

//         }

//         if (state.current.item) {

//           const fromBankCurrentRq = {
//             ...state.current.item,
//             bank: {
//               ...state.current.item.bank,
//               items: [updatedBank],
//               current: updatedBank,
//               fields: updatedBank.fields

//             }
//           }
//           const currentItems = state.current.items.map((rq: EvsRqItem) => {

//             if (rq.bx_id === fromBankCurrentRq.bx_id) {

//               return fromBankCurrentRq
//             }
//             return rq
//           })

//           const resolvedType = getResolvedType(action.clientType) as ResolvedRQType;
//           if (state.rqs) {
//             return {
//               ...state,
//               rqs: {
//                 ...state.rqs,
//                 [resolvedType]: {
//                   ...state.rqs[resolvedType],
//                   items: currentItems,


//                 }

//               },
//               current: {
//                 ...state.current,
//                 items: currentItems,
//                 item: fromBankCurrentRq
//               },
//               creating: {
//                 ...state.creating,
//                 bank: null,
//               }
//             }
//           }
//           return state

//         }
//       }
//       return state
//     case "bxrq/CANCEL_BANK_CREATING":
//       return {
//         ...state,
//         creating: {
//           ...state.creating,
//           bank: null,
//         }

//       }

//     case "bxrq/SET_BASE_PROP":
//       const creating = { ...state.creating }
//       const currentItem = { ...creating.base }


//       currentItem.fields = state.creating.base?.fields.map(f => {
//         if (f.type !== "select") {
//           if (f.code === action.code) {

//             return {
//               ...f,
//               value: action.value
//             }
//           }
//         }
//         return f
//       })

//       return {
//         ...state,
//         creating: {
//           ...state.creating,
//           base: currentItem,
//         }
//       };
//     case "bxrq/SET_ADDRESS_PROP":
//       const aCurrent = { ...state.creating }
//       const aCurrentItem = { ...aCurrent.address }

//       if (aCurrentItem && aCurrentItem.fields) {

//         const addressFields = aCurrentItem.fields.map(f => {

//           if (f.code === action.code) {

//             return {
//               ...f,
//               value: action.value
//             }
//           }
//           return f
//         })

//         return {
//           ...state,
//           creating: {
//             ...state.creating,
//             address: {
//               ...state.creating.address,
//               fields: addressFields,

//             },
//           }
//         };
//       }
//       return state
//     case "bxrq/SET_BANK_PROP":
//       const bCurrent = { ...state.creating }
//       const bCurrentItem = { ...bCurrent.bank }

//       if (bCurrentItem) {
//         const bank = bCurrentItem as BankRqItem
//         const fields = bank.fields.map(f => {
//           if (f.type !== "select") {
//             if (f.code === action.code) {
//               return {
//                 ...f,
//                 value: action.value
//               }
//             }
//           }
//           return f
//         })
//         bank.fields = fields
//         return {
//           ...state,
//           creating: {
//             ...state.creating,
//             bank
//           }
//         };
//       }




//       return state;

//     case "bxrq/SET_ERROR":
//       return {
//         ...state,
//         errors: {
//           ...state.errors,
//           [action.code]: action.value
//         }
//       }
//     case "bxrq/CLEAN_ERROR":
//       const { [action.code]: _, ...restErrors } = state.errors || {}; // Удаляем ключ action.errorKey
//       return {
//         ...state,
//         errors: restErrors, // Обновленный объект ошибок
//       };
//     case "bxrq/CLEAN_ERRORS":
//       return {
//         ...state,
//         errors: null
//       }

//     case "bxrq/SET_REQUIRED":
//       return {
//         ...state,

//         push: {
//           ...state.push,
//           reqired: action.errors,
//           isUnderstanding: action.errors.length < 1
//         }
//       }

//     case "bxrq/SET_REQUIRED_UNDERSTAND":
//       return {
//         ...state,

//         push: {
//           ...state.push,
//           reqired: [],
//           isUnderstanding: action.status
//         }
//       }
//     default:
//       return state;
//   }
// };

// export default bxrq;
