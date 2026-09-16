const styles = {
  paid: { cls: "bg-label-success", label: "Paid" },
  pending: { cls: "bg-label-warning", label: "Pending" },
  failed: { cls: "bg-label-danger", label: "Failed" },
};

export default function StatusBadge({ status }) {
  const style = styles[status] || { cls: "bg-label-secondary", label: status };
  return (
    <span className={`badge ${style.cls} d-inline-flex align-items-center gap-1`}>
      <span style={{ width: 6, height: 6, borderRadius: "50%", background: "currentColor", display: "inline-block" }}></span>
      {style.label}
    </span>
  );
}
