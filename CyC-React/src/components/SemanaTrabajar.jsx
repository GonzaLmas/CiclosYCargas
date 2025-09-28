import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import {
  getTipoSemanaByPF,
  getCapacidadesByIds,
  getSubcapacidadesByIds,
} from "../services/TipoSemanaService";

const Competencia = () => {
  const { user, loading: authLoading } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [registros, setRegistros] = useState([]);
  const [fechas, setFechas] = useState([]);
  const [fechaCompetencia, setFechaCompetencia] = useState("");
  const [capMap, setCapMap] = useState({});
  const [subcapMap, setSubcapMap] = useState({});

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
        const data = await getTipoSemanaByPF(user.id);
        setRegistros(data);
        const fechasUnicas = Array.from(
          new Set(data.map((d) => d.FechaCompetencia))
        ).sort((a, b) => parseDate(b) - parseDate(a));
        setFechas(fechasUnicas);
        if (!fechaCompetencia && fechasUnicas.length > 0) {
          setFechaCompetencia(fechasUnicas[0]);
        }

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
  }, [user, authLoading]);

  const navigate = useNavigate();

  const handleVolver = (e) => {
    e.preventDefault();
    navigate("/navbar");
  };

  const handleChangeFecha = (e) => {
    setFechaCompetencia(e.target.value);
  };

  const parseDate = (str) => {
    if (!str) return new Date(NaN);
    const [y, m, d] = String(str)
      .split("-")
      .map((v) => parseInt(v, 10));
    if (!y || !m || !d) return new Date(str);
    return new Date(y, m - 1, d);
  };
  const formatDate = (date) =>
    date.toLocaleDateString("es-AR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });

  const registrosSeleccion = registros
    .filter((r) => r.FechaCompetencia === fechaCompetencia)
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
        {/* Selector de FechaCompetencia */}
        <label htmlFor="fechaCompetencia">
          Seleccione una fecha de competencia:
        </label>
        <select
          id="fechaCompetencia"
          value={fechaCompetencia}
          onChange={handleChangeFecha}
          className="select-input"
          disabled={loading}
        >
          {!fechaCompetencia && <option value="">Seleccione una fecha</option>}
          {fechas.map((fecha) => (
            <option key={fecha} value={fecha}>
              {formatDate(parseDate(fecha))}
            </option>
          ))}
        </select>

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
                    <h3>
                      Día -{d} | {formatDate(fechaDia)}
                    </h3>
                    <div className="field-group">
                      <label>Capacidad</label>
                      <p>
                        {(it.Capacidad && capMap[it.Capacidad]) ||
                          (it.Capacidad ? it.Capacidad : "No asignado")}
                      </p>
                    </div>
                    <div className="field-group">
                      <label>Subcapacidad</label>
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
          <button
            type="button"
            onClick={handleVolver}
            className="btn-back"
          >
            Volver
          </button>
        </div>
      </div>
    </div>
  );
};

export default Competencia;
