import useCalculatorContext from '../../../core/context/useCalculatorContext';
import PreCalculationView from './PreCalculationView';
import PostCalculationView from './PostCalculationView';
import type { ReactNode } from 'react';

interface ResultsSectionProps {
  onViewReceipt: () => void;
  onSaveJourney: () => void;
}

export function ResultsSection({ onViewReceipt, onSaveJourney }: ResultsSectionProps): ReactNode {
  const { state } = useCalculatorContext();

  if (state.calculated) {
    return <PostCalculationView onViewReceipt={onViewReceipt} onSaveJourney={onSaveJourney} />;
  }

  return <PreCalculationView />;
}
