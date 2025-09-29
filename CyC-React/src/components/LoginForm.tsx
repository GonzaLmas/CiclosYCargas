import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import Alert from "./Alert";
import {
  validateEmail,
  translateSupabaseResetError,
} from "../utils/authHelpers";

const style = document.createElement("style");
style.textContent = `
  @keyframes fadeIn {
    from { opacity: 0; transform: translateY(-10px); }
    to { opacity: 1; transform: translateY(0); }
  }
  .animate-fade-in {
    animation: fadeIn 0.3s ease-out forwards;
  }
`;
document.head.appendChild(style);

export default function LoginForm() {
  const navigate = useNavigate();
  const { login, loading: authLoading, resetPassword } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const [showResetModal, setShowResetModal] = useState(false);
  const [resetEmail, setResetEmail] = useState("");
  const [resetError, setResetError] = useState<string | null>(null);
  const [resetInfo, setResetInfo] = useState<string | null>(null);
  const [isResetting, setIsResetting] = useState(false);

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);

    if (!email.trim() || !password.trim()) {
      setError("Por favor, complete todos los campos");
      return;
    }

    setIsLoading(true);

    try {
      const user = await login(email, password);
      if (!user) {
        setError("Email o contraseña incorrectos");
        setPassword("");
        return;
      }

      const userRole = user.user_metadata?.role;
      if (userRole === "PF") {
        navigate("/jugadorasaptas");
      } else if (userRole === "Jugadora") {
        navigate("/formpercepcion");
      } else {
        navigate("/navbar");
      }
    } catch (err: any) {
      setError("Email o contraseña incorrectos. Intente de nuevo por favor");
      setPassword("");
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegistro = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    navigate("/registro");
  };

  const handleVolver = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    navigate("/navbar");
  };
  const handleForgotPassword = (
    e: React.MouseEvent<HTMLButtonElement | HTMLAnchorElement>
  ) => {
    e.preventDefault();
    setResetEmail("");
    setResetError(null);
    setResetInfo(null);
    setShowResetModal(true);
  };

  const handleSendReset = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setResetError(null);
    setResetInfo(null);
    const emailError = validateEmail(resetEmail);
    if (emailError) return setResetError(emailError);
    setIsResetting(true);
    try {
      await resetPassword(resetEmail.trim());
      setResetInfo(
        "Si el email existe, te enviamos un enlace para restablecer la contraseña. Revisá tu bandeja de entrada y spam."
      );
    } catch (err: any) {
      setResetError(translateSupabaseResetError(err?.message));
    } finally {
      setIsResetting(false);
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
              <h3 className="text-lg font-semibold">Ingresar</h3>
            </div>
            <div className="p-6">
              <form onSubmit={handleLogin} noValidate className="space-y-6">
                <div className="field-group">
                  <label
                    htmlFor="email"
                    className="block text-sm font-medium text-gray-100"
                  >
                    Email
                  </label>
                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="input-field"
                    placeholder="Ingrese su email"
                  />
                </div>

                <div className="field-group">
                  <label
                    htmlFor="password"
                    className="block text-sm font-medium text-gray-100"
                  >
                    Contraseña
                  </label>
                  <input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="input-field"
                    placeholder="Ingrese su contraseña"
                  />
                </div>

                {error && <Alert type="error">{error}</Alert>}

                <div className="flex justify-center mt-6 gap-4">
                  <button
                    type="submit"
                    disabled={isLoading || authLoading}
                    className="btn-action"
                  >
                    {isLoading || authLoading ? "Procesando..." : "Ingresar"}
                  </button>
                  <button
                    type="button"
                    onClick={handleVolver}
                    className="btn-back"
                  >
                    Volver
                  </button>
                </div>
              </form>

              <div className="mt-4 text-center">
                <button
                  onClick={handleForgotPassword}
                  className="text-sm font-semibold text-indigo-400 hover:text-indigo-300 disabled:opacity-60"
                >
                  ¿Olvidaste tu contraseña?
                </button>
              </div>

              <p className="mt-6 text-center text-sm text-gray-400">
                No tengo cuenta{" "}
                <a
                  href="#"
                  className="font-semibold text-indigo-400 hover:text-indigo-300"
                  onClick={handleRegistro}
                >
                  Registrarme
                </a>
              </p>
            </div>
          </div>
        </div>
      </div>

      {showResetModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-gray-800 rounded-lg shadow-lg w-full max-w-md mx-4">
            <div
              className="text-white text-center p-4 rounded-t-lg"
              style={{ backgroundColor: "#575dd0ff" }}
            >
              <h3 className="text-lg font-semibold">Restablecer contraseña</h3>
            </div>
            <div className="p-6">
              <form onSubmit={handleSendReset} className="space-y-4">
                <div className="field-group">
                  <label
                    htmlFor="resetEmail"
                    className="block text-sm font-medium text-gray-100"
                  >
                    Email
                  </label>
                  <input
                    id="resetEmail"
                    type="email"
                    value={resetEmail}
                    onChange={(e) => setResetEmail(e.target.value)}
                    className="input-field"
                    placeholder="Ingresá tu email"
                  />
                </div>

                {resetError && <Alert type="error">{resetError}</Alert>}
                {resetInfo && <Alert type="success">{resetInfo}</Alert>}

                <div className="flex justify-center mt-4 gap-4">
                  <button
                    type="submit"
                    disabled={isResetting}
                    className="btn-action"
                  >
                    {isResetting ? "Enviando enlace..." : "Enviar enlace"}
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowResetModal(false)}
                    className="btn-back"
                  >
                    Cerrar
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
