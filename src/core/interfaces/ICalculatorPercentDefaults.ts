import type { TCarOwner } from "../types/TCarOwner"

// PORCENTAJES QUE TOMO DE LOS AJUSTES DEL USUARIO PARA ALIMENTAR LA CALCULADORA
export interface ICalculatorPercentDefaults {
  agencyPercent: number
  driverPercent: number
  carPercent: number
  carRented: boolean
  carOwner: TCarOwner
}
