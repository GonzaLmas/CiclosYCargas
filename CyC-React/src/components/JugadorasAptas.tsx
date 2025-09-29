import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { getJugadorasAptas, type Jugadora } from "../services/JugadoraService";
import { getPFById } from "../services/PFService";
import { useAuth } from "../contexts/AuthContext";
import Arrow from "./Arrow";

type Dir = "up" | "right" | "down" | "upRight" | "downRight";
const dirByIndicador = (indicador: number | null | undefined): Dir | null => {
  if (indicador == null) return null;
  switch (indicador) {
    case 1:
      return "down";
    case 2:
      return "downRight";
    case 3:
      return "right";
    case 4:
      return "upRight";
    case 5:
      return "up";
    default:
      return null;
  }
};

export default function JugadorasAptas() {
  type JugadoraConNull = {
    [K in keyof Jugadora]: Jugadora[K] | null;
  };

  const [jugadoras, setJugadoras] = useState<JugadoraConNull[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const { user } = useAuth();
  type SortKey = "Indicador" | "Nombre" | "Apellido" | "Division";
  const [sortKey, setSortKey] = useState<SortKey>("Indicador");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");
  const SortIcon = ({ active, dir }: { active: boolean; dir: "asc" | "desc" }) => {
    const upClass = active && dir === "asc" ? "text-white" : "text-white/40";
    const downClass = active && dir === "desc" ? "text-white" : "text-white/40";
    return (
      <span className="flex flex-col leading-none">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="currentColor"
          className={`w-3 h-3 ${upClass}`}
        >
          <path d="M7 14l5-5 5 5H7z" />
        </svg>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="currentColor"
          className={`w-3 h-3 ${downClass}`}
        >
          <path d="M7 10l5 5 5-5H7z" />
        </svg>
      </span>
    );
  };

  useEffect(() => {
    const cargarJugadoras = async () => {
      if (!user?.id) return;
      try {
        const pf = await getPFById(user.id);
        if (!pf) {
          setJugadoras([]);
          setError("No se encontró el PF actual o no tiene club/división.");
          return;
        }

        const data = await getJugadorasAptas();
        const filtradas = (data || []).filter(
          (j) => j.IdClub === pf.IdClub && j.Division === pf.Division
        );
        setJugadoras(filtradas);
      } catch (err) {
        console.error("Error al cargar las jugadoras:", err);
        setError(
          "Error al cargar las jugadoras. Por favor, intente nuevamente."
        );
      } finally {
        setLoading(false);
      }
    };

    cargarJugadoras();
  }, [user?.id]);

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    navigate("/navbar");
  };
  const onSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDir((prev) => (prev === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      // Por defecto, "Indicador" en desc (mejor rendimiento primero); el resto en asc
      setSortDir(key === "Indicador" ? "desc" : "asc");
    }
  };

  const sortedJugadoras = useMemo(() => {
    const data = [...jugadoras];
    const dir = sortDir === "asc" ? 1 : -1;
    const getVal = (j: JugadoraConNull) => j[sortKey as keyof JugadoraConNull];
    data.sort((a, b) => {
      const va = getVal(a);
      const vb = getVal(b);
      // nulls al final
      if (va == null && vb == null) return 0;
      if (va == null) return 1;
      if (vb == null) return -1;

      if (sortKey === "Indicador") {
        const na = Number(va);
        const nb = Number(vb);
        if (na < nb) return -1 * dir;
        if (na > nb) return 1 * dir;
        return 0;
      }

      // Orden alfabético case-insensitive
      const sa = String(va).toLocaleLowerCase();
      const sb = String(vb).toLocaleLowerCase();
      return sa.localeCompare(sb) * dir;
    });
    return data;
  }, [jugadoras, sortKey, sortDir]);
  const renderContent = () => {
    if (loading) {
      return (
        <tr>
          <td colSpan={4} className="px-6 py-4 text-center">
            Cargando jugadoras...
          </td>
        </tr>
      );
    }

    if (error) {
      return (
        <tr>
          <td colSpan={4} className="px-6 py-4 text-center text-red-500">
            {error}
          </td>
        </tr>
      );
    }

    if (jugadoras.length === 0) {
      return (
        <tr>
          <td colSpan={4} className="px-6 py-4 text-center">
            No hay jugadoras disponibles
          </td>
        </tr>
      );
    }

    return sortedJugadoras.map((jugadora, index) => (
      <tr key={jugadora.IdJugadora || index} className="hover:bg-gray-800">
        <td className="px-6 py-4 whitespace-nowrap text-indigo-500 flex items-center gap-1">
          {(() => {
            const dir = dirByIndicador(
              jugadora.Indicador as number | null | undefined
            );
            return dir ? <Arrow direction={dir} /> : "-";
          })()}
        </td>
        <td className="px-6 py-4 whitespace-nowrap">
          {jugadora.Nombre || "-"}
        </td>
        <td className="px-6 py-4 whitespace-nowrap">
          {jugadora.Apellido || "-"}
        </td>
        <td className="px-6 py-4 whitespace-nowrap">
          {jugadora.Division || "-"}
        </td>
      </tr>
    ));
  };

  return (
    <div className="p-6 min-h-screen text-white">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-xl font-bold">Jugadoras Disponibles</h2>
        </div>
      </div>

      <div className="overflow-x-auto bg-gray-800 shadow-lg rounded-md overflow-hidden border border-indigo-500/60">
        <table className="min-w-full divide-y divide-gray-700">
          <thead
            style={{ backgroundColor: "#575dd0ff" }}
            className="text-white"
          >
            <tr>
              <th
                className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider cursor-pointer select-none"
                onClick={() => onSort("Indicador")}
                role="button"
                aria-label="Ordenar por rendimiento"
              >
                <span className="inline-flex items-center gap-2">
                  Rendimiento
                  <SortIcon
                    active={sortKey === "Indicador"}
                    dir={sortKey === "Indicador" ? sortDir : "asc"}
                  />
                </span>
              </th>
              <th
                className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider cursor-pointer select-none"
                onClick={() => onSort("Nombre")}
                role="button"
                aria-label="Ordenar por nombre"
              >
                <span className="inline-flex items-center gap-2">
                  Nombre
                  <SortIcon
                    active={sortKey === "Nombre"}
                    dir={sortKey === "Nombre" ? sortDir : "asc"}
                  />
                </span>
              </th>
              <th
                className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider cursor-pointer select-none"
                onClick={() => onSort("Apellido")}
                role="button"
                aria-label="Ordenar por apellido"
              >
                <span className="inline-flex items-center gap-2">
                  Apellido
                  <SortIcon
                    active={sortKey === "Apellido"}
                    dir={sortKey === "Apellido" ? sortDir : "asc"}
                  />
                </span>
              </th>
              <th
                className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider cursor-pointer select-none"
                onClick={() => onSort("Division")}
                role="button"
                aria-label="Ordenar por división"
              >
                <span className="inline-flex items-center gap-2">
                  División
                  <SortIcon
                    active={sortKey === "Division"}
                    dir={sortKey === "Division" ? sortDir : "asc"}
                  />
                </span>
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-700">{renderContent()}</tbody>
        </table>
      </div>
      <div className="mt-4 flex justify-center">
        <button onClick={handleClick} className="btn-back">
          Volver
        </button>
      </div>
    </div>
  );
}
