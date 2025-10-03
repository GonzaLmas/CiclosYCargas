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

export function shiftMonth(year: number, month0: number, delta: number) {
  const d = new Date(year, month0 + delta, 1);
  return { year: d.getFullYear(), month0: d.getMonth() };
}
