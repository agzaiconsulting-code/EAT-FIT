import { DayColor, dayColor, DayRecord } from './dayColor'

export type RegistroConDeportes = DayRecord & {
  fecha: string
  deportes: { tipo: string; kms: number | null }[]
}

export type StatsResult = {
  totalKms: number
  colorCounts: Record<DayColor, number>
  deportesCounts: Record<string, number>
  rachaVerde: number
  diasConDatos: number
}

export function calcStats(registros: RegistroConDeportes[], mes: string): StatsResult {
  const [year, month] = mes.split('-').map(Number)
  const diasEnMes = new Date(year, month, 0).getDate()
  const today = new Date().toISOString().split('T')[0]

  const colorCounts: Record<DayColor, number> = {
    verde: 0,
    naranja: 0,
    rojo: 0,
    gris: 0,
    objetivo: 0,
  }
  const deportesCounts: Record<string, number> = {}
  let totalKms = 0

  const byFecha = Object.fromEntries(registros.map((r) => [r.fecha, r]))

  for (let d = 1; d <= diasEnMes; d++) {
    const fecha = `${year}-${String(month).padStart(2, '0')}-${String(d).padStart(2, '0')}`
    if (fecha > today) continue
    const r = byFecha[fecha] ?? null
    colorCounts[dayColor(r, fecha)]++
  }

  for (const r of registros) {
    for (const dep of r.deportes ?? []) {
      deportesCounts[dep.tipo] = (deportesCounts[dep.tipo] ?? 0) + 1
      if (dep.tipo === 'Correr' && dep.kms) totalKms += Number(dep.kms)
    }
  }

  // Racha verde consecutiva hasta hoy
  let rachaVerde = 0
  let checking = today
  const mesStart = `${mes}-01`
  while (checking >= mesStart) {
    const r = byFecha[checking] ?? null
    if (dayColor(r, checking) === 'verde') {
      rachaVerde++
      const d = new Date(checking)
      d.setDate(d.getDate() - 1)
      checking = d.toISOString().split('T')[0]
    } else {
      break
    }
  }

  const diasConDatos = colorCounts.verde + colorCounts.naranja + colorCounts.rojo

  return { totalKms, colorCounts, deportesCounts, rachaVerde, diasConDatos }
}
