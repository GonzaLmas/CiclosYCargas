import { useState, type ChangeEvent, type FormEvent, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { createCiclo } from "../services/CicloService";
import { useAuth } from "../contexts/AuthContext";
import Alert from "./Alert";

interface FormData {
  FechaInicio: string;
  DiasPremenstruales: number | "";
  DiasSangrado: number | "";
  DuracionCicloAnterior: number | "";
  UsaAnticonceptivos: boolean | "";
}

export default function FormJugadoraMensual() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const [formData, setFormData] = useState<FormData>({
    FechaInicio: "",
    DiasPremenstruales: "",
    DiasSangrado: "",
    DuracionCicloAnterior: "",
    UsaAnticonceptivos: "",
  });

  useEffect(() => {
    if (typeof window === "undefined") return;

    if (!loading && !user) {
      navigate("/login", { replace: true, state: { from: location.pathname } });
      return;
    }
  }, [user, loading, navigate]);

  const handleChange = (
    e: ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;

    setFormData((prev) => {
      if (name === "UsaAnticonceptivos") {
        return { ...prev, [name]: value === "true" };
      }
      if (
        [
          "DiasPremenstruales",
          "DiasSangrado",
          "DuracionCicloAnterior",
        ].includes(name)
      ) {
        return { ...prev, [name]: value === "" ? "" : Number(value) };
      }

      return { ...prev, [name]: value };
    });
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!user?.id) {
      setError("No hay sesión activa. Iniciá sesión para continuar.");
      return;
    }

    const missing: string[] = [];
    if (!formData.FechaInicio || formData.FechaInicio.trim() === "") {
      missing.push("Fecha de inicio del ciclo");
    }
    if (formData.DiasPremenstruales === "") {
      missing.push("Días premenstruales");
    }
    if (formData.DiasSangrado === "") {
      missing.push("Días de sangrado");
    }
    if (formData.DuracionCicloAnterior === "") {
      missing.push("Duración del ciclo anterior");
    }
    if (formData.UsaAnticonceptivos === "") {
      missing.push("Uso de anticonceptivos");
    }

    if (missing.length > 0) {
      setSuccessMsg(null);
      setError(
        `Complete todos los campos antes de enviar. Faltan: ${missing.join(
          ", "
        )}`
      );
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      await createCiclo({
        IdJugadora: user.id,
        FechaInicio: formData.FechaInicio,
        DiasPremenstruales: formData.DiasPremenstruales || null,
        DiasSangrado: formData.DiasSangrado || null,
        DuracionCicloAnterior: formData.DuracionCicloAnterior || null,
        UsaAnticonceptivos: formData.UsaAnticonceptivos === true,
      });
      setSuccessMsg("¡Datos guardados correctamente!");
      setTimeout(() => {
        navigate("/navbar", { replace: true });
      }, 1200);
    } catch (err) {
      console.error("Error al guardar el ciclo:", err);
      setSuccessMsg(null);
      setError("Error al guardar el ciclo. Por favor, intente nuevamente.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="text-center mt-10 text-gray-600">Cargando sesión...</div>
    );
  }

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
                  <label htmlFor="FechaInicio" className="block mb-1">
                    ¿Qué día comenzó su ciclo?
                  </label>
                  <input
                    type="date"
                    id="FechaInicio"
                    name="FechaInicio"
                    value={formData.FechaInicio}
                    onChange={handleChange}
                    className="date-input w-full p-2 border rounded"
                    required
                  />
                </div>

                <div className="mb-4 field-group">
                  <label htmlFor="DiasPremenstruales" className="block mb-1">
                    ¿Cuántos días premenstruales tuvo previos a la menstruación?
                  </label>
                  <select
                    id="DiasPremenstruales"
                    name="DiasPremenstruales"
                    value={formData.DiasPremenstruales}
                    onChange={handleChange}
                    className="select-input w-full p-2 border rounded"
                  >
                    <option value="">Seleccione</option>
                    {[1, 2, 3, 4, 5].map((i) => (
                      <option key={i} value={i}>
                        {i}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="mb-4 field-group">
                  <label htmlFor="DiasSangrado" className="block mb-1">
                    ¿Cuántos días de sangrado tuvo?
                  </label>
                  <select
                    id="DiasSangrado"
                    name="DiasSangrado"
                    value={formData.DiasSangrado}
                    onChange={handleChange}
                    className="select-input w-full p-2 border rounded"
                  >
                    <option value="">Seleccione</option>
                    {[1, 2, 3, 4, 5].map((i) => (
                      <option key={i} value={i}>
                        {i}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="mb-4 field-group">
                  <label htmlFor="DuracionCicloAnterior" className="block mb-1">
                    ¿De cuántos días fue el ciclo anterior?
                  </label>
                  <select
                    id="DuracionCicloAnterior"
                    name="DuracionCicloAnterior"
                    value={formData.DuracionCicloAnterior}
                    onChange={handleChange}
                    className="select-input w-full p-2 border rounded"
                  >
                    <option value="">Seleccione</option>
                    {Array.from({ length: 46 }, (_, i) => 15 + i).map((i) => (
                      <option key={i} value={i}>
                        {i}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="mb-4 field-group">
                  <label htmlFor="UsaAnticonceptivos" className="block mb-1">
                    ¿Toma pastillas anticonceptivas?
                  </label>
                  <select
                    id="UsaAnticonceptivos"
                    name="UsaAnticonceptivos"
                    value={
                      formData.UsaAnticonceptivos === ""
                        ? ""
                        : formData.UsaAnticonceptivos
                        ? "true"
                        : "false"
                    }
                    onChange={handleChange}
                    className="select-input w-full p-2 border rounded"
                  >
                    <option value="">Seleccione</option>
                    <option value="true">Sí</option>
                    <option value="false">No</option>
                  </select>
                </div>

                {error && <Alert type="error">{error}</Alert>}
                {successMsg && <Alert type="success">{successMsg}</Alert>}

                <div className="flex justify-center mt-6 gap-4">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="btn-action"
                  >
                    {isSubmitting ? "Guardando..." : "Enviar"}
                  </button>
                  <button
                    type="button"
                    onClick={() => navigate("/navbar")}
                    className="btn-back"
                    disabled={isSubmitting}
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
