import supabase from "./SupabaseService";

export type Club = {
  IdClub: string;
  NombreClub: string;
  PaisClub?: string;
};

export async function getClubes(): Promise<Club[]> {
  try {
    const { data, error } = await supabase
      .from("Club")
      .select("*")
      .order("NombreClub", { ascending: true });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error("Error al obtener los clubes:", error);
    throw error;
  }
}

export async function getClubById(id: string): Promise<Club | null> {
  try {
    const { data, error } = await supabase
      .from("Club")
      .select("*")
      .eq("IdClub", id)
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error("Error al obtener el club:", error);
    throw error;
  }
}
