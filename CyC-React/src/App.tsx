import "./App.css";
import LoginForm from "./components/LoginForm";
import { Routes, Route } from "react-router-dom";
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

function App() {
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
        <Route path="/tiposemana" element={<TipoSemana />} />
        <Route path="/semanatrabajar" element={<SemanaTrabajar />} />
        <Route path="/formjugadora" element={<FormJugadoraMensual />} />
        <Route path="/formpercepcion" element={<FormPercepcion />} />
      </Route>
    </Routes>
  );
}

export default App;
