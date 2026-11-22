import { useState, useEffect, type ReactNode } from 'react'
import { HelpCircle, ArrowLeft } from 'lucide-react'
import { Link } from 'react-router-dom'
import { SPONSORS } from '../../core/config/sponsor.config'
import SponsorBanner from '../../shared/components/SponsorBanner'
import faqCategories from '../../core/config/FAQPage.config'
import Accordion from '../../shared/ui/Accordion'
import BackToTopButton from '../../shared/ui/BackToTopButton'

const FAQPage = (): ReactNode => {
  const [showSponsor, setShowSponsor] = useState(false)

  const SHOW_SPONSOR_WITH_TRANSITION = (): (() => void) => {
    const timerId: number = window.setTimeout(() => setShowSponsor(true), 0)
    return () => window.clearTimeout(timerId)
  }
  useEffect(SHOW_SPONSOR_WITH_TRANSITION, [])

  return (
    <div className="min-safe">
      {/* Única instancia del patrocinador: sticky en móvil, fija a la izquierda en desktop */}
      <div className="sticky top-17 z-20 bg-bg-deep xl:fixed xl:left-4 xl:top-1/2 xl:z-10 xl:w-48 xl:-translate-y-1/2 2xl:w-60">
        <div
          className={`mx-auto max-w-3xl px-4 pt-2 transition-opacity duration-700 ease-out md:px-6 xl:mx-0 xl:px-0 xl:pt-0 ${showSponsor ? 'opacity-100' : 'opacity-0'}`}
        >
          <SponsorBanner
            imageUrl={SPONSORS[0].imageUrl}
            linkUrl={SPONSORS[0].linkUrl}
            alt={SPONSORS[0].alt}
            dismissible
          />
        </div>
      </div>

      <div className="mx-auto max-w-3xl px-4 py-8 md:px-6 md:py-10">
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-sm text-text-secondary hover:text-accent-teal transition-colors cursor-pointer mb-6 group"
        >
          <ArrowLeft className="h-4 w-4 group-hover:-translate-x-0.5 transition-transform" aria-hidden="true" />
          Volver al inicio
        </Link>

        <div className="flex flex-col items-center text-center mb-8 animate-fade-in-up">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-accent-teal/15 border border-accent-teal/20 mb-4">
            <HelpCircle className="h-7 w-7 text-accent-teal" aria-hidden="true" />
          </div>
          <h1 className="text-3xl md:text-4xl font-black text-text-primary font-display tracking-tight mb-2">
            Preguntas Frecuentes
          </h1>
          <p className="text-base text-text-secondary max-w-md">
            Todo lo que necesitás saber sobre LiquidChofer. Si no encontrás tu respuesta,
            no dudes en contactarnos.
          </p>
        </div>

        <nav
          id="faq-indice"
          aria-label="Índice de preguntas frecuentes"
          className="card-glass rounded-xl p-4 md:p-5 mb-8 scroll-mt-24 animate-fade-in-up stagger-1"
        >
          <p className="font-display text-sm font-bold text-text-primary mb-3">Saltar a…</p>
          <ul className="grid grid-cols-1 gap-x-4 gap-y-2 sm:grid-cols-2">
            {faqCategories.map((category) => (
              <li key={category.id}>
                <a
                  href={`#faq-${category.id}`}
                  className="inline-flex min-h-11 items-center rounded-md text-sm font-medium text-accent-teal underline decoration-accent-teal/40 underline-offset-4 transition-colors hover:text-accent-teal-soft hover:decoration-accent-teal focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-teal/50"
                >
                  {category.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>

        <div className="animate-fade-in-up stagger-1">
          {faqCategories.map((category, categoryIndex) => (
            <section
              key={category.id}
              id={`faq-${category.id}`}
              aria-labelledby={`faq-title-${category.id}`}
              className="mt-8 scroll-mt-24 first:mt-0"
            >
              <h2
                id={`faq-title-${category.id}`}
                className="mb-3 font-display text-xl font-black tracking-tight text-text-primary"
              >
                {category.label}
              </h2>
              <Accordion items={category.items} defaultOpenIndex={categoryIndex === 0 ? 0 : -1} />
            </section>
          ))}
        </div>

        <div className="mt-10 p-6 card-glass rounded-2xl text-center animate-fade-in-up stagger-2">
          <p className="text-text-secondary text-sm mb-4">
            ¿Tenés otra pregunta?
          </p>
          <p className="text-text-primary font-semibold font-display">
            Estamos acá para ayudarte
          </p>
        </div>
      </div>
      <BackToTopButton />
    </div>
  )
}

export default FAQPage;
