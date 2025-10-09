import supabase from "./SupabaseService";

interface DatabasePF {
  IdUsuario: string;
  Nombre: string;
  Apellido: string;
  Email: string;
  IdClub: string | null;
  FecProxEditPerfil: string | null;
}

export type PF = DatabasePF;

export type CreatePFDTO = Omit<DatabasePF, "IdUsuario"> & {
  IdUsuario: string;
};

export type UpdatePFDTO = Partial<CreatePFDTO>;

const toPF = (data: any): PF => ({
  IdUsuario: data.IdUsuario,
  Nombre: data.Nombre || "",
  Apellido: data.Apellido || "",
  Email: data.Email || "",
  IdClub: data.IdClub || null,
  FecProxEditPerfil: data.FecProxEditPerfil || null,
});

export async function getPFs(): Promise<PF[]> {
  try {
    const { data, error } = await supabase
      .from("PF")
      .select("*")
      .order("Apellido", { ascending: true });

    if (error) throw error;

    return (data || []).map(toPF);
  } catch (error) {
    console.error("Error al obtener los preparadores físicos:", error);
    throw error;
  }
}

export async function getPFById(id: string): Promise<PF | null> {
  try {
    const { data, error } = await supabase
      .from("PF")
      .select("*")
      .eq("IdUsuario", id)
      .single();

    if (error) {
      if (error.code === "PGRST116" || error.code === "22P02") {
        return null;
      }
      throw error;
    }

    return toPF(data);
  } catch (error) {
    console.error("Error al obtener el preparador físico:", error);
    throw error;
  }
}

export async function createPF(pf: CreatePFDTO): Promise<PF> {
  try {
    const pfData = {
      IdUsuario: pf.IdUsuario,
      Nombre: pf.Nombre,
      Apellido: pf.Apellido,
      Email: pf.Email,
      IdClub: pf.IdClub,
    };

    const { data, error } = await supabase
      .from("PF")
      .insert([pfData] as any)
      .select()
      .single();

    if (error) throw error;

    return toPF(data);
  } catch (error) {
    console.error("Error al crear el preparador físico:", error);
    throw error;
  }
}

export async function updatePF(
  id: string,
  updates: UpdatePFDTO
): Promise<PF | null> {
  try {
    const { data, error } = await supabase
      .from("PF")
      .update(updates as any)
      .eq("IdUsuario", id)
      .select()
      .single();

    if (error) throw error;

    if (!data) return null;

    return toPF(data);
  } catch (error) {
    console.error("Error al actualizar el preparador físico:", error);
    throw error;
  }
}

export async function deletePF(id: string): Promise<void> {
  try {
    const { error } = await supabase.from("PF").delete().eq("IdUsuario", id);

    if (error) throw error;
  } catch (error) {
    console.error("Error al eliminar el preparador físico:", error);
    throw error;
  }
}

