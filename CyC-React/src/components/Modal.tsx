import React from "react";

interface ModalProps {
  isOpen: boolean;
  title?: string;
  children: React.ReactNode;
  confirmText?: string;
  cancelText?: string;
  onConfirm?: () => void;
  onCancel?: () => void;
  hideCancel?: boolean;
}

export default function Modal({
  isOpen,
  title,
  children,
  confirmText = "Aceptar",
  cancelText = "Cancelar",
  onConfirm,
  onCancel,
  hideCancel = false,
}: ModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/60" onClick={onCancel} />
      <div className="relative w-full max-w-md mx-4 rounded-lg bg-neutral-800 text-white shadow-xl overflow-hidden">
        <div className="h-1 w-full" style={{ backgroundColor: "#646cff" }} />
        {title && (
          <div
            className="px-5 py-4 border-b border-neutral-700"
            style={{ backgroundColor: "#646cff" }}
          >
            <h3 className="text-lg font-semibold text-white">{title}</h3>
          </div>
        )}
        <div className="px-5 py-4 text-sm text-neutral-200">{children}</div>
        <div className="px-5 py-4 flex gap-3 justify-end border-t border-neutral-700">
          {!hideCancel && (
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 rounded-md bg-neutral-600 hover:bg-neutral-500 transition-colors"
            >
              {cancelText}
            </button>
          )}
          <button
            type="button"
            onClick={onConfirm}
            className="px-4 py-2 rounded-md bg-[#646cff] hover:bg-[#535bf2] transition-colors"
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}
