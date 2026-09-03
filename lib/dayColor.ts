export type DayRecord = {
  comida: 'fit' | 'fat' | null
  gimnasio: boolean
  cervezas: number
}

// Keep export for backward compat
export type DayColor = 'fit' | 'fat' | 'sport' | 'empty'
