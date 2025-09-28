import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import supabase from "../services/SupabaseService";
import { createJugadora } from "../services/JugadoraService";
import { createPF } from "../services/PFService";
import { getClubes } from "../services/ClubService";
import Alert from "./Alert";

export default function RegistroUsuario() {
  const [form, setForm] = useState({
    Email: "",
    Pass: "",
    confirmarPass: "",
    IdRol: "",
    Nombre: "",
    Apellido: "",
    Edad: "",
    IdClub: "",
    Division: "",
  });

  const [clubes, setClubes] = useState<
    Array<{ IdClub: string; NombreClub: string }>
  >([]);
  const [errorPass, setErrorPass] = useState("");
  const [mensaje, setMensaje] = useState("");
  const [registroExitoso, setRegistroExitoso] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

  const roles = [
    //{ value: "f211f07c-4004-4575-9dbc-af8dbbf3f8d0", text: "Admin" },
    { value: "d4bead2c-64ec-4f82-8491-fcd62158dd08", text: "PF" },
    { value: "3756bc44-caf3-4efc-8b55-aa2ace5be1b8", text: "Jugadora" },
  ];

  const jugadoraRol = roles.find((r) => r.text === "Jugadora");
  const pfRol = roles.find((r) => r.text === "PF");

  useEffect(() => {
    const fetchClubes = async () => {
      try {
        const data = await getClubes();
        setClubes(data);
      } catch (error) {
        console.error("Error al cargar clubes:", error);
      }
    };
    fetchClubes();
  }, []);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
  };

  const handleConfirmPassBlur = () => {
    if (form.Pass !== form.confirmarPass) {
      setErrorPass("Las contraseñas no coinciden.");
    } else {
      setErrorPass("");
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    setErrorPass("");
    setMensaje("");
    setRegistroExitoso(false);

    if (form.Pass !== form.confirmarPass) {
      setErrorPass("Las contraseñas no coinciden.");
      return;
    }

    const missing: string[] = [];
    if (!form.Email.trim()) missing.push("Email");
    if (!form.Pass.trim()) missing.push("Contraseña");
    if (!form.confirmarPass.trim()) missing.push("Confirmar contraseña");
    if (!form.IdRol) missing.push("Rol");
    if (!form.Nombre.trim()) missing.push("Nombre");
    if (!form.Apellido.trim()) missing.push("Apellido");

    const esJugadora = jugadoraRol && form.IdRol === jugadoraRol.value;
    const esPF = pfRol && form.IdRol === pfRol.value;

    if (esJugadora) {
      if (!form.Edad) missing.push("Edad");
      if (!form.IdClub) missing.push("Club");
      if (!form.Division) missing.push("División");
    } else if (esPF) {
      if (!form.IdClub) missing.push("Club");
      if (!form.Division) missing.push("División");
    }

    if (missing.length > 0) {
      setMensaje(
        `Complete todos los campos antes de enviar. Faltan: ${missing.join(
          ", "
        )}`
      );
      setRegistroExitoso(false);
      return;
    }

    setIsSubmitting(true);

    try {
      const { data, error } = await supabase.auth.signUp({
        email: form.Email,
        password: form.Pass,
        options: {
          data: {
            role: esJugadora ? "Jugadora" : esPF ? "PF" : "Admin",
          },
        },
      });
      if (error) throw error;
      if (!data.user) throw new Error("No se pudo crear el usuario");

      const userId = data.user.id;

      if (esJugadora) {
        await createJugadora({
          IdJugadora: userId,
          Nombre: form.Nombre,
          Apellido: form.Apellido,
          Email: form.Email,
          Edad: parseInt(form.Edad, 10),
          IdClub: form.IdClub,
          Division: form.Division,
          Activa: true,
          Indicador: 0,
        });
      } else if (esPF) {
        await createPF({
          IdUsuario: userId,
          Nombre: form.Nombre,
          Apellido: form.Apellido,
          Email: form.Email,
          IdClub: form.IdClub,
          Division: form.Division,
        });
      }

      setMensaje(
        "¡Registro exitoso! Revisa tu email para confirmar tu cuenta."
      );
      setRegistroExitoso(true);

      setForm({
        Email: "",
        Pass: "",
        confirmarPass: "",
        IdRol: "",
        Nombre: "",
        Apellido: "",
        Edad: "",
        IdClub: "",
        Division: "",
      });

      setTimeout(() => navigate("/login"), 3000);
    } catch (error) {
      console.error("Error al registrar usuario:", error);
      setMensaje(
        error instanceof Error ? error.message : "Error al registrar el usuario"
      );
      setRegistroExitoso(false);
    } finally {
      setIsSubmitting(false);
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
              <h3 className="text-lg font-semibold">Registro de Usuario</h3>
            </div>
            <div className="p-6">
              <form onSubmit={handleSubmit} className="space-y-4" noValidate>
                <div className="field-group">
                  <label className="block text-sm font-medium text-gray-100">
                    Email
                  </label>
                  <input
                    type="email"
                    name="Email"
                    value={form.Email}
                    onChange={handleChange}
                    className="input-field"
                    placeholder="Ingrese su correo electrónico"
                  />
                </div>

                <div className="field-group">
                  <label className="block text-sm font-medium text-gray-100">
                    Contraseña
                  </label>
                  <input
                    type="password"
                    name="Pass"
                    value={form.Pass}
                    onChange={handleChange}
                    className="input-field"
                    placeholder="Ingrese su contraseña"
                  />
                </div>

                <div className="field-group">
                  <label className="block text-sm font-medium text-gray-100">
                    Confirmar Contraseña
                  </label>
                  <input
                    type="password"
                    name="confirmarPass"
                    value={form.confirmarPass}
                    onChange={handleChange}
                    onBlur={handleConfirmPassBlur}
                    className="input-field"
                    placeholder="Confirme su contraseña"
                  />
                  {errorPass && <Alert type="error">{errorPass}</Alert>}
                </div>

                <div className="field-group">
                  <label className="block text-sm font-medium text-gray-100">
                    Rol
                  </label>
                  <select
                    name="IdRol"
                    value={form.IdRol}
                    onChange={handleChange}
                    className="select-input"
                  >
                    <option value="" className="select-input">
                      Seleccione un rol
                    </option>
                    {roles.map((rol) => (
                      <option key={rol.value} value={rol.value}>
                        {rol.text}
                      </option>
                    ))}
                  </select>
                </div>

                {(form.IdRol === jugadoraRol?.value ||
                  form.IdRol === pfRol?.value) && (
                  <>
                    {form.IdRol === jugadoraRol?.value && (
                      <div className="field-group">
                        <label className="block text-sm font-medium text-gray-100">
                          Edad
                        </label>
                        <select
                          name="Edad"
                          value={form.Edad}
                          onChange={handleChange}
                          className="select-input"
                        >
                          <option value="">Seleccione su edad</option>
                          {Array.from({ length: 31 }, (_, i) => i + 10).map(
                            (edad) => (
                              <option key={edad} value={edad}>
                                {edad} años
                              </option>
                            )
                          )}
                        </select>
                      </div>
                    )}

                    <div className="field-group">
                      <label className="block text-sm font-medium text-gray-100">
                        Club
                      </label>
                      <select
                        name="IdClub"
                        value={form.IdClub}
                        onChange={handleChange}
                        className={`select-input ${
                          !form.IdClub ? "text-gray-400" : ""
                        }`}
                      >
                        <option value="">Seleccione su club</option>
                        {clubes.map((club) => (
                          <option key={club.IdClub} value={club.IdClub}>
                            {club.NombreClub}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="field-group">
                      <label className="block text-sm font-medium text-gray-100">
                        División
                      </label>
                      <select
                        name="Division"
                        value={form.Division}
                        onChange={handleChange}
                        className={`select-input ${
                          !form.Division ? "text-gray-400" : ""
                        }`}
                      >
                        <option value="">Seleccione su división</option>
                        <option value="Primera">Primera</option>
                        <option value="Tercera">Tercera</option>
                        <option value="Cuarta">Cuarta</option>
                        <option value="Quinta">Quinta</option>
                      </select>
                    </div>
                  </>
                )}

                <div className="field-group">
                  <label className="block text-sm font-medium text-gray-100">
                    Nombre
                  </label>
                  <input
                    type="text"
                    name="Nombre"
                    value={form.Nombre}
                    onChange={handleChange}
                    className="input-field"
                    placeholder="Ingrese su nombre"
                  />
                </div>

                <div className="field-group">
                  <label className="block text-sm font-medium text-gray-100">
                    Apellido
                  </label>
                  <input
                    type="text"
                    name="Apellido"
                    value={form.Apellido}
                    onChange={handleChange}
                    className="input-field"
                    placeholder="Ingrese su apellido"
                  />
                </div>

                <div className="flex justify-center mt-6 gap-4">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="btn-action"
                  >
                    {isSubmitting ? "Registrando..." : "Registrarse"}
                  </button>
                  <button
                    type="button"
                    onClick={() => navigate("/login")}
                    className="btn-back"
                    disabled={isSubmitting}
                  >
                    Volver
                  </button>
                </div>
                {mensaje &&
                  (registroExitoso ? (
                    <Alert type="success" className="mt-4">
                      {mensaje}
                    </Alert>
                  ) : (
                    <Alert type="error" className="mt-4">
                      {mensaje}
                    </Alert>
                  ))}
              </form>
              <p className="mt-6 text-center text-sm text-gray-400">
                ¿Ya tienes una cuenta?{" "}
                <a
                  href="/login"
                  className="font-semibold text-indigo-400 hover:text-indigo-300"
                >
                  Iniciar Sesión
                </a>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
