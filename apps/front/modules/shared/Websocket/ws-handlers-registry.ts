// packages/ws/ws-handlers-registry.ts
import {  type AppDispatch } from '@/modules/app/model/store';
import { wsClient, WSClient } from './ws-client';


type WSHandler = (data: unknown, dispatch: AppDispatch) => void;

const handlerMap = new Map<string, WSHandler>();

export function registerWSHandler(event: string, handler: WSHandler) {
  handlerMap.set(event, handler);
}

export function initWSHandlers(dispatch: AppDispatch) {
  const ws = WSClient.getClient();

  handlerMap.forEach((handler, event) => {
    ws.on(event, (data) => handler(data, dispatch));
  });
}
