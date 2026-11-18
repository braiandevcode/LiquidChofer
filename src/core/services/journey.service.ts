import { initialState } from '../config/calculates.config'
import type { ICalculatorState } from '../interfaces/ICalculatorState'
import type { IVoucherTrip } from '../interfaces/IVoucherTrip'
import { API_FETCH } from './api'

const DRAFT_PATH: string = '/api/v1/journey-draft'

// NORMALIZO LOS VALES ANTES DE GUARDAR: SOLO LOS GUARDADOS Y SIN MODO EDICION
const NORMALIZE_VOUCHERS = (vouchers: IVoucherTrip[]): IVoucherTrip[] =>
  vouchers
    .filter((voucher) => voucher.saved)
    .map((voucher) => ({ ...voucher, editing: false }))

// CONVIERTO LA RESPUESTA DEL BACKEND A ESTADO DE CALCULADORA O NULL SI NO HAY BORRADOR
const MAP_DRAFT_TO_STATE = (data: Partial<ICalculatorState> | null): ICalculatorState | null => {
  if (!data) return null
  return {
    ...initialState,
    ...data,
    vouchers: (data.vouchers ?? []).map((voucher) => ({
      ...voucher,
      saved: true,
      editing: false,
    })),
    carOwner: data.carRented ? null : (data.carOwner ?? 'agency'),
  }
}

// CARGO EL BORRADOR DEL USUARIO DESDE EL BACKEND (LA COOKIE IDENTIFICA AL USUARIO)
export const loadUserState = async (): Promise<ICalculatorState | null> => {
  try {
    const response = await API_FETCH<{ data: Partial<ICalculatorState> | null }>(DRAFT_PATH)
    return MAP_DRAFT_TO_STATE(response.data)
  } catch (error) {
    throw new Error('No se pudo cargar tu jornada. Revisá tu conexión.', { cause: error })
  }
}

// GUARDO EL BORRADOR EN EL BACKEND
export const saveUserState = async (state: ICalculatorState): Promise<void> => {
  try {
    await API_FETCH<{ message: string }>(DRAFT_PATH, {
      method: 'PUT',
      body: JSON.stringify({
        total: state.total,
        agencyPercent: state.agencyPercent,
        driverPercent: state.driverPercent,
        carPercent: state.carPercent,
        carRented: state.carRented,
        carOwner: state.carOwner,
        gas: state.gas,
        petrol: state.petrol,
        showVouchers: state.showVouchers,
        calculated: state.calculated,
        vouchers: NORMALIZE_VOUCHERS(state.vouchers),
      }),
    })
  } catch (error) {
    throw new Error('No se pudo guardar tu jornada. Revisá tu conexión.', { cause: error })
  }
}