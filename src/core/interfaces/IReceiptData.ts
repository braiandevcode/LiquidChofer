// DATOS NORMALIZADOS PARA RENDERIZAR UN RECIBO.

import type { TCarOwner } from "../types/TCarOwner"
import type { IVoucherDetail } from "./IVoucherDetail"

// LO ALIMENTA LA VISTA PREVIA (CALCULADORA) O UNA JORNADA GUARDADA (BACKEND).
export interface IReceiptData {
  total: number
  adjustedTotal: number
  agencyPercent: number
  agencyAmount: number
  fixedFeeTotal: number
  otherTotal: number
  finalAgency: number
  driverPercent: number
  driverAmount: number
  carRented: boolean
  carPercent: number | null
  carAmount: number | null
  carOwner: TCarOwner
  gas: number
  petrol: number
  vouchers: IVoucherDetail[]
  subtitle?: string
  fuelFromAgency: number,
  fuelFromDriver: number,
  generatedAt?: string
  verificationCode?: string
}
