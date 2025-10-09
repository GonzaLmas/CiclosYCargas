import { getJugadoraById, updateJugadora } from "./JugadoraService";
import { getPFById, updatePF } from "./PFService";
import { getClubes } from "./ClubService";
import supabase from "./SupabaseService";
import { getPFData } from "./TipoSemanaService";

export type PerfilRole = "PF" | "Jugadora" | null;

export type PerfilData = {
  nombre: string;
  apellido: string;
  edad?: string;
  idClub: string;
  division: string;
  divisionIds?: string[];
  nextEditAt?: number | null;
};

export type PerfilForm = {
  Edad: string;
  IdClub: string;
  Division: string;
  DivisionIds?: string[];
};

export async function fetchUserPerfil(
  userId: string,
  role: PerfilRole
): Promise<PerfilData | null> {
  if (role === "PF") {
    const [pf, pfInfo] = await Promise.all([
      getPFById(userId),
      getPFData(userId),
    ]);
    if (!pf && !pfInfo) return null;
    return {
      nombre: pf?.Nombre || "",
      apellido: pf?.Apellido || "",
      idClub: (pf?.IdClub ?? pfInfo?.IdClub) || "",
      division: "",
      divisionIds: pfInfo?.DivisionIds || [],
      nextEditAt: pf?.FecProxEditPerfil
        ? Date.parse(pf.FecProxEditPerfil)
        : null,
    };
  }

  const jugadora = await getJugadoraById(userId);
  if (!jugadora) return null;
  return {
    nombre: jugadora.Nombre || "",
    apellido: jugadora.Apellido || "",
    edad: jugadora.Edad?.toString() || "",
    idClub: jugadora.IdClub || "",
    division: jugadora.Division || "",
    nextEditAt: jugadora.FecProxEditPerfil
      ? Date.parse(jugadora.FecProxEditPerfil)
      : null,
  };
}

export async function fetchClubesData() {
  return await getClubes();
}

export async function fetchDivisionesDisponibles(): Promise<string[]> {
  const { data, error } = await (supabase as any)
    .from("Division")
    .select("Descripcion");
  if (error) throw error;
  return (data || []).map((r: any) => r.Descripcion as string);
}

export function validatePerfilForm(
  form: PerfilForm,
  role: PerfilRole
): string | null {
  const isPF = role === "PF";
  if (isPF) {
    if (!form.IdClub) return "Por favor complete todos los campos";
    const hasDivs =
      Array.isArray(form.DivisionIds) && form.DivisionIds.length > 0;
    if (!hasDivs) return "Seleccione al menos una división";
    return null;
  }
  if (!form.Edad || !form.IdClub || !form.Division)
    return "Por favor complete todos los campos";
  return null;
}

export async function submitPerfilUpdate(
  userId: string,
  role: PerfilRole,
  form: PerfilForm
): Promise<number> {
  const isPF = role === "PF";
  const nextTs = nextAllowedTimestamp(7);
  const nextIso = new Date(nextTs).toISOString();
  if (isPF) {
    await updatePF(userId, {
      IdClub: form.IdClub,
      FecProxEditPerfil: nextIso,
    });

    const divisions = Array.isArray(form.DivisionIds) ? form.DivisionIds : [];

    const { error: delErr } = await (supabase as any)
      .from("PF_Division")
      .delete()
      .eq("IdPF", userId);
    if (delErr) throw delErr;

    if (divisions.length > 0) {
      const rows = divisions.map((d) => ({ IdPF: userId, Division: d }));
      const { error: insErr } = await (supabase as any)
        .from("PF_Division")
        .insert(rows as any);
      if (insErr) throw insErr;
    }
  } else {
    await updateJugadora(userId, {
      Edad: parseInt(form.Edad, 10),
      IdClub: form.IdClub,
      Division: form.Division,
      FecProxEditPerfil: nextIso,
    });
  }
  return nextTs;
}

export function nextAllowedTimestamp(days: number = 7): number {
  return Date.now() + days * 24 * 60 * 60 * 1000;
}
