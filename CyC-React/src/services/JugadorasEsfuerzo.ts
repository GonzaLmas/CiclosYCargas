import supabase from "./SupabaseService";
import { getPFById } from "./PFService";
import { getJugadorasAptas, type Jugadora } from "./JugadoraService";

export type EsfuerzoMap = Record<string, number | null>;
export type FechaMap = Record<string, string | null>;

export interface EsfuerzoResult {
  jugadoras: Jugadora[];
  esfuerzoById: EsfuerzoMap;
  fechaById: FechaMap;
}

export async function getEsfuerzoDataForPF(
  userId: string
): Promise<EsfuerzoResult> {
  if (!userId) return { jugadoras: [], esfuerzoById: {}, fechaById: {} };

  const pf = await getPFById(userId);
  if (!pf || !pf.IdClub || !pf.Division) {
    return { jugadoras: [], esfuerzoById: {}, fechaById: {} };
  }

  const all = await getJugadorasAptas();
  const jugadorasPF = (all || []).filter(
    (j) => j.IdClub === pf.IdClub && j.Division === pf.Division
  );

  const ids = jugadorasPF.map((j) => j.IdJugadora).filter(Boolean);
  if (ids.length === 0) {
    return { jugadoras: jugadorasPF, esfuerzoById: {}, fechaById: {} };
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

  return { jugadoras: jugadorasPF, esfuerzoById, fechaById };
}
