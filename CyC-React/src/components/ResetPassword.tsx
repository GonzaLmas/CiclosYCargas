import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import Alert from "./Alert";
import { validateNewPassword, translateSupabaseUpdateError } from "../utils/authHelpers";

export default function ResetPassword() {
  const navigate = useNavigate();
  const { updatePassword, loading, user } = useAuth();

  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setInfo(null);

    const validationError = validateNewPassword(password, confirm);
    if (validationError) return setError(validationError);

    setSubmitting(true);
    try {
      await updatePassword(password);
      setInfo("Contraseña actualizada. Ya podés iniciar sesión.");
      setTimeout(() => navigate("/login"), 1500);
    } catch (err: any) {
      setError(translateSupabaseUpdateError(err?.message));
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
              className="text-white text-center p-4 rounded-t-lg"
              style={{ backgroundColor: "#575dd0ff" }}
            >
              <h3 className="text-lg font-semibold">Restablecer contraseña</h3>
            </div>
            <div className="p-6">
              {!user && (
                <div className="mb-4">
                  <Alert type="error">
                    Para cambiar la contraseña, abrí el enlace que te enviamos por email.
                  </Alert>
                </div>
              )}
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="field-group">
                  <label htmlFor="password" className="block text-sm font-medium text-gray-100">
                    Nueva contraseña
                  </label>
                  <input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="input-field"
                    placeholder="Ingresá tu nueva contraseña"
                    disabled={!user}
                  />
                </div>

                <div className="field-group">
                  <label htmlFor="confirm" className="block text-sm font-medium text-gray-100">
                    Repetir contraseña
                  </label>
                  <input
                    id="confirm"
                    type="password"
                    value={confirm}
                    onChange={(e) => setConfirm(e.target.value)}
                    className="input-field"
                    placeholder="Repetí tu nueva contraseña"
                    disabled={!user}
                  />
                </div>

                {error && <Alert type="error">{error}</Alert>}
                {info && <Alert type="success">{info}</Alert>}

                <div className="flex justify-center mt-6 gap-4">
                  <button
                    type="submit"
                    disabled={submitting || loading || !user}
                    className="btn-action"
                  >
                    {submitting || loading ? "Actualizando..." : "Actualizar contraseña"}
                  </button>
                  <button
                    type="button"
                    onClick={() => navigate("/login")}
                    className="btn-back"
                  >
                    Cancelar
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
