import { FormEvent, useEffect, useState } from "react";
import { apiRequest } from "../api/client";
import FormActions from "../components/FormActions";
import Modal from "../components/Modal";
import { PageHeader, PageState } from "../components/PageState";
import { Client, Contract } from "../types/api";

const clientInitial = { nome: "", documento: "", email: "", telefone: "" };
const contractInitial = {
  numero_contrato: "",
  data_inicio: "",
  data_fim: "",
  clienteId: "",
};

export default function Clients() {
  const [clients, setClients] = useState<Client[]>([]);
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [clientForm, setClientForm] = useState(clientInitial);
  const [contractForm, setContractForm] = useState(contractInitial);
  const [modal, setModal] = useState<"client" | "contract" | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function load() {
    setLoading(true);
    setError(null);
    try {
      const [clientData, contractData] = await Promise.all([
        apiRequest<Client[]>("/api/clients"),
        apiRequest<Contract[]>("/api/contracts"),
      ]);
      setClients(clientData);
      setContracts(contractData);
    } catch (requestError) {
      setError(readError(requestError));
    } finally {
      setLoading(false);
    }
  }
  useEffect(() => {
    void load();
  }, []);
  async function createClient(event: FormEvent) {
    event.preventDefault();
    setSaving(true);
    try {
      await apiRequest("/api/clients", {
        method: "POST",
        body: JSON.stringify({
          ...clientForm,
          email: clientForm.email || undefined,
          telefone: clientForm.telefone || undefined,
        }),
      });
      setModal(null);
      setClientForm(clientInitial);
      setFeedback("Cliente cadastrado com sucesso.");
      await load();
    } catch (requestError) {
      setError(readError(requestError));
    } finally {
      setSaving(false);
    }
  }
  async function createContract(event: FormEvent) {
    event.preventDefault();
    setSaving(true);
    try {
      await apiRequest("/api/contracts", {
        method: "POST",
        body: JSON.stringify({
          ...contractForm,
          clienteId: Number(contractForm.clienteId),
        }),
      });
      setModal(null);
      setContractForm(contractInitial);
      setFeedback("Contrato criado com sucesso.");
      await load();
    } catch (requestError) {
      setError(readError(requestError));
    } finally {
      setSaving(false);
    }
  }
  const activeContracts = contracts.filter(
    (contract) => contract.status === "ativo",
  );

  return (
    <div className="mx-auto max-w-7xl">
      <PageHeader
        eyebrow="Relacionamentos"
        title="Clientes e contratos"
        subtitle="Acompanhe a carteira e os vínculos comerciais da operação."
        action={
          <div className="flex flex-wrap gap-3">
            <button
              className="button-secondary"
              onClick={() => setModal("contract")}
            >
              + Novo contrato
            </button>
            <button
              className="button-primary max-w-44"
              onClick={() => setModal("client")}
            >
              + Novo cliente
            </button>
          </div>
        }
      />
      {feedback && <PageState message={feedback} />}
      {error && <PageState message={error} error />}
      <section className="mt-8 grid gap-4 sm:grid-cols-3">
        <div className="summary-card">
          <p className="text-xs uppercase tracking-[0.16em] text-slate-500">
            Clientes
          </p>
          <p className="mt-3 font-display text-4xl text-white">
            {clients.length}
          </p>
        </div>
        <div className="summary-card">
          <p className="text-xs uppercase tracking-[0.16em] text-slate-500">
            Contratos ativos
          </p>
          <p className="mt-3 font-display text-4xl text-mint">
            {activeContracts.length}
          </p>
        </div>
        <div className="summary-card">
          <p className="text-xs uppercase tracking-[0.16em] text-slate-500">
            Total de contratos
          </p>
          <p className="mt-3 font-display text-4xl text-white">
            {contracts.length}
          </p>
        </div>
      </section>
      <section className="mt-8 overflow-hidden border border-white/10 bg-panel">
        <div className="table-heading">
          <div>
            <p className="eyebrow">Carteira comercial</p>
            <h2 className="section-title">Clientes</h2>
          </div>
          <button className="button-secondary" onClick={() => void load()}>
            Atualizar ↻
          </button>
        </div>
        {loading ? (
          <PageState message="Carregando clientes..." />
        ) : (
          <div className="grid gap-4 p-5 sm:grid-cols-2 xl:grid-cols-3">
            {clients.map((client) => {
              const linked = contracts.filter(
                (contract) => contract.clienteId === client.id,
              );
              return (
                <article className="entity-card" key={client.id}>
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h3 className="font-semibold text-white">
                        {client.nome}
                      </h3>
                      <p className="mt-1 text-xs text-slate-500">
                        {client.documento}
                      </p>
                    </div>
                    <span
                      className={`status-badge ${client.status === "ativo" ? "status-em_transito" : "status-cancelado"}`}
                    >
                      {client.status}
                    </span>
                  </div>
                  <p className="mt-4 text-sm text-slate-400">
                    {client.email ?? "Sem e-mail"}
                  </p>
                  <div className="mt-5 border-t border-white/10 pt-4">
                    <p className="text-[10px] uppercase tracking-[0.18em] text-slate-500">
                      Contratos vinculados
                    </p>
                    {linked.length ? (
                      linked.map((contract) => (
                        <div
                          className="mt-3 flex items-center justify-between text-sm"
                          key={contract.id}
                        >
                          <span className="text-slate-300">
                            {contract.numero_contrato}
                          </span>
                          <span className="text-xs text-mint">
                            {contract.status}
                          </span>
                        </div>
                      ))
                    ) : (
                      <p className="mt-3 text-sm text-slate-600">
                        Nenhum contrato
                      </p>
                    )}
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </section>
      {modal === "client" && (
        <Modal
          title="Cadastrar cliente"
          eyebrow="Nova carteira"
          onClose={() => setModal(null)}
        >
          <form onSubmit={createClient} className="space-y-4">
            <label className="form-label">
              <span>Nome / Razão social</span>
              <input
                className="field"
                required
                value={clientForm.nome}
                onChange={(e) =>
                  setClientForm({ ...clientForm, nome: e.target.value })
                }
              />
            </label>
            <label className="form-label">
              <span>CPF/CNPJ</span>
              <input
                className="field"
                required
                value={clientForm.documento}
                onChange={(e) =>
                  setClientForm({ ...clientForm, documento: e.target.value })
                }
              />
            </label>
            <label className="form-label">
              <span>E-mail</span>
              <input
                className="field"
                type="email"
                value={clientForm.email}
                onChange={(e) =>
                  setClientForm({ ...clientForm, email: e.target.value })
                }
              />
            </label>
            <label className="form-label">
              <span>Telefone</span>
              <input
                className="field"
                value={clientForm.telefone}
                onChange={(e) =>
                  setClientForm({ ...clientForm, telefone: e.target.value })
                }
              />
            </label>
            <FormActions
              loading={saving}
              onCancel={() => setModal(null)}
              label="Cadastrar cliente"
            />
          </form>
        </Modal>
      )}
      {modal === "contract" && (
        <Modal
          title="Criar contrato"
          eyebrow="Novo vínculo"
          onClose={() => setModal(null)}
        >
          <form onSubmit={createContract} className="space-y-4">
            <label className="form-label">
              <span>Número do contrato</span>
              <input
                className="field"
                required
                value={contractForm.numero_contrato}
                onChange={(e) =>
                  setContractForm({
                    ...contractForm,
                    numero_contrato: e.target.value,
                  })
                }
              />
            </label>
            <label className="form-label">
              <span>Cliente</span>
              <select
                className="field"
                required
                value={contractForm.clienteId}
                onChange={(e) =>
                  setContractForm({
                    ...contractForm,
                    clienteId: e.target.value,
                  })
                }
              >
                <option value="">Selecione um cliente</option>
                {clients
                  .filter((client) => client.status === "ativo")
                  .map((client) => (
                    <option key={client.id} value={client.id}>
                      {client.nome}
                    </option>
                  ))}
              </select>
            </label>
            <div className="form-grid">
              <label className="form-label">
                <span>Início</span>
                <input
                  className="field"
                  type="date"
                  required
                  value={contractForm.data_inicio}
                  onChange={(e) =>
                    setContractForm({
                      ...contractForm,
                      data_inicio: e.target.value,
                    })
                  }
                />
              </label>
              <label className="form-label">
                <span>Fim</span>
                <input
                  className="field"
                  type="date"
                  required
                  value={contractForm.data_fim}
                  onChange={(e) =>
                    setContractForm({
                      ...contractForm,
                      data_fim: e.target.value,
                    })
                  }
                />
              </label>
            </div>
            <FormActions
              loading={saving}
              onCancel={() => setModal(null)}
              label="Criar contrato"
            />
          </form>
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
