import { ArrowLeft, FileText } from 'lucide-react'
import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'

const TermsPage = (): ReactNode => {
  const currentYear: number = new Date().getFullYear()
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

        <div className="flex flex-col gap-2 mb-8 animate-fade-in-up">
          <div className="flex items-center gap-3 mb-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent-amber/15 border border-accent-amber/20">
              <FileText className="h-5 w-5 text-accent-amber" aria-hidden="true" />
            </div>
            <h1 className="text-3xl md:text-4xl font-black text-text-primary font-display tracking-tight">
              Términos y Condiciones
            </h1>
          </div>
          <p className="text-sm text-text-muted">
            Última actualización: {new Date().toLocaleDateString('es-AR')}
          </p>
        </div>

        <div className="space-y-8 animate-fade-in-up stagger-1">
          <section className="card-glass rounded-xl p-6">
            <h2 className="text-xl font-bold text-text-primary font-display mb-4">
              1. Aceptación
            </h2>
            <p className="text-text-secondary leading-relaxed">
              Al usar LiquidChofer, aceptás estos términos. Si no estás de acuerdo con
              alguna parte, por favor no uses la aplicación.
            </p>
          </section>

          <section className="card-glass rounded-xl p-6">
            <h2 className="text-xl font-bold text-text-primary font-display mb-4">
              2. ¿Qué hace LiquidChofer?
            </h2>
            <p className="text-text-secondary leading-relaxed mb-4">
              LiquidChofer es una calculadora que te ayuda a hacer las cuentas de tu jornada
              de forma automática. Con ella podés:
            </p>
            <ul className="space-y-2 text-text-secondary pl-6 list-disc">
              <li>Calcular cuánto le corresponde a la agencia, a vos y al vehículo</li>
              <li>Registrar lo que gastaste en combustible</li>
              <li>Calcular viajes con vales de fábrica u otros</li>
              <li>Guardar tus jornadas y consultarlas en el historial</li>
              <li>Generar un resumen en PDF para descargar o compartir</li>
              <li>Usar ChófIA para resolver dudas sobre la app y para interpretar texto o imágenes que ayuden con el cálculo</li>
            </ul>
          </section>

          <section className="card-glass rounded-xl p-6">
            <h2 className="text-xl font-bold text-text-primary font-display mb-4">
              3. Tu cuenta
            </h2>
            <p className="text-text-secondary leading-relaxed mb-4">
              Para usar la calculadora necesitás una cuenta gratuita. Esto significa:
            </p>
            <ul className="space-y-2 text-text-secondary pl-6 list-disc">
              <li>Podés crearla con tu correo o con Google.</li>
              <li>Si te registrás con correo, vas a tener que verificar tu dirección antes de ingresar.</li>
              <li>Sos responsable de mantener tu contraseña protegida y de la actividad que ocurra en tu cuenta.</li>
              <li>No compartas tu cuenta con otras personas.</li>
              <li>Si detectás un acceso que no reconocés, cambiá tu contraseña y contactanos.</li>
            </ul>
          </section>

          <section className="card-glass rounded-xl p-6">
            <h2 className="text-xl font-bold text-text-primary font-display mb-4">
              4. Uso permitido
            </h2>
            <p className="text-text-secondary leading-relaxed mb-4">
              LiquidChofer es para uso personal. Podés usarla para hacer tus propios cálculos
              de jornada. No está permitido:
            </p>
            <ul className="space-y-2 text-text-secondary pl-6 list-disc">
              <li>Modificar, copiar o distribuir la aplicación sin autorización.</li>
              <li>Venderla o revenderla a otras personas.</li>
              <li>Usarla para fines ilegales o para perjudicar a terceros.</li>
              <li>Intentar acceder a cuentas ajenas o interferir con el funcionamiento del servicio.</li>
              <li>Automatizar el uso de ChófIA para evitar la cuota diaria.</li>
            </ul>
          </section>

          <section className="card-glass rounded-xl p-6">
            <h2 className="text-xl font-bold text-text-primary font-display mb-4">
              5. Cálculos y limitaciones
            </h2>
            <p className="text-text-secondary leading-relaxed">
              LiquidChofer está para ayudarte, pero siempre te recomendamos verificar los
              resultados antes de presentarlos a tu agencia. Si bien nos esforzamos para
              que todo sea exacto, no podemos garantizar que no haya errores. LiquidChofer
              no se responsabiliza por diferencias en los cálculos ni por decisiones que
              tomes basadas en los resultados. La app no brinda asesoramiento legal,
              contable ni financiero.
            </p>
          </section>

          <section className="card-glass rounded-xl p-6">
            <h2 className="text-xl font-bold text-text-primary font-display mb-4">
              6. Jornadas guardadas e historial
            </h2>
            <p className="text-text-secondary leading-relaxed mb-4">
              Cuando guardás una jornada, queda registrada con la fecha que elegiste.
              Tené en cuenta que:
            </p>
            <ul className="space-y-2 text-text-secondary pl-6 list-disc">
              <li>La jornada guardada no se puede editar.</li>
              <li>Podés ver su detalle, descargar el recibo o compartirlo por WhatsApp.</li>
              <li>Podés eliminar una jornada del historial cuando quieras.</li>
              <li>Si necesitás corregir una jornada, guardá una nueva con los datos correctos.</li>
            </ul>
          </section>

          <section className="card-glass rounded-xl p-6">
            <h2 className="text-xl font-bold text-text-primary font-display mb-4">
              7. ChófIA y contenido que enviás
            </h2>
            <p className="text-text-secondary leading-relaxed mb-4">
              ChófIA usa los mensajes e imágenes que le enviás para responderte dudas sobre
              la app y ayudarte con el cálculo. Al usarla, tené en cuenta que:
            </p>
            <ul className="space-y-2 text-text-secondary pl-6 list-disc">
              <li>ChófIA puede equivocarse: revisá siempre la propuesta antes de confirmarla.</li>
              <li>Sos responsable del contenido que enviás. No subas información sensible de terceros ni contenido ilegal.</li>
              <li>La conversación puede guardarse para que puedas continuarla más tarde.</li>
              <li>Podés eliminar una conversación cuando quieras.</li>
              <li>El uso de ChófIA tiene una cuota diaria.</li>
            </ul>
          </section>

          <section className="card-glass rounded-xl p-6">
            <h2 className="text-xl font-bold text-text-primary font-display mb-4">
              8. Disponibilidad y mantenimiento
            </h2>
            <p className="text-text-secondary leading-relaxed">
              Hacemos lo posible para que la app esté disponible, pero puede haber
              interrupciones por mantenimiento, actualizaciones o problemas técnicos.
              No garantizamos que el servicio esté disponible de forma ininterrumpida.
              Podemos modificar o discontinuar funciones con el tiempo.
            </p>
          </section>

          <section className="card-glass rounded-xl p-6">
            <h2 className="text-xl font-bold text-text-primary font-display mb-4">
              9. Propiedad intelectual
            </h2>
            <p className="text-text-secondary leading-relaxed">
              El nombre, el logo y el contenido de LiquidChofer pertenecen a sus titulares.
              El código de la aplicación se distribuye bajo licencia MIT. El uso de la app
              no te otorga derechos sobre la marca ni sobre el contenido más allá de lo
              necesario para usarla.
            </p>
          </section>

          <section className="card-glass rounded-xl p-6">
            <h2 className="text-xl font-bold text-text-primary font-display mb-4">
              10. Límite de responsabilidad
            </h2>
            <p className="text-text-secondary leading-relaxed">
              En la medida en que la ley lo permita, LiquidChofer no se responsabiliza por
              daños indirectos, pérdida de ganancias o diferencias con tu agencia derivadas
              del uso de la app. Nada en estos términos limita los derechos que la ley te
              reconoce como consumidor.
            </p>
          </section>

          <section className="card-glass rounded-xl p-6">
            <h2 className="text-xl font-bold text-text-primary font-display mb-4">
              11. Baja de cuenta
            </h2>
            <p className="text-text-secondary leading-relaxed">
              Podés eliminar tu cuenta desde Ajustes. La acción es irreversible: se elimina
              tu cuenta y los datos asociados. Antes de hacerlo, descargá los recibos que
              quieras conservar.
            </p>
          </section>

          <section className="card-glass rounded-xl p-6">
            <h2 className="text-xl font-bold text-text-primary font-display mb-4">
              12. Cambios
            </h2>
            <p className="text-text-secondary leading-relaxed">
              Podemos actualizar estos términos en cualquier momento. Si seguís usando
              LiquidChofer después de un cambio, significa que estás de acuerdo con las
              nuevas reglas.
            </p>
          </section>

          <section className="card-glass rounded-xl p-6">
            <h2 className="text-xl font-bold text-text-primary font-display mb-4">
              13. Ley aplicable
            </h2>
            <p className="text-text-secondary leading-relaxed">
              Estos términos se rigen por las leyes de la República Argentina. Cualquier
              controversia se someterá a los tribunales competentes de la República Argentina.
            </p>
          </section>

          <section className="card-glass rounded-xl p-6">
            <h2 className="text-xl font-bold text-text-primary font-display mb-4">
              14. Contacto
            </h2>
            <p className="text-text-secondary leading-relaxed">
              Si tenés alguna pregunta, podés contactarnos a través de nuestras redes
              sociales.
            </p>
          </section>

          <div className="text-center py-4">
            <p className="text-sm text-text-muted">
              © {currentYear} LiquidChofer. Todos los derechos reservados.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default TermsPage;
