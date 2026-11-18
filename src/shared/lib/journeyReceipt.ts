import type { IVoucherDetail } from '../../core/interfaces/IVoucherDetail'
import type { IJourneyDetail, IJourneyVoucher } from '../../core/types/journeyHistory'
import type { IReceiptData } from '../../core/interfaces/IReceiptData'
import { FORMAT_JOURNEY_DATE } from './journey'

// LOS VALES DEL BACKEND NO TRAEN SUBTOTAL: LO CALCULO SOLO PARA MOSTRAR.
export const TO_VOUCHER_DETAILS = (vouchers: IJourneyVoucher[]): IVoucherDetail[] =>
  vouchers.map((voucher) => ({
    id: voucher.id,
    type: voucher.type,
    name: voucher.name,
    trips: voucher.trips,
    pricePerTrip: voucher.pricePerTrip,
    fixedFeePerTrip: voucher.type === 'factory' ? voucher.fixedFeePerTrip : 0,
    subtotal: voucher.trips * voucher.pricePerTrip,
    fixedFeeSubtotal:
      voucher.type === 'factory' ? voucher.trips * voucher.fixedFeePerTrip : 0,
  }))

// RECIBO DE UNA JORNADA GUARDADA: USA EXCLUSIVAMENTE LOS IMPORTES DEL BACKEND.
export const JOURNEY_RECEIPT_DATA = (
  journey: IJourneyDetail,
  verificationCode?: string | null,
): IReceiptData => ({
  total: journey.total,
  adjustedTotal: journey.adjustedTotal,
  agencyPercent: journey.agencyPercent,
  agencyAmount: journey.agencyAmount,
  fixedFeeTotal: journey.fixedFeeTotal,
  otherTotal: journey.otherTotal,
  finalAgency: journey.finalAgency,
  driverPercent: journey.driverPercent,
  driverAmount: journey.driverAmount,
  carRented: journey.carRented,
  carOwner: journey.carOwner,
  carPercent: journey.carPercent,
  carAmount: journey.carAmount,
  gas: journey.gas,
  petrol: journey.petrol,
  fuelFromAgency: !journey.carRented && journey.carOwner !== 'driver' ? journey.gas + journey.petrol : 0,
  fuelFromDriver: !journey.carRented && journey.carOwner === 'driver' ? journey.gas + journey.petrol : 0,
  generatedAt: journey.createdAt,
  vouchers: TO_VOUCHER_DETAILS(journey.vouchers),
  subtitle: `Jornada del ${FORMAT_JOURNEY_DATE(journey.journeyDate)}`,
  verificationCode: verificationCode ?? undefined,
})
