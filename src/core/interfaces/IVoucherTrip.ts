export interface IVoucherTrip {
  id: string
  type: 'factory' | 'other'
  name: string
  trips: number
  pricePerTrip: number
  fixedFeePerTrip: number
  saved: boolean
  editing: boolean
}