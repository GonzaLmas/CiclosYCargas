import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import {
  getTipoSemanaByPF,
  getCapacidadesByIds,
  getSubcapacidadesByIds,
  getPFData,
} from "../services/TipoSemanaService";
import {
  parseDate,
  isWeekday,
  formatDateWithDayName,
  formatDateShortEs,
} from "../services/DateUtils";

const Competencia = () => {
  const { user, loading: authLoading } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [registros, setRegistros] = useState([]);
  const [fechas, setFechas] = useState([]);
  const [fechaCompetencia, setFechaCompetencia] = useState("");
  const [capMap, setCapMap] = useState({});
  const [subcapMap, setSubcapMap] = useState({});
  const [pfDivisions, setPfDivisions] = useState([]);
  const [selectedDivision, setSelectedDivision] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      if (authLoading) return;
      if (!user?.id) {
        setLoading(false);
        setRegistros([]);
        return;
      }
      try {
        setLoading(true);
        setError("");
        const [data, pfInfo, capSubMaps] = await Promise.all([
          getTipoSemanaByPF(user.id),
          getPFData(user.id),
          (async () => {
            return { cap: {}, sub: {} };
          })(),
        ]);
        setRegistros(data);
        if (pfInfo && Array.isArray(pfInfo.DivisionIds)) {
          setPfDivisions(pfInfo.DivisionIds);
        }

        const base =
          (selectedDivision
            ? data.filter((d) => d.Division === selectedDivision)
            : data) || [];
        const fechasUnicas = Array.from(
          new Set(base.map((d) => d.FechaCompetencia))
        )
          .filter(Boolean)
          .sort((a, b) => parseDate(b) - parseDate(a));

        setFechas(fechasUnicas);

        const capIds = Array.from(
          new Set(data.map((d) => d.Capacidad).filter(Boolean))
        );
        const subcapIds = Array.from(
          new Set(data.map((d) => d.SubCapacidad).filter(Boolean))
        );
        const [capMapResp, subcapMapResp] = await Promise.all([
          getCapacidadesByIds(capIds),
          getSubcapacidadesByIds(subcapIds),
        ]);
        setCapMap(capMapResp);
        setSubcapMap(subcapMapResp);
      } catch (e) {
        setError(e?.message || "Error al cargar datos");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [user, authLoading, selectedDivision]);

  const navigate = useNavigate();

  const handleVolver = (e) => {
    e.preventDefault();
    navigate("/navbar");
  };

  const handleChangeFecha = (e) => {
    const selectedValue = e.target.value;
    console.log("Selected date:", selectedValue);
    setFechaCompetencia(selectedValue);
  };

  const registrosSeleccion = registros
    .filter((r) => !selectedDivision || r.Division === selectedDivision)
    .filter((r) => r.FechaCompetencia === fechaCompetencia)
    .filter((r) => isWeekday(parseDate(r.FechaEntrenamiento)))
    .sort(
      (a, b) =>
        parseDate(a.FechaEntrenamiento) - parseDate(b.FechaEntrenamiento)
    );

  const diffDias = (fCompetenciaStr, fEntrenoStr) => {
    const fc = parseDate(fCompetenciaStr);
    const fe = parseDate(fEntrenoStr);
    const diff = Math.round((fc - fe) / (1000 * 60 * 60 * 24));
    return diff;
  };

  return (
    <div className="competency-form">
      <div className="field-group">
        {/* Selector de División */}
        <label htmlFor="divisionSelect">División</label>
        <div className="select-wrapper">
          <select
            id="divisionSelect"
            value={selectedDivision}
            onChange={(e) => {
              setSelectedDivision(e.target.value);
              setFechaCompetencia("");
            }}
            className="select-input"
            disabled={loading || !pfDivisions.length}
          >
            {!selectedDivision && (
              <option value="">Seleccione la división</option>
            )}
            {pfDivisions.map((d) => (
              <option key={d} value={d}>
                {d}
              </option>
            ))}
          </select>
          <svg
            className="select-icon"
            xmlns="http://www.w3.org/2000/svg"
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <polyline points="6 9 12 15 18 9"></polyline>
          </svg>
        </div>
      </div>
      <div className="field-group">
        {/* Selector de FechaCompetencia */}
        <label htmlFor="fechaCompetencia">
          Seleccione una fecha de competencia:
        </label>
        <div className="select-wrapper">
          <select
            id="fechaCompetencia"
            value={fechaCompetencia || ""}
            onChange={handleChangeFecha}
            className="select-input"
            disabled={loading || !selectedDivision || !fechas.length}
          >
            {!selectedDivision ? (
              <option value="">Seleccione la división</option>
            ) : !fechas.length ? (
              <option value="">Cargando fechas...</option>
            ) : !fechaCompetencia ? (
              <option value="">Seleccione la fecha de competencia</option>
            ) : null}
            {fechas.map((fecha) => {
              if (!fecha) return null;
              const date = parseDate(fecha);
              const formattedDate = formatDateShortEs(date);
              return (
                <option key={fecha} value={fecha}>
                  {formattedDate}
                </option>
              );
            })}
          </select>
          <svg
            className="select-icon"
            xmlns="http://www.w3.org/2000/svg"
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <polyline points="6 9 12 15 18 9"></polyline>
          </svg>
        </div>

        {loading && <p>Cargando...</p>}
        {error && <p style={{ color: "red" }}>{error}</p>}

        {!loading && !error && fechaCompetencia && (
          <div className="days-grid mt-4">
            {registrosSeleccion.length === 0 ? (
              <p>No hay entrenamientos para la fecha seleccionada.</p>
            ) : (
              registrosSeleccion.map((it, idx) => {
                const d = diffDias(it.FechaCompetencia, it.FechaEntrenamiento);
                const fechaDia = parseDate(it.FechaEntrenamiento);
                return (
                  <div key={idx} className="day-card">
                    <h3>{formatDateWithDayName(fechaDia)}</h3>
                    <div className="field-group">
                      <label className="uppercase" style={{ color: "#6e74e1" }}>
                        Capacidad
                      </label>
                      <p className="">
                        {(it.Capacidad && capMap[it.Capacidad]) ||
                          (it.Capacidad ? it.Capacidad : "No asignado")}
                      </p>
                    </div>
                    <div className="field-group">
                      <label className="uppercase" style={{ color: "#6e74e1" }}>
                        Subcapacidad
                      </label>
                      <p>
                        {(it.SubCapacidad && subcapMap[it.SubCapacidad]) ||
                          (it.SubCapacidad ? it.SubCapacidad : "No asignado")}
                      </p>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        )}

        <div className="form-actions">
          <button type="button" onClick={handleVolver} className="btn-back">
            Volver
          </button>
        </div>
      </div>
    </div>
  );
};

export default Competencia;
