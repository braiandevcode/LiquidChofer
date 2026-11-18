import type { ICalculatorState } from "../interfaces/ICalculatorState";

export const initialState: ICalculatorState = {
  total: 0,
  agencyPercent: 70,
  driverPercent: 30,
  carPercent: 50,
  carRented: false,
  carOwner: 'agency',
  gas: 0,
  petrol: 0,
  vouchers: [],
  showVouchers: false,
  calculated: false,
}