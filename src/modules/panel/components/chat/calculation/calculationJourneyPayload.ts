import type { ICalculationState } from '../../../../../core/interfaces/ICalculationState'
import type {
  ICreateJourneyPayload,
  IJourneyVoucherInput,
  TJourneyVoucherType,
} from '../../../../../core/types/journeyHistory'

// TRADUZCO EL TIPO DE VALE DE LA IA AL TIPO QUE ESPERA EL BACKEND DE JORNADAS.
const TO_JOURNEY_VOUCHER_TYPE = (type: 'fabrica' | 'otro' | undefined): TJourneyVoucherType =>
  type === 'fabrica' ? 'factory' : 'other'

// ARMO EL PAYLOAD DEL POST /journeys DESDE EL CALCULO QUE DEVUELVE CHOFIA.
// EL BACKEND VALIDA Y CALCULA LOS IMPORTES DEFINITIVOS; ACÁ SOLO ENVÍO ENTRADAS.
export const TO_CHAT_JOURNEY_PAYLOAD = (
  calculation: ICalculationState,
  journeyDate: string,
  replaceExisting = false,
): ICreateJourneyPayload => {
  const { input } = calculation

  const vouchers: IJourneyVoucherInput[] = (input.vouchers ?? []).map(
    (voucher): IJourneyVoucherInput => ({
      type: TO_JOURNEY_VOUCHER_TYPE(voucher.type),
      name: voucher.name ?? '',
      trips: voucher.trips ?? 0,
      pricePerTrip: voucher.pricePerTrip ?? 0,
      fixedFeePerTrip: voucher.fixedFeePerTrip ?? 0,
    }),
  )

  return {
    journeyDate,
    total: input.totalInvoiced ?? 0,
    agencyPercent: input.agencyPercentage ?? 0,
    driverPercent: input.driverPercentage ?? 0,
    carRented: input.vehicleRented ?? false,
    carPercent: input.vehicleRented ? (input.vehiclePercentage ?? null) : null,
    carOwner: input.vehicleRented ? null : (input.carOwner ?? 'agency'),
    gas: input.gas ?? 0,
    petrol: input.fuel ?? 0,
    vouchers,
    replaceExisting,
    sourceCalculationId: calculation.id,
  }
}
