export interface IPercentageInputProps {
  label: string
  value: number
  onChange: (value: number) => void
  hint?: string
  disabled?: boolean
}