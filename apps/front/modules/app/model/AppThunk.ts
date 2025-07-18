
import { appActions } from "./AppSlice";
import { AppDispatch, AppGetState, AppThunk, listenerMiddleware } from "./store";


import { appInit } from "../lib/app-init/app-init.util";
import { startStoreListeners } from "./listeners/start-store-listeners";




export const initial = (): AppThunk =>
  async (dispatch: AppDispatch, getState: AppGetState, { getWSClient }) => {

    const state = getState();
    const app = state.app;
    const isLoading = app.isLoading




    if (!isLoading) { 
      startStoreListeners(listenerMiddleware);

      dispatch(
        appActions.loading({ status: true })
      )
      appInit(dispatch, getState, getWSClient, () => {
        dispatch(
          appActions.loading({ status: false })
        )
      })
      // const bitrix = await Bitrix.start(TESTING_DOMAIN, TESTING_USER)
      // console.log('bitrix', bitrix.api)
      // console.log('bitrix initialized', bitrix.api.getInitializedData())
      // const { domain, user } = bitrix.api.getInitializedData();


      // console.log("user");

      // console.log(user);

      // const { deal, company, participants } = await bitrixInit() || {}

      // if (deal && company) {
      //   Promise.all([
      //     dispatch(setParticipants(participants)),
      //     dispatch(fetchProducts(deal.ID.toString()) as any),
      //     dispatch(
      //       setDealData(
      //         getDealFieldsData(deal)
      //       )
      //     )
      //     // dispatch(setFetchedProducts(rows))
      //   ])
      // }

      // initWSClient(Number(user.ID), domain); // <- здесь создаёшь сокет
      // // const socket = getWSClient()
      // dispatch(
      //   socketThunk(
      //     Number(user.ID),
      //     domain
      //   )
      // )




      // if (deal && company) {
      //   dispatch(
      //     appActions.
      //       setAppData(
      //         {
      //           domain,
      //           user,
      //           deal,
      //           company

      //         }
      //       ))
      // }

      // dispatch(
      //   appActions.loading({ status: false })
      // )
      // dispatch(departmentAPI.endpoints.getDepartment.initiate({ domain }));




    }

  };

export const reloadApp = (): AppThunk => async (dispatch: AppDispatch, getState: AppGetState, { getWSClient }) => {


  const state = getState();
  const app = state.app;
  const isReloading = app.isReloading




  if (!isReloading) {
    dispatch(
      appActions.reloading({ status: true })
    )
    appInit(dispatch, getState, getWSClient, () => {
      dispatch(
        appActions.reloading({ status: false })
      )
    })

  }
}