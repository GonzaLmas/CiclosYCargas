let intervalId: number | undefined;
let lastTag: string | null = null;
let started = false;
let lastCheck = 0;
let pollIntervalMs = 120000;

function getCurrentMainAsset(): string | null {
  return (
    document
      .querySelector('script[type="module"][src*="/assets/"]')
      ?.getAttribute("src") || null
  );
}

async function fetchIndexHtml(): Promise<{ html: string; tag: string | null }> {
  const res = await fetch("/", { method: "GET", cache: "no-store" });
  const tag = res.headers.get("ETag") || res.headers.get("Last-Modified");
  const html = await res.text();
  return { html, tag };
}

function extractMainFromHtml(html: string): string | null {
  try {
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, "text/html");
    return (
      doc
        .querySelector('script[type="module"][src*="/assets/"]')
        ?.getAttribute("src") || null
    );
  } catch {
    return null;
  }
}

async function checkForUpdate(): Promise<void> {
  try {
    const currentMain = getCurrentMainAsset();
    const { html, tag } = await fetchIndexHtml();
    const nextMain = extractMainFromHtml(html);

    if (currentMain && nextMain && nextMain !== currentMain) {
      location.reload();
      return;
    }

    if (tag) {
      if (lastTag && tag !== lastTag) {
        location.reload();
        return;
      }
      if (!lastTag) lastTag = tag;
    }
  } catch {
  } finally {
    lastCheck = Date.now();
  }
}

function onVisibilityOrFocus() {
  if (document.visibilityState === "visible") {
    if (Date.now() - lastCheck >= pollIntervalMs) {
      void checkForUpdate();
    }
  }
}

export function startVersionCheck(intervalMs = 120000): void {
  if (started) return;
  started = true;
  pollIntervalMs = intervalMs;

  void checkForUpdate();

  intervalId = window.setInterval(() => {
    void checkForUpdate();
  }, intervalMs);

  window.addEventListener("focus", onVisibilityOrFocus);
  document.addEventListener("visibilitychange", onVisibilityOrFocus);
}

export function stopVersionCheck(): void {
  if (!started) return;
  started = false;
  if (intervalId !== undefined) {
    clearInterval(intervalId);
    intervalId = undefined;
  }
  window.removeEventListener("focus", onVisibilityOrFocus);
  document.removeEventListener("visibilitychange", onVisibilityOrFocus);
}
