interface ICalculatorStep {
  slug: string
  label: string
}

export const CALCULATOR_STEPS: ICalculatorStep[] = [
  { slug: 'ingreso', label: 'Ingreso' },
  { slug: 'vales', label: 'Vales' },
  { slug: 'porcentajes', label: '%' },
  { slug: 'gastos', label: 'Gastos' },
  { slug: 'resultados', label: 'Resultados' },
]

export const CALCULATOR_BASE_PATH: string = '/panel/calculadora'
export const CALCULATOR_DEFAULT_PATH: string = `${CALCULATOR_BASE_PATH}/${CALCULATOR_STEPS[0].slug}`

export const STEP_LABELS: string[] = CALCULATOR_STEPS.map((step): string => step.label)

export const getCalculatorStepIndex = (slug: string | undefined): number =>
  CALCULATOR_STEPS.findIndex((step): boolean => step.slug === slug)

export const getCalculatorStepPath = (index: number): string =>
  `${CALCULATOR_BASE_PATH}/${CALCULATOR_STEPS[index]?.slug ?? CALCULATOR_STEPS[0].slug}`
