import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type ChangeEvent,
  type ReactNode,
  type SubmitEvent,
} from 'react'
import {
  ArrowLeft,
  BadgeCheck,
  CircleExclamationPoint,
  LoaderCircle,
  Search,
  ShieldX,
} from 'lucide-react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { ApiError } from '../../core/services/api'
import { TO_USER_ERROR } from '../../core/services/apiMessages'
import { verifyJourneyCode } from '../../core/services/journeyHistory.service'
import type { IJourneyVerificationResponse } from '../../core/types/journeyHistory'
import Button from '../../shared/ui/Button'
import Input from '../../shared/ui/Input'
import VerificationDetails from './verification/VerificationDetails'

// EL LARGO VIENE DE VITE_CODE_LENGTH; 16 ES EL VALOR POR DEFECTO Y COINCIDE CON EL FORMATO DEL BACKEND.
const CONFIGURED_CODE_LENGTH: number = Number(import.meta.env.VITE_CODE_LENGTH)
const CODE_LENGTH: number =
  Number.isInteger(CONFIGURED_CODE_LENGTH) && CONFIGURED_CODE_LENGTH > 0
    ? CONFIGURED_CODE_LENGTH
    : 16
const CODE_PATTERN: RegExp = new RegExp(`^[0-9A-HJKMNP-TV-Z]{${CODE_LENGTH}}$`)
const INVALID_CODE_MESSAGE: string =
  `El código tiene ${CODE_LENGTH} caracteres. Revisalo y volvé a intentar.`
const NOT_FOUND_MESSAGE: string =
  'No encontramos una constancia con ese código. Revisá que esté completo.'

const CLEAN_CODE = (raw: string): string => raw.toUpperCase().replace(/[\s-]/g, '')

// MANTENGO SOLO CARACTERES VALIDOS Y AGRUPO DE A CUATRO PARA LEERLO MEJOR.
const FORMAT_CODE_INPUT = (raw: string): string => {
  const clean: string = raw
    .toUpperCase()
    .replace(/[^0-9A-HJKMNP-TV-Z]/g, '')
    .slice(0, CODE_LENGTH)
  return clean.match(/.{1,4}/g)?.join('-') ?? ''
}

const IS_VALID_CODE = (clean: string): boolean => CODE_PATTERN.test(clean)

type TVerificationView = 'idle' | 'loading' | 'success' | 'invalid' | 'notfound' | 'error'

