export const formatName = (value?: string | null) => {
  if (!value) return "-";
  const t = String(value).trim();
  if (!t) return "-";
  return t
    .toLowerCase()
    .split(/\s+/)
    .map((w) => (w ? w.charAt(0).toUpperCase() + w.slice(1) : w))
    .join(" ");
};

export function getMonthLabelCapitalized(year: number, month0: number) {
  const raw = new Date(year, month0, 1).toLocaleDateString("es-AR", {
    month: "long",
    year: "numeric",
  });
  return raw.replace(/^([a-záéíóúñ])/, (m) => m.toUpperCase());
}

export function getDaysInMonth(year: number, month0: number) {
  return new Date(year, month0 + 1, 0).getDate();
}

export type PercepcionCalendarItem = {
  FechaCarga: string;
  VariableE: number | null;
};

export function mapItemsToCalendarTMinus1(
  items: PercepcionCalendarItem[],
  year: number,
  month0: number,
  baOffsetHours = 3
) {
  const map = new Map<number, number | null>();
  for (const it of items) {
    const dUTC = new Date(it.FechaCarga);
    const dBA = new Date(dUTC.getTime() - baOffsetHours * 3600 * 1000);
    dBA.setDate(dBA.getDate() - 1);
    if (dBA.getFullYear() !== year || dBA.getMonth() !== month0) continue;
    const day = dBA.getDate();
    map.set(day, it.VariableE);
  }
  return map;
}

export function mapItemsToDateMapTMinus1(
  items: PercepcionCalendarItem[],
  baOffsetHours = 3
) {
  const map = new Map<string, number | null>();
  for (const it of items) {
    const dUTC = new Date(it.FechaCarga);
    const dBA = new Date(dUTC.getTime() - baOffsetHours * 3600 * 1000);
    dBA.setDate(dBA.getDate() - 1);
    const key = dBA.toISOString().slice(0, 10);
    map.set(key, it.VariableE);
  }
  return map;
}

export function shiftMonth(year: number, month0: number, delta: number) {
  const d = new Date(year, month0 + delta, 1);
  return { year: d.getFullYear(), month0: d.getMonth() };
}

export function getStartWeekdayMon0(year: number, month0: number) {
  const jsDay = new Date(year, month0, 1).getDay();
  return (jsDay + 6) % 7;
}

export type LeadingInfo = {
  prevYear: number;
  prevMonth0: number;
  prevMonthDays: number;
  leadingCount: number;
  leadingDays: number[];
};

export function getPrevMonthLeadingInfo(
  year: number,
  month0: number,
  startWeekdayMon0: number
): LeadingInfo {
  const lastPrev = new Date(year, month0, 0);
  const prevMonth0 = lastPrev.getMonth();
  const prevYear = lastPrev.getFullYear();
  const prevMonthDays = lastPrev.getDate();
  const leadingCount = startWeekdayMon0;
  const leadingDays = Array.from(
    { length: leadingCount },
    (_, i) => prevMonthDays - leadingCount + 1 + i
  );
  return { prevYear, prevMonth0, prevMonthDays, leadingCount, leadingDays };
}

export type TrailingInfo = {
  trailingCount: number;
  nextMonth0: number;
  nextYear: number;
  trailingDays: number[];
};

export function getTrailingInfo(
  year: number,
  month0: number,
  startWeekdayMon0: number,
  daysInMonth: number
): TrailingInfo {
  const remainder = (startWeekdayMon0 + daysInMonth) % 7;
  const trailingCount = remainder === 0 ? 0 : 7 - remainder;
  const nextFirst = new Date(year, month0 + 1, 1);
  const nextMonth0 = nextFirst.getMonth();
  const nextYear = nextFirst.getFullYear();
  const trailingDays = Array.from({ length: trailingCount }, (_, i) => i + 1);
  return { trailingCount, nextMonth0, nextYear, trailingDays };
}

export function ymdKey(y: number, m0: number, d: number) {
  const mm = String(m0 + 1).padStart(2, "0");
  const dd = String(d).padStart(2, "0");
  return `${y}-${mm}-${dd}`;
}

export function buildExtendedBARange(
  year: number,
  month0: number,
  leadingCount: number,
  trailingCount: number,
  baOffsetHours = 3
) {
  const startBA = new Date(year, month0, 1 - leadingCount, 0, 0, 0, 0);
  const endBA = new Date(year, month0 + 1, trailingCount + 1, 0, 0, 0, 0);
  const startUTC = new Date(startBA.getTime() + baOffsetHours * 3600 * 1000);
  const endUTC = new Date(endBA.getTime() + baOffsetHours * 3600 * 1000);
  return { startISO: startUTC.toISOString(), endISO: endUTC.toISOString() };
}
