import type { TSendStatus } from "../types/TSendStatus";
import type { IConversationMessage } from "./IConversationMessage";

export interface IChatMessageState extends IConversationMessage {
  sendStatus?: TSendStatus
}
