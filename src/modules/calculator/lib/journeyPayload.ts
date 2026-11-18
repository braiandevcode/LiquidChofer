import type { ICalculatorState } from '../../../core/interfaces/ICalculatorState'
import type {
  ICreateJourneyPayload,
  IJourneyVoucherInput,
} from '../../../core/types/journeyHistory'

// VALES QUE REALMENTE ENTRAN EN EL CALCULO: GUARDADOS, SIN EDICION Y SOLO SI EL USUARIO LOS HABILITO.
const EFFECTIVE_VOUCHERS = (state: ICalculatorState) =>
  state.showVouchers ? state.vouchers.filter((voucher) => voucher.saved && !voucher.editing) : []

// ARMO EL PAYLOAD DEL POST /journeys CON SOLO LAS ENTRADAS.
// EL BACKEND VALIDA, CALCULA Y PERSISTE LOS IMPORTES DEFINITIVOS.
// `replaceExisting` solo se activa cuando el usuario confirma reemplazar la jornada de esa fecha.
export const TO_CREATE_JOURNEY_PAYLOAD = (
  state: ICalculatorState,
  journeyDate: string,
  replaceExisting = false,
): ICreateJourneyPayload => ({
  journeyDate,
  total: state.total,
  agencyPercent: state.agencyPercent,
  driverPercent: state.driverPercent,
  carRented: state.carRented,
  carPercent: state.carRented ? state.carPercent : null,
  carOwner: state.carRented ? null : (state.carOwner ?? 'agency'),
  gas: state.gas,
  petrol: state.petrol,
  vouchers: EFFECTIVE_VOUCHERS(state).map(
    (voucher): IJourneyVoucherInput => ({
      type: voucher.type,
      name: voucher.name,
      trips: voucher.trips,
      pricePerTrip: voucher.pricePerTrip,
      fixedFeePerTrip: voucher.fixedFeePerTrip,
    }),
  ),
  replaceExisting,
})
