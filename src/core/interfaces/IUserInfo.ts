export interface IUserInfo {
  uid: string
  email: string | null
  displayName: string | null
  photoURL: string | null
  hasPassword?: boolean
}