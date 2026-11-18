import type { InputHTMLAttributes } from "react"

export interface IInputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label: string
  prefix?: string
  error?: string
  formattedValue?: number
  numeric?: boolean
}