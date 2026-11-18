import { Calculator, History, Sparkles } from 'lucide-react';
import type { TLandingList } from '../types/featureItems';

const features: TLandingList = [
  {
    id: crypto.randomUUID(),
    icon: Calculator,
    title: "Cálculos automáticos",
    desc: "El reparto de tu jornada, resuelto sin cuentas a mano.",
    iconColor: "text-accent-violet",
  },
  {
    id: crypto.randomUUID(),
    icon: Sparkles,
    title: "Ayuda de ChófIA",
    desc: "Tu copiloto para dudas sobre la app y para el cálculo de tu jornada.",
    iconColor: "text-accent-amber",
  },
  {
    id: crypto.randomUUID(),
    icon: History,
    title: "Tus jornadas, guardadas",
    desc: "Historial y recibos listos para cuando los necesites, en cualquier dispositivo.",
    iconColor: "text-accent-green",
  },
];

export default features;
