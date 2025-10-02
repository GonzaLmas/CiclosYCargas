import { getJugadoraById, updateJugadora } from "./JugadoraService";
import { getPFById, updatePF } from "./PFService";
import { getClubes } from "./ClubService";

export type PerfilRole = "PF" | "Jugadora" | null;

export type PerfilData = {
  nombre: string;
  apellido: string;
  edad?: string;
  idClub: string;
  division: string;
  nextEditAt?: number | null;
};

export type PerfilForm = {
  Edad: string;
  IdClub: string;
  Division: string;
};

export async function fetchUserPerfil(
  userId: string,
  role: PerfilRole
): Promise<PerfilData | null> {
  if (role === "PF") {
    const pf = await getPFById(userId);
    if (!pf) return null;
    return {
      nombre: pf.Nombre || "",
      apellido: pf.Apellido || "",
      idClub: pf.IdClub || "",
      division: pf.Division || "",
      nextEditAt: pf.FecProxEditPerfil ? Date.parse(pf.FecProxEditPerfil) : null,
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

export function validatePerfilForm(
  form: PerfilForm,
  role: PerfilRole
): string | null {
  const isPF = role === "PF";
  if (isPF) {
    if (!form.IdClub || !form.Division)
      return "Por favor complete todos los campos";
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
      Division: form.Division,
      FecProxEditPerfil: nextIso,
    });
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
