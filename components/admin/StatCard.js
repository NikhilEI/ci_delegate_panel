import IconBadge from "./IconBadge";

export default function StatCard({ icon, tint = "primary", label, value, sub }) {
  return (
    <div className="col-sm-6 col-lg-3 mb-4">
      <div className="card h-100">
        <div className="card-body d-flex align-items-start gap-3">
          <IconBadge icon={icon} tint={tint} size={46} />
          <div style={{ minWidth: 0 }}>
            <span className="d-block text-muted text-truncate" style={{ fontSize: 12.5, textTransform: "uppercase", letterSpacing: "0.03em" }}>
              {label}
            </span>
            <h3 className="mb-0" style={{ fontSize: 24 }}>
              {value}
            </h3>
            {sub && (
              <small className="text-muted d-block" style={{ fontSize: 12.5 }}>
                {sub}
              </small>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
