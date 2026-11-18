import type { Dispatch } from "react"
import type { ICalculatorState } from "./ICalculatorState"
import type { TAction } from "../types/TAction"
import type { ICalculatorPercentDefaults } from "./ICalculatorPercentDefaults"

// DEFINO FIRMA PARA CALCULO DE REDUCER
export interface ICalculatorContextType {
  state: ICalculatorState
  dispatch: Dispatch<TAction>
  percentageDefaults: ICalculatorPercentDefaults
}