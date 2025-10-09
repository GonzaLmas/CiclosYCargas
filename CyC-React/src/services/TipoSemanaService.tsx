import supabase from "./SupabaseService";

export interface Capacidad {
  IdCapacidad: string;
  Nombre: string;
}

export interface Subcapacidad {
  IdSubCapacidad: string;
  IdCapacidad: string;
  Nombre: string;
}

export interface PFData {
  IdUsuario: string;
  IdClub: string | null;
  DivisionIds: string[];
}

export async function getCapacidades(): Promise<Capacidad[]> {
  try {
    const { data, error } = await supabase
      .from("Capacidades")
      .select("*")
      .order("Nombre");

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error("Error al obtener capacidades:", error);
    throw error;
  }
}

export async function getSubcapacidades(
  idCapacidad: string
): Promise<Subcapacidad[]> {
  try {
    const { data, error } = await supabase
      .from("Subcapacidad")
      .select("*")
      .eq("IdCapacidad", idCapacidad)
      .order("Nombre");

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error("Error al obtener subcapacidades:", error);
    throw error;
  }
}

export async function getPFData(userId: string): Promise<PFData | null> {
  try {
    const { data: pf, error: pfError } = await supabase
      .from("PF")
      .select("IdUsuario, IdClub")
      .eq("IdUsuario", userId)
      .single();

    if (pfError) throw pfError;
    if (!pf) return null;

    const { data: pfDivs, error: divError } = await (supabase as any)
      .from("PF_Division")
      .select("Division")
      .eq("IdPF", userId);

    if (divError) throw divError;

    const divisionIds = (pfDivs || []).map((r: any) => r.Division as string);

    return {
      IdUsuario: pf.IdUsuario,
      IdClub: pf.IdClub ?? null,
      DivisionIds: divisionIds,
    };
  } catch (error) {
    console.error("Error al obtener datos del PF:", error);
    throw error;
  }
}

export async function createTipoSemana(
  registros: {
    FechaCompetencia: string;
    FechaEntrenamiento: string;
    Capacidad?: string | null;
    SubCapacidad?: string | null;
    IdClub?: string | null;
    IdPF: string;
    Division: string;
  }[]
) {
  try {
    if (registros.some((r) => !r.IdPF)) {
      throw new Error("Todos los registros deben tener un IdPF válido");
    }

    const registrosNorm = registros.map((r) => ({
      Division: r.Division,
      FechaCompetencia: r.FechaCompetencia,
      FechaEntrenamiento: r.FechaEntrenamiento,
      Capacidad: r.Capacidad ?? null,
      SubCapacidad: r.SubCapacidad ?? null,
      IdClub: r.IdClub ?? null,
      IdPF: r.IdPF,
    }));

    const { data, error } = await supabase
      .from("TipoSemana")
      .insert(registrosNorm)
      .select();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error("Error al crear registros de TipoSemana:", error);
    throw error;
  }
}

export interface TipoSemana {
  Division: string;
  FechaCompetencia: string;
  FechaEntrenamiento: string;
  Capacidad: string | null;
  SubCapacidad: string | null;
  IdClub: string | null;
  IdPF: string;
}

export async function getTipoSemanaByPF(idPF: string): Promise<TipoSemana[]> {
  try {
    const { data, error } = await supabase
      .from("TipoSemana")
      .select(
        "Division, FechaCompetencia, FechaEntrenamiento, Capacidad, SubCapacidad, IdClub, IdPF"
      )
      .eq("IdPF", idPF)
      .order("FechaCompetencia", { ascending: false })
      .order("FechaEntrenamiento", { ascending: true });

    if (error) throw error;
    return (data as TipoSemana[]) || [];
  } catch (error) {
    console.error("Error al obtener TipoSemana por PF:", error);
    throw error;
  }
}

export async function getCapacidadesByIds(
  ids: string[]
): Promise<Record<string, string>> {
  if (!ids || ids.length === 0) return {};
  try {
    const { data, error } = await supabase
      .from("Capacidades")
      .select("IdCapacidad, Nombre")
      .in("IdCapacidad", Array.from(new Set(ids)));
    if (error) throw error;
    const map: Record<string, string> = {};
    (data || []).forEach((row: any) => {
      map[row.IdCapacidad] = row.Nombre;
    });
    return map;
  } catch (error) {
    console.error("Error al obtener nombres de Capacidades:", error);
    throw error;
  }
}

export async function getSubcapacidadesByIds(
  ids: string[]
): Promise<Record<string, string>> {
  if (!ids || ids.length === 0) return {};
  try {
    const { data, error } = await supabase
      .from("Subcapacidad")
      .select("IdSubCapacidad, Nombre")
      .in("IdSubCapacidad", Array.from(new Set(ids)));
    if (error) throw error;
    const map: Record<string, string> = {};
    (data || []).forEach((row: any) => {
      map[row.IdSubCapacidad] = row.Nombre;
    });
    return map;
  } catch (error) {
    console.error("Error al obtener nombres de Subcapacidades:", error);
    throw error;
  }
}
