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

  const formatName = (value: string | null | undefined) => {
    if (!value) return "-";
    const t = String(value).trim();
    if (!t) return "-";
    return t
      .toLowerCase()
      .split(/\s+/)
      .map((w) => (w ? w.charAt(0).toUpperCase() + w.slice(1) : w))
      .join(" ");
  };

  const [jugadoras, setJugadoras] = useState<JugadoraConNull[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const { user } = useAuth();
  type SortKey = "Indicador" | "Nombre" | "Apellido" | "Division";
  const [sortKey, setSortKey] = useState<SortKey>("Indicador");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");
  const [page, setPage] = useState(1);
  const rowsPerPage = 10;
  const SortIcon = ({
    active,
    dir,
  }: {
    active: boolean;
    dir: "asc" | "desc";
  }) => {
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
      setSortDir(key === "Indicador" ? "desc" : "asc");
    }
    setPage(1);
  };

  const sortedJugadoras = useMemo(() => {
    const data = [...jugadoras];
    const dir = sortDir === "asc" ? 1 : -1;
    const getVal = (j: JugadoraConNull) => j[sortKey as keyof JugadoraConNull];
    data.sort((a, b) => {
      const va = getVal(a);
      const vb = getVal(b);

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

      const sa = String(va).toLocaleLowerCase();
      const sb = String(vb).toLocaleLowerCase();
      return sa.localeCompare(sb) * dir;
    });
    return data;
  }, [jugadoras, sortKey, sortDir]);

  const totalPages = useMemo(
    () => Math.max(1, Math.ceil(sortedJugadoras.length / rowsPerPage)),
    [sortedJugadoras.length]
  );
  const currentPage = Math.min(page, totalPages);
  const startIndex = (currentPage - 1) * rowsPerPage;
  const endIndex = startIndex + rowsPerPage;
  const pagedJugadoras = useMemo(
    () => sortedJugadoras.slice(startIndex, endIndex),
    [sortedJugadoras, startIndex, endIndex]
  );

  useEffect(() => {
    if (page > totalPages) setPage(totalPages);
  }, [totalPages, page]);
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

    return pagedJugadoras.map((jugadora, index) => (
      <tr key={jugadora.IdJugadora || index} className="hover:bg-gray-800">
        <td className="px-3 py-4 w-12 sm:w-14 md:w-16 whitespace-nowrap text-indigo-500 flex items-center justify-center gap-1">
          {(() => {
            const dir = dirByIndicador(
              jugadora.Indicador as number | null | undefined
            );
            return dir ? <Arrow direction={dir} /> : "-";
          })()}
        </td>
        <td className="px-6 py-4 whitespace-nowrap">
          {formatName(jugadora.Apellido as string | null | undefined)}
        </td>
        <td className="px-6 py-4 whitespace-nowrap">
          {formatName(jugadora.Nombre as string | null | undefined)}
        </td>
        <td className="px-6 py-4 whitespace-nowrap">
          {jugadora.Division || "-"}
        </td>
      </tr>
    ));
  };

  return (
    <div className="px-4 py-4 sm:p-6 min-h-screen text-white">
      <div className="flex justify-between items-center mb-2 sm:mb-4 md:mb-6">
        <div>
          <h2 className="text-xl font-bold">Jugadoras Disponibles</h2>
        </div>
      </div>

      <div className="overflow-x-auto bg-gray-800 shadow-lg rounded-md overflow-hidden border border-indigo-500/60">
        <table className="min-w-full table-fixed divide-y divide-gray-700">
          <thead
            style={{ backgroundColor: "#575dd0ff" }}
            className="text-white"
          >
            <tr>
              <th
                className="px-3 py-3 w-12 sm:w-14 md:w-16 text-left text-xs font-medium text-white uppercase tracking-wider cursor-pointer select-none"
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
      <div className="mt-2 sm:mt-4 flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <button
            className="px-3 py-1 rounded bg-indigo-600 disabled:bg-gray-600"
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            aria-label="Página anterior"
            title="Anterior"
          >
            <span aria-hidden="true">◀</span>
          </button>
          <span className="text-sm text-white/80">
            Página {currentPage} de {totalPages}
          </span>
          <button
            className="px-3 py-1 rounded bg-indigo-600 disabled:bg-gray-600"
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
            aria-label="Página siguiente"
            title="Siguiente"
          >
            <span aria-hidden="true">▶</span>
          </button>
        </div>
        <button onClick={handleClick} className="btn-back">
          Volver
        </button>
      </div>
    </div>
  );
}
