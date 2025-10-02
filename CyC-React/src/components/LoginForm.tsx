import Alert from "./Alert";
import { useLoginFormLogic } from "../services/LoginForm.ts";

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
  const {
    email,
    setEmail,
    password,
    setPassword,
    error,
    isLoading,
    authLoading,
    showResetModal,
    setShowResetModal,
    resetEmail,
    setResetEmail,
    resetError,
    resetInfo,
    isResetting,
    handleLogin,
    handleRegistro,
    handleVolver,
    handleGoogleLogin,
    handleForgotPassword,
    handleSendReset,
  } = useLoginFormLogic();

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

              <div className="mt-6">
                <div className="relative flex items-center justify-center">
                  <div className="h-px bg-gray-700 w-full" />
                  <span className="px-3 text-xs text-gray-400 bg-gray-800 absolute">
                    o
                  </span>
                </div>
                <div className="flex justify-center mt-6">
                  <button
                    type="button"
                    onClick={handleGoogleLogin}
                    disabled={authLoading}
                    className="flex items-center gap-2 px-4 py-2 rounded-md border transition-colors disabled:opacity-60"
                    style={{
                      backgroundColor: "#ffffff",
                      color: "#111827",
                      borderColor: "#e5e7eb",
                    }}
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 48 48"
                      className="w-5 h-5"
                    >
                      <path
                        fill="#FFC107"
                        d="M43.611 20.083H42V20H24v8h11.303C33.602 32.091 29.223 35 24 35c-6.627 0-12-5.373-12-12s5.373-12 12-12c3.059 0 5.842 1.156 7.961 3.039l5.657-5.657C34.869 5.053 29.706 3 24 3 12.955 3 4 11.955 4 23s8.955 20 20 20 20-8.955 20-20c0-1.341-.138-2.651-.389-3.917z"
                      />
                      <path
                        fill="#FF3D00"
                        d="M6.306 14.691l6.571 4.819C14.294 16.108 18.74 13 24 13c3.059 0 5.842 1.156 7.961 3.039l5.657-5.657C34.869 5.053 29.706 3 24 3 16.318 3 9.656 7.337 6.306 14.691z"
                      />
                      <path
                        fill="#4CAF50"
                        d="M24 43c5.166 0 9.86-1.977 13.409-5.191l-6.19-5.238C29.223 35 24 35 24 35c-5.202 0-9.567-2.888-11.289-7.001l-6.552 5.047C9.474 40.556 16.227 43 24 43z"
                      />
                      <path
                        fill="#1976D2"
                        d="M43.611 20.083H42V20H24v8h11.303c-1.347 3.091-4.726 7-11.303 7 0 0 5.223 0 7.219-2.429l6.19 5.238C35.889 40.772 44 36 44 23c0-1.341-.138-2.651-.389-3.917z"
                      />
                    </svg>
                    Ingresar con Google
                  </button>
                </div>
              </div>

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
                    {isResetting ? "Enviando enlace..." : "Reenviar enlace"}
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
