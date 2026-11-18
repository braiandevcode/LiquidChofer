import type { IUserInfo } from "../interfaces/IUserInfo";

export type TAuthStateListener = (user: IUserInfo | null) => void