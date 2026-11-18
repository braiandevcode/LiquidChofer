import type { ReactNode } from 'react'
import type { IUserAvatarProps } from '../interfaces/props/IUserAvatarProps'
import { AVATAR_PALETTE, AVATAR_SIZE_CLASSES } from '../config/config.clasessAvatar'

// HASH DETERMINISTICO PARA QUE EL COLOR DEL AVATAR SEA ESTABLE ENTRE SESIONES
const HASH_SEED = (value: string): number => {
  let hash: number = 0
  for (let i = 0; i < value.length; i++) {
    hash = (hash * 31 + value.charCodeAt(i)) % 9973
  }
  return hash
}

const UserAvatar = ({ user, size = 'md', className = '' }: IUserAvatarProps): ReactNode => {
  const INITIAL: string = (user.displayName ?? user.email ?? 'U').charAt(0).toUpperCase()
  const COLOR: string = AVATAR_PALETTE[HASH_SEED(user.uid) % AVATAR_PALETTE.length]

  return (
    <span
      aria-hidden="true"
      className={`inline-flex items-center justify-center rounded-full font-display font-bold text-white shadow-sm ${AVATAR_SIZE_CLASSES[size]} ${COLOR} ${className}`}
    >
      {INITIAL}
    </span>
  )
}

export default UserAvatar