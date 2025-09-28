export function getDiasOvulatorios(diasSangrado: number): number {
  if (diasSangrado <= 8) return 5;
  if (diasSangrado === 9) return 4;
  if (diasSangrado === 10) return 3;
  return 0;
}

export function getDiasFolicular(
  duracionCicloAnterior: number,
  diasCicloPremenstrual: number,
  diasMenstrual: number,
  diasOvulatorios: number
): number {
  // (duracion - premenstrual - menstrual - ovulatorios) / 2
  return (
    (duracionCicloAnterior -
      diasCicloPremenstrual -
      diasMenstrual -
      diasOvulatorios) /
    2
  );
}

export function getOvulacion(duracionCicloAnterior: number): number {
  // duracion/2
  return duracionCicloAnterior / 2;
}

export function getDiasLuteos(
  duracionCicloAnterior: number,
  diasCicloPremenstrual: number,
  diasMenstrual: number,
  diasOvulatorios: number
): number {
  // (duracion - premenstrual - menstrual - ovulatorios) / 2
  return (
    (duracionCicloAnterior -
      diasCicloPremenstrual -
      diasMenstrual -
      diasOvulatorios) /
    2
  );
}

export function addDays(base: Date, days: number): Date {
  const d = new Date(base.getTime());
  d.setTime(d.getTime() + days * 24 * 60 * 60 * 1000);
  return d;
}

export function toISOStringUTC(date: Date): string {
  return date.toISOString();
}

// ---------------- Indicador Jugadora ----------------
function parseDate(dateStr: string | null | undefined): Date | null {
  if (!dateStr) return null;
  const d = new Date(dateStr);
  return isNaN(d.getTime()) ? null : d;
}

function isOnOrAfter(a: Date, b: Date) {
  return a.getTime() >= b.getTime();
}
function isOnOrBefore(a: Date, b: Date) {
  return a.getTime() <= b.getTime();
}

/**
 * Calcula el indicador (1..5) según la fecha y las fronteras del ciclo.
 * Devuelve null si no hay datos suficientes.
 */
export function getIndicador(
  fecha: Date,
  ciclo: {
    DiaInicioCiclo?: string | null;
    FechaInicioCiclo?: string | null;
    DiaFinMenstruacion?: string | null;
    FecFinalizacionSangrado?: string | null;
    DiaFinFolicular?: string | null;
    FecOvulacion?: string | null;
    DiaFinLuteo?: string | null;
    DiaFinPeriodo?: string | null;
  }
): number | null {
  const inicio =
    parseDate(ciclo.DiaInicioCiclo) ?? parseDate(ciclo.FechaInicioCiclo);
  const finMenstruacion =
    parseDate(ciclo.DiaFinMenstruacion) ??
    parseDate(ciclo.FecFinalizacionSangrado);
  const finFolicular = parseDate(ciclo.DiaFinFolicular);
  const ovulacion = parseDate(ciclo.FecOvulacion);
  const finLuteo = parseDate(ciclo.DiaFinLuteo);
  const finPeriodo = parseDate(ciclo.DiaFinPeriodo);

  if (
    !inicio ||
    !finMenstruacion ||
    !finFolicular ||
    !ovulacion ||
    !finLuteo ||
    !finPeriodo
  ) {
    return null;
  }

  // 1: Fase Menstrual
  if (isOnOrAfter(fecha, inicio) && isOnOrBefore(fecha, finMenstruacion))
    return 1;
  // 5: Fase Folicular
  if (isOnOrAfter(fecha, finMenstruacion) && isOnOrBefore(fecha, finFolicular))
    return 5;
  // 4: Fase Ovulatoria
  if (
    fecha.getTime() > finFolicular.getTime() &&
    isOnOrBefore(fecha, ovulacion)
  )
    return 4;
  // 3: Fase Lútea
  if (isOnOrAfter(fecha, ovulacion) && isOnOrBefore(fecha, finLuteo)) return 3;
  // 2: Pre Menstrual
  if (fecha.getTime() > finLuteo.getTime() && isOnOrBefore(fecha, finPeriodo))
    return 2;

  return null;
}