const VerifyJourneyPage = (): ReactNode => {
  const { code: codeParam } = useParams<{ code?: string }>()
  const navigate = useNavigate()
  // null = EL INPUT SIGUE AL CODIGO DE LA URL; un string = EL USUARIO ESTA ESCRIBIENDO.
  const [inputDraft, setInputDraft] = useState<string | null>(null)
  const [view, setView] = useState<TVerificationView>('idle')
  const [result, setResult] = useState<IJourneyVerificationResponse | null>(null)
  const [message, setMessage] = useState<string>('')
  // IDENTIFICA LA ULTIMA CONSULTA PARA DESCARTAR RESPUESTAS VIEJAS.
  const requestIdRef = useRef<number>(0)
  // EVITA REPETIR LA CONSULTA CUANDO EL FORMULARIO ACTUALIZA LA URL.
  const lastRequestedCodeRef = useRef<string>('')

  const urlCode: string = CLEAN_CODE(codeParam ?? '')
  const urlCodeInvalid: boolean = urlCode.length > 0 && !IS_VALID_CODE(urlCode)
  const input: string = inputDraft ?? FORMAT_CODE_INPUT(codeParam ?? '')

  const RUN_VERIFICATION = useCallback(async (clean: string): Promise<void> => {
    const requestId: number = requestIdRef.current + 1
    requestIdRef.current = requestId
    lastRequestedCodeRef.current = clean
    setView('loading')
    setResult(null)
    setMessage('')

    try {
      const response: IJourneyVerificationResponse = await verifyJourneyCode(clean)
      if (requestIdRef.current !== requestId) return
      setResult(response)
      setView('success')
    } catch (error) {
      if (requestIdRef.current !== requestId) return
      setResult(null)
      if (error instanceof ApiError && error.status === 404) {
        setView('notfound')
        setMessage(NOT_FOUND_MESSAGE)
        return
      }
      setView('error')
      setMessage(TO_USER_ERROR(error, 'No se pudo verificar la constancia.'))
    }
  }, [])

  // SI LA URL YA TRAE UN CODIGO VALIDO, CONSULTO AUTOMATICAMENTE AL ABRIR LA PAGINA.
  // UN CODIGO MAL FORMADO SE INFORMA EN EL INPUT SIN LLAMAR AL BACKEND.
  useEffect(() => {
    if (!IS_VALID_CODE(urlCode)) return
    if (lastRequestedCodeRef.current === urlCode) return
    void RUN_VERIFICATION(urlCode)
  }, [urlCode, RUN_VERIFICATION])

  const HANDLE_CHANGE = (event: ChangeEvent<HTMLInputElement>): void => {
    // EDITAR EL CODIGO INVALIDA CUALQUIER CONSULTA EN CURSO.
    requestIdRef.current += 1
    lastRequestedCodeRef.current = ''
    setInputDraft(FORMAT_CODE_INPUT(event.target.value))
    setView('idle')
    setResult(null)
    setMessage('')
  }

  const HANDLE_SUBMIT = (event: SubmitEvent<HTMLFormElement>): void => {
    event.preventDefault()

    const clean: string = CLEAN_CODE(input)
    if (!IS_VALID_CODE(clean)) {
      setInputDraft(FORMAT_CODE_INPUT(clean))
      setView('invalid')
      setResult(null)
      setMessage(INVALID_CODE_MESSAGE)
      return
    }

    // AL CONFIRMAR, EL INPUT VUELVE A SEGUIR EL CODIGO DE LA URL.
    setInputDraft(null)
    void RUN_VERIFICATION(clean)
    // COMPARTO LA URL CON EL CODIGO PARA QUE SE PUEDA GUARDAR O REENVIAR.
    if (urlCode !== clean) {
      navigate(`/verificar/${clean}`, { replace: true })
    }
  }

  const HANDLE_RETRY = (): void => {
    const clean: string = CLEAN_CODE(input)
    if (IS_VALID_CODE(clean)) void RUN_VERIFICATION(clean)
  }

  const isLoading: boolean = view === 'loading'
  const canSubmit: boolean = input.length > 0 && !isLoading
  const inputError: string =
    view === 'invalid' ? message : urlCodeInvalid && inputDraft === null ? INVALID_CODE_MESSAGE : ''

  return (
    <div className="min-safe">
      <div className="mx-auto max-w-2xl px-4 py-8 md:px-6 md:py-10">
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-sm text-text-secondary hover:text-accent-teal transition-colors cursor-pointer mb-6 group"
        >
          <ArrowLeft className="h-4 w-4 group-hover:-translate-x-0.5 transition-transform" aria-hidden="true" />
          Volver al inicio
        </Link>

        <div className="flex flex-col items-center text-center mb-8 animate-fade-in-up">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-accent-teal/15 border border-accent-teal/20 mb-4">
            <BadgeCheck className="h-7 w-7 text-accent-teal" aria-hidden="true" />
          </div>
          <h1 className="text-3xl md:text-4xl font-black text-text-primary font-display tracking-tight mb-2">
            Verificar comprobante
          </h1>
          <p className="max-w-lg text-text-secondary">
            Ingresá el código que figura al pie del comprobante. La consulta es pública y no
            requiere iniciar sesión.
          </p>
        </div>

        <form
          onSubmit={HANDLE_SUBMIT}
          className="card-glass rounded-xl p-5 md:p-6 mb-6 animate-fade-in-up stagger-1"
          noValidate
        >
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
            <div className="flex-1">
              <Input
                label="Código de verificación"
                value={input}
                onChange={HANDLE_CHANGE}
                placeholder="XXXX-XXXX-XXXX-XXXX"
                autoComplete="off"
                autoCapitalize="characters"
                spellCheck={false}
                error={inputError}
              />
            </div>
            <Button
              type="submit"
              disabled={!canSubmit}
              fullWidth={false}
              className="w-full sm:mb-0.5 sm:w-auto sm:px-6"
            >
              {isLoading ? (
                <span className="inline-flex items-center gap-2">
                  <LoaderCircle className="h-4 w-4 animate-spin" aria-hidden="true" />
                  Verificando
                </span>
              ) : (
                <span className="inline-flex items-center gap-2">
                  <Search className="h-4 w-4" aria-hidden="true" />
                  Verificar
                </span>
              )}
            </Button>
          </div>
          <p id="verify-help" className="mt-2 text-xs text-text-muted">
            El código tiene el formato XXXX-XXXX-XXXX-XXXX. Podés escribirlo en minúsculas y sin
            guiones: lo normalizamos automáticamente.
          </p>
        </form>

        <div aria-live="polite" aria-busy={isLoading}>
          {isLoading && (
            <div className="card-glass rounded-xl p-8 text-center animate-fade-in-up">
              <LoaderCircle
                className="mx-auto h-8 w-8 animate-spin text-accent-teal"
                aria-hidden="true"
              />
              <p className="mt-3 text-sm text-text-secondary">Consultando la constancia…</p>
            </div>
          )}

          {!isLoading && view === 'idle' && !inputError && (
            <div className="rounded-xl border border-border-subtle bg-bg-card/60 p-5 text-sm text-text-muted animate-fade-in-up">
              <p className="flex items-start gap-2">
                <ShieldX className="mt-0.5 h-4 w-4 shrink-0 text-text-muted" aria-hidden="true" />
                La verificación compara el código con los registros de LiquidChofer e informa si la
                jornada está vigente, fue reemplazada o fue eliminada.
              </p>
            </div>
          )}

          {!isLoading && view === 'notfound' && (
            <div className="card-glass rounded-xl p-6 animate-fade-in-up">
              <div className="flex items-start gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-accent-red/10 border border-accent-red/30">
                  <ShieldX className="h-5 w-5 text-accent-red" aria-hidden="true" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-text-primary font-display">
                    Constancia no encontrada
                  </h2>
                  <p className="mt-1 text-sm text-text-secondary">{message}</p>
                </div>
              </div>
            </div>
          )}

          {!isLoading && view === 'error' && (
            <div className="card-glass rounded-xl p-6 animate-fade-in-up">
              <div className="flex items-start gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-accent-red/10 border border-accent-red/30">
                  <CircleExclamationPoint className="h-5 w-5 text-accent-red" aria-hidden="true" />
                </div>
                <div className="flex-1">
                  <h2 className="text-lg font-bold text-text-primary font-display">
                    No pudimos verificar
                  </h2>
                  <p className="mt-1 text-sm text-text-secondary">{message}</p>
                  <Button
                    type="button"
                    variant="secondary"
                    fullWidth={false}
                    className="mt-4"
                    onClick={HANDLE_RETRY}
                  >
                    Intentar de nuevo
                  </Button>
                </div>
              </div>
            </div>
          )}

          {!isLoading && view === 'success' && result && (
            <VerificationDetails result={result} />
          )}
        </div>
      </div>
    </div>
  )
}

export default VerifyJourneyPage
