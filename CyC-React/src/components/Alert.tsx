import React from "react";

export type AlertType = "success" | "error" | "info" | "warning";

interface AlertProps {
  type?: AlertType;
  className?: string;
  role?: "alert" | "status";
  children: React.ReactNode;
}

/**
 * Reusable alert box with project-wide styling.
 * Usage:
 *   <Alert type="error">Mensaje de error</Alert>
 *   <Alert type="success">Operación exitosa</Alert>
 */
export default function Alert({ type = "info", className = "", role, children }: AlertProps) {
  const palette: Record<AlertType, { bg: string; text: string; defaultRole: "alert" | "status" }> = {
    success: { bg: "bg-green-100", text: "text-green-700", defaultRole: "status" },
    error: { bg: "bg-red-100", text: "text-red-700", defaultRole: "alert" },
    info: { bg: "bg-blue-100", text: "text-blue-700", defaultRole: "status" },
    warning: { bg: "bg-yellow-100", text: "text-yellow-800", defaultRole: "alert" },
  };

  const colors = palette[type];

  return (
    <div
      className={`p-4 mb-4 rounded-md ${colors.bg} ${colors.text} ${className}`}
      role={role ?? colors.defaultRole}
      aria-live={role === "alert" ? "assertive" : "polite"}
    >
      {children}
    </div>
  );
}
