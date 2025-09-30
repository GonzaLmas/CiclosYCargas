import { BrowserRouter } from "react-router-dom";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.tsx";
import { AuthProvider } from "./contexts/AuthContext.tsx";

if (import.meta.env.PROD) {
  let lastTag: string | null = null;
  const checkForUpdate = async () => {
    try {
      const res = await fetch("/", { method: "HEAD", cache: "no-store" });
      const tag = res.headers.get("ETag") || res.headers.get("Last-Modified");
      if (tag) {
        if (lastTag && tag !== lastTag) {
          location.reload();
        }
        if (!lastTag) lastTag = tag;
      }
    } catch {}
  };

  checkForUpdate();
  setInterval(checkForUpdate, 60000);
}

createRoot(document.getElementById("root")!).render(
  <BrowserRouter>
    <AuthProvider>
      <App />
    </AuthProvider>
  </BrowserRouter>
);
