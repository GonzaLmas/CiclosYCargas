import { BrowserRouter } from "react-router-dom";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.tsx";
import { AuthProvider } from "./contexts/AuthContext.tsx";

// Production-only: detect new deploys and auto-reload the tab
if (import.meta.env.PROD) {
  let lastTag: string | null = null;
  // current main asset loaded in the page (e.g. /assets/index-XXXX.js)
  const currentMain = document
    .querySelector('script[type="module"][src*="/assets/"]')
    ?.getAttribute("src");

  const checkForUpdate = async () => {
    try {
      const res = await fetch("/", { method: "GET", cache: "no-store" });
      const tag = res.headers.get("ETag") || res.headers.get("Last-Modified");
      const html = await res.text();

      // Parse HTML safely and find the main module script pointing to assets
      let nextMain: string | null = null;
      try {
        const parser = new DOMParser();
        const doc = parser.parseFromString(html, "text/html");
        nextMain = doc
          .querySelector('script[type="module"][src*="/assets/"]')
          ?.getAttribute("src") || null;
      } catch {
        // ignore DOM parsing errors
      }

      // Prefer comparing the hashed main asset name; if it changed, there is a new build
      if (currentMain && nextMain && nextMain !== currentMain) {
        location.reload();
        return;
      }

      // Fallback: header changed
      if (tag) {
        if (lastTag && tag !== lastTag) {
          location.reload();
          return;
        }
        if (!lastTag) lastTag = tag;
      }
    } catch {
      // ignore network errors
    }
  };
  // initial check and then every 30s
  checkForUpdate();
  setInterval(checkForUpdate, 30000);
}

createRoot(document.getElementById("root")!).render(
  <BrowserRouter>
    <AuthProvider>
      <App />
    </AuthProvider>
  </BrowserRouter>
);
