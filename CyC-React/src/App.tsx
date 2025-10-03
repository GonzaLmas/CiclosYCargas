import "./App.css";
import LoginForm from "./components/LoginForm.tsx";
import { Routes, Route, useLocation, useNavigate } from "react-router-dom";
import Navbar from "./components/Navbar";
import JugadorasAptas from "./components/JugadorasAptas";
import Index from "./components/Index.jsx";
import TipoSemana from "./components/TipoSemana";
import SemanaTrabajar from "./components/SemanaTrabajar.jsx";
import FormJugadoraMensual from "./components/FormJugadoraMensual";
import FormPercepcion from "./components/FormPercepcion";
import Layout from "./components/Layout.js";
import Registro from "./components/Registro";
import CompletarDatos from "./components/CompletarDatos";
import ResetPassword from "./components/ResetPassword";
import JugadorasEsfuerzo from "./components/JugadorasEsfuerzo";
import HistorialPercepcion from "./components/HistorialPercepcion";
import EditarPerfil from "./components/EditarPerfil";
import { useEffect } from "react";
import { useAuth } from "./contexts/AuthContext";

function App() {
  const { user, role, loading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (loading) return;
    if (!user) return;

    const publicPaths = new Set(["/", "/login", "/registro"]);
    if (!publicPaths.has(location.pathname)) return;

    if (role === "PF") {
      navigate("/jugadorasaptas", { replace: true });
    } else if (role === "Jugadora") {
      navigate("/formpercepcion", { replace: true });
    } else {
      navigate("/navbar", { replace: true });
    }
  }, [user, role, loading, location.pathname, navigate]);

  return (
    <Routes>
      <Route path="/" element={<Index />} />
      <Route path="/login" element={<LoginForm />} />
      <Route path="/reset-password" element={<ResetPassword />} />
      <Route path="/registro" element={<Registro />} />
      <Route path="/completar-datos" element={<CompletarDatos />} />

      <Route path="/navbar" element={<Navbar />} />
      <Route element={<Layout />}>
        <Route path="/jugadorasaptas" element={<JugadorasAptas />} />
        <Route path="/jugadorasesfuerzo" element={<JugadorasEsfuerzo />} />
        <Route path="/historial-percepcion" element={<HistorialPercepcion />} />
        <Route path="/tiposemana" element={<TipoSemana />} />
        <Route path="/semanatrabajar" element={<SemanaTrabajar />} />
        <Route path="/formjugadora" element={<FormJugadoraMensual />} />
        <Route path="/formpercepcion" element={<FormPercepcion />} />
        <Route path="/editar-perfil" element={<EditarPerfil />} />
      </Route>
    </Routes>
  );
}

export default App;
