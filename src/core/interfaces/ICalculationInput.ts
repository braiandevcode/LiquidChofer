import type { TCalculationCarOwner } from "../types/TCalculation"
import type { ICalculationVoucher } from "./ICalculationVoucher"

// Datos de entrada completos. El estado solo persiste una parte mientras se completa.
export interface ICalculationInput {
  totalInvoiced: number
  vouchers: ICalculationVoucher[]
  agencyPercentage: number
  driverPercentage: number
  vehicleRented: boolean
  vehiclePercentage?: number
  carOwner?: TCalculationCarOwner
  gas: number
  fuel: number
}