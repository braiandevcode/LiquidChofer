import type { ICalculatorResult } from "../interfaces/ICalculatorResult"
import type { ICalculatorState } from "../interfaces/ICalculatorState"
import type { IVoucherDetail } from "../interfaces/IVoucherDetail"


export function calculateResult(state: ICalculatorState): ICalculatorResult {
  const { total, agencyPercent, driverPercent, carPercent, carRented, carOwner, gas, petrol, vouchers, showVouchers } = state
  const effectiveVouchers = showVouchers ? vouchers.filter((v) => v.saved && !v.editing) : []


  // MAPEO LOS VOUCHERS EFECTIVOS A DETALLES DE VOUCHER PARA EL RESULTADO
  const voucherDetailList: IVoucherDetail[] = effectiveVouchers.map((v) => ({
    id: v.id,
    type: v.type,
    name: v.name,
    trips: v.trips,
    pricePerTrip: v.pricePerTrip,
    fixedFeePerTrip: v.type === 'factory' ? v.fixedFeePerTrip : 0,
    subtotal: v.trips * v.pricePerTrip,
    fixedFeeSubtotal: v.type === 'factory' ? v.trips * v.fixedFeePerTrip : 0,
  }))

  const ONE_HUNDRED: number = 100

  const factoryDetails: IVoucherDetail[] = voucherDetailList.filter((v) => v.type === 'factory')
  const otherDetails: IVoucherDetail[] = voucherDetailList.filter((v) => v.type === 'other')

  const factoryTotal: number = factoryDetails.reduce((sum, v) => sum + v.subtotal, 0)
  const fixedFeeTotal: number = factoryDetails.reduce((sum, v) => sum + v.fixedFeeSubtotal, 0)
  const otherTotal: number = otherDetails.reduce((sum, v) => sum + v.subtotal, 0)

  const factoryEarningsTotal: number = factoryTotal - fixedFeeTotal
  const adjustedTotal: number = total - factoryEarningsTotal

  let driverAmount: number = adjustedTotal * (driverPercent / ONE_HUNDRED)

  let agencyAmount: number
  let agencyDisplayPercent: number
  let carAmount: number | null
  let percentTotal: number

  if (carRented) {
    agencyAmount = adjustedTotal * (agencyPercent / ONE_HUNDRED)
    agencyDisplayPercent = agencyPercent
    carAmount = Math.max(0, (adjustedTotal * (carPercent / ONE_HUNDRED)) - (gas + petrol))
    percentTotal = agencyPercent + driverPercent + carPercent
  } else {
    agencyDisplayPercent = agencyPercent
    agencyAmount = adjustedTotal * (agencyDisplayPercent / ONE_HUNDRED)
    carAmount = null
    percentTotal = agencyPercent + driverPercent
  }

  const deduction: number = fixedFeeTotal + otherTotal;
  const fuelExpenses: number = gas + petrol;
  const fuelFromAgency: number = !carRented && carOwner !== 'driver' ? fuelExpenses : 0;
  const fuelFromDriver: number = !carRented && carOwner === 'driver' ? fuelExpenses : 0;

  // AJUSTO MONTO DE LA AGENCIA SI HAY DESCUENTO DE COMBUSTIBLE
  const finalAgency: number = agencyAmount - deduction - fuelFromAgency

  // AJUSTO MONTO DEL CONDUCTOR SI HAY DESCUENTO DE COMBUSTIBLE
  driverAmount -= fuelFromDriver

  const isPercentValid: boolean = percentTotal === ONE_HUNDRED

  return {
    adjustedTotal,
    agencyAmount,
    agencyDisplayPercent,
    driverAmount,
    carAmount,
    gas,
    petrol,
    voucherDetails: voucherDetailList,
    factoryTotal,
    fixedFeeTotal,
    factoryEarningsTotal,
    otherTotal,
    finalAgency,
    percentTotal,
    fuelFromAgency,
    fuelFromDriver,
    isPercentValid,
  }
}
