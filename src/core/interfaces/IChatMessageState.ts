import type { TSendStatus } from "../types/TSendStatus";
import type { IConversationMessage } from "./IConversationMessage";

export interface IChatMessageState extends IConversationMessage {
  sendStatus?: TSendStatus
  // BANDERA LOCAL DE UI: SOLO LA RESPUESTA RECIEN LLEGADA SE REVELA COMO REDACCION. NO SE PERSISTE.
  animateTyping?: boolean
}
