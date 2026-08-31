export type DayColor = 'verde' | 'naranja' | 'rojo' | 'gris' | 'objetivo'

export type DayRecord = {
  comida: 'fit' | 'fat' | null
  gimnasio: boolean
  objetivo: boolean
}

function todayISO(): string {
  return new Date().toISOString().split('T')[0]
}

export function dayColor(record: DayRecord | null | undefined, fecha: string): DayColor {
  const today = todayISO()
  const isFuture = fecha > today

  if (!record || (!record.comida && !record.gimnasio)) {
    if (record?.objetivo && isFuture) return 'objetivo'
    return 'gris'
  }

  if (record.comida === 'fit' && record.gimnasio) return 'verde'
  if (record.comida === 'fat' && !record.gimnasio) return 'rojo'
  return 'naranja'
}

export const COLOR_BG: Record<DayColor, string> = {
  verde: 'bg-clay-green',
  naranja: 'bg-clay-orange',
  rojo: 'bg-clay-red',
  gris: 'bg-clay-gray',
  objetivo: 'bg-clay-gray',
}

export const COLOR_HEX: Record<DayColor, string> = {
  verde: '#A8D48A',
  naranja: '#FFB870',
  rojo: '#FF8A8A',
  gris: '#E5E3D8',
  objetivo: '#E5E3D8',
}
