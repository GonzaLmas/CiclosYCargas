import { BrowserRouter } from "react-router-dom";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.tsx";
import { AuthProvider } from "./contexts/AuthContext.tsx";
import { startVersionCheck } from "./services/versionCheck";
import { startViewportHeightFix } from "./services/viewport";

startViewportHeightFix();

if (import.meta.env.PROD) {
  startVersionCheck(120000);
}

createRoot(document.getElementById("root")!).render(
  <BrowserRouter>
    <AuthProvider>
      <App />
    </AuthProvider>
  </BrowserRouter>
);
