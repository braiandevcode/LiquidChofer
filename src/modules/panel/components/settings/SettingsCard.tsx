import { useId, type ReactNode } from 'react'
import type { LucideIcon } from 'lucide-react'
import { cn } from '../../../../shared/lib/utils'

type TSettingsTone = 'violet' | 'green' | 'blue' | 'red'

interface ISettingsCardProps {
  icon: LucideIcon
  title: string
  description?: string
  tone?: TSettingsTone
  className?: string
  children: ReactNode
}

const TONE_CLASSES: Record<TSettingsTone, string> = {
  violet: 'border-accent-violet/20 bg-accent-violet/10 text-accent-violet',
  green: 'border-accent-green/20 bg-accent-green/10 text-accent-green',
  blue: 'border-accent-blue/20 bg-accent-blue/10 text-accent-blue',
  red: 'border-accent-red/20 bg-accent-red/10 text-accent-red',
}

const SettingsCard = ({
  icon: Icon,
  title,
  description,
  tone = 'violet',
  className = '',
  children,
}: ISettingsCardProps): ReactNode => {
  const headingId: string = useId()

  return (
    <section
      aria-labelledby={headingId}
      className={cn('card-glass rounded-2xl p-5 md:p-6', className)}
    >
      <div className="mb-4 flex items-start gap-3">
        <div
          className={cn(
            'flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border',
            TONE_CLASSES[tone],
          )}
        >
          <Icon className="h-5 w-5" aria-hidden="true" />
        </div>
        <div className="min-w-0">
          <h2
            id={headingId}
            className="font-display text-lg font-black tracking-tight text-text-primary"
          >
            {title}
          </h2>
          {description && (
            <p className="mt-0.5 text-sm leading-relaxed text-text-secondary">
              {description}
            </p>
          )}
        </div>
      </div>
      {children}
    </section>
  )
}

export default SettingsCard
