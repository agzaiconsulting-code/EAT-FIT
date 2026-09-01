import { DayRecord } from './dayColor'

export type RegistroConDeportes = DayRecord & {
  fecha: string
  deportes: { tipo: string; kms: number | null }[]
}

export type StatsResult = {
  diasFit: number
  diasFat: number
  diasDeporte: number
  semanasDoradas: number
  rachaFit: number
  totalKms: number
  deportesCounts: Record<string, number>
  diasConDatos: number
}

function getMondayOfWeek(date: Date): Date {
  const d = new Date(date)
  const day = d.getDay()
  const diff = day === 0 ? -6 : 1 - day
  d.setDate(d.getDate() + diff)
  d.setHours(0, 0, 0, 0)
  return d
}

export function calcStats(registros: RegistroConDeportes[], mes: string): StatsResult {
  const [year, month] = mes.split('-').map(Number)
  const diasEnMes = new Date(year, month, 0).getDate()
  const today = new Date().toISOString().split('T')[0]

  const byFecha = Object.fromEntries(registros.map((r) => [r.fecha, r]))

  let diasFit = 0
  let diasFat = 0
  let diasDeporte = 0
  let totalKms = 0
  const deportesCounts: Record<string, number> = {}

  for (let d = 1; d <= diasEnMes; d++) {
    const fecha = `${year}-${String(month).padStart(2, '0')}-${String(d).padStart(2, '0')}`
    if (fecha > today) continue
    const r = byFecha[fecha]
    if (!r) continue
    if (r.comida === 'fit') diasFit++
    if (r.comida === 'fat') diasFat++
    if (r.gimnasio) diasDeporte++
  }

  for (const r of registros) {
    for (const dep of r.deportes ?? []) {
      deportesCounts[dep.tipo] = (deportesCounts[dep.tipo] ?? 0) + 1
      if (dep.tipo === 'Correr' && dep.kms) totalKms += Number(dep.kms)
    }
  }

  // Racha fit consecutiva hasta hoy
  let rachaFit = 0
  let checking = today
  const mesStart = `${mes}-01`
  while (checking >= mesStart) {
    const r = byFecha[checking] ?? null
    if (r && r.comida === 'fit') {
      rachaFit++
      const dt = new Date(checking)
      dt.setDate(dt.getDate() - 1)
      checking = dt.toISOString().split('T')[0]
    } else {
      break
    }
  }

  // Semanas doradas: Mon-Sun weeks that overlap the month
  // For each week, count fit days and sport days (past+today only)
  const monthStart = new Date(year, month - 1, 1)
  const monthEnd = new Date(year, month - 1, diasEnMes)

  // Find the Monday of the week containing the 1st
  const firstMonday = getMondayOfWeek(monthStart)

  let semanasDoradas = 0
  let weekStart = new Date(firstMonday)

  while (weekStart <= monthEnd) {
    let fitCount = 0
    let sportCount = 0

    for (let i = 0; i < 7; i++) {
      const d = new Date(weekStart)
      d.setDate(d.getDate() + i)
      const fechaStr = d.toISOString().split('T')[0]
      if (fechaStr > today) continue
      // Only count days in this month
      if (d.getMonth() !== month - 1) continue
      const r = byFecha[fechaStr]
      if (!r) continue
      if (r.comida === 'fit') fitCount++
      if (r.gimnasio) sportCount++
    }

    if (fitCount >= 5 && sportCount >= 4) semanasDoradas++

    weekStart.setDate(weekStart.getDate() + 7)
  }

  const diasConDatos = diasFit + diasFat + (diasDeporte > 0 ? 0 : 0)
  // diasConDatos = days that have any data
  let diasConDatosCount = 0
  for (let d = 1; d <= diasEnMes; d++) {
    const fecha = `${year}-${String(month).padStart(2, '0')}-${String(d).padStart(2, '0')}`
    if (fecha > today) continue
    const r = byFecha[fecha]
    if (r && (r.comida || r.gimnasio)) diasConDatosCount++
  }

  return {
    diasFit,
    diasFat,
    diasDeporte,
    semanasDoradas,
    rachaFit,
    totalKms,
    deportesCounts,
    diasConDatos: diasConDatosCount,
  }
}
