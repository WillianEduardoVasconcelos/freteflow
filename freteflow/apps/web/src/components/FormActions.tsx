export default function FormActions({
  loading,
  onCancel,
  label,
}: {
  loading: boolean;
  onCancel: () => void;
  label: string;
}) {
  return (
    <div className="mt-6 flex justify-end gap-3">
      <button type="button" className="button-secondary" onClick={onCancel}>
        Cancelar
      </button>
      <button
        type="submit"
        className="button-primary max-w-48"
        disabled={loading}
      >
        {loading ? "Salvando..." : label}
      </button>
    </div>
  );
}
