import { FormEvent, useEffect, useState } from "react";
import { apiRequest } from "../api/client";
import FormActions from "../components/FormActions";
import Modal from "../components/Modal";
import { PageHeader, PageState } from "../components/PageState";
import {
  Client,
  Contract,
  Driver,
  Freight,
  FreightStatus,
  Occurrence,
  TrackingPoint,
  Vehicle,
} from "../types/api";

const emptyForm = {
  numero_frete: "",
  origem: "",
  destino: "",
  peso_kg: "",
  valor_frete: "",
  previsao_entrega: "",
  clienteId: "",
  contratoId: "",
  veiculoId: "",
  motoristaId: "",
};

const labels: Record<FreightStatus, string> = {
  pendente: "Pendente",
  em_transito: "Em trânsito",
  entregue: "Entregue",
  cancelado: "Cancelado",
};

export default function Freights() {
  const [freights, setFreights] = useState<Freight[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [form, setForm] = useState(emptyForm);
  const [filter, setFilter] = useState<"todos" | FreightStatus>("todos");
  const [modalOpen, setModalOpen] = useState(false);
  const [selected, setSelected] = useState<Freight | null>(null);
  const [tracking, setTracking] = useState<TrackingPoint[]>([]);
  const [occurrences, setOccurrences] = useState<Occurrence[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<string | null>(null);

  async function load(isSilent = false) {
    if (!isSilent) setLoading(true);
    setError(null);
    try {
      // Carrega apenas o essencial para a tabela não quebrar
      const freightData = await apiRequest<Freight[]>("/api/freights");
      setFreights(freightData);

      // Carrega o resto depois, sem bloquear a interface
      const [clientData, contractData, vehicleData, driverData] =
        await Promise.all([
          apiRequest<Client[]>("/api/clients"),
          apiRequest<Contract[]>("/api/contracts"),
          apiRequest<Vehicle[]>("/api/vehicles"),
          apiRequest<Driver[]>("/api/drivers"),
        ]);

      setClients(clientData);
      setContracts(contractData);
      setVehicles(vehicleData);
      setDrivers(driverData);
    } catch (requestError) {
      if (!isSilent) setError(readError(requestError));
    } finally {
      if (!isSilent) setLoading(false);
    }
  }

  /// Carrega os dados apenas quando a tela é aberta ou o frete selecionado muda
  useEffect(() => {
    void load();
  }, [selected?.id]);

  async function createFreight(event: FormEvent) {
    event.preventDefault();
    setSaving(true);
    setError(null);
    try {
      await apiRequest("/api/freights", {
        method: "POST",
        body: JSON.stringify({
          ...form,
          peso_kg: form.peso_kg ? Number(form.peso_kg) : undefined,
          valor_frete: Number(form.valor_frete),
          previsao_entrega: form.previsao_entrega || undefined,
          clienteId: Number(form.clienteId),
          contratoId: Number(form.contratoId),
          veiculoId: Number(form.veiculoId),
          motoristaId: form.motoristaId ? Number(form.motoristaId) : undefined,
        }),
      });
      setModalOpen(false);
      setForm(emptyForm);
      setFeedback("Frete criado com sucesso.");
      await load();
    } catch (requestError) {
      setError(readError(requestError));
    } finally {
      setSaving(false);
    }
  }

  async function openDetails(freight: Freight) {
    setSelected(freight);
    setError(null);
    try {
      const [trackingData, occurrenceData, latestFreightList] =
        await Promise.all([
          apiRequest<TrackingPoint[]>(`/api/tracking/${freight.id}`),
          apiRequest<Occurrence[]>(`/api/occurrences/${freight.id}`),
          apiRequest<Freight[]>("/api/freights"),
        ]);
      setTracking(trackingData);
      setOccurrences(occurrenceData);
      setFreights(latestFreightList);

      const updatedSelected = latestFreightList.find(
        (f) => f.id === freight.id,
      );
      if (updatedSelected) {
        setSelected(updatedSelected);
      }
    } catch (requestError) {
      setError(readError(requestError));
    }
  }

  async function quickStatus(freight: Freight, status: FreightStatus) {
    setSaving(true);
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
      if (selected?.id === freight.id) setSelected({ ...freight, ...updated });

      // GATILHO INTELIGENTE: Se mudou para 'entregue', recarrega a lista para mudar de aba na web
      if (status === "entregue") {
        await load(true);
      }
    } catch (requestError) {
      setError(readError(requestError));
    } finally {
      setSaving(false);
    }
  }

  const visible =
    filter === "todos"
      ? freights
      : freights.filter((freight) => freight.status === filter);

  const selectedContract = contracts.find(
    (contract) => contract.id === Number(form.contratoId),
  );

  const driversForVehicle = drivers.filter((driver) =>
    driver.veiculos.some((vehicle) => vehicle.id === Number(form.veiculoId)),
  );

  return (
    <div className="mx-auto max-w-7xl">
      <PageHeader
        eyebrow="Operação"
        title="Fretes"
        subtitle="Planeje, acompanhe e atualize a jornada de cada carga."
        action={
          <button
            className="button-primary max-w-44"
            onClick={() => setModalOpen(true)}
          >
            + Novo frete
          </button>
        }
      />
      {feedback && <PageState message={feedback} />}
      {error && <PageState message={error} error />}
      <div className="mt-8 flex flex-wrap gap-2">
        {(
          ["todos", "pendente", "em_transito", "entregue", "cancelado"] as const
        ).map((item) => (
          <button
            key={item}
            className={`filter-pill ${filter === item ? "filter-pill-active" : ""}`}
            onClick={() => setFilter(item)}
          >
            {item === "todos" ? "Todos" : labels[item]}
          </button>
        ))}
      </div>
      <section className="table-shell mt-5">
        <div className="table-heading">
          <div>
            <p className="eyebrow">Carteira de transporte</p>
            <h2 className="section-title">Fretes em operação</h2>
          </div>
          <span className="text-xs text-slate-500">
            {visible.length} registros
          </span>
        </div>
        {loading ? (
          <PageState message="Carregando fretes..." />
        ) : (
          <div className="overflow-x-auto">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Frete</th>
                  <th>Rota</th>
                  <th>Cliente</th>
                  <th>Valor</th>
                  <th>Status</th>
                  <th>Ação</th>
                </tr>
              </thead>
              <tbody>
                {visible.map((freight) => (
                  <tr key={freight.id}>
                    <td className="font-semibold text-white">
                      {freight.numero_frete}
                      <span className="mt-1 block text-xs text-slate-500">
                        {freight.veiculo?.placa ?? "-"}
                      </span>
                    </td>
                    <td className="min-w-56">
                      {freight.origem} <span className="text-mint">-&gt;</span>{" "}
                      {freight.destino}
                    </td>
                    <td>{freight.cliente?.nome ?? "-"}</td>
                    <td>
                      R${" "}
                      {Number(freight.valor_frete).toLocaleString("pt-BR", {
                        minimumFractionDigits: 2,
                      })}
                    </td>
                    <td>
                      <span className={`status-badge status-${freight.status}`}>
                        {labels[freight.status]}
                      </span>
                    </td>
                    <td>
                      <div className="flex items-center justify-end gap-3">
                        <button
                          className="text-xs font-bold text-mint hover:text-white"
                          onClick={() => void openDetails(freight)}
                        >
                          Detalhes
                        </button>
                        {freight.status === "pendente" && (
                          <button
                            className="text-xs text-slate-400 hover:text-white"
                            onClick={() =>
                              void quickStatus(freight, "em_transito")
                            }
                            disabled={saving}
                          >
                            Despachar
                          </button>
                        )}
                        {freight.status === "em_transito" && (
                          <button
                            className="text-xs text-slate-400 hover:text-white"
                            onClick={() =>
                              void quickStatus(freight, "entregue")
                            }
                            disabled={saving}
                          >
                            Entregar
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {modalOpen && (
        <Modal
          title="Novo frete"
          eyebrow="Planejamento"
          onClose={() => setModalOpen(false)}
        >
          <form onSubmit={createFreight} className="space-y-4">
            <div className="form-grid">
              <label className="form-label">
                <span>Número do frete</span>
                <input
                  className="field"
                  required
                  value={form.numero_frete}
                  onChange={(e) =>
                    setForm({ ...form, numero_frete: e.target.value })
                  }
                />
              </label>
              <label className="form-label">
                <span>Valor (R$)</span>
                <input
                  className="field"
                  type="number"
                  min="0.01"
                  step="0.01"
                  required
                  value={form.valor_frete}
                  onChange={(e) =>
                    setForm({ ...form, valor_frete: e.target.value })
                  }
                />
              </label>
              <label className="form-label">
                <span>Origem</span>
                <input
                  className="field"
                  required
                  value={form.origem}
                  onChange={(e) => setForm({ ...form, origem: e.target.value })}
                />
              </label>
              <label className="form-label">
                <span>Destino</span>
                <input
                  className="field"
                  required
                  value={form.destino}
                  onChange={(e) =>
                    setForm({ ...form, destino: e.target.value })
                  }
                />
              </label>
              <label className="form-label">
                <span>Peso (kg)</span>
                <input
                  className="field"
                  type="number"
                  min="0"
                  step="0.01"
                  value={form.peso_kg}
                  onChange={(e) =>
                    setForm({ ...form, peso_kg: e.target.value })
                  }
                />
              </label>
              <label className="form-label">
                <span>Previsão de entrega</span>
                <input
                  className="field"
                  type="date"
                  value={form.previsao_entrega}
                  onChange={(e) =>
                    setForm({ ...form, previsao_entrega: e.target.value })
                  }
                />
              </label>
            </div>
            <label className="form-label">
              <span>Cliente</span>
              <select
                className="field"
                required
                value={form.clienteId}
                onChange={(e) =>
                  setForm({
                    ...form,
                    clienteId: e.target.value,
                    contratoId: "",
                  })
                }
              >
                <option value="">Selecione</option>
                {clients
                  .filter((client) => client.status === "ativo")
                  .map((client) => (
                    <option key={client.id} value={client.id}>
                      {client.nome}
                    </option>
                  ))}
              </select>
            </label>
            <label className="form-label">
              <span>Contrato vigente</span>
              <select
                className="field"
                required
                value={form.contratoId}
                onChange={(e) =>
                  setForm({ ...form, contratoId: e.target.value })
                }
              >
                <option value="">Selecione</option>
                {contracts
                  .filter(
                    (contract) =>
                      contract.clienteId === Number(form.clienteId) &&
                      contract.status === "ativo",
                  )
                  .map((contract) => (
                    <option key={contract.id} value={contract.id}>
                      {contract.numero_contrato} (
                      {contract.data_fim.slice(0, 10)})
                    </option>
                  ))}
              </select>
              {form.clienteId && !selectedContract && (
                <small className="text-coral">
                  Selecione um contrato vigente para este cliente.
                </small>
              )}
            </label>
            <div className="form-grid">
              <label className="form-label">
                <span>Veículo</span>
                <select
                  className="field"
                  required
                  value={form.veiculoId}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      veiculoId: e.target.value,
                      motoristaId: "",
                    })
                  }
                >
                  <option value="">Selecione</option>
                  {vehicles
                    .filter((vehicle) => vehicle.status === "ativo")
                    .map((vehicle) => (
                      <option key={vehicle.id} value={vehicle.id}>
                        {vehicle.placa} - {vehicle.modelo}
                      </option>
                    ))}
                </select>
              </label>
              <label className="form-label">
                <span>Motorista</span>
                <select
                  className="field"
                  value={form.motoristaId}
                  onChange={(e) =>
                    setForm({ ...form, motoristaId: e.target.value })
                  }
                >
                  <option value="">Opcional</option>
                  {driversForVehicle.map((driver) => (
                    <option key={driver.id} value={driver.id}>
                      {driver.nome}
                    </option>
                  ))}
                </select>
              </label>
            </div>
            <FormActions
              loading={saving}
              onCancel={() => setModalOpen(false)}
              label="Criar frete"
            />
          </form>
        </Modal>
      )}

      {selected && (
        <Modal
          title={selected.numero_frete}
          eyebrow="Detalhes do frete"
          onClose={() => {
            setSelected(null);
            void load(true);
          }}
        >
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="detail-block">
              <span>Rota</span>
              <strong>
                {selected.origem} -&gt; {selected.destino}
              </strong>
            </div>
            <div className="detail-block">
              <span>Status</span>
              <span className={`status-badge status-${selected.status}`}>
                {labels[selected.status]}
              </span>
            </div>
            <div className="detail-block">
              <span>Veículo</span>
              <strong>{selected.veiculo?.placa ?? "-"}</strong>
            </div>
            <div className="detail-block">
              <span>Motorista</span>
              <strong>{selected.motorista?.nome ?? "Não atribuído"}</strong>
            </div>
          </div>
          <div className="mt-7 grid gap-6 sm:grid-cols-2">
            <div>
              <p className="eyebrow">Rastreamento</p>
              {tracking.length ? (
                <div className="mt-3 space-y-2">
                  {tracking.slice(0, 5).map((point) => (
                    <div className="timeline-item" key={point.id}>
                      <span>
                        {Number(point.latitude).toFixed(4)},{" "}
                        {Number(point.longitude).toFixed(4)}
                      </span>
                      <small>
                        {new Date(point.registrado_em).toLocaleString("pt-BR")}
                      </small>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="mt-3 text-sm text-slate-500">
                  Nenhum checkpoint registrado.
                </p>
              )}
            </div>
            <div>
              <p className="eyebrow">Ocorrências</p>
              {occurrences.length ? (
                <div className="mt-3 space-y-2">
                  {occurrences.map((item) => (
                    <div className="timeline-item" key={item.id}>
                      <span>
                        {item.tipo}: {item.descricao}
                      </span>
                      <small>{item.status}</small>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="mt-3 text-sm text-slate-500">
                  Nenhuma ocorrência registrada.
                </p>
              )}
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}

function readError(error: unknown) {
  return error && typeof error === "object" && "error" in error
    ? String(error.error)
    : "Não foi possível concluir a operação.";
}
