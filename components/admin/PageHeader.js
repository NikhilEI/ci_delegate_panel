import IconBadge from "./IconBadge";

export default function PageHeader({ icon, title, subtitle, action }) {
  return (
    <div className="d-flex flex-wrap align-items-start justify-content-between mb-4 gap-3">
      <div className="d-flex align-items-center gap-3">
        {icon && <IconBadge icon={icon} size={44} />}
        <div>
          <h4 className="fw-bold mb-0">{title}</h4>
          {subtitle && (
            <p className="text-muted mb-0" style={{ fontSize: 13.5 }}>
              {subtitle}
            </p>
          )}
        </div>
      </div>
      {action && <div>{action}</div>}
    </div>
  );
}
