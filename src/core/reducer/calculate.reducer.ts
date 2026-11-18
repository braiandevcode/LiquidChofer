import { initialState } from '../config/calculates.config'
import type { ICalculatorState } from '../interfaces/ICalculatorState'
import type { TAction } from '../types/TAction'

const calculatorReducer = (state: ICalculatorState, action: TAction): ICalculatorState => {
  switch (action.type) {
    case 'SET_TOTAL':
      return { ...state, total: action.payload, calculated: false }
    case 'SET_AGENCY_PERCENT':
      return { ...state, agencyPercent: action.payload, calculated: false }
    case 'SET_DRIVER_PERCENT':
      return { ...state, driverPercent: action.payload, calculated: false }
    case 'SET_CAR_PERCENT':
      return { ...state, carPercent: action.payload, calculated: false }
    case 'SET_CAR_RENTED': {
      const newValue: boolean = action.payload
      if (newValue === state.carRented) return state
      // ALQUILADO => SIN DUEÑO; NO ALQUILADO => DUEÑO PREVIO O AGENCIA
      return { ...state, carRented: newValue, carOwner: newValue ? null : (state.carOwner ?? 'agency'), calculated: false }
    }
    case 'SET_CAR_OWNER':
      // SOLO TIENE SENTIDO SI NO ESTA ALQUILADO
      return state.carRented ? state : { ...state, carOwner: action.payload ?? 'agency', calculated: false }
    case 'SET_GAS':
      return { ...state, gas: action.payload, calculated: false }
    case 'SET_PETROL':
      return { ...state, petrol: action.payload, calculated: false }
    case 'SET_SHOW_VOUCHERS':
      return {
        ...state,
        showVouchers: action.payload,
        vouchers: action.payload === false
          ? state.vouchers.filter((v) => v.saved)
          : state.vouchers,
        calculated: false,
      }
    case 'ADD_VOUCHER':
      return { ...state, vouchers: [...state.vouchers, action.payload], calculated: false }
    case 'UPDATE_VOUCHER':
      return {
        ...state,
        vouchers: state.vouchers.map((v) => (v.id === action.payload.id ? action.payload : v)),
        calculated: false,
      }
    case 'SAVE_VOUCHER':
      return {
        ...state,
        vouchers: state.vouchers.map((v) =>
          v.id === action.payload ? { ...v, saved: true, editing: false } : v
        ),
      }
    case 'REMOVE_VOUCHER':
      return { ...state, vouchers: state.vouchers.filter((v) => v.id !== action.payload), calculated: false }
    case 'CLEAR_UNSAVED_VOUCHERS': {
      const savedVouchers = state.vouchers
        .filter((v) => v.saved)
        .map((v) => ({ ...v, editing: false }))

      return {
        ...state,
        vouchers: savedVouchers,
        showVouchers: savedVouchers.length > 0,
        calculated: false,
      }
    }
    case 'CALCULATE':
      return { ...state, calculated: true }
    case 'HYDRATE_STATE':
      return { ...action.payload, calculated: false }
    case 'APPLY_PERCENT_DEFAULTS': {
      const { payload } = action
      const ALREADY_APPLIED: boolean =
        state.agencyPercent === payload.agencyPercent &&
        state.driverPercent === payload.driverPercent &&
        state.carPercent === payload.carPercent &&
        state.carRented === payload.carRented &&
        state.carOwner === payload.carOwner
      if (ALREADY_APPLIED) return state // EVITO UN LOOP DE ACTUALIZACIONES
      return { ...state, ...payload, calculated: false }
    }
    case 'RESET':
      return { ...initialState, ...(action.payload ?? {}), calculated: false }
    default:
      return state
  }
}

export default calculatorReducer;
