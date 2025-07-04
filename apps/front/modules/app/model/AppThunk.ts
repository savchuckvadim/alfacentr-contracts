import type { BXUser } from "@workspace/bx";
import { bxAPI as bx } from "@workspace/api";
import { TESTING_DOMAIN, TESTING_USER } from "../consts/app-global";
import { appActions } from "./AppSlice";
import { AppDispatch, AppGetState, AppThunk, initWSClient } from "./store";
import { WSClient } from "@workspace/ws";
import { socketThunk } from "./queue-ws-ping-test/QueueWsPingListener";
import { bitrixInit } from "../lib/bitrix-init/bitrix-init.util";
import { fetchParticipants } from "@/modules/entities/participant/model/ParticipantThunk";
import { Bitrix } from "@workspace/bitrix";


export let socket: undefined | WSClient;
export let IN_BITRIX: boolean = false
export const initial = (inBitrix: boolean = false): AppThunk =>
  async (dispatch: AppDispatch, getState: AppGetState, { getWSClient }) => {


    const state = getState();
    const app = state.app;
    const isLoading = app.isLoading
    const __IN_BITRIX__ = inBitrix
    IN_BITRIX = __IN_BITRIX__
    const bitrix = await Bitrix.start(TESTING_DOMAIN)
    console.log('bitrix', bitrix.api)
    console.log('bitrix initialized', bitrix.api.getInitializedData())
    
    if (!isLoading) {
      dispatch(
        appActions.loading({ status: true })
      )

      const domain: string = bitrix.api.getInitializedData().domain;

      const user = __IN_BITRIX__ ? ((await bx.getCurrentUser()) as BXUser) : TESTING_USER;
      console.log("user");

      console.log(user);

      const { deal, company } = await bitrixInit() || {}
      if (deal && company) {
        dispatch(fetchParticipants(deal.ID.toString()))
      }

      initWSClient(user.ID, domain); // <- здесь создаёшь сокет
      // const socket = getWSClient()
      dispatch(
        socketThunk(
          user.ID,
          domain
        )
      )





      dispatch(
        appActions.
          setAppData(
            {
              domain,
              user,


            }
          ))

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