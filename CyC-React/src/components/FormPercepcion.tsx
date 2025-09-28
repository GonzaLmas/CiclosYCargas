import { useState, type ChangeEvent, type FormEvent } from "react";
import supabase from "../services/SupabaseService";
import { useAuth } from "../contexts/AuthContext";
import Alert from "./Alert";
import { useNavigate } from "react-router-dom";

interface FormData {
  VariableE: string;
}

type VariableRow = {
  IdUsuario: string;
  FechaCarga: string;
  VariableE: number;
};

export default function FormPercepcionEsfuerzo() {
  const [formData, setFormData] = useState<FormData>({ VariableE: "" });
  const { user } = useAuth();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [ok, setOk] = useState<string | null>(null);
  const [existingToday, setExistingToday] = useState<VariableRow | null>(null);
  const [pendingValue, setPendingValue] = useState<number | null>(null);

  const navigate = useNavigate();

  const handleChange = (e: ChangeEvent<HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setOk(null);

    try {
      if (!user?.id) {
        setError("Sesión no encontrada. Inicie sesión para continuar.");
        return;
      }

      const missing: string[] = [];
      if (!formData.VariableE || String(formData.VariableE).trim() === "") {
        missing.push("Valor de esfuerzo (1-10)");
      }
      if (missing.length > 0) {
        setError(
          `Complete todos los campos antes de enviar. Faltan: ${missing.join(
            ", "
          )}`
        );
        return;
      }

      setSubmitting(true);
      const today = new Date();
      const start = new Date(
        today.getFullYear(),
        today.getMonth(),
        today.getDate(),
        0,
        0,
        0,
        0
      ).toISOString();
      const end = new Date(
        today.getFullYear(),
        today.getMonth(),
        today.getDate() + 1,
        0,
        0,
        0,
        0
      ).toISOString();

      const { data: existing, error: selError } = await supabase
        .from("Variables")
        .select("IdUsuario, FechaCarga, VariableE")
        .eq("IdUsuario", user.id)
        .gte("FechaCarga", start)
        .lt("FechaCarga", end)
        .order("FechaCarga", { ascending: false })
        .limit(1);

      if (selError) throw selError;

      const value = Number(formData.VariableE);
      if (existing && existing.length > 0) {
        setExistingToday(existing[0] as VariableRow);
        setPendingValue(value);
        setOk(null);
        setError(null);
        return;
      }

      const payload = {
        IdUsuario: user.id,
        VariableE: value,
      } as const;

      const { error: insertError } = await supabase
        .from("Variables")
        .insert(payload);

      if (insertError) throw insertError;

      setOk("Respuesta registrada correctamente.");
      setFormData({ VariableE: "" });
    } catch (err: any) {
      setError(err?.message || "Error al registrar la respuesta.");
    } finally {
      setSubmitting(false);
    }
  };

  const formatDateTime = (iso: string) => {
    const d = new Date(iso);
    return d.toLocaleString("es-AR", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const handleKeepExisting = () => {
    setOk("Se mantuvo el valor previamente cargado para hoy.");
    setExistingToday(null);
    setPendingValue(null);
  };

  const handleModifyExisting = async () => {
    if (!existingToday || pendingValue == null) return;
    try {
      setSubmitting(true);
      const match = {
        IdUsuario: user!.id,
        FechaCarga: existingToday.FechaCarga,
      } as const;

      const updatePayload = { VariableE: pendingValue } as const;

      const {
        data: _updData,
        error: updError,
        status: _updStatus,
        statusText: _updStatusText,
      } = await supabase
        .from("Variables")
        .update(updatePayload)
        .match(match)
        .select();

      if (updError) throw updError;
      setOk("Valor actualizado correctamente para hoy.");
      setExistingToday(null);
      setPendingValue(null);
      setFormData({ VariableE: "" });
    } catch (err: any) {
      setError(err?.message || "No se pudo actualizar el valor.");
      console.error("[Variables] Update error", err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="container mx-auto mt-10 px-4">
      <div className="flex justify-center">
        <div className="w-full max-w-lg">
          <div className="bg-gray-800 shadow-lg rounded-lg overflow-hidden">
            <div
              className="text-white text-center p-4"
              style={{ backgroundColor: "#575dd0ff" }}
            >
              <h3 className="text-lg font-semibold">Complete el Formulario</h3>
            </div>

            <div className="p-6">
              <form onSubmit={handleSubmit} noValidate>
                <div className="mb-4 field-group">
                  <label htmlFor="VariableE" className="block mb-1">
                    ¿Cuánto esfuerzo realizó en el último entrenamiento?
                  </label>
                  <select
                    id="VariableE"
                    name="VariableE"
                    value={formData.VariableE}
                    onChange={handleChange}
                    className="select-input w-full p-2 border rounded"
                  >
                    <option value="">Seleccione</option>
                    {Array.from({ length: 10 }, (_, i) => i + 1).map((i) => (
                      <option key={i} value={i}>
                        {i}
                      </option>
                    ))}
                  </select>
                </div>

                {error && <Alert type="error">{error}</Alert>}
                {ok && <Alert type="success">{ok}</Alert>}

                {existingToday && (
                  <div
                    className="mt-4 p-3 rounded"
                    style={{ background: "#1f2937" }}
                  >
                    <p>
                      Ya existe una carga para hoy:{" "}
                      <strong>{existingToday.VariableE}</strong> (
                      {formatDateTime(existingToday.FechaCarga)}).
                    </p>
                    <p className="mt-1">
                      ¿Desea mantenerla o reemplazarla por{" "}
                      <strong>{pendingValue}</strong>?
                    </p>
                    <div className="flex gap-3 mt-3">
                      <button
                        type="button"
                        className="px-3 py-1 rounded text-white bg-indigo-500 hover:bg-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-300 disabled:opacity-50"
                        onClick={handleKeepExisting}
                        disabled={submitting}
                      >
                        Mantener
                      </button>
                      <button
                        type="button"
                        className="px-3 py-1 rounded text-white bg-indigo-700 hover:bg-indigo-600 focus:outline-none focus:ring-2 focus:ring-indigo-400 disabled:opacity-50"
                        onClick={handleModifyExisting}
                        disabled={submitting}
                      >
                        Modificar
                      </button>
                    </div>
                  </div>
                )}

                <div className="flex justify-center mt-6 gap-4">
                  <button
                    type="submit"
                    className="btn-action"
                    disabled={submitting}
                  >
                    {submitting ? "Enviando..." : "Enviar"}
                  </button>
                  <button
                    type="button"
                    onClick={() => navigate("/navbar")}
                    className="btn-back"
                  >
                    Volver
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
