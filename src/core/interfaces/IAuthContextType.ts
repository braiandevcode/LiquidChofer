import type { IUserInfo } from "./IUserInfo"

export interface IAuthContextType {
  user: IUserInfo | null
  authReady: boolean
  updateName: (displayName: string) => Promise<void>
  signInEmail: (email: string, password: string) => Promise<void>
  signUpEmail: (email: string, password: string) => Promise<void>
  signInGoogle: () => Promise<void>
  pendingGoogleEmail: string | null
  completeGoogleLink: (password: string) => Promise<void>
  cancelGoogleLink: () => void
  signOut: () => Promise<void>
}