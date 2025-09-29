export function validateEmail(email: string): string | null {
  const value = (email || "").trim();
  if (!value) return "Ingresá tu email";

  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!re.test(value)) return "Email inválido";
  return null;
}

export function validateNewPassword(
  password: string,
  confirm: string
): string | null {
  const p = (password || "").trim();
  const c = (confirm || "").trim();
  if (!p || !c) return "Completá ambos campos";
  if (p !== c) return "Las contraseñas no coinciden";
  if (p.length < 6) return "La contraseña debe tener al menos 6 caracteres";
  return null;
}

export function translateSupabaseResetError(message?: string): string {
  const m = message || "";
  const rateLimit = m.match(
    /For security purposes, you can only request this after (\d+) seconds?\.?/i
  );
  if (rateLimit) {
    const seconds = rateLimit[1];
    return `Por motivos de seguridad, solo podés solicitarlo nuevamente después de ${seconds} segundos.`;
  }
  if (/Email not found|User not found/i.test(m))
    return "No encontramos un usuario con ese email.";
  if (/reset password rate limit/i.test(m))
    return "Alcanzaste el límite de intentos. Probá más tarde.";
  if (/Email rate limit exceeded/i.test(m))
    return "Demasiadas solicitudes. Intentá de nuevo en unos minutos.";
  return "No se pudo enviar el email de recuperación. Intentá nuevamente en unos segundos.";
}

export function translateSupabaseUpdateError(message?: string): string {
  const m = message || "";
  if (/token.*expired|session.*not found|access token is invalid/i.test(m))
    return "El enlace de recuperación expiró o no es válido. Volvé a solicitarlo.";
  if (/password should be at least|length|too short/i.test(m))
    return "La contraseña es muy corta. Debe tener al menos 6 caracteres.";
  if (/same as previous password/i.test(m))
    return "La nueva contraseña no puede ser igual a la anterior.";
  if (/rate limit|too many requests/i.test(m))
    return "Demasiados intentos. Intentá de nuevo en unos minutos.";
  return "No se pudo actualizar la contraseña. Intentá nuevamente.";
}
