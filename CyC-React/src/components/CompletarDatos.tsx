import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  updateJugadora,
  createJugadora,
  getJugadoraById,
} from "../services/JugadoraService";
import { getClubes } from "../services/ClubService";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export default function CompletarDatos() {
  const location = useLocation();
  const navigate = useNavigate();
  const [clubes, setClubes] = useState<
    Array<{ IdClub: string; NombreClub: string }>
  >([]);
  const [form, setForm] = useState({
    IdJugadora: location.state?.userId || "",
    Nombre: location.state?.nombre || "",
    Apellido: location.state?.apellido || "",
    Email: location.state?.email || "",
    Edad: "",
    IdClub: "",
    Division: "",
    Activa: true,
    Indicador: 0,
  });
  const handleFormChange = (
    e: React.ChangeEvent<HTMLSelectElement | HTMLInputElement>
  ) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  useEffect(() => {
    const fetchClubes = async () => {
      try {
        const clubesData = await getClubes();
        setClubes(clubesData);
      } catch (error) {
        console.error("Error al cargar los clubes:", error);
        toast.error("Error al cargar la lista de clubes");
      }
    };

    fetchClubes();
  }, []);

  useEffect(() => {
    if (!location.state?.userId) {
      toast.warning(
        "Acceso no autorizado. Redirigiendo al inicio de sesión..."
      );
      navigate("/login");
    }
  }, [location.state, navigate]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!form.Edad || !form.IdClub || !form.Division) {
      toast.error("Por favor complete todos los campos");
      return;
    }

    try {
      const jugadoraExistente = await getJugadoraById(form.IdJugadora);

      const datosJugadora = {
        IdJugadora: form.IdJugadora,
        Nombre: form.Nombre,
        Apellido: form.Apellido,
        Email: form.Email,
        Edad: parseInt(form.Edad, 10),
        IdClub: form.IdClub,
        Division: form.Division,
        Activa: true,
        Indicador: 0,
      };

      if (!jugadoraExistente) {
        await createJugadora(datosJugadora);
        toast.success("¡Perfil de jugadora creado exitosamente!");
      } else {
        await updateJugadora(form.IdJugadora, datosJugadora);
        toast.success("¡Datos actualizados exitosamente!");
      }

      navigate("/");
    } catch (error) {
      console.error("Error al guardar los datos de la jugadora:", error);
      toast.error("Error al guardar los datos. Por favor, intente nuevamente.");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-neutral-900 p-6">
      <div className="w-full max-w-lg">
        <div className="bg-neutral-800 shadow-lg rounded-2xl overflow-hidden">
          <div className="bg-[#646cff] text-white text-center py-4">
            <h3 className="text-xl font-semibold">
              Complete sus datos de jugadora
            </h3>
            <p className="text-sm opacity-90">
              Complete la información requerida para continuar
            </p>
          </div>
          <div className="p-6">
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* ID Jugadora oculto */}
              <input type="hidden" name="IdJugadora" value={form.IdJugadora} />

              {/* Edad */}
              <div>
                <label
                  htmlFor="edad"
                  className="block text-sm font-medium text-white mb-1"
                >
                  Seleccione su Edad
                </label>
                <select
                  id="Edad"
                  name="Edad"
                  value={form.Edad}
                  onChange={handleFormChange}
                  className="w-full px-4 py-2 rounded-lg bg-neutral-800 border border-gray-700 text-white focus:border-[#646cff] focus:ring-2 focus:ring-[#646cff] focus:outline-none transition-colors"
                >
                  <option value="">-- Seleccione su edad --</option>
                  {Array.from({ length: 31 }, (_, i) => i + 10).map((edad) => (
                    <option key={edad} value={edad}>
                      {edad} años
                    </option>
                  ))}
                </select>
              </div>

              {/* Club */}
              <div>
                <label
                  htmlFor="idClub"
                  className="block text-sm font-medium text-white mb-1"
                >
                  Seleccione su Club
                </label>
                <select
                  id="IdClub"
                  name="IdClub"
                  value={form.IdClub}
                  onChange={handleFormChange}
                  className="w-full px-4 py-2 rounded-lg bg-neutral-800 border border-gray-700 text-white focus:border-[#646cff] focus:ring-2 focus:ring-[#646cff] focus:outline-none transition-colors"
                >
                  <option value="">-- Seleccione su club --</option>
                  {clubes.map((club) => (
                    <option key={club.IdClub} value={club.IdClub}>
                      {club.NombreClub}
                    </option>
                  ))}
                </select>
              </div>

              {/* División */}
              <div>
                <label
                  htmlFor="division"
                  className="block text-sm font-medium text-white mb-1"
                >
                  Seleccione su División
                </label>
                <select
                  id="Division"
                  name="Division"
                  value={form.Division}
                  onChange={handleFormChange}
                  className="w-full px-4 py-2 rounded-lg bg-neutral-800 border border-gray-700 text-white focus:border-[#646cff] focus:ring-2 focus:ring-[#646cff] focus:outline-none transition-colors"
                >
                  <option value="">-- Seleccione su división --</option>
                  <option value="Primera">Primera División</option>
                  <option value="Tercera">Tercera División</option>
                  <option value="Cuarta">Cuarta División</option>
                  <option value="Quinta">Quinta División</option>
                </select>
              </div>

              {/* Botón */}
              <div className="text-center pt-4">
                <button
                  type="submit"
                  disabled={!form.Edad || !form.IdClub || !form.Division}
                  className={`w-full py-2 px-4 rounded-lg font-medium transition-colors ${
                    !form.Edad || !form.IdClub || !form.Division
                      ? "bg-gray-600 text-gray-400 cursor-not-allowed"
                      : "bg-[#646cff] text-white hover:bg-[#535bf2] transform hover:-translate-y-0.5"
                  }`}
                >
                  Guardar Datos
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
