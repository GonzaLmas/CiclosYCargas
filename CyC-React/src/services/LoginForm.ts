import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import {
  validateEmail,
  translateSupabaseResetError,
} from "../utils/authHelpers";

export function useLoginFormLogic() {
  const navigate = useNavigate();
  const {
    login,
    loading: authLoading,
    resetPassword,
    loginWithGoogle,
  } = useAuth();

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
    navigate("/");
  };

  const handleGoogleLogin = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    try {
      await loginWithGoogle();
    } catch (err) {
      setError("No se pudo iniciar sesión con Google");
    }
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

  return {
    email,
    setEmail,
    password,
    setPassword,
    error,
    setError,
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
  };
}
