import supabase from "./SupabaseService";
import type { Tables, TablesInsert } from "./Supabase";
import {
  getDiasOvulatorios,
  getDiasFolicular,
  getOvulacion,
  getDiasLuteos,
  addDays,
  toISOStringUTC,
  getIndicador,
} from "./Formulas";
import { updateJugadora } from "./JugadoraService";

export type Ciclo = {
  IdCiclo: string;
  IdJugadora: string;
  FechaInicio: string;
  DiasPremenstruales: number | null;
  DiasSangrado: number | null;
  DuracionCicloAnterior: number | null;
  UsaAnticonceptivos: boolean | null;
  FechaRegistro: string;
};

export type CreateCicloDTO = Omit<Ciclo, "IdCiclo" | "FechaRegistro">;
export async function createCiclo(ciclo: CreateCicloDTO): Promise<Ciclo> {
  try {
    const insertData: TablesInsert<"Ciclo"> = {
      IdUsuario: ciclo.IdJugadora,
      FechaInicioCiclo: ciclo.FechaInicio,
      DiasCicloPremenstrualAnterior: ciclo.DiasPremenstruales,
      DiasSangrado: ciclo.DiasSangrado,
      DiasDuracionCicloAnteriores: ciclo.DuracionCicloAnterior,
      Anticonceptivas: ciclo.UsaAnticonceptivos,
    };

    const { data, error } = await supabase
      .from("Ciclo")
      .insert(insertData)
      .select()
      .single<Tables<"Ciclo">>();

    if (error) {
      console.error("Error de Supabase:", error);
      throw error;
    }

    const cicloCreado: Ciclo = {
      IdCiclo: data.IdCicloJugadora,
      IdJugadora: data.IdUsuario ?? ciclo.IdJugadora,
      FechaInicio: data.FechaInicioCiclo ?? ciclo.FechaInicio,
      DiasPremenstruales:
        data.DiasCicloPremenstrualAnterior ?? ciclo.DiasPremenstruales ?? null,
      DiasSangrado: data.DiasSangrado ?? ciclo.DiasSangrado ?? null,
      DuracionCicloAnterior:
        data.DiasDuracionCicloAnteriores ?? ciclo.DuracionCicloAnterior ?? null,
      UsaAnticonceptivos: data.Anticonceptivas,
      FechaRegistro: new Date().toISOString(),
    };

    try {
      if (
        cicloCreado.DiasSangrado == null ||
        cicloCreado.DuracionCicloAnterior == null ||
        cicloCreado.DiasPremenstruales == null
      ) {
        console.warn(
          "No se calcularán campos derivados: faltan valores requeridos",
          {
            DiasSangrado: cicloCreado.DiasSangrado,
            DuracionCicloAnterior: cicloCreado.DuracionCicloAnterior,
            DiasPremenstruales: cicloCreado.DiasPremenstruales,
          }
        );
      } else {
        const fechaInicio = new Date(cicloCreado.FechaInicio);
        const diasMenstrual = cicloCreado.DiasSangrado;
        const diasOvulatorios = getDiasOvulatorios(diasMenstrual);
        const diasFolicular = getDiasFolicular(
          cicloCreado.DuracionCicloAnterior,
          cicloCreado.DiasPremenstruales,
          diasMenstrual,
          diasOvulatorios
        );
        const ovulacion = getOvulacion(cicloCreado.DuracionCicloAnterior);
        const diasLuteos = getDiasLuteos(
          cicloCreado.DuracionCicloAnterior,
          cicloCreado.DiasPremenstruales,
          diasMenstrual,
          diasOvulatorios
        );

        const finMenstruacion = addDays(fechaInicio, diasMenstrual);
        const finDiasFolicular = addDays(
          fechaInicio,
          diasMenstrual + diasFolicular
        );
        const fechaOvulacion = addDays(fechaInicio, ovulacion);
        const finDiasLuteos = addDays(
          fechaInicio,
          diasMenstrual + diasOvulatorios + diasFolicular + diasLuteos
        );
        const finPeriodo = addDays(
          fechaInicio,
          cicloCreado.DuracionCicloAnterior
        );

        const updateData = {
          Anticonceptivas: data.Anticonceptivas,
          DiaFinFolicular: toISOStringUTC(finDiasFolicular),
          DiaFinLuteo: toISOStringUTC(finDiasLuteos),
          DiaFinMenstruacion: toISOStringUTC(finMenstruacion),
          DiaFinPeriodo: toISOStringUTC(finPeriodo),
          DiaInicioCiclo: toISOStringUTC(fechaInicio),
          DiasCicloPremenstrualAnterior: cicloCreado.DiasPremenstruales,
          DiasDuracionCicloAnteriores: cicloCreado.DuracionCicloAnterior,
          DiasFolicular: diasFolicular,
          DiasLuteos: diasLuteos,
          DiasMenstrual: diasMenstrual,
          DiasOvulatorios: diasOvulatorios,
          DiasPremenstruales: cicloCreado.DiasPremenstruales,
          DiasSangrado: diasMenstrual,
          FecFinalizacionSangrado: toISOStringUTC(finMenstruacion),
          FechaInicioCiclo: toISOStringUTC(fechaInicio),
          FecOvulacion: toISOStringUTC(fechaOvulacion),
          Ovulacion: ovulacion,
        };

        const { error: updError } = await supabase
          .from("Ciclo")
          .update({
            Anticonceptivas: updateData.Anticonceptivas,
            DiaFinFolicular: updateData.DiaFinFolicular,
            DiaFinLuteo: updateData.DiaFinLuteo,
            DiaFinMenstruacion: updateData.DiaFinMenstruacion,
            DiaFinPeriodo: updateData.DiaFinPeriodo,
            DiaInicioCiclo: updateData.DiaInicioCiclo,
            DiasCicloPremenstrualAnterior:
              updateData.DiasCicloPremenstrualAnterior,
            DiasDuracionCicloAnteriores: updateData.DiasDuracionCicloAnteriores,
            DiasFolicular: updateData.DiasFolicular,
            DiasLuteos: updateData.DiasLuteos,
            DiasMenstrual: updateData.DiasMenstrual,
            DiasOvulatorios: updateData.DiasOvulatorios,
            DiasPremenstruales: updateData.DiasPremenstruales,
            DiasSangrado: updateData.DiasSangrado,
            FecFinalizacionSangrado: updateData.FecFinalizacionSangrado,
            FechaInicioCiclo: updateData.FechaInicioCiclo,
            FecOvulacion: updateData.FecOvulacion,
            Ovulacion: updateData.Ovulacion,
          })
          .eq("IdCicloJugadora", data.IdCicloJugadora);

        if (updError) {
          console.error(
            "Error al actualizar campos derivados del ciclo:",
            updError
          );
        } else {
          try {
            const { data: cicloActualizado, error: selErr } = await supabase
              .from("Ciclo")
              .select(
                "DiaInicioCiclo, DiaFinMenstruacion, DiaFinFolicular, FecOvulacion, DiaFinLuteo, DiaFinPeriodo, IdUsuario"
              )
              .eq("IdCicloJugadora", data.IdCicloJugadora)
              .single();

            if (selErr || !cicloActualizado) {
              console.warn(
                "No se pudo leer el ciclo actualizado para indicador",
                selErr
              );
            } else {
              const indicador = getIndicador(new Date(), cicloActualizado);
              if (indicador != null) {
                await updateJugadora(cicloCreado.IdJugadora, {
                  Indicador: indicador,
                });
              } else {
                console.warn(
                  "No se pudo calcular el indicador: faltan datos de fechas en el ciclo"
                );
              }
            }
          } catch (indErr) {
            console.error(
              "Error al actualizar el indicador de la jugadora:",
              indErr
            );
          }
        }
      }
    } catch (calcErr) {
      console.error("Error en cálculos de ciclo:", calcErr);
    }

    return cicloCreado;
  } catch (error) {
    throw error;
  }
}
