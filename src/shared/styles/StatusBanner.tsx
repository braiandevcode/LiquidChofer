import type { ReactNode } from 'react'

type TStatusBannerVariant = 'error' | 'warning' | 'info' | 'success'

interface IStatusBannerProps {
  variant: TStatusBannerVariant
  icon?: ReactNode
  children: ReactNode
  className?: string
}

const VARIANT_CLASSES: Record<TStatusBannerVariant, string> = {
  error: 'bg-accent-red/10 border-accent-red/20',
  warning: 'bg-accent-amber/10 border-accent-amber/20',
  info: 'bg-accent-violet/10 border-accent-violet/20',
  success: 'bg-accent-teal/10 border-accent-teal/20',
}

const ICON_CLASSES: Record<TStatusBannerVariant, string> = {
  error: 'text-accent-red',
  warning: 'text-accent-amber',
  info: 'text-accent-violet',
  success: 'text-accent-teal',
}

// ICONO Y TEXTO CENTRADOS: EL TAMANO DEL SVG SE FIJA AQUI, NO EN CADA LLAMADA.
const StatusBanner = ({ variant, icon, children, className = '' }: IStatusBannerProps): ReactNode => (
  <div
    role={variant === 'error' ? 'alert' : 'status'}
    className={`flex items-center gap-2.5 rounded-xl border p-3 ${VARIANT_CLASSES[variant]} ${className}`}
  >
    {icon && (
      <div className={`flex h-5 w-5 shrink-0 items-center justify-center [&_svg]:h-4 [&_svg]:w-4 ${ICON_CLASSES[variant]}`}>
        {icon}
      </div>
    )}
    <span className="text-sm leading-snug text-text-primary">{children}</span>
  </div>
)

export default StatusBanner
