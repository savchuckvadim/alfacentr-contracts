import type { BXUser } from "@workspace/bx";
import { bxAPI as bx } from "@workspace/api";
import { TESTING_DOMAIN, TESTING_USER } from "../consts/app-global";
import { appActions } from "./AppSlice";
import { AppDispatch, AppGetState, AppThunk, initWSClient } from "./store";
import { WSClient } from "@workspace/ws";
import { socketThunk } from "./queue-ws-ping-test/QueueWsPingListener";
import { bitrixInit } from "../lib/bitrix-init/bitrix-init.util";
import { Bitrix } from "@workspace/bitrix";
import { setFetchedProducts } from "@/modules/entities/product/";
import { setParticipants } from "@/modules/entities";


export let socket: undefined | WSClient;
export let IN_BITRIX: boolean = false
export const initial = (inBitrix: boolean = false): AppThunk =>
  async (dispatch: AppDispatch, getState: AppGetState, { getWSClient }) => {


    const state = getState();
    const app = state.app;
    const isLoading = app.isLoading


    const bitrix = await Bitrix.start(TESTING_DOMAIN, TESTING_USER)
    console.log('bitrix', bitrix.api)
    console.log('bitrix initialized', bitrix.api.getInitializedData())

    if (!isLoading) {
      dispatch(
        appActions.loading({ status: true })
      )

      const { domain, user } = bitrix.api.getInitializedData();


      console.log("user");

      console.log(user);

      const { deal, company, rows, participants } = await bitrixInit() || {}
      debugger
      if (deal && company) {
        Promise.all([
          dispatch(setParticipants(participants)),
          dispatch(setFetchedProducts(rows))
        ])
      }

      initWSClient(Number(user.ID), domain); // <- здесь создаёшь сокет
      // const socket = getWSClient()
      dispatch(
        socketThunk(
          Number(user.ID),
          domain
        )
      )




      if (deal && company) {
        dispatch(
          appActions.
            setAppData(
              {
                domain,
                user,
                deal,
                company

              }
            ))
      }

      dispatch(
        appActions.loading({ status: false })
      )
      // dispatch(departmentAPI.endpoints.getDepartment.initiate({ domain }));




    }

  };

export const reloadApp = () => async (dispatch: AppDispatch, getState: AppGetState) => {


  setTimeout(() => {


    dispatch(
      // initialEventApp()
      appActions.reload()
    )


  }, 1000)

}