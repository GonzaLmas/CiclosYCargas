import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import type { Jugadora } from "../services/JugadoraService";
import { getEsfuerzoDataForPF } from "../services/JugadorasEsfuerzo";

type EsfuerzoMap = Record<string, number | null>;

export default function JugadorasEsfuerzo() {
  type JugadoraConNull = {
    [K in keyof Jugadora]: Jugadora[K] | null;
  };
  const formatDateTime = (iso?: string | null) => {
    if (!iso) return "-";
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return "-";
    return d.toLocaleString("es-AR", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    });
  };

  const [jugadoras, setJugadoras] = useState<JugadoraConNull[]>([]);
  const [esfuerzoById, setEsfuerzoById] = useState<EsfuerzoMap>({});
  const [fechaById, setFechaById] = useState<Record<string, string | null>>({});
  const [totalSemanaById, setTotalSemanaById] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const rowsPerPage = 10;

  const { user } = useAuth();
  const navigate = useNavigate();

  type SortKey = "Esfuerzo" | "Total" | "Nombre" | "Apellido" | "Division" | "FechaCarga";
  const [sortKey, setSortKey] = useState<SortKey>("Esfuerzo");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");
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
  useEffect(() => {
    const cargar = async () => {
      if (!user?.id) return;
      setLoading(true);
      setError(null);
      try {
        const { jugadoras, esfuerzoById, fechaById, totalSemanaById } = await getEsfuerzoDataForPF(user.id);
        setJugadoras(jugadoras as any);
        setEsfuerzoById(esfuerzoById);
        setFechaById(fechaById);
        setTotalSemanaById(totalSemanaById);
      } catch (err: any) {
        console.error("Error al cargar Esfuerzo:", err);
        setError("Error al cargar la información. Por favor, intente nuevamente.");
      } finally {
        setLoading(false);
      }
    };
    cargar();
  }, [user?.id]);

  const onSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDir((prev) => (prev === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDir(key === "Esfuerzo" || key === "Total" ? "desc" : "asc");
    }
    setPage(1);
  };

  const sortedJugadoras = useMemo(() => {
    const data = [...jugadoras];
    const dir = sortDir === "asc" ? 1 : -1;

    data.sort((a, b) => {
      if (sortKey === "Esfuerzo") {
        const aId = a.IdJugadora ?? undefined;
        const bId = b.IdJugadora ?? undefined;
        const va = aId ? esfuerzoById[aId] ?? null : null;
        const vb = bId ? esfuerzoById[bId] ?? null : null;
        if (va == null && vb == null) return 0;
        if (va == null) return 1;
        if (vb == null) return -1;
        if (va < vb) return -1 * dir;
        if (va > vb) return 1 * dir;
        return 0;
      }
      if (sortKey === "Total") {
        const aId = a.IdJugadora ?? undefined;
        const bId = b.IdJugadora ?? undefined;
        const va = aId ? totalSemanaById[aId] ?? null : null;
        const vb = bId ? totalSemanaById[bId] ?? null : null;
        if (va == null && vb == null) return 0;
        if (va == null) return 1;
        if (vb == null) return -1;
        if (va < vb) return -1 * dir;
        if (va > vb) return 1 * dir;
        return 0;
      }
      if (sortKey === "FechaCarga") {
        const aId = a.IdJugadora ?? "";
        const bId = b.IdJugadora ?? "";
        const fechaA = fechaById[aId] ? new Date(fechaById[aId] as string).getTime() : 0;
        const fechaB = fechaById[bId] ? new Date(fechaById[bId] as string).getTime() : 0;
        if (fechaA < fechaB) return -1 * dir;
        if (fechaA > fechaB) return 1 * dir;
        return 0;
      }

      const get = (j: JugadoraConNull) =>
        String(j[sortKey as keyof JugadoraConNull] ?? "").toLocaleLowerCase();
      const sa = get(a);
      const sb = get(b);
      return sa.localeCompare(sb) * dir;
    });

    return data;
  }, [jugadoras, esfuerzoById, sortKey, sortDir]);

  const esfuerzoBadgeClass = (v: number | null | undefined) => {
    if (v == null) return "text-white/70";
    if (v >= 8) return "bg-red-600 text-white";
    if (v >= 4) return "bg-yellow-400 text-gray-900";
    return "bg-green-600 text-white";
  };

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

  const renderBody = () => {
    if (loading) {
      return (
        <tr>
          <td colSpan={6} className="px-6 py-4 text-center">
            Cargando jugadoras...
          </td>
        </tr>
      );
    }
    if (error) {
      return (
        <tr>
          <td colSpan={6} className="px-6 py-4 text-center text-red-500">
            {error}
          </td>
        </tr>
      );
    }
    if (jugadoras.length === 0) {
      return (
        <tr>
          <td colSpan={6} className="px-6 py-4 text-center">
            No hay jugadoras disponibles
          </td>
        </tr>
      );
    }

    return pagedJugadoras.map((j, i) => (
      <tr key={j.IdJugadora || i} className="hover:bg-gray-800">
        <td className="px-3 py-4 w-12 sm:w-14 md:w-16 whitespace-nowrap text-indigo-500 text-center">
          {(() => {
            const val =
              j.IdJugadora != null ? esfuerzoById[j.IdJugadora] : null;
            if (val == null) return "-";
            return (
              <span
                className={`inline-block min-w-[1.5rem] px-2 py-0.5 rounded text-xs font-semibold ${esfuerzoBadgeClass(
                  val
                )}`}
                title={`Esfuerzo: ${val}`}
              >
                {val}
              </span>
            );
          })()}
        </td>
        <td className="px-6 py-4 whitespace-nowrap text-center">
          {j.IdJugadora != null && totalSemanaById[j.IdJugadora] != null
            ? totalSemanaById[j.IdJugadora]
            : "-"}
        </td>
        <td className="px-6 py-4 whitespace-nowrap">
          {formatName(j.Apellido as string | null | undefined)}
        </td>
        <td className="px-6 py-4 whitespace-nowrap">
          {formatName(j.Nombre as string | null | undefined)}
        </td>
        <td className="px-6 py-4 whitespace-nowrap">
          {j.IdJugadora ? formatDateTime(fechaById[j.IdJugadora] ?? null) : "-"}
        </td>
        <td className="px-6 py-4 whitespace-nowrap">{j.Division || "-"}</td>
      </tr>
    ));
  };

  return (
    <div className="px-4 py-4 sm:p-6 min-h-screen text-white">
      <div className="flex justify-between items-center mb-2 sm:mb-4 md:mb-6">
        <div>
          <h2 className="text-xl font-bold">Percepción del Entrenamiento</h2>
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
                onClick={() => onSort("Esfuerzo")}
                role="button"
                aria-label="Ordenar por esfuerzo"
              >
                <span className="inline-flex items-center gap-2">
                  Esfuerzo
                  <SortIcon
                    active={sortKey === "Esfuerzo"}
                    dir={sortKey === "Esfuerzo" ? sortDir : "asc"}
                  />
                </span>
              </th>
              <th
                className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider cursor-pointer select-none"
                onClick={() => onSort("Total")}
                role="button"
                aria-label="Ordenar por total semanal"
              >
                <span className="inline-flex items-center gap-2">
                  Total Semanal
                  <SortIcon
                    active={sortKey === "Total"}
                    dir={sortKey === "Total" ? sortDir : "asc"}
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
                onClick={() => onSort("FechaCarga")}
                role="button"
                aria-label="Ordenar por fecha de carga"
              >
                <span className="inline-flex items-center gap-2">
                  Fecha de Carga
                  <SortIcon
                    active={sortKey === "FechaCarga"}
                    dir={sortKey === "FechaCarga" ? sortDir : "desc"}
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
          <tbody className="divide-y divide-gray-700">{renderBody()}</tbody>
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
        <button onClick={() => navigate("/navbar")} className="btn-back">
          Volver
        </button>
      </div>
    </div>
  );
}
