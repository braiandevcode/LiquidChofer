import { createContext } from 'react'
import type { ICalculatorContextType } from '../interfaces/ICalculatorContextType'


export const CalculatorContext = createContext<ICalculatorContextType | null>(null)
