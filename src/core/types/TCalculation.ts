// Estado del calculo de cierre que el backend asocia a un mensaje del asistente.
export type TCalculationStatus = 'needs_data' | 'offer' | 'completed'

// Dueño del auto cuando el vehículo NO está alquilado (define quién absorbe el combustible).
export type TCalculationCarOwner = 'agency' | 'driver'

// Tipo de vale que devuelve el tool de extracción del backend.
export type TCalculationVoucherType = 'fabrica' | 'otro'

// Claves que el backend informa como faltantes o invalidas.
export type TCalculationMissingField =
  | 'totalInvoiced'
  | 'agencyPercentage'
  | 'driverPercentage'
  | 'vehicleRented'
  | 'vehiclePercentage'
  | 'carOwner'
  | 'gas'
  | 'fuel'
  | 'vouchers'
  | 'percentages'
