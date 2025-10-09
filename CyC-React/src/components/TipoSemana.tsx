"use client";

import { useState, useEffect } from "react";
import { ChevronDown, Calendar, Loader2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import {
  getCapacidades,
  getSubcapacidades,
  getPFData,
  createTipoSemana,
  type Capacidad,
  type Subcapacidad,
} from "../services/TipoSemanaService";
import "./TipoSemana.css";
import Alert from "./Alert";
import supabase from "../services/SupabaseService";
import {
  parseDate,
  getPreviousWeekday,
  formatYMD,
  formatDate,
} from "../services/DateUtils";

const TipoSemana = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{
    text: string;
    type: "success" | "error";
  } | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [competencyDate, setCompetencyDate] = useState(() => {
    const today = new Date();
    return today.toISOString().split("T")[0];
  });
  const [selectedWeek, setSelectedWeek] = useState<number | "">("");

  type SemanaExistente = {
    FechaEntrenamiento: string;
    FechaCompetencia: string;
    Capacidad: string | null;
    SubCapacidad: string | null;
  };
  type RegistroSemana = {
    Division: string;
    FechaCompetencia: string;
    FechaEntrenamiento: string;
    Capacidad: string | null;
    SubCapacidad: string | null;
    IdClub: string | null;
    IdPF: string;
  };
  const [existingSemana, setExistingSemana] = useState<
    SemanaExistente[] | null
  >(null);
  const [pendingRegistros, setPendingRegistros] = useState<
    RegistroSemana[] | null
  >(null);

  const [capacidades, setCapacidades] = useState<Capacidad[]>([]);
  const [subcapacidades, setSubcapacidades] = useState<
    Record<string, Subcapacidad[]>
  >({});
  const [dayCapacities, setDayCapacities] = useState<{ [key: number]: string }>(
    {}
  );
  const [dayProperties, setDayProperties] = useState<{ [key: number]: string }>(
    {}
  );

  const [pfData, setPfData] = useState<{
    idPF: string;
    idClub: string | null;
  } | null>(null);
  const [pfDivisions, setPfDivisions] = useState<string[]>([]);
  const [selectedDivision, setSelectedDivision] = useState<string>("");

  useEffect(() => {
    const cargarDatosIniciales = async () => {
      try {
        setLoading(true);
        const capacidadesData = await getCapacidades();
        setCapacidades(capacidadesData);

        if (user?.id) {
          const pfInfo = await getPFData(user.id);
          if (pfInfo) {
            const divisions = pfInfo.DivisionIds || [];
            if (divisions.length === 0) {
              console.warn("El PF no tiene divisiones asignadas");
              alert(
                "No se encontraron divisiones asignadas. Por favor, actualiza tu perfil."
              );
              return;
            }
            setPfData({
              idPF: pfInfo.IdUsuario,
              idClub: pfInfo.IdClub,
            });
            setPfDivisions(divisions);
            setSelectedDivision(divisions[0] || "");
          }
        }
      } catch (error) {
        console.error("Error al cargar datos iniciales:", error);
        alert("Error al cargar los datos iniciales");
      } finally {
        setLoading(false);
      }
    };

    cargarDatosIniciales();
  }, [user]);

  useEffect(() => {
    const cargarSubcapacidades = async () => {
      const newSubcapacidades: Record<string, Subcapacidad[]> = {};
      await Promise.all(
        capacidades.map(async (capacidad) => {
          const subs = await getSubcapacidades(capacidad.IdCapacidad);
          newSubcapacidades[capacidad.IdCapacidad] = subs;
        })
      );

      setSubcapacidades(newSubcapacidades);
    };
    if (capacidades.length > 0) {
      cargarSubcapacidades();
    }
  }, [capacidades]);

  const handleCapacityChange = (dayNum: number, value: string) => {
    setDayCapacities({ ...dayCapacities, [dayNum]: value });
    setDayProperties({ ...dayProperties, [dayNum]: "" });
  };
  const handlePropertyChange = (dayNum: number, value: string) => {
    setDayProperties({ ...dayProperties, [dayNum]: value });
  };
  const handleGuardar = async () => {
    if (!selectedWeek) {
      setMessage({ text: "Por favor, seleccione una semana", type: "error" });
      return;
    }

    const missing: string[] = [];
    for (let i = 1; i <= selectedWeek; i++) {
      const cap = dayCapacities[i];
      const prop = dayProperties[i];
      if (!cap || cap.trim() === "") missing.push(`Día -${i} (Capacidad)`);
      if (!prop || prop.trim() === "") missing.push(`Día -${i} (Subcapacidad)`);
    }
    if (missing.length > 0) {
      setMessage({
        text: `Complete todos los campos antes de guardar. Faltan: ${missing.join(
          ", "
        )}`,
        type: "error",
      });
      return;
    }

    setSaving(true);
    setIsLoading(true);
    setMessage(null);

    try {
      if (!pfData) {
        setMessage({
          text: "No se encontraron los datos del preparador físico",
          type: "error",
        });
        return;
      }
      if (!selectedDivision) {
        setMessage({
          text: "Seleccione una división",
          type: "error",
        });
        return;
      }

      const registros: RegistroSemana[] = [];

      for (let i = 1; i <= selectedWeek; i++) {
        const capacitiesId = dayCapacities[i];
        const subcapacidadId = dayProperties[i];

        const fechaEntrenamiento = getPreviousWeekday(
          new Date(parseDate(competencyDate)),
          i
        );

        registros.push({
          Division: selectedDivision,
          FechaCompetencia: competencyDate,
          FechaEntrenamiento: formatYMD(fechaEntrenamiento),
          Capacidad: capacitiesId || null,
          SubCapacidad: subcapacidadId || null,
          IdClub: pfData.idClub,
          IdPF: pfData.idPF,
        });
      }

      const fechas = registros.map((r) => r.FechaEntrenamiento);
      const { data: existentes, error: selError } = await supabase
        .from("TipoSemana")
        .select("FechaEntrenamiento, FechaCompetencia, Capacidad, SubCapacidad")
        .eq("IdPF", pfData.idPF)
        .eq("Division", selectedDivision)
        .eq("FechaCompetencia", competencyDate)
        .in("FechaEntrenamiento", fechas)
        .order("FechaEntrenamiento", { ascending: true });

      if (selError) throw selError;

      if (existentes && existentes.length > 0) {
        setExistingSemana(existentes as any);
        setPendingRegistros(registros);
        setSaving(false);
        setIsLoading(false);
        return;
      }

      await createTipoSemana(registros);

      setDayCapacities({});
      setDayProperties({});
      setSelectedWeek("");

      setMessage({ text: "Semana guardada correctamente", type: "success" });
      setTimeout(() => setMessage(null), 3000);
    } catch (error) {
      console.error("Error al guardar la semana:", error);
      setMessage({
        text:
          error instanceof Error ? error.message : "Error al guardar la semana",
        type: "error",
      });
    } finally {
      setSaving(false);
      setIsLoading(false);
    }
  };

  const handleKeepExistingSemana = () => {
    setMessage({
      text: "Se mantuvieron los registros previamente cargados para estas fechas.",
      type: "success",
    });
    setExistingSemana(null);
    setPendingRegistros(null);
  };

  const handleReplaceExistingSemana = async () => {
    if (!pfData || !pendingRegistros) return;
    try {
      setSaving(true);
      setIsLoading(true);

      const { error: delError } = await supabase
        .from("TipoSemana")
        .delete()
        .eq("IdPF", pfData.idPF)
        .eq("Division", selectedDivision)
        .eq("FechaCompetencia", competencyDate);
      if (delError) throw delError;

      await createTipoSemana(
        pendingRegistros.map((r: RegistroSemana) => ({
          Division: selectedDivision,
          FechaCompetencia: r.FechaCompetencia,
          FechaEntrenamiento: r.FechaEntrenamiento,
          Capacidad: r.Capacidad,
          SubCapacidad: r.SubCapacidad,
          IdClub: r.IdClub ?? null,
          IdPF: r.IdPF,
        }))
      );

      setExistingSemana(null);
      setPendingRegistros(null);
      setDayCapacities({});
      setDayProperties({});
      setSelectedWeek("");
      setMessage({ text: "Semana actualizada correctamente", type: "success" });
      setTimeout(() => setMessage(null), 3000);
    } catch (err) {
      console.error("[TipoSemana] Replace error", err);
      setMessage({
        text:
          err instanceof Error
            ? err.message
            : "No se pudo actualizar la semana",
        type: "error",
      });
    } finally {
      setSaving(false);
      setIsLoading(false);
    }
  };

  const navigate = useNavigate();

  const handleVolver = (e: React.MouseEvent<HTMLElement>) => {
    e.preventDefault();
    navigate("/navbar");
  };

  return (
    <div className="competency-form">
      <div className="form-header">
        <div className="field-group">
          <label htmlFor="division-select">División</label>
          <div className="select-wrapper">
            <select
              id="division-select"
              value={selectedDivision}
              onChange={(e) => setSelectedDivision(e.target.value)}
              disabled={pfDivisions.length === 0 || isLoading}
              className="select-input"
            >
              {!selectedDivision && <option value="">Seleccione división</option>}
              {pfDivisions.map((divId) => (
                <option key={divId} value={divId}>
                  {divId}
                </option>
              ))}
            </select>
            <ChevronDown className="select-icon" size={20} />
          </div>
        </div>
        <div className="field-group">
          <label
            htmlFor="competency-date"
            className="font-weight: 500 color: rgba(255, 255, 255, 0.87) font-size: 0.95rem"
          >
            Fecha de Competencia
          </label>
          <div className="date-input-wrapper">
            <input
              id="competency-date"
              type="date"
              value={competencyDate}
              onChange={(e) => {
                setCompetencyDate(e.target.value);
                setSelectedWeek("");
              }}
              className="date-input"
            />
            {/* <Calendar className="date-icon" size={20} /> */}
          </div>
        </div>

        <div className="field-group">
          <label htmlFor="week-select">Semana</label>
          <div className="select-wrapper">
            <select
              id="week-select"
              value={selectedWeek}
              onChange={(e) => {
                const val = e.target.value;
                setSelectedWeek(val === "" ? "" : Number(val));
              }}
              disabled={!competencyDate || isLoading}
              className="select-input"
            >
              {!selectedWeek && <option value="">Seleccione semana</option>}
              {Array.from({ length: 13 }, (_, i) => (
                <option key={i + 1} value={i + 1}>
                  Semana {i + 1}
                </option>
              ))}
            </select>
            <ChevronDown className="select-icon" size={20} />
          </div>
        </div>
      </div>

      <div className="days-grid">
        {selectedWeek &&
          Array.from({ length: selectedWeek }, (_, i) => {
            const dayNum = i + 1;
            const fechaDia = getPreviousWeekday(
              new Date(parseDate(competencyDate)),
              dayNum
            );

            return (
              <div key={dayNum} className="day-card">
                <h3>
                  Día -{dayNum} | {formatDate(fechaDia)}
                </h3>

                <div className="field-group">
                  <label style={{ color: "#6e74e1" }}>CAPACIDAD</label>
                  <div className="select-wrapper">
                    <select
                      value={dayCapacities[dayNum] || ""}
                      onChange={(e) =>
                        handleCapacityChange(dayNum, e.target.value)
                      }
                      className="select-input select-capacidad"
                      disabled={loading}
                    >
                      <option value="">Seleccione una capacidad</option>
                      {capacidades.map((cap) => (
                        <option key={cap.IdCapacidad} value={cap.IdCapacidad}>
                          {cap.Nombre}
                        </option>
                      ))}
                    </select>
                    <ChevronDown className="select-icon" size={20} />
                  </div>
                </div>

                <div className="field-group">
                  <label style={{ color: "#6e74e1" }}>SUBCAPACIDAD</label>
                  <div className="select-wrapper">
                    <select
                      value={dayProperties[dayNum] || ""}
                      onChange={(e) =>
                        handlePropertyChange(dayNum, e.target.value)
                      }
                      className="select-input select-propiedad"
                      disabled={!dayCapacities[dayNum] || loading}
                    >
                      <option value="">Seleccione una subcapacidad</option>
                      {dayCapacities[dayNum] &&
                        subcapacidades[dayCapacities[dayNum]]?.map((sub) => (
                          <option
                            key={sub.IdSubCapacidad}
                            value={sub.IdSubCapacidad}
                          >
                            {sub.Nombre}
                          </option>
                        ))}
                    </select>
                    <ChevronDown className="select-icon" size={20} />
                  </div>
                </div>
              </div>
            );
          })}
      </div>

      {message && <Alert type={message.type}>{message.text}</Alert>}

      {existingSemana && (
        <div className="mt-4 p-4 rounded" style={{ background: "#1f2937" }}>
          <p>
            Ya existen registros para la fecha de competencia{" "}
            {formatDate(new Date(parseDate(competencyDate)))} en los siguientes
            días:
          </p>
          <ul className="list-disc pl-6 mt-2">
            {existingSemana.map((e: SemanaExistente) => (
              <li key={e.FechaEntrenamiento}>
                {formatDate(new Date(parseDate(e.FechaEntrenamiento)))}
              </li>
            ))}
          </ul>
          <p className="mt-2">
            ¿Desea mantener los registros existentes o reemplazarlos por los
            nuevos valores?
          </p>
          <div className="flex gap-3 mt-3">
            <button
              type="button"
              className="px-3 py-1 rounded text-white bg-indigo-500 hover:bg-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-300 disabled:opacity-50"
              onClick={handleKeepExistingSemana}
              disabled={saving}
            >
              Mantener
            </button>
            <button
              type="button"
              className="px-3 py-1 rounded text-white bg-indigo-700 hover:bg-indigo-600 focus:outline-none focus:ring-2 focus:ring-indigo-400 disabled:opacity-50"
              onClick={handleReplaceExistingSemana}
              disabled={saving}
            >
              Reemplazar
            </button>
          </div>
        </div>
      )}

      <div className="form-actions">
        <button
          type="button"
          onClick={handleGuardar}
          className="btn-action flex items-center gap-2"
          disabled={!selectedWeek || loading || saving || isLoading}
        >
          {saving ? (
            <>
              <Loader2 className="animate-spin h-4 w-4" />
              Guardando...
            </>
          ) : (
            "Guardar Semana"
          )}
        </button>
        <button type="button" onClick={handleVolver} className="btn-back">
          Volver
        </button>
      </div>
    </div>
  );
};

export default TipoSemana;
