import type { IUserInfo } from '../../../core/interfaces/IUserInfo'

export interface IUserAvatarProps {
  user: IUserInfo
  size?: 'sm' | 'md' | 'lg'
  className?: string
}