import { useCallback, type ReactNode, type ChangeEvent } from 'react'
import useCalculatorContext from '../../../core/context/useCalculatorContext'
import Input from '../../../shared/ui/Input'

const IncomeSection = (): ReactNode => {
  const MAX_TOTAL: number = 999_999_999
  const { state, dispatch } = useCalculatorContext()

  const handleTotalChange = useCallback((e: ChangeEvent<HTMLInputElement>): void => {
    const raw = e.target.value.replace(/\D/g, '').slice(0, 9)
    dispatch({ type: 'SET_TOTAL', payload: Math.min(Number(raw), MAX_TOTAL) })
  }, [dispatch])

  return (
    <Input
      label="Total facturado"
      prefix="$"
      numeric
      placeholder="0"
      value={state.total || ''}
      onChange={handleTotalChange}
      formattedValue={state.total}
    />
  )
}

export default IncomeSection
