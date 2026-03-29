// src/components/UI.jsx

export function Spinner({ size = 32 }) {
  return (
    <div
      style={{
        width: size,
        height: size,
        border: "3px solid rgba(255,255,255,0.1)",
        borderTop: "3px solid #6366f1",
        borderRadius: "50%",
        animation: "spin 0.8s linear infinite",
      }}
    />
  );
}

export function PageLoader() {
  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 16,
        background: "var(--bg-base)",
      }}
    >
      <Spinner size={40} />
      <div
        style={{
          fontSize: 11,
          letterSpacing: 3,
          color: "var(--text-muted)",
          textTransform: "uppercase",
        }}
      >
        Loading…
      </div>
    </div>
  );
}

export function Button({
  children,
  variant = "primary",
  size = "md",
  onClick,
  disabled,
  style = {},
  type = "button",
}) {
  const base = {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    border: "none",
    borderRadius: "var(--radius-md)",
    fontFamily: "var(--font-mono)",
    fontWeight: 700,
    letterSpacing: 1,
    textTransform: "uppercase",
    cursor: disabled ? "not-allowed" : "pointer",
    opacity: disabled ? 0.5 : 1,
    transition: "all 0.18s",
  };
  const sizes = {
    sm: { fontSize: 10, padding: "7px 14px" },
    md: { fontSize: 11, padding: "11px 20px" },
    lg: { fontSize: 13, padding: "14px 28px" },
  };
  const variants = {
    primary: { background: "#6366f1", color: "#fff" },
    ghost: {
      background: "rgba(255,255,255,0.06)",
      color: "var(--text-primary)",
      border: "1px solid var(--border)",
    },
    danger: {
      background: "rgba(239,68,68,0.15)",
      color: "#f87171",
      border: "1px solid rgba(239,68,68,0.3)",
    },
    gold: {
      background: "rgba(251,191,36,0.15)",
      color: "#fbbf24",
      border: "1px solid rgba(251,191,36,0.3)",
    },
  };
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      style={{ ...base, ...sizes[size], ...variants[variant], ...style }}
    >
      {children}
    </button>
  );
}

export function Card({ children, style = {}, onClick, glow }) {
  return (
    <div
      onClick={onClick}
      style={{
        background: "var(--bg-card)",
        border: "1px solid var(--border)",
        borderRadius: "var(--radius-lg)",
        padding: 20,
        boxShadow: glow ? `0 0 32px ${glow}22` : "none",
        cursor: onClick ? "pointer" : "default",
        transition: "border-color 0.2s, box-shadow 0.2s",
        ...style,
      }}
    >
      {children}
    </div>
  );
}

export function Badge({ children, color = "#6366f1" }) {
  return (
    <span
      style={{
        fontSize: 9,
        fontWeight: 700,
        letterSpacing: 2,
        textTransform: "uppercase",
        padding: "3px 8px",
        borderRadius: 99,
        background: color + "22",
        color,
        border: `1px solid ${color}44`,
      }}
    >
      {children}
    </span>
  );
}

export function Modal({ open, onClose, title, children }) {
  if (!open) return null;
  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.7)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 100,
        padding: 20,
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: "#12102a",
          border: "1px solid var(--border-bright)",
          borderRadius: "var(--radius-xl)",
          padding: 28,
          width: "100%",
          maxWidth: 440,
          animation: "fadeIn 0.25s ease",
        }}
      >
        {title && (
          <div
            style={{
              fontFamily: "var(--font-display)",
              fontSize: 20,
              fontWeight: 800,
              marginBottom: 20,
            }}
          >
            {title}
          </div>
        )}
        {children}
      </div>
    </div>
  );
}

export function Input({
  label,
  value,
  onChange,
  onBlur,
  placeholder,
  type = "text",
  style = {},
}) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
      {label && (
        <label
          style={{
            fontSize: 10,
            letterSpacing: 2,
            color: "var(--text-muted)",
            textTransform: "uppercase",
          }}
        >
          {label}
        </label>
      )}
      <input
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        style={{
          background: "rgba(255,255,255,0.05)",
          border: "1px solid var(--border)",
          borderRadius: "var(--radius-md)",
          padding: "11px 14px",
          color: "var(--text-primary)",
          fontFamily: "var(--font-mono)",
          fontSize: 13,
          outline: "none",
          transition: "border-color 0.2s",
          ...style,
        }}
        onFocus={(e) => (e.target.style.borderColor = "#6366f1")}
        onBlur={(e) => { e.target.style.borderColor = "rgba(255,255,255,0.08)"; onBlur?.(e); }}
      />
    </div>
  );
}

export function Select({ label, value, onChange, options, style = {} }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
      {label && (
        <label
          style={{
            fontSize: 10,
            letterSpacing: 2,
            color: "var(--text-muted)",
            textTransform: "uppercase",
          }}
        >
          {label}
        </label>
      )}
      <select
        value={value}
        onChange={onChange}
        style={{
          background: "rgba(255,255,255,0.05)",
          border: "1px solid var(--border)",
          borderRadius: "var(--radius-md)",
          padding: "11px 14px",
          color: "var(--text-primary)",
          fontFamily: "var(--font-mono)",
          fontSize: 13,
          outline: "none",
          cursor: "pointer",
          ...style,
        }}
      >
        {options.map((o) => (
          <option
            key={o.value}
            value={o.value}
            style={{ background: "#12102a" }}
          >
            {o.label}
          </option>
        ))}
      </select>
    </div>
  );
}

export function XPBurst({ show, amount }) {
  if (!show) return null;
  return (
    <span
      style={{
        position: "absolute",
        top: -20,
        right: 10,
        fontSize: 12,
        fontWeight: 800,
        color: "#fbbf24",
        pointerEvents: "none",
        animation: "floatUp 0.9s ease forwards",
        zIndex: 20,
        fontFamily: "var(--font-mono)",
      }}
    >
      +{amount} XP
    </span>
  );
}
