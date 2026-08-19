import { useLocation } from "react-router-dom";

const labels: Record<string, string> = {
  "/freights": "Fretes",
  "/vehicles": "Veículos",
  "/drivers": "Motoristas",
  "/clients": "Clientes",
};

export default function SectionPlaceholder() {
  const location = useLocation();
  const label = labels[location.pathname] ?? "Módulo";

  return (
    <div className="mx-auto max-w-7xl">
      <p className="eyebrow">Em construção</p>
      <h1 className="page-title">{label}</h1>
      <p className="page-subtitle">
        Esta área será conectada aos fluxos operacionais na próxima etapa.
      </p>
    </div>
  );
}
