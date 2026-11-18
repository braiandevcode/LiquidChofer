import type { TCalculationVoucherType } from "../types/TCalculation"

// Vale extraído por la IA. Todo es opcional porque el backend pide lo que falta.
export interface ICalculationVoucher {
  type?: TCalculationVoucherType
  name?: string
  trips?: number
  pricePerTrip?: number
  fixedFeePerTrip?: number
}
