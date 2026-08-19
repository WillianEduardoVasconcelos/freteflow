import { FormEvent, useEffect, useState } from "react";
import { apiRequest } from "../api/client";
import FormActions from "../components/FormActions";
import Modal from "../components/Modal";
import { PageHeader, PageState } from "../components/PageState";
import { Driver, Vehicle } from "../types/api";

const emptyForm = { nome: "", numero_cnh: "", validade_cnh: "" };

export default function Drivers() {
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [form, setForm] = useState(emptyForm);
  const [open, setOpen] = useState(false);
  const [linking, setLinking] = useState<Driver | null>(null);
  const [vehicleId, setVehicleId] = useState("");
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function load() {
    setLoading(true);
    setError(null);
    try {
      const [driverData, vehicleData] = await Promise.all([
        apiRequest<Driver[]>("/api/drivers"),
        apiRequest<Vehicle[]>("/api/vehicles"),
      ]);
      setDrivers(driverData);
      setVehicles(vehicleData);
    } catch (requestError) {
      setError(readError(requestError));
    } finally {
      setLoading(false);
    }
  }
  useEffect(() => {
    void load();
  }, []);

  async function createDriver(event: FormEvent) {
    event.preventDefault();
    setSaving(true);
    setError(null);
    try {
      await apiRequest("/api/drivers", {
        method: "POST",
        body: JSON.stringify(form),
      });
      setOpen(false);
      setForm(emptyForm);
      setFeedback("Motorista cadastrado com sucesso.");
      await load();
    } catch (requestError) {
      setError(readError(requestError));
    } finally {
      setSaving(false);
    }
  }
  async function toggleVehicle(driver: Driver, id: number, attached: boolean) {
    setError(null);
    try {
      await apiRequest(`/api/drivers/${driver.id}/vehicles/${id}`, {
        method: attached ? "DELETE" : "POST",
      });
      setFeedback(attached ? "Veículo desvinculado." : "Veículo vinculado.");
      await load();
    } catch (requestError) {
      setError(readError(requestError));
    }
  }
  async function linkVehicle(event: FormEvent) {
    event.preventDefault();
    if (!linking || !vehicleId) return;
    setSaving(true);
    try {
      await toggleVehicle(linking, Number(vehicleId), false);
      setLinking(null);
      setVehicleId("");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="mx-auto max-w-7xl">
      <PageHeader
        eyebrow="Pessoas"
        title="Motoristas"
        subtitle="CNH, disponibilidade e permissões de condução por veículo."
        action={
          <button
            className="button-primary max-w-56"
            onClick={() => setOpen(true)}
          >
            + Novo motorista
          </button>
        }
      />
      {feedback && <PageState message={feedback} />}
      {error && <PageState message={error} error />}
      <section className="table-shell mt-8">
        <div className="table-heading">
          <div>
            <p className="eyebrow">Equipe de campo</p>
            <h2 className="section-title">Motoristas cadastrados</h2>
          </div>
          <button className="button-secondary" onClick={() => void load()}>
            Atualizar ↻
          </button>
        </div>
        {loading ? (
          <PageState message="Carregando motoristas..." />
        ) : (
          <div className="overflow-x-auto">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Motorista</th>
                  <th>CNH</th>
                  <th>Validade</th>
                  <th>Veículos autorizados</th>
                  <th>Status</th>
                  <th>Ação</th>
                </tr>
              </thead>
              <tbody>
                {drivers.map((driver) => (
                  <tr key={driver.id}>
                    <td className="font-semibold text-white">{driver.nome}</td>
                    <td>{driver.numero_cnh}</td>
                    <td>
                      {new Date(driver.validade_cnh).toLocaleDateString(
                        "pt-BR",
                      )}
                    </td>
                    <td>
                      <div className="flex flex-wrap gap-2">
                        {driver.veiculos.length ? (
                          driver.veiculos.map((vehicle) => (
                            <button
                              key={vehicle.id}
                              className="chip"
                              title="Desvincular veículo"
                              onClick={() =>
                                void toggleVehicle(driver, vehicle.id, true)
                              }
                            >
                              {vehicle.placa} ×
                            </button>
                          ))
                        ) : (
                          <span className="text-slate-600">Nenhum</span>
                        )}
                        <button
                          className="chip chip-add"
                          onClick={() => {
                            setLinking(driver);
                            setVehicleId("");
                          }}
                        >
                          + vincular
                        </button>
                      </div>
                    </td>
                    <td>
                      <span
                        className={`status-badge ${driver.status === "ativo" ? "status-em_transito" : "status-cancelado"}`}
                      >
                        {driver.status}
                      </span>
                    </td>
                    <td>
                      <button
                        className="text-xs font-bold text-mint hover:text-white"
                        onClick={() => {
                          setLinking(driver);
                          setVehicleId("");
                        }}
                      >
                        Gerenciar
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
      {open && (
        <Modal
          title="Cadastrar motorista"
          eyebrow="Nova pessoa"
          onClose={() => setOpen(false)}
        >
          <form onSubmit={createDriver} className="space-y-4">
            <label className="form-label">
              <span>Nome completo</span>
              <input
                className="field"
                required
                value={form.nome}
                onChange={(e) => setForm({ ...form, nome: e.target.value })}
              />
            </label>
            <label className="form-label">
              <span>CNH</span>
              <input
                className="field"
                required
                value={form.numero_cnh}
                onChange={(e) =>
                  setForm({ ...form, numero_cnh: e.target.value })
                }
              />
            </label>
            <label className="form-label">
              <span>Validade da CNH</span>
              <input
                className="field"
                type="date"
                required
                value={form.validade_cnh}
                onChange={(e) =>
                  setForm({ ...form, validade_cnh: e.target.value })
                }
              />
            </label>
            <FormActions
              loading={saving}
              onCancel={() => setOpen(false)}
              label="Cadastrar motorista"
            />
          </form>
        </Modal>
      )}
      {linking && (
        <Modal
          title={`Veículos de ${linking.nome}`}
          eyebrow="Permissões"
          onClose={() => setLinking(null)}
        >
          <form onSubmit={linkVehicle} className="space-y-4">
            <label className="form-label">
              <span>Selecionar veículo</span>
              <select
                className="field"
                required
                value={vehicleId}
                onChange={(e) => setVehicleId(e.target.value)}
              >
                <option value="">Escolha uma placa</option>
                {vehicles
                  .filter(
                    (vehicle) =>
                      !linking.veiculos.some(
                        (attached) => attached.id === vehicle.id,
                      ),
                  )
                  .map((vehicle) => (
                    <option key={vehicle.id} value={vehicle.id}>
                      {vehicle.placa} - {vehicle.modelo}
                    </option>
                  ))}
              </select>
            </label>
            <FormActions
              loading={saving}
              onCancel={() => setLinking(null)}
              label="Vincular veículo"
            />
          </form>
          <div className="mt-6 border-t border-white/10 pt-5">
            <p className="text-xs uppercase tracking-[0.16em] text-slate-500">
              Atualmente autorizados
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              {linking.veiculos.map((vehicle) => (
                <span className="chip" key={vehicle.id}>
                  {vehicle.placa}
                </span>
              ))}
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
