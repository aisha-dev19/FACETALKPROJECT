import { useEffect } from "react";

type ConfirmDialogProps = {
  title: string;
  message: string;
  confirmLabel: string;
  cancelLabel: string;
  busyLabel: string;
  busy: boolean;
  error: string;
  onConfirm: () => void;
  onClose: () => void;
};

export default function ConfirmDialog({
  title,
  message,
  confirmLabel,
  cancelLabel,
  busyLabel,
  busy,
  error,
  onConfirm,
  onClose,
}: ConfirmDialogProps) {
  // Escape closes the pop-up (unless it is in the middle of working)
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape" && !busy) onClose();
    }

    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [busy, onClose]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      onClick={() => {
        if (!busy) onClose();
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="confirm-title"
        className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 id="confirm-title" className="text-lg font-semibold text-slate-900">
          {title}
        </h2>
        <p className="mt-2 text-sm leading-6 text-slate-600">{message}</p>

        {error && (
          <p role="alert" className="mt-3 text-sm text-red-600">
            {error}
          </p>
        )}

        <div className="mt-6 flex justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            disabled={busy}
            className="rounded-md border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:opacity-60"
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={busy}
            className="rounded-md bg-red-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-red-700 disabled:opacity-60"
          >
            {busy ? busyLabel : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}