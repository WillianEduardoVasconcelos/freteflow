import { ReactNode } from "react";

export default function Modal({
  title,
  eyebrow,
  onClose,
  children,
}: {
  title: string;
  eyebrow?: string;
  onClose: () => void;
  children: ReactNode;
}) {
  return (
    <div className="modal-backdrop" role="presentation" onMouseDown={onClose}>
      <section
        className="modal-panel"
        role="dialog"
        aria-modal="true"
        aria-label={title}
        onMouseDown={(event) => event.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-4 border-b border-white/10 px-5 py-5 sm:px-6">
          <div>
            <p className="eyebrow">{eyebrow ?? "Operação"}</p>
            <h2 className="section-title">{title}</h2>
          </div>
          <button className="icon-button" aria-label="Fechar" onClick={onClose}>
            X
          </button>
        </div>
        <div className="max-h-[75vh] overflow-y-auto px-5 py-5 sm:px-6">
          {children}
        </div>
      </section>
    </div>
  );
}
