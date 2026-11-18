// DETALLES DE VOUCHER/VALE DE VIAJES A FABRICA U OTROS 
export interface IVoucherDetail {
  id: string
  type: 'factory' | 'other'
  name: string
  trips: number
  pricePerTrip: number
  fixedFeePerTrip: number
  subtotal: number
  fixedFeeSubtotal: number
}