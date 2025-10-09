import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import type { Club } from "../services/ClubService";
import {
  fetchUserPerfil,
  fetchClubesData,
  validatePerfilForm,
  submitPerfilUpdate,
  fetchDivisionesDisponibles,
} from "../services/EditarPerfil";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Modal from "./Modal";
import Alert from "./Alert";

export default function EditarPerfil() {
  const navigate = useNavigate();
  const { user, role } = useAuth();
  const [clubes, setClubes] = useState<Club[]>([]);
  const [loading, setLoading] = useState(true);
  const [nombre, setNombre] = useState("");
  const [apellido, setApellido] = useState("");
  const [displayEdad, setDisplayEdad] = useState("");
  const [displayIdClub, setDisplayIdClub] = useState("");
  const [displayDivision, setDisplayDivision] = useState("");
  const [displayDivisionList, setDisplayDivisionList] = useState<string[]>([]);
  const [form, setForm] = useState({
    Edad: "",
    IdClub: "",
    Division: "",
    DivisionIds: [] as string[],
  });
  const [isEditing, setIsEditing] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalTitle, setModalTitle] = useState<string>("");
  const [modalMessage, setModalMessage] = useState<string>("");
  const [modalConfirmText, setModalConfirmText] = useState<string>("Aceptar");
  const [modalCancelText, setModalCancelText] = useState<string>("Cancelar");
  const [modalOnConfirm, setModalOnConfirm] = useState<
    (() => void) | undefined
  >(undefined);
  const [saveOk, setSaveOk] = useState<string | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [cooldownUntil, setCooldownUntil] = useState<number | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      if (!user?.id) {
        toast.error("Usuario no autenticado");
        navigate("/login");
        return;
      }

      try {
        const perfil = await fetchUserPerfil(user.id, role as any);
        if (perfil) {
          setNombre(perfil.nombre || "");
          setApellido(perfil.apellido || "");
          setDisplayEdad(perfil.edad || "");
          setDisplayIdClub(perfil.idClub || "");
          setDisplayDivision(perfil.division || "");
          if (role === "PF") {
            setDisplayDivisionList(perfil.divisionIds || []);
          }
          setForm({
            Edad: perfil.edad || "",
            IdClub: perfil.idClub || "",
            Division: perfil.division || "",
            DivisionIds: perfil.divisionIds || [],
          });
          if (perfil.nextEditAt) setCooldownUntil(perfil.nextEditAt);
        } else {
          setNombre("");
          setApellido("");
          setDisplayEdad("");
          setDisplayIdClub("");
          setDisplayDivision("");
          setDisplayDivisionList([]);
          setForm({ Edad: "", IdClub: "", Division: "", DivisionIds: [] });
        }

        const clubesData = await fetchClubesData();
        setClubes(clubesData);

        if (role === "PF") {
          try {
            const divis = await fetchDivisionesDisponibles();
            setDivisionesDisponibles(divis);
          } catch (e) {
            console.warn("No se pudieron cargar divisiones disponibles", e);
          }
        }
      } catch (error) {
        console.error("Error al cargar los datos:", error);
        toast.error("Error al cargar los datos del perfil");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user, role, navigate]);

  const handleFormChange = (
    e: React.ChangeEvent<HTMLSelectElement | HTMLInputElement>
  ) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const [divisionesDisponibles, setDivisionesDisponibles] = useState<string[]>(
    []
  );
  const [divisionToAdd, setDivisionToAdd] = useState<string>("");
  const addDivision = () => {
    if (!divisionToAdd) return;
    setForm((prev) =>
      prev.DivisionIds.includes(divisionToAdd)
        ? prev
        : { ...prev, DivisionIds: [...prev.DivisionIds, divisionToAdd] }
    );
    setDivisionToAdd("");
  };
  const removeDivision = (value: string) => {
    setForm((prev) => ({
      ...prev,
      DivisionIds: prev.DivisionIds.filter((d) => d !== value),
    }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSaveOk(null);
    setSaveError(null);

    const isPF = role === "PF";
    const validationError = validatePerfilForm(form, role as any);
    if (validationError) {
      toast.error(validationError);
      return;
    }

    if (!user?.id) {
      toast.error("Usuario no autenticado");
      return;
    }

    const now = Date.now();
    if (cooldownUntil && now < cooldownUntil) {
      const remainingDays = Math.ceil(
        (cooldownUntil - now) / (1000 * 60 * 60 * 24)
      );
      toast.error(
        `No podés modificar el perfil todavía. Te faltan ${remainingDays} día(s). Recordá que solo se puede editar cada 7 días.`
      );
      return;
    }

    try {
      const nextAllowed = await submitPerfilUpdate(user.id, role as any, form);
      setCooldownUntil(nextAllowed);

      const nextDate = new Date(nextAllowed);
      if (!isPF) setDisplayEdad(form.Edad);
      setDisplayIdClub(form.IdClub);
      setDisplayDivision(form.Division);
      setIsEditing(false);
      setSaveOk(
        `¡Perfil actualizado! Podrás volver a modificarlo a partir del ${nextDate.toLocaleDateString()} (${nextDate.toLocaleTimeString()}).`
      );
      toast.success("¡Perfil actualizado exitosamente!");
      setTimeout(() => navigate(-1), 2500);
    } catch (error) {
      console.error("Error al actualizar el perfil:", error);
      setSaveError(
        "Error al actualizar el perfil. Por favor, intente nuevamente."
      );
      toast.error("Error al actualizar el perfil.");
    }
  };

  const handleStartEdit = () => {
    const now = Date.now();
    if (cooldownUntil && now < cooldownUntil) {
      const remainingDays = Math.ceil(
        (cooldownUntil - now) / (1000 * 60 * 60 * 24)
      );
      setModalTitle("Edición bloqueada");
      setModalMessage(
        `Solo podés editar tu perfil cada 7 días. Te faltan ${remainingDays} día(s) para volver a intentarlo.`
      );
      setModalConfirmText("Entendido");
      setModalCancelText("");
      setModalOnConfirm(() => () => setModalOpen(false));
      setModalOpen(true);
      return;
    }

    setModalTitle("Confirmar modificación");
    setModalMessage(
      "Vas a modificar tus datos. Recordá que solo podrás volver a cambiarlos dentro de 7 días. ¿Deseás continuar?"
    );
    setModalConfirmText("Sí, continuar");
    setModalCancelText("Cancelar");
    setModalOnConfirm(() => () => {
      setIsEditing(true);
      setModalOpen(false);
      toast.info(
        "Editando perfil. Al guardar, comenzará el período de 7 días."
      );
    });
    setModalOpen(true);
  };

  const canEditNow = !cooldownUntil || Date.now() >= cooldownUntil;
  const remainingDaysText = (() => {
    if (!cooldownUntil) return null;
    const diff = cooldownUntil - Date.now();
    if (diff <= 0) return null;
    const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
    return `${days} día(s)`;
  })();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-neutral-900"></div>
    );
  }

  return (
    <div className="container mx-auto mt-10 px-4">
      <div className="flex justify-center">
        <div className="w-full max-w-lg">
          <div className="bg-neutral-800 shadow-lg rounded-lg overflow-hidden">
            <div className="bg-[#646cff] text-white text-center py-4">
              <h3 className="text-xl font-semibold">Editar Perfil</h3>
            </div>
            <div className="p-6 space-y-6">
              {saveError && <Alert type="error">{saveError}</Alert>}
              {saveOk && <Alert type="success">{saveOk}</Alert>}
              <div className="rounded-lg border border-gray-700 bg-neutral-900 p-4 text-white">
                <h4 className="font-semibold mb-3">Valores actuales</h4>
                <div className="text-sm space-y-2">
                  <div>
                    <span className="text-gray-400">Nombre: </span>
                    <span>{nombre || "—"}</span>
                  </div>
                  <div>
                    <span className="text-gray-400">Apellido: </span>
                    <span>{apellido || "—"}</span>
                  </div>
                  {role !== "PF" && (
                    <div>
                      <span className="text-gray-400">Edad: </span>
                      <span>{displayEdad || "—"}</span>
                    </div>
                  )}
                  <div>
                    <span className="text-gray-400">Club: </span>
                    <span>
                      {clubes.find((c) => c.IdClub === displayIdClub)
                        ?.NombreClub || "—"}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-400">División: </span>
                    {role === "PF" ? (
                      <span>
                        {displayDivisionList && displayDivisionList.length > 0
                          ? displayDivisionList.join(", ")
                          : "—"}
                      </span>
                    ) : (
                      <span>{displayDivision || "—"}</span>
                    )}
                  </div>
                </div>
                <div className="mt-4 flex items-center gap-3">
                  {!isEditing && (
                    <>
                      <button
                        type="button"
                        onClick={handleStartEdit}
                        disabled={!canEditNow}
                        className={`py-2 px-4 rounded-lg font-medium transition-colors ${
                          canEditNow
                            ? "bg-[#646cff] text-white hover:bg-[#535bf2]"
                            : "bg-gray-600 text-gray-300 cursor-not-allowed"
                        }`}
                      >
                        Modificar datos
                      </button>
                      {!canEditNow && remainingDaysText && (
                        <span className="text-xs text-gray-400">
                          Podrás modificar nuevamente en {remainingDaysText}.
                        </span>
                      )}
                    </>
                  )}
                </div>
              </div>

              {/* Formulario de edición (solo si está editando) */}
              {isEditing && (
                <form onSubmit={handleSubmit} className="space-y-4">
                  {/* Edad */}
                  {role !== "PF" && (
                    <div>
                      <label
                        htmlFor="Edad"
                        className="block text-sm font-medium text-white mb-1"
                      >
                        Edad
                      </label>
                      <select
                        id="Edad"
                        name="Edad"
                        value={form.Edad}
                        onChange={handleFormChange}
                        className="w-full px-4 py-2 rounded-lg bg-neutral-700 border border-gray-600 text-white focus:border-[#646cff] focus:ring-2 focus:ring-[#646cff] focus:outline-none transition-colors"
                      >
                        <option value="">-- Seleccione su edad --</option>
                        {Array.from({ length: 21 }, (_, i) => i + 10).map(
                          (edad) => (
                            <option key={edad} value={edad}>
                              {edad} años
                            </option>
                          )
                        )}
                      </select>
                    </div>
                  )}

                  {/* Club */}
                  <div>
                    <label
                      htmlFor="IdClub"
                      className="block text-sm font-medium text-white mb-1"
                    >
                      Club
                    </label>
                    <select
                      id="IdClub"
                      name="IdClub"
                      value={form.IdClub}
                      onChange={handleFormChange}
                      className="w-full px-4 py-2 rounded-lg bg-neutral-700 border border-gray-600 text-white focus:border-[#646cff] focus:ring-2 focus:ring-[#646cff] focus:outline-none transition-colors"
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
                  {role !== "PF" ? (
                    <div>
                      <label
                        htmlFor="Division"
                        className="block text-sm font-medium text-white mb-1"
                      >
                        División
                      </label>
                      <select
                        id="Division"
                        name="Division"
                        value={form.Division}
                        onChange={handleFormChange}
                        className="w-full px-4 py-2 rounded-lg bg-neutral-700 border border-gray-600 text-white focus:border-[#646cff] focus:ring-2 focus:ring-[#646cff] focus:outline-none transition-colors"
                      >
                        <option value="">-- Seleccione su división --</option>
                        {divisionesDisponibles.length > 0 ? (
                          divisionesDisponibles.map((d) => (
                            <option key={d} value={d}>
                              {d}
                            </option>
                          ))
                        ) : (
                          <>
                            <option value="Primera">Primera División</option>
                            <option value="Tercera">Tercera División</option>
                            <option value="Cuarta">Cuarta División</option>
                            <option value="Quinta">Quinta División</option>
                          </>
                        )}
                      </select>
                    </div>
                  ) : (
                    <div>
                      <label
                        htmlFor="DivisionSelect"
                        className="block text-sm font-medium text-white mb-1"
                      >
                        Divisiones
                      </label>
                      <div className="flex gap-2">
                        <select
                          id="DivisionSelect"
                          value={divisionToAdd}
                          onChange={(e) => setDivisionToAdd(e.target.value)}
                          className="flex-1 px-4 py-2 rounded-lg bg-neutral-700 border border-gray-600 text-white focus:border-[#646cff] focus:ring-2 focus:ring-[#646cff] focus:outline-none transition-colors"
                        >
                          <option value="">
                            -- Seleccione una división --
                          </option>
                          {divisionesDisponibles
                            .filter((d) => !form.DivisionIds.includes(d))
                            .map((d) => (
                              <option key={d} value={d}>
                                {d}
                              </option>
                            ))}
                        </select>
                        <button
                          type="button"
                          onClick={addDivision}
                          className="px-3 py-2 rounded-lg bg-[#646cff] text-white hover:bg-[#535bf2]"
                          disabled={!divisionToAdd}
                        >
                          Agregar
                        </button>
                      </div>
                      {form.DivisionIds.length > 0 && (
                        <div className="mt-2 flex flex-wrap gap-2">
                          {form.DivisionIds.map((d) => (
                            <span
                              key={d}
                              className="inline-flex items-center gap-2 px-2 py-1 rounded-full bg-neutral-700 text-white text-sm"
                            >
                              {d}
                              <button
                                type="button"
                                onClick={() => removeDivision(d)}
                                className="text-gray-300 hover:text-white"
                                aria-label={`Quitar ${d}`}
                              >
                                ×
                              </button>
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Botones */}
                  <div className="flex gap-3 pt-4">
                    <button
                      type="button"
                      onClick={() => navigate(-1)}
                      className="flex-1 py-2 px-4 rounded-lg font-medium bg-gray-600 text-white hover:bg-gray-700 transition-colors"
                    >
                      Volver
                    </button>
                    <button
                      type="submit"
                      disabled={
                        (role !== "PF" &&
                          (!form.Edad || !form.IdClub || !form.Division)) ||
                        (role === "PF" &&
                          (!form.IdClub ||
                            !(form.DivisionIds && form.DivisionIds.length > 0)))
                      }
                      className={`flex-1 py-2 px-4 rounded-lg font-medium transition-colors ${
                        (role !== "PF" &&
                          (!form.Edad || !form.IdClub || !form.Division)) ||
                        (role === "PF" &&
                          (!form.IdClub ||
                            !(form.DivisionIds && form.DivisionIds.length > 0)))
                          ? "bg-gray-600 text-gray-400 cursor-not-allowed"
                          : "bg-[#646cff] text-white hover:bg-[#535bf2] transform hover:-translate-y-0.5"
                      }`}
                    >
                      Guardar Cambios
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
      <Modal
        isOpen={modalOpen}
        title={modalTitle}
        onConfirm={modalOnConfirm}
        onCancel={() => setModalOpen(false)}
        confirmText={modalConfirmText}
        cancelText={modalCancelText}
        hideCancel={!modalCancelText}
      >
        <p className="text-sm leading-relaxed">{modalMessage}</p>
        {modalTitle === "Edición bloqueada" && cooldownUntil && (
          <p className="mt-2 text-xs text-neutral-400">
            Podrás modificar nuevamente en {remainingDaysText}.
          </p>
        )}
      </Modal>
    </div>
  );
}
