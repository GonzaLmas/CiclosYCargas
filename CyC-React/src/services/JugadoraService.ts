import supabase from "./SupabaseService";

export type Jugadora = {
  IdJugadora: string;
  Nombre: string;
  Apellido: string;
  Email: string;
  Edad: number | null;
  IdClub: string | null;
  Division: string | null;
  Activa: boolean | null;
  Indicador: number | null;
  FecProxEditPerfil: string | null;
};

export type CreateJugadoraDTO = Omit<Jugadora, "IdJugadora"> & {
  IdJugadora: string;
};
export type UpdateJugadoraDTO = Partial<CreateJugadoraDTO>;

export async function getJugadoras(): Promise<Jugadora[]> {
  try {
    const { data, error } = await supabase
      .from("Jugadora")
      .select("*")
      .order("Apellido", { ascending: true });

    if (error) throw error;
    return (data || []).map(toJugadora);
  } catch (error) {
    console.error("Error al obtener las jugadoras:", error);
    throw error;
  }
}

export async function getJugadorasAptas(): Promise<Jugadora[]> {
  try {
    const { data, error } = await supabase
      .from("Jugadora")
      .select("*")
      .eq("Activa", true)
      .order("Apellido", { ascending: true });

    if (error) throw error;
    return (data || []).map(toJugadora);
  } catch (error) {
    console.error("Error al obtener las jugadoras aptas:", error);
    throw error;
  }
}

export async function getJugadoraById(id: string): Promise<Jugadora | null> {
  try {
    const { data, error } = await supabase
      .from("Jugadora")
      .select("*")
      .eq("IdJugadora", id)
      .single();

    if (error) throw error;
    return data ? toJugadora(data) : null;
  } catch (error) {
    console.error("Error al obtener la jugadora:", error);
    throw error;
  }
}

export async function createJugadora(
  jugadora: CreateJugadoraDTO
): Promise<Jugadora> {
  try {
    const jugadoraData = {
      IdJugadora: jugadora.IdJugadora,
      Nombre: jugadora.Nombre,
      Apellido: jugadora.Apellido,
      Email: jugadora.Email,
      Edad: jugadora.Edad,
      IdClub: jugadora.IdClub,
      Division: jugadora.Division,
      Activa: jugadora.Activa ?? true,
      Indicador: jugadora.Indicador ?? 0,
      FecProxEditPerfil: jugadora.FecProxEditPerfil ?? null,
    };

    const { data, error } = await supabase
      .from("Jugadora")
      .insert(jugadoraData)
      .select()
      .single();

    if (error) throw error;
    return toJugadora(data);
  } catch (error) {
    console.error("Error al crear la jugadora:", error);
    throw error;
  }
}

export async function updateJugadora(
  uuid: string,
  updates: UpdateJugadoraDTO
): Promise<Jugadora | null> {
  try {
    const { data, error } = await supabase
      .from("Jugadora")
      .update(updates)
      .eq("IdJugadora", uuid)
      .select();

    if (error) throw error;

    if (!data || data.length === 0) {
      console.warn("No se encontró la jugadora con ese UUID");
      return null;
    }

    return toJugadora(data[0]);
  } catch (error) {
    console.error("Error al actualizar la jugadora:", error);
    throw error;
  }
}

export async function deleteJugadora(
  id: string,
  hardDelete: boolean = false
): Promise<void> {
  try {
    if (hardDelete) {
      const { error } = await supabase
        .from("Jugadora")
        .delete()
        .eq("IdJugadora", id);

      if (error) throw error;
    } else {
      await updateJugadora(id, { Activa: false });
    }
  } catch (error) {
    console.error("Error al eliminar la jugadora:", error);
    throw error;
  }
}

function toJugadora(data: any): Jugadora {
  return {
    IdJugadora: data.IdJugadora,
    Nombre: data.Nombre ?? "",
    Apellido: data.Apellido ?? "",
    Email: data.Email ?? "",
    Edad: data.Edad ?? null,
    IdClub: data.IdClub ?? null,
    Division: data.Division ?? null,
    Activa: data.Activa ?? null,
    Indicador: data.Indicador ?? null,
    FecProxEditPerfil: data.FecProxEditPerfil ?? null,
  };
}
