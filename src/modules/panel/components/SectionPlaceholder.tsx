import type { LucideIcon } from 'lucide-react'
import type { ReactNode } from 'react'
import StatusBanner from '../../../shared/styles/StatusBanner'

interface ISectionPlaceholderProps {
  icon: LucideIcon
  title: string
  description: string
}

const SectionPlaceholder = ({ icon: Icon, title, description }: ISectionPlaceholderProps): ReactNode => (
  <section className="mx-auto max-w-2xl animate-fade-in-up">
    <div className="card-glass card-accent-top rounded-2xl px-6 py-10 md:p-12">
      <div className="flex flex-col items-center gap-3 text-center">
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-accent-violet/20 bg-accent-violet/10">
          <Icon className="h-7 w-7 text-accent-violet" aria-hidden="true" />
        </div>
        <h2 className="font-display text-xl font-black tracking-tight text-text-primary md:text-2xl">
          {title}
        </h2>
        <p className="max-w-md text-sm leading-relaxed text-text-secondary md:text-base">
          {description}
        </p>
        <div className="mt-2 w-full max-w-sm">
          <StatusBanner variant="info">Próximamente</StatusBanner>
        </div>
      </div>
    </div>
  </section>
)

export default SectionPlaceholder