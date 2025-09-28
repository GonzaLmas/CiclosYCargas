import supabase from "./SupabaseService";

export async function getClubes() {
  try {
    const { data, error } = await supabase
      .from("Club")
      .select("*")
      .order("nombreClub", { ascending: true });

    if (error) throw error;
    return data;
  } catch (error) {
    console.error("Error fetching clubs:", error);
    throw error;
  }
}

export async function createJugadora(jugadoraData: {
  idUsuario: string;
  edad: number;
  idClub: string;
  division: string;
}) {
  try {
    const { data, error } = await supabase
      .from("Jugadora")
      .insert([
        {
          IdJugadora: jugadoraData.idUsuario,
          Edad: jugadoraData.edad,
          IdClub: jugadoraData.idClub,
          Division: jugadoraData.division,
          Activa: true,
          Nombre: "",
          Apellido: "",
          Email: "",
          Indicador: 0,
        },
      ])
      .select();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error("Error creating player:", error);
    throw error;
  }
}
