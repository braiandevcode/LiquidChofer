export interface IToggleProps {
  label: string
  enabled: boolean
  disabled?: boolean
  onChange: (enabled: boolean) => void
}