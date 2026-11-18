import {
  Calculator,
  FileText,
  Fuel,
  History,
  Smartphone,
  Sparkles,
} from 'lucide-react'

import type { IFeature } from '../interfaces/IFeature'

export const features: IFeature[] = [
  {
    icon: Calculator,
    title: 'Cálculos automáticos',
    description: 'El reparto de tu jornada, resuelto sin cuentas a mano.',
  },
  {
    icon: Sparkles,
    title: 'Ayuda de ChófIA',
    description:
      'Tu copiloto para dudas sobre la app y para el cálculo de tu jornada. Revisá siempre los números.',
  },
  {
    icon: History,
    title: 'Historial de jornadas',
    description: 'Tus jornadas quedan guardadas para cuando las necesites.',
  },
  {
    icon: FileText,
    title: 'Recibos para compartir',
    description: 'Un recibo claro, listo para descargar o compartir.',
  },
  {
    icon: Fuel,
    title: 'Combustible y dueño del auto',
    description: 'El combustible se descuenta a quien corresponde.',
  },
  {
    icon: Smartphone,
    title: 'Instalable en el teléfono',
    description: 'Usala como una app más en tu teléfono.',
  },
]

export const benefits: string[] = [
  'Menos tiempo haciendo cuentas',
  'Reparto claro entre agencia, conductor y vehículo',
  'Tus jornadas guardadas y a mano',
  'ChófIA para dudas y cálculos',
  'Gratis, con cuota diaria en ChófIA',
]
