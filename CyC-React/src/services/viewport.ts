function setVhVar(): void {
  const vh = window.innerHeight * 0.01;
  document.documentElement.style.setProperty("--vh", `${vh}px`);
}

function onResize(): void {
  setVhVar();
}

function onOrientationChange(): void {
  setVhVar();
}

export function startViewportHeightFix(): () => void {
  setVhVar();
  window.addEventListener("resize", onResize);
  window.addEventListener("orientationchange", onOrientationChange);

  return () => {
    window.removeEventListener("resize", onResize);
    window.removeEventListener("orientationchange", onOrientationChange);
  };
}
