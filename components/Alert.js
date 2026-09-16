"use client";

const palette = {
  error: { bg: "#fde8e8", color: "#b3261e", border: "#f3b4b0" },
  warning: { bg: "#fff4e0", color: "#9a6300", border: "#f5d999" },
  success: { bg: "#e4f8ec", color: "#1a7f4a", border: "#a9e3c1" },
};

export default function Alert({ type = "error", children, onDismiss }) {
  if (!children) return null;
  const colors = palette[type] || palette.error;

  return (
    <div
      role="alert"
      style={{
        background: colors.bg,
        color: colors.color,
        border: `1px solid ${colors.border}`,
        borderRadius: 10,
        padding: "12px 16px",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        gap: 12,
        fontSize: 14,
        marginBottom: 20,
      }}
    >
      <span>{children}</span>
      {onDismiss && (
        <button
          type="button"
          onClick={onDismiss}
          aria-label="Dismiss"
          style={{
            background: "none",
            border: "none",
            color: colors.color,
            fontSize: 18,
            lineHeight: 1,
            cursor: "pointer",
            padding: 0,
          }}
        >
          ×
        </button>
      )}
    </div>
  );
}
