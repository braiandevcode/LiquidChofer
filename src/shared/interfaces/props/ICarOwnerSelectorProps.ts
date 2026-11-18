import type { TOwner } from "../../types/TOwner"

export interface ICarOwnerSelectorProps {
  value: TOwner
  onChange: (owner: TOwner) => void
  disabled?: boolean
}