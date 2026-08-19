import { useEffect, useState } from "react";
import { apiRequest } from "../api/client";

type FreightStatus = "pendente" | "em_transito" | "entregue" | "cancelado";

type Freight = {
  id: number;
  numero_frete: string;
  origem: string;
  destino: string;
  status: FreightStatus;
  valor_frete: string | number;
  previsao_entrega?: string;
  cliente?: { nome: string };
  veiculo?: { placa: string };
};

type Occurrence = { status: string };

const statusLabels: Record<FreightStatus, string> = {
  pendente: "Pendente",
  em_transito: "Em trânsito",
  entregue: "Entregue",
  cancelado: "Cancelado",
};

function formatDate(value?: string) {
  if (!value) return "Sem previsão";
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "short",
  }).format(new Date(value));
}

function nextStatus(status: FreightStatus): FreightStatus | null {
  if (status === "pendente") return "em_transito";
  if (status === "em_transito") return "entregue";
  return null;
}

export default function Dashboard() {
  const [freights, setFreights] = useState<Freight[]>([]);
  const [openOccurrences, setOpenOccurrences] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [updatingId, setUpdatingId] = useState<number | null>(null);

  async function loadDashboard() {
    setLoading(true);
    setError(null);
    try {
      const response = await apiRequest<Freight[]>("/api/freights");
      setFreights(response);
      const occurrenceLists = await Promise.all(
        response.map((freight) =>
          apiRequest<Occurrence[]>(`/api/occurrences/${freight.id}`),
        ),
      );
      setOpenOccurrences(
        occurrenceLists.flat().filter((item) => item.status !== "RESOLVIDA")
          .length,
      );
    } catch (requestError) {
      setError(
        requestError &&
          typeof requestError === "object" &&
          "error" in requestError
          ? String(requestError.error)
          : "Não foi possível carregar a operação.",
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadDashboard();
  }, []);

  async function advanceFreight(freight: Freight) {
    const status = nextStatus(freight.status);
    if (!status) return;
    setUpdatingId(freight.id);
    try {
      const updated = await apiRequest<Freight>(`/api/freights/${freight.id}`, {
        method: "PATCH",
        body: JSON.stringify({ status }),
      });
      setFreights((current) =>
        current.map((item) =>
          item.id === freight.id ? { ...item, ...updated } : item,
        ),
      );
    } catch (requestError) {
      setError(
        requestError &&
          typeof requestError === "object" &&
          "error" in requestError
          ? String(requestError.error)
          : "Não foi possível atualizar o frete.",
      );
    } finally {
      setUpdatingId(null);
    }
  }

  const inTransit = freights.filter(
    (freight) => freight.status === "em_transito",
  ).length;
  const delivered = freights.filter(
    (freight) => freight.status === "entregue",
  ).length;

  return (
    <div className="mx-auto max-w-7xl">
      <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
        <div>
          <p className="eyebrow">Painel de controle</p>
          <h1 className="page-title">Bom dia, operação.</h1>
          <p className="page-subtitle">
            Acompanhe o pulso da sua frota e das entregas.
          </p>
        </div>
        <button
          className="button-secondary"
          onClick={() => void loadDashboard()}
          disabled={loading}
        >
          Atualizar dados <span aria-hidden="true">↻</span>
        </button>
      </div>

      {error && (
        <div
          className="mt-7 border border-coral/30 bg-coral/10 px-4 py-3 text-sm text-coral"
          role="alert"
        >
          {error}
        </div>
      )}

      <section
        className="mt-9 grid gap-4 sm:grid-cols-2 xl:grid-cols-4"
        aria-label="Resumo da operação"
      >
        <SummaryCard
          label="Total de fretes"
          value={freights.length}
          detail="na carteira atual"
          accent="mint"
        />
        <SummaryCard
          label="Em trânsito"
          value={inTransit}
          detail="veículos em rota"
          accent="amber"
        />
        <SummaryCard
          label="Entregues"
          value={delivered}
          detail="operação concluída"
          accent="blue"
        />
        <SummaryCard
          label="Ocorrências abertas"
          value={openOccurrences}
          detail="pedem atenção"
          accent="coral"
        />
      </section>

      <section className="mt-10 overflow-hidden border border-white/10 bg-panel">
        <div className="flex flex-col gap-2 border-b border-white/10 px-5 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <div>
            <p className="eyebrow">Monitoramento</p>
            <h2 className="section-title">Últimos fretes</h2>
          </div>
          <span className="text-xs text-slate-500">
            {freights.length} registros
          </span>
        </div>
        {loading ? (
          <div className="px-6 py-12 text-sm text-slate-500">
            Carregando operação...
          </div>
        ) : freights.length === 0 ? (
          <div className="px-6 py-12 text-sm text-slate-500">
            Nenhum frete encontrado.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead className="border-b border-white/10 text-[10px] uppercase tracking-[0.18em] text-slate-500">
                <tr>
                  <th className="px-6 py-4 font-bold">Frete</th>
                  <th className="px-6 py-4 font-bold">Rota</th>
                  <th className="px-6 py-4 font-bold">Cliente</th>
                  <th className="px-6 py-4 font-bold">Entrega</th>
                  <th className="px-6 py-4 font-bold">Status</th>
                  <th className="px-6 py-4 text-right font-bold">Ação</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {freights.slice(0, 8).map((freight) => {
                  const action = nextStatus(freight.status);
                  return (
                    <tr
                      key={freight.id}
                      className="text-slate-300 transition-colors hover:bg-white/[0.025]"
                    >
                      <td className="whitespace-nowrap px-6 py-5">
                        <span className="font-semibold text-white">
                          {freight.numero_frete}
                        </span>
                        <span className="mt-1 block text-xs text-slate-500">
                          {freight.veiculo?.placa ?? "Veículo não informado"}
                        </span>
                      </td>
                      <td className="min-w-56 px-6 py-5">
                        <span>{freight.origem}</span>
                        <span className="mx-2 text-mint">-&gt;</span>
                        <span>{freight.destino}</span>
                      </td>
                      <td className="whitespace-nowrap px-6 py-5 text-slate-400">
                        {freight.cliente?.nome ?? "-"}
                      </td>
                      <td className="whitespace-nowrap px-6 py-5 text-slate-400">
                        {formatDate(freight.previsao_entrega)}
                      </td>
                      <td className="px-6 py-5">
                        <span
                          className={`status-badge status-${freight.status}`}
                        >
                          {statusLabels[freight.status]}
                        </span>
                      </td>
                      <td className="whitespace-nowrap px-6 py-5 text-right">
                        {action ? (
                          <button
                            className="text-xs font-bold text-mint transition-colors hover:text-white disabled:opacity-40"
                            disabled={updatingId === freight.id}
                            onClick={() => void advanceFreight(freight)}
                          >
                            {updatingId === freight.id
                              ? "Salvando..."
                              : statusLabels[action]}
                          </button>
                        ) : (
                          <span className="text-xs text-slate-600">
                            Finalizado
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}

function SummaryCard({
  label,
  value,
  detail,
  accent,
}: {
  label: string;
  value: number;
  detail: string;
  accent: "mint" | "amber" | "blue" | "coral";
}) {
  return (
    <article className="summary-card">
      <div className={`summary-dot summary-dot-${accent}`} />
      <p className="text-xs font-bold uppercase tracking-[0.16em] text-slate-500">
        {label}
      </p>
      <p className="mt-4 font-display text-4xl text-white">{value}</p>
      <p className="mt-2 text-xs text-slate-500">{detail}</p>
    </article>
  );
}
