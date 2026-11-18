
// Resultado final calculado y persistido por el backend.
export interface ICalculationResult {
  totalInvoiced: number
  factoryVoucherInvoiced: number
  factoryVoucherFixed: number
  otherVoucherTotal: number
  profit: number
  agency: number
  driver: number
  vehicle: number | null
  fuelFromAgency: number
  fuelFromDriver: number
}