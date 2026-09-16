export default function EmptyState({ icon = "bx-inbox", title = "Nothing here yet", subtitle }) {
  return (
    <div className="text-center py-5">
      <i className={`bx ${icon}`} style={{ fontSize: 40, color: "#c8ccd4" }}></i>
      <p className="fw-semibold text-muted mt-2 mb-0">{title}</p>
      {subtitle && <p className="text-muted mb-0" style={{ fontSize: 13 }}>{subtitle}</p>}
    </div>
  );
}
