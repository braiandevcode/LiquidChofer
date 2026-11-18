import type { IVoucherDetail } from "./IVoucherDetail"

// RESULTADO DE LA CALCULADORA
export interface ICalculatorResult {
  adjustedTotal: number
  agencyAmount: number
  agencyDisplayPercent: number
  driverAmount: number
  carAmount: number | null
  gas: number
  petrol: number
  voucherDetails: IVoucherDetail[]
  factoryTotal: number
  fixedFeeTotal: number
  factoryEarningsTotal: number
  otherTotal: number
  finalAgency: number
  percentTotal: number
  fuelFromAgency: number // COMBUSTIBLE DESCONTADO A LA AGENCIA
  fuelFromDriver: number // COMBUSTIBLE DESCONTADO AL CONDUCTOR
  isPercentValid: boolean
}