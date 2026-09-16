export default function LoadingState({ label = "Loading..." }) {
  return (
    <div className="d-flex align-items-center gap-2 text-muted py-5 justify-content-center">
      <div className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></div>
      <span>{label}</span>
    </div>
  );
}
