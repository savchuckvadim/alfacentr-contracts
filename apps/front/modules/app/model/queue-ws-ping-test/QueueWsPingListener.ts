import { createAsyncThunk, } from "@reduxjs/toolkit";
import { AppDispatch, AppGetState, AppThunk, RootState, ThunkExtraArgument } from "../store";
import { API_METHOD, backAPI, EBACK_ENDPOINT } from "@workspace/api";
import { WSClient as WSClientWorkspace } from "@workspace/ws";



export const wsInit = createAsyncThunk<
  {
    // socket: WSClientWorkspace,
    userId: number,
    domain: string,
    socketId: string
  } | undefined, // ReturnType
  {
    userId: number,
    domain: string
  }, // Arg
  {
    dispatch: AppDispatch
    state: RootState
    extra: ThunkExtraArgument
  }
>('ws/wsInit',
  async (payload: { userId: number, domain: string }, { dispatch, rejectWithValue, getState, extra }) => {
    const state = getState()
    try {


      const { getWSClient } = extra

      const socket = getWSClient()

      const waitForConnection = () =>
        new Promise<void>((resolve) => {
          if (socket.socket.connected) {
            resolve();
          } else {
            socket.socket.once('connect', () => {
              resolve();
            });
          }
        });

      await waitForConnection();


      const socketId = socket.id
      if (!socketId) {
        return rejectWithValue('Socket ID is not available')
      }
      // const reqData = {
      //   userId: payload.userId,
      //   domain: payload.domain,
      //   socketId
      // }

      return {
        // socket,
        userId: payload.userId,
        domain: payload.domain,
        socketId
      }
    } catch (error) {
      return rejectWithValue(error as Error)
    }
  })

// export const socketThunk = (
//   userId: number,
//   domain: string
// ): AppThunk =>
//   async (dispatch: AppDispatch, getState: AppGetState, { getWSClient }) => {
//     const socket = getWSClient()

//     const waitForConnection = () =>
//       new Promise<void>((resolve) => {
//         if (socket.socket.connected) {
//           resolve();
//         } else {
//           socket.socket.once('connect', () => {
//             resolve();
//           });
//         }
//       });

//     await waitForConnection();


//     const socketId = socket.id
//     const reqData = {
//       userId,
//       domain,
//       socketId
//     }
    // console.log('reqData')
    // console.log(reqData)
    // const response = await backAPI.service(EBACK_ENDPOINT.QUEUE_PING, API_METHOD.POST, reqData)


    // console.log('push queue ping http request')
    // console.log(response)

    // const handler = (data: unknown) => {

    //   console.log('from test queue ws')
    //   console.log(data)

    //   socket.off('queue-ping:done', handler); // отписка// отписка
    // };
    // socket.on('queue-ping:done', (data: unknown) => {
    //   console.log(socket)
    //   console.log('ответ ws по событию queue-ping:done')

    //   handler(data)
    // });

  // }

