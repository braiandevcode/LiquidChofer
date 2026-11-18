import type { ICalculatorResult } from '../../../core/interfaces/ICalculatorResult'
import type { ICalculatorState } from '../../../core/interfaces/ICalculatorState'
import type { IReceiptData } from '../../../core/interfaces/IReceiptData'

// ADAPTO LA VISTA PREVIA LOCAL AL RECIBO PRESENTACIONAL.
// ESTOS VALORES SON ESTIMADOS: AL GUARDAR, EL BACKEND DEVUELVE LOS DEFINITIVOS.
export const CALCULATOR_RECEIPT_DATA = (
  state: ICalculatorState,
  result: ICalculatorResult,
): IReceiptData => ({
  total: state.total,
  adjustedTotal: result.adjustedTotal,
  agencyPercent: result.agencyDisplayPercent,
  agencyAmount: result.agencyAmount,
  fixedFeeTotal: result.fixedFeeTotal,
  otherTotal: result.otherTotal,
  finalAgency: result.finalAgency,
  driverPercent: state.driverPercent,
  driverAmount: result.driverAmount,
  carRented: state.carRented,
  carPercent: state.carPercent,
  carAmount: result.carAmount,
  carOwner: state.carOwner,
  gas: state.gas,
  petrol: state.petrol,
  fuelFromAgency: result.fuelFromAgency,
  fuelFromDriver: result.fuelFromDriver,
  vouchers: result.voucherDetails,
})
