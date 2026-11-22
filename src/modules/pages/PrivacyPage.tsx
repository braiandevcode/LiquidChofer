import { ArrowLeft, Shield } from 'lucide-react'
import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import BackToTopButton from '../../shared/ui/BackToTopButton'

const PRIVACY_SECTIONS = [
  { id: 'privacidad-1', label: 'Tu privacidad es importante' },
  { id: 'privacidad-2', label: '¿Qué información guardamos?' },
  { id: 'privacidad-3', label: '¿Para qué usamos la información?' },
  { id: 'privacidad-4', label: '¿Dónde y cómo se guarda tu información?' },
  { id: 'privacidad-5', label: '¿Cuánto tiempo la conservamos?' },
  { id: 'privacidad-6', label: '¿Compartimos tus datos con alguien?' },
  { id: 'privacidad-7', label: 'Medición de visitas' },
  { id: 'privacidad-8', label: 'Tus derechos y controles' },
  { id: 'privacidad-9', label: 'Seguridad' },
  { id: 'privacidad-10', label: 'Menores de edad' },
  { id: 'privacidad-11', label: 'Cambios en esta política' },
  { id: 'privacidad-12', label: 'Contacto' },
]

const PrivacyPage = (): ReactNode => {
  const CURRENT_YEAR: number = new Date().getFullYear()
  return (
    <div className="min-safe">
      <div className="mx-auto max-w-3xl px-4 py-8 md:px-6 md:py-10">
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-sm text-text-secondary hover:text-accent-teal transition-colors cursor-pointer mb-6 group"
        >
          <ArrowLeft className="h-4 w-4 group-hover:-translate-x-0.5 transition-transform" aria-hidden="true" />
          Volver al inicio
        </Link>

        <div id="privacidad-inicio" className="flex flex-col gap-2 mb-8 animate-fade-in-up scroll-mt-24">
          <div className="flex items-center gap-3 mb-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent-teal/15 border border-accent-teal/20">
              <Shield className="h-5 w-5 text-accent-teal" aria-hidden="true" />
            </div>
            <h1 className="text-3xl md:text-4xl font-black text-text-primary font-display tracking-tight">
              Política de Privacidad
            </h1>
          </div>
          <p className="text-sm text-text-muted">
            Última actualización: {new Date().toLocaleDateString('es-AR')}
          </p>
        </div>

        <nav aria-label="Índice de la política de privacidad" className="card-glass rounded-xl p-4 md:p-5 mb-8 animate-fade-in-up">
          <p className="font-display text-sm font-bold text-text-primary mb-3">Saltar a…</p>
          <ul className="grid grid-cols-1 gap-x-4 gap-y-2 sm:grid-cols-2">
            {PRIVACY_SECTIONS.map((section) => (
              <li key={section.id}>
                <a
                  href={`#${section.id}`}
                  className="inline-flex min-h-11 items-center rounded-md text-sm font-medium text-accent-teal underline decoration-accent-teal/40 underline-offset-4 transition-colors hover:text-accent-teal-soft hover:decoration-accent-teal focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-teal/50"
                >
                  {section.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>

        <div className="space-y-8 animate-fade-in-up stagger-1">
          <section id="privacidad-1" className="card-glass rounded-xl p-6 scroll-mt-24">
            <h2 className="text-xl font-bold text-text-primary font-display mb-4">
              Tu privacidad es importante
            </h2>
            <p className="text-text-secondary leading-relaxed">
              En LiquidChofer nos tomamos en serio que tus datos estén protegidos.
              Esta página explica qué información guardamos, para qué la usamos y
              qué podés hacer con ella.
            </p>
          </section>

          <section id="privacidad-2" className="card-glass rounded-xl p-6 scroll-mt-24">
            <h2 className="text-xl font-bold text-text-primary font-display mb-4">
              ¿Qué información guardamos?
            </h2>
            <p className="text-text-secondary leading-relaxed mb-4">
              Guardamos la información que necesitás para usar la app:
            </p>
            <ul className="space-y-2 text-text-secondary pl-6 list-disc">
              <li><strong>Datos de tu cuenta:</strong> nombre, correo y, si iniciás sesión con Google, tu foto de perfil.</li>
              <li><strong>Tu jornada:</strong> total facturado, gastos de gas y nafta, vales, porcentajes, si el auto es alquilado y quién es su dueño.</li>
              <li><strong>Tu historial:</strong> las jornadas que guardaste, con su fecha, sus importes y sus vales.</li>
              <li><strong>ChófIA:</strong> los mensajes que enviás, las imágenes que adjuntás y las conversaciones que quedan guardadas.</li>
              <li><strong>Tus ajustes:</strong> porcentajes por defecto, preferencia de tema y otras opciones que elijas.</li>
            </ul>
          </section>

          <section id="privacidad-3" className="card-glass rounded-xl p-6 scroll-mt-24">
            <h2 className="text-xl font-bold text-text-primary font-display mb-4">
              ¿Para qué usamos la información?
            </h2>
            <ul className="space-y-2 text-text-secondary pl-6 list-disc">
              <li>Calcular y mostrar el resultado de tu jornada.</li>
              <li>Guardar tu borrador para que puedas continuar después.</li>
              <li>Mantener tu historial y permitirte descargar o compartir tus recibos.</li>
              <li>Hacer funcionar a ChófIA y recordar tus conversaciones.</li>
              <li>Aplicar tus preferencias y porcentajes por defecto.</li>
              <li>Proteger tu cuenta y ayudarte cuando tenés un problema.</li>
            </ul>
          </section>

          <section id="privacidad-4" className="card-glass rounded-xl p-6 scroll-mt-24">
            <h2 className="text-xl font-bold text-text-primary font-display mb-4">
              ¿Dónde y cómo se guarda tu información?
            </h2>
            <p className="text-text-secondary leading-relaxed mb-4">
              Tu información se guarda de forma segura y asociada a tu cuenta:
            </p>
            <ul className="space-y-2 text-text-secondary pl-6 list-disc">
              <li><strong>Solo vos podés verla:</strong> para acceder necesitás iniciar sesión con tu cuenta.</li>
              <li><strong>Podés continuar en otro dispositivo:</strong> si cerrás sesión o cambiás de teléfono, tu jornada y tu historial te esperan.</li>
              <li><strong>El acceso es restringido:</strong> solo el personal autorizado puede acceder a la información necesaria para operar y mantener el servicio.</li>
            </ul>
          </section>

          <section id="privacidad-5" className="card-glass rounded-xl p-6 scroll-mt-24">
            <h2 className="text-xl font-bold text-text-primary font-display mb-4">
              ¿Cuánto tiempo la conservamos?
            </h2>
            <p className="text-text-secondary leading-relaxed">
              Conservamos tu información mientras tu cuenta esté activa. Las conversaciones
              de ChófIA pueden tener una vigencia limitada y eliminarse automáticamente.
              Si eliminás tu cuenta, se elimina tu cuenta y los datos que dependen de ella.
              También podés borrar una jornada del historial cuando quieras.
            </p>
          </section>

          <section id="privacidad-6" className="card-glass rounded-xl p-6 scroll-mt-24">
            <h2 className="text-xl font-bold text-text-primary font-display mb-4">
              ¿Compartimos tus datos con alguien?
            </h2>
            <p className="text-text-secondary leading-relaxed mb-4">
              <strong>No vendemos, alquilamos ni compartimos tus datos con terceros
              para publicidad.</strong> Solo usamos los servicios necesarios para que la
              app funcione:
            </p>
            <ul className="space-y-2 text-text-secondary pl-6 list-disc">
              <li><strong>Inicio de sesión con Google:</strong> si lo elegís, Google nos comparte tu correo, nombre y foto para identificarte.</li>
              <li><strong>Servicios de alojamiento y funcionamiento:</strong> nos permiten mantener la app disponible y segura.</li>
              <li><strong>Medición de visitas:</strong> si está activa, solo se usan datos agregados, como se explica más abajo.</li>
            </ul>
          </section>

          <section id="privacidad-7" className="card-glass rounded-xl p-6 scroll-mt-24">
            <h2 className="text-xl font-bold text-text-primary font-display mb-4">
              Medición de visitas
            </h2>
            <p className="text-text-secondary leading-relaxed">
              Si el sitio tiene activada la medición de visitas, registramos datos agregados
              como páginas vistas, tipo de dispositivo y ubicación aproximada. Esa información
              nos ayuda a entender cómo se usa la app y no se cruza con tus jornadas ni con
              tu cuenta. Podés limitar esta medición desde la configuración de privacidad de
              tu navegador.
            </p>
          </section>

          <section id="privacidad-8" className="card-glass rounded-xl p-6 scroll-mt-24">
            <h2 className="text-xl font-bold text-text-primary font-display mb-4">
              Tus derechos y controles
            </h2>
            <p className="text-text-secondary leading-relaxed mb-4">
              Con tus datos podés:
            </p>
            <ul className="space-y-2 text-text-secondary pl-6 list-disc">
              <li><strong>Verlos:</strong> están disponibles en la calculadora, el historial y tus ajustes.</li>
              <li><strong>Corregirlos:</strong> podés cambiar tu nombre, tu correo y tu contraseña desde Ajustes.</li>
              <li><strong>Exportarlos:</strong> podés descargar el recibo de cada jornada en PDF.</li>
              <li><strong>Borrarlos:</strong> podés reiniciar la jornada actual, eliminar una jornada del historial o eliminar tu cuenta.</li>
              <li><strong>Cerrar sesión:</strong> podés salir de tu cuenta en cualquier momento, especialmente en dispositivos que no son tuyos.</li>
            </ul>
          </section>

          <section id="privacidad-9" className="card-glass rounded-xl p-6 scroll-mt-24">
            <h2 className="text-xl font-bold text-text-primary font-display mb-4">
              Seguridad
            </h2>
            <p className="text-text-secondary leading-relaxed">
              La conexión con la app es segura y el acceso a tu cuenta requiere tu contraseña
              o tu cuenta de Google. Recordá que la seguridad también depende de vos:
              no compartas tu contraseña y cerrá sesión en dispositivos ajenos.
            </p>
          </section>

          <section id="privacidad-10" className="card-glass rounded-xl p-6 scroll-mt-24">
            <h2 className="text-xl font-bold text-text-primary font-display mb-4">
              Menores de edad
            </h2>
            <p className="text-text-secondary leading-relaxed">
              LiquidChofer está pensada para personas mayores de edad que trabajan como
              choferes. No está dirigida a menores y no recopilamos intencionalmente
              información de menores.
            </p>
          </section>

          <section id="privacidad-11" className="card-glass rounded-xl p-6 scroll-mt-24">
            <h2 className="text-xl font-bold text-text-primary font-display mb-4">
              Cambios en esta política
            </h2>
            <p className="text-text-secondary leading-relaxed">
              Podemos actualizar esta página en el futuro. Si lo hacemos, actualizaremos
              la fecha de "última actualización" que figura al principio.
            </p>
          </section>

          <section id="privacidad-12" className="card-glass rounded-xl p-6 scroll-mt-24">
            <h2 className="text-xl font-bold text-text-primary font-display mb-4">
              Contacto
            </h2>
            <p className="text-text-secondary leading-relaxed">
              Si tenés alguna pregunta sobre cómo protegemos tus datos, podés contactarnos
              a través de nuestras redes sociales.
            </p>
          </section>

          <div className="text-center py-4">
            <p className="text-sm text-text-muted">
              © {CURRENT_YEAR} LiquidChofer. Todos los derechos reservados.
            </p>
          </div>
        </div>
      </div>
      <BackToTopButton />
    </div>
  )
}

export default PrivacyPage;
