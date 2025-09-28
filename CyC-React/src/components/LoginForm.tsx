import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import Alert from "./Alert";

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
  const { login, loading: authLoading } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

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
    </div>
  );
}
