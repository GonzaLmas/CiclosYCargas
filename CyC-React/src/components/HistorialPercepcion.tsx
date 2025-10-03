import { useEffect, useMemo, useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import type { Jugadora } from "../services/JugadoraService";
import {
  getJugadorasParaPF,
  getPercepcionHistorial,
  getMonthRangeBA,
} from "../services/JugadorasEsfuerzo";
import {
  formatName,
  getMonthLabelCapitalized,
  getDaysInMonth,
  mapItemsToCalendarTMinus1,
  shiftMonth,
} from "../services/HistorialPercepcion";

export default function HistorialPercepcion() {
  const { user, role } = useAuth();
  const navigate = useNavigate();

  const [jugadoras, setJugadoras] = useState<Jugadora[]>([]);
  const [jugadoraSel, setJugadoraSel] = useState<string>("");

  const today = new Date();
  const [year, setYear] = useState<number>(today.getFullYear());
  const [month0, setMonth0] = useState<number>(today.getMonth());

  const [items, setItems] = useState<
    Array<{ FechaCarga: string; VariableE: number | null }>
  >([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (role !== "PF") {
      navigate("/navbar", { replace: true });
      return;
    }
  }, [role, navigate]);

  useEffect(() => {
    const load = async () => {
      if (!user?.id) return;
      try {
        const js = await getJugadorasParaPF(user.id);
        setJugadoras(js);
        if (js.length && !jugadoraSel) setJugadoraSel(js[0].IdJugadora || "");
      } catch (e: any) {
        setError(e?.message || "Error cargando jugadoras");
      }
    };
    load();
  }, [user?.id]);

  const monthLabel = useMemo(
    () => getMonthLabelCapitalized(year, month0),
    [year, month0]
  );

  const daysInMonth = useMemo(
    () => getDaysInMonth(year, month0),
    [year, month0]
  );

  useEffect(() => {
    const loadHist = async () => {
      if (!jugadoraSel) return;
      setLoading(true);
      setError(null);
      try {
        const { startISO, endISO } = getMonthRangeBA(year, month0);
        const endPlus1ISO = new Date(
          new Date(endISO).getTime() + 24 * 3600 * 1000
        ).toISOString();
        const data = await getPercepcionHistorial(
          jugadoraSel,
          startISO,
          endPlus1ISO
        );
        setItems(data);
      } catch (e: any) {
        setError(e?.message || "Error cargando historial");
      } finally {
        setLoading(false);
      }
    };
    loadHist();
  }, [jugadoraSel, year, month0]);

  const mapByDay = useMemo(
    () => mapItemsToCalendarTMinus1(items, year, month0),
    [items, year, month0]
  );

  const changeMonth = (delta: number) => {
    const next = shiftMonth(year, month0, delta);
    setYear(next.year);
    setMonth0(next.month0);
  };

  return (
    <div className="px-4 py-4 sm:p-6 min-h-screen text-white">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold">Historial de Percepción</h2>
        <button
          onClick={() => navigate("/jugadorasaptas")}
          className="btn-back sm:hidden"
        >
          Volver
        </button>
      </div>

      <div className="bg-gray-800 border border-indigo-500/60 rounded-md p-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-4">
          <div className="flex-1">
            <label className="block text-sm mb-1 sm:sr-only">Jugadora</label>
            <select
              className="w-full bg-gray-900 border border-gray-700 rounded p-2"
              value={jugadoraSel}
              onChange={(e) => setJugadoraSel(e.target.value)}
            >
              {jugadoras.map((j) => (
                <option key={j.IdJugadora} value={j.IdJugadora || ""}>
                  {formatName(j.Apellido)} {formatName(j.Nombre)}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-2">
            <button
              className="px-3 py-1 rounded bg-indigo-600"
              onClick={() => changeMonth(-1)}
              aria-label="Mes anterior"
            >
              ◀
            </button>
            <div className="min-w-[10rem] text-center font-semibold">
              {monthLabel}
            </div>
            <button
              className="px-3 py-1 rounded bg-indigo-600"
              onClick={() => changeMonth(1)}
              aria-label="Mes siguiente"
            >
              ▶
            </button>
          </div>
        </div>

        <div className="mt-4">
          {error && <div className="text-red-400 mb-2">{error}</div>}
          {loading ? (
            <div className="text-center py-6">Cargando...</div>
          ) : (
            <div>
              {/* Encabezados de días (desktop) */}
              <div className="hidden sm:grid grid-cols-7 gap-2 text-center text-white/70 text-xs mb-2">
                <div>Lun</div>
                <div>Mar</div>
                <div>Mié</div>
                <div>Jue</div>
                <div>Vie</div>
                <div>Sáb</div>
                <div>Dom</div>
              </div>

              {/* Grid responsive: 3 cols en mobile, 7 en sm+ */}
              <div className="grid grid-cols-3 sm:grid-cols-7 gap-2">
                {Array.from({ length: daysInMonth }, (_, i) => i + 1).map(
                  (day) => {
                    const val = mapByDay.get(day);
                    const badge = val == null ? "-" : String(val);
                    const color =
                      val == null
                        ? "border-gray-700 text-white/70"
                        : val >= 8
                        ? "bg-red-600 text-white"
                        : val >= 4
                        ? "bg-yellow-400 text-gray-900"
                        : "bg-green-600 text-white";

                    const isToday =
                      today.getDate() === day &&
                      today.getMonth() === month0 &&
                      today.getFullYear() === year;

                    return (
                      <div
                        key={day}
                        className={`rounded border-2 p-2 flex flex-col items-center justify-center min-h-[64px] ${
                          isToday
                            ? "border-[#f86d92] shadow-lg shadow-[#f86d92]/30"
                            : "border-gray-700"
                        }`}
                      >
                        <div className="text-xs text-white/70">{day}</div>
                        <div
                          className={`mt-1 inline-flex items-center justify-center min-w-[1.75rem] px-2 py-0.5 rounded text-xs font-semibold ${
                            val == null ? "" : color
                          }`}
                        >
                          {badge}
                        </div>
                      </div>
                    );
                  }
                )}
              </div>

              {/* Leyenda */}
              <div className="mt-3 flex flex-wrap items-center gap-3 text-xs text-white/80">
                <span className="inline-flex items-center gap-1">
                  <span className="inline-block w-3 h-3 rounded bg-green-600" />{" "}
                  Baja
                </span>
                <span className="inline-flex items-center gap-1">
                  <span className="inline-block w-3 h-3 rounded bg-yellow-400" />{" "}
                  Media
                </span>
                <span className="inline-flex items-center gap-1">
                  <span className="inline-block w-3 h-3 rounded bg-red-600" />{" "}
                  Alta
                </span>
                <span className="inline-flex items-center gap-1">
                  <span className="inline-block w-3 h-3 rounded bg-gray-700" />{" "}
                  Sin dato
                </span>
              </div>
            </div>
          )}
        </div>
      </div>
      {/* Botón Volver inferior (solo escritorio, por fuera de la grid) */}
      <div className="hidden sm:flex justify-center mt-4">
        <button onClick={() => navigate("/navbar")} className="btn-back">
          Volver
        </button>
      </div>
    </div>
  );
}
