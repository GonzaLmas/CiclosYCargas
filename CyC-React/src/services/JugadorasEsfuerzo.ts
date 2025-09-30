import supabase from "./SupabaseService";
import { getPFById } from "./PFService";
import { getJugadorasAptas, type Jugadora } from "./JugadoraService";

export type EsfuerzoMap = Record<string, number | null>;
export type FechaMap = Record<string, string | null>;
export type TotalesMap = Record<string, number>;

export interface EsfuerzoResult {
  jugadoras: Jugadora[];
  esfuerzoById: EsfuerzoMap;
  fechaById: FechaMap;
  totalSemanaById: TotalesMap;
}

function getBAWeeklyWindowISO(now: Date = new Date()) {
  const BA_OFFSET_HOURS = 3;
  const nowBA = new Date(now.getTime() - BA_OFFSET_HOURS * 60 * 60 * 1000);
  const dow = nowBA.getDay();
  const diffToMonday = (dow + 6) % 7;
  const mondayBA = new Date(
    nowBA.getFullYear(),
    nowBA.getMonth(),
    nowBA.getDate() - diffToMonday,
    18,
    0,
    0,
    0
  );

  const saturdayBA = new Date(mondayBA.getTime());
  saturdayBA.setDate(saturdayBA.getDate() + 5);
  saturdayBA.setHours(13, 0, 0, 0);

  const startUTC = new Date(
    mondayBA.getTime() + BA_OFFSET_HOURS * 60 * 60 * 1000
  );
  const endUTC = new Date(
    saturdayBA.getTime() + BA_OFFSET_HOURS * 60 * 60 * 1000
  );
  return { startISO: startUTC.toISOString(), endISO: endUTC.toISOString() };
}
export async function getEsfuerzoDataForPF(
  userId: string
): Promise<EsfuerzoResult> {
  if (!userId)
    return {
      jugadoras: [],
      esfuerzoById: {},
      fechaById: {},
      totalSemanaById: {},
    };

  const pf = await getPFById(userId);
  if (!pf || !pf.IdClub || !pf.Division) {
    return {
      jugadoras: [],
      esfuerzoById: {},
      fechaById: {},
      totalSemanaById: {},
    };
  }

  const all = await getJugadorasAptas();
  const jugadorasPF = (all || []).filter(
    (j) => j.IdClub === pf.IdClub && j.Division === pf.Division
  );

  const ids = jugadorasPF.map((j) => j.IdJugadora).filter(Boolean);
  if (ids.length === 0) {
    return {
      jugadoras: jugadorasPF,
      esfuerzoById: {},
      fechaById: {},
      totalSemanaById: {},
    };
  }

  const { data, error } = await supabase
    .from("Variables")
    .select("IdUsuario, FechaCarga, VariableE")
    .in("IdUsuario", ids)
    .order("FechaCarga", { ascending: false });

  if (error) throw error as any;

  const esfuerzoById: EsfuerzoMap = {};
  const fechaById: FechaMap = {};
  for (const row of (data || []) as Array<{
    IdUsuario: string;
    VariableE: number | null | undefined;
    FechaCarga?: string;
  }>) {
    const id = row.IdUsuario;
    if (!(id in esfuerzoById)) {
      const ve = row.VariableE;
      const n = typeof ve === "number" ? ve : ve == null ? null : Number(ve);
      esfuerzoById[id] = Number.isFinite(n as number) ? (n as number) : null;
      fechaById[id] = row.FechaCarga ?? null;
    }
  }

  const { startISO, endISO } = getBAWeeklyWindowISO();
  console.log("[Semana] range UTC0", startISO, endISO);

  const { data: weekData, error: weekError } = await supabase
    .from("Variables")
    .select("IdUsuario, FechaCarga, VariableE")
    .in("IdUsuario", ids)
    .gte("FechaCarga", startISO)
    .lt("FechaCarga", endISO);
  if (weekError) throw weekError as any;

  const fechas = (weekData || [])
    .map((r: any) => r?.FechaCarga)
    .filter(Boolean)
    .sort();
  const minF = fechas.length ? fechas[0] : null;
  const maxF = fechas.length ? fechas[fechas.length - 1] : null;
  console.log("[Semana] count/min/max", (weekData || []).length, minF, maxF);

  const totalSemanaById: TotalesMap = {};
  for (const row of (weekData || []) as Array<{
    IdUsuario: string;
    VariableE: number | null | undefined;
    FechaCarga?: string;
  }>) {
    const id = row.IdUsuario;
    const ve = row.VariableE;
    const n = typeof ve === "number" ? ve : ve == null ? null : Number(ve);
    if (!Number.isFinite(n as number)) continue;
    totalSemanaById[id] = (totalSemanaById[id] || 0) + (n as number);
  }

  return { jugadoras: jugadorasPF, esfuerzoById, fechaById, totalSemanaById };
}
