import type { TCarOwner } from "./TCarOwner"

// Contrato del historial de jornadas que expone el backend (module/journeys).
export type TJourneyVoucherType = 'factory' | 'other'

// Entrada de un vale para guardar la jornada. El backend normaliza el fijo de los vales "other".
export interface IJourneyVoucherInput {
  type: TJourneyVoucherType
  name: string
  trips: number
  pricePerTrip: number
  fixedFeePerTrip: number
}

// Payload del POST /api/v1/journeys: solo datos de entrada, sin importes calculados.
export interface ICreateJourneyPayload {
  journeyDate: string // AAAA-MM-DD
  total: number
  agencyPercent: number
  driverPercent: number
  carRented: boolean
  carPercent: number | null
  carOwner: TCarOwner
  gas: number
  petrol: number
  vouchers: IJourneyVoucherInput[]
  // Solo se envia al confirmar el reemplazo de una jornada ya guardada para esa fecha.
  replaceExisting?: boolean
  // Calculo de Chofia que origino el guardado; el backend lo vincula a la jornada.
  sourceCalculationId?: string
}

// Jornada guardada con los importes que calculo y persistio el backend.
export interface IJourneyHistory {
  id: string
  journeyDate: string
  total: number
  agencyPercent: number
  driverPercent: number
  carRented: boolean
  carPercent: number | null
  gas: number
  petrol: number
  factoryTotal: number
  fixedFeeTotal: number
  otherTotal: number
  adjustedTotal: number
  agencyAmount: number
  driverAmount: number
  carAmount: number | null
  carOwner: TCarOwner
  finalAgency: number
  createdAt: string
}

// Vale persistido de una jornada guardada.
export interface IJourneyVoucher {
  id: string
  journeyId: string
  type: TJourneyVoucherType
  name: string
  trips: number
  pricePerTrip: number
  fixedFeePerTrip: number
  position: number
}

// Detalle de una jornada: incluye sus vales ordenados por posicion.
export interface IJourneyDetail extends IJourneyHistory {
  vouchers: IJourneyVoucher[]
}

// Estado del comprobante: solo una jornada vigente se puede descargar o compartir.
export type TJourneyShareStatus = 'active' | 'deleted'

// Respuesta de GET /api/v1/journeys/:id/share-status.
// `deleted` no devuelve datos: la jornada esta en papelera o ya no existe.
export type IJourneyShareStatusResponse =
  | {
      shareable: true
      status: 'active'
      // Codigo publico de auditoria, formateado XXXX-XXXX-XXXX-XXXX.
      verificationCode: string
      journey: IJourneyDetail
    }
  | {
      shareable: false
      status: 'deleted'
      verificationCode?: never
      journey?: never
    }

// Respuesta paginada de GET /api/v1/journeys.
export interface IJourneyListResponse {
  items: IJourneyHistory[]
  total: number
  limit: number
  offset: number
}

// Jornada vigente que ya ocupa la fecha que se intento guardar (payload del 409).
export interface IJourneyConflictExisting {
  id: string
  journeyDate: string
  total: number
  createdAt: string // ISO 8601 en UTC (termina en Z)
}

// Body del 409 JOURNEY_DATE_EXISTS (al guardar o al restaurar).
// `existing` falta en la rama de duplicado concurrente.
export interface IJourneyDateExistsPayload {
  statusCode: number
  code: 'JOURNEY_DATE_EXISTS'
  message: string
  existing?: IJourneyConflictExisting
}

// Conflicto de fecha que la UI usa para pedir confirmacion antes de reemplazar.
export interface IJourneySaveConflict {
  journeyDate: string
  existing: IJourneyConflictExisting | null
}

// MOTIVO DEL BORRADO LOGICO: LA ELIMINO EL USUARIO O LA REEMPLAZO OTRA JORNADA DEL MISMO DIA.
export type TJourneyDeleteReason = 'user' | 'replaced'

// Jornada en papelera: el backend devuelve solo el resumen del borrado logico,
// no los importes calculados de la jornada vigente.
// PARA EL USUARIO FINAL TODAS SE MUESTRAN COMO "ELIMINADAS", SIN DISTINGUIR EL MOTIVO INTERNO.
export interface IJourneyTrashItem {
  id: string
  journeyDate: string
  total: number
  createdAt: string
  deletedAt: string
  deleteReason: TJourneyDeleteReason | null
  replacedById: string | null
  // Fecha en que la purga automatica la borra definitivamente (deletedAt + 30 dias).
  purgeAt: string | null
}

// Respuesta paginada de GET /api/v1/journeys/trash.
export interface IJourneyTrashListResponse {
  items: IJourneyTrashItem[]
  total: number
  limit: number
  offset: number
}

// Estado publico de una constancia.
// `active` sigue vigente; `replaced` fue reemplazada por otra jornada de la misma fecha;
// `deleted` la elimino su autor. Estos dos ultimos siguen siendo auditables.
export type TJourneyVerificationStatus = 'active' | 'replaced' | 'deleted'

// Importes congelados al momento de emitir la constancia.
export interface IJourneyVerificationAmounts {
  total: number
  adjustedTotal: number
  agencyPercent: number
  agencyAmount: number
  finalAgency: number
  driverPercent: number
  driverAmount: number
  carPercent: number | null
  carAmount: number | null
}

// Respuesta de GET /api/v1/verify/:code (publica, sin sesion).
// `amounts` es null cuando la jornada ya se purgo y solo queda el tombstone de auditoria.
export interface IJourneyVerificationResponse {
  status: TJourneyVerificationStatus
  journeyDate: string
  createdAt: string
  deletedAt: string | null
  amounts: IJourneyVerificationAmounts | null
}
