import type { TCarOwner } from "../types/TCarOwner"
import type { IVoucherTrip } from "./IVoucherTrip"

// ESTADO DE LA CALCULADORA
export interface ICalculatorState {
  total: number
  agencyPercent: number
  driverPercent: number
  carPercent: number
  carRented: boolean
  carOwner: TCarOwner
  gas: number
  petrol: number
  vouchers: IVoucherTrip[]
  showVouchers: boolean
  calculated: boolean
}