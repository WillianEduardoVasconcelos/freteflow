import { FormEvent, useEffect, useState } from "react";
import { apiRequest } from "../api/client";
import FormActions from "../components/FormActions";
import Modal from "../components/Modal";
import { PageHeader, PageState } from "../components/PageState";
import { Vehicle } from "../types/api";

const initialForm = {
  placa: "",
  modelo: "",
  marca: "",
  ano_fabricacao: "2025",
  cor: "",
  chassis: "",
  categoria: "caminhao",
  tipo_combustivel: "diesel",
  capacidade_tanque: "",
  capacidade_peso: "",
  capacidade_volume: "",
};

export default function Vehicles() {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [form, setForm] = useState(initialForm);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function load() {
    setLoading(true);
    setError(null);
    try {
      setVehicles(await apiRequest<Vehicle[]>("/api/vehicles"));
    } catch (requestError) {
      setError(readError(requestError));
    } finally {
      setLoading(false);
    }
  }
  useEffect(() => {
    void load();
  }, []);

  async function submit(event: FormEvent) {
    event.preventDefault();
    setSaving(true);
    setError(null);
    setFeedback(null);
    try {
      await apiRequest("/api/vehicles", {
        method: "POST",
        body: JSON.stringify({
          ...form,
          ano_fabricacao: Number(form.ano_fabricacao),
          capacidade_tanque: Number(form.capacidade_tanque),
          capacidade_peso: form.capacidade_peso
            ? Number(form.capacidade_peso)
            : undefined,
          capacidade_volume: form.capacidade_volume
            ? Number(form.capacidade_volume)
            : undefined,
        }),
      });
      setOpen(false);
      setForm(initialForm);
      setFeedback("Veículo cadastrado com sucesso.");
      await load();
    } catch (requestError) {
      setError(readError(requestError));
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="mx-auto max-w-7xl">
      <PageHeader
        eyebrow="Frota"
        title="Veículos"
        subtitle="Controle capacidade, disponibilidade e documentação da frota."
        action={
          <button
            className="button-primary max-w-56"
            onClick={() => {
              setError(null);
              setOpen(true);
            }}
          >
            + Novo veículo
          </button>
        }
      />
      {feedback && <PageState message={feedback} />}
      {error && <PageState message={error} error />}
      <section className="table-shell mt-8">
        <div className="table-heading">
          <div>
            <p className="eyebrow">Inventário</p>
            <h2 className="section-title">Frota cadastrada</h2>
          </div>
          <button className="button-secondary" onClick={() => void load()}>
            Atualizar ↻
          </button>
        </div>
        {loading ? (
          <PageState message="Carregando veículos..." />
        ) : vehicles.length === 0 ? (
          <PageState message="Nenhum veículo cadastrado." />
        ) : (
          <div className="overflow-x-auto">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Placa</th>
                  <th>Modelo</th>
                  <th>Categoria</th>
                  <th>Capacidade</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {vehicles.map((vehicle) => (
                  <tr key={vehicle.id}>
                    <td className="font-semibold text-white">
                      {vehicle.placa}
                    </td>
                    <td>
                      {vehicle.marca} {vehicle.modelo}
                    </td>
                    <td>{vehicle.categoria}</td>
                    <td>
                      {vehicle.capacidade_peso
                        ? `${vehicle.capacidade_peso} kg`
                        : "-"}
                      {vehicle.capacidade_volume
                        ? ` / ${vehicle.capacidade_volume} m³`
                        : ""}
                    </td>
                    <td>
                      <span
                        className={`status-badge ${vehicle.status === "ativo" ? "status-em_transito" : "status-cancelado"}`}
                      >
                        {vehicle.status}
                      </span>
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
          title="Cadastrar veículo"
          eyebrow="Nova frota"
          onClose={() => setOpen(false)}
        >
          <form onSubmit={submit} className="form-grid">
            {field("Placa", "placa", form, setForm, "ABC1D23", true)}
            {field("Modelo", "modelo", form, setForm, "Cargo 2429", true)}
            {field("Marca", "marca", form, setForm, "Ford", true)}
            {field("Cor", "cor", form, setForm, "Branco", true)}
            {field("Chassi", "chassis", form, setForm, "Identificador", true)}
            {field(
              "Ano",
              "ano_fabricacao",
              form,
              setForm,
              "2025",
              true,
              "number",
            )}
            <label className="form-label">
              <span>Categoria</span>
              <select
                className="field"
                value={form.categoria}
                onChange={(e) =>
                  setForm({ ...form, categoria: e.target.value })
                }
              >
                <option>caminhao</option>
                <option>carreta</option>
                <option>moto</option>
              </select>
            </label>
            <label className="form-label">
              <span>Combustível</span>
              <select
                className="field"
                value={form.tipo_combustivel}
                onChange={(e) =>
                  setForm({ ...form, tipo_combustivel: e.target.value })
                }
              >
                <option>diesel</option>
                <option>gasolina</option>
                <option>etanol</option>
                <option>eletrico</option>
              </select>
            </label>
            {field(
              "Tanque (L)",
              "capacidade_tanque",
              form,
              setForm,
              "300",
              true,
              "number",
            )}
            {field(
              "Peso (kg)",
              "capacidade_peso",
              form,
              setForm,
              "Opcional",
              false,
              "number",
            )}
            {field(
              "Volume (m³)",
              "capacidade_volume",
              form,
              setForm,
              "Opcional",
              false,
              "number",
            )}
            <div className="col-span-full">
              <FormActions
                loading={saving}
                onCancel={() => setOpen(false)}
                label="Cadastrar veículo"
              />
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}

function field(
  label: string,
  key: keyof typeof initialForm,
  form: typeof initialForm,
  setForm: (value: typeof initialForm) => void,
  placeholder: string,
  required = false,
  type = "text",
) {
  return (
    <label className="form-label">
      <span>{label}</span>
      <input
        className="field"
        type={type}
        value={form[key]}
        placeholder={placeholder}
        required={required}
        onChange={(event) => setForm({ ...form, [key]: event.target.value })}
      />
    </label>
  );
}
function readError(error: unknown) {
  return error && typeof error === "object" && "error" in error
    ? String(error.error)
    : "Não foi possível concluir a operação.";
}
