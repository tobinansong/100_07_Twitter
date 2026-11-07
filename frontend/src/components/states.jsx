import Icon from "./Icon.jsx";
import RadarScope from "./RadarScope.jsx";

export function ScanRows({ rows = 4, label = "Loading" }) {
  return (
    <div className="scan-rows" role="status">
      <span className="sr-only">{label}</span>
      {Array.from({ length: rows }, (_, index) => (
        <div className="scan-row" key={index} aria-hidden="true">
          <span className="scan-row__dot" />
          <span className="scan-row__lines">
            <span className="scan-line scan-line--short" />
            <span className="scan-line" />
            <span className="scan-line scan-line--mid" />
          </span>
        </div>
      ))}
    </div>
  );
}

export function EmptyPanel({ title, children, action }) {
  return (
    <div className="state">
      <RadarScope still className="state__mark" />
      <h2 className="state__title">{title}</h2>
      {children && <p className="state__text">{children}</p>}
      {action}
    </div>
  );
}

export function ErrorPanel({ title = "Signal lost", message, onRetry }) {
  return (
    <div className="state state--error" role="alert">
      <h2 className="state__title">{title}</h2>
      <p className="state__text">{message}</p>
      {onRetry && (
        <button type="button" className="btn btn--ghost" onClick={() => onRetry()}>
          <Icon name="refresh" size={14} />
          Try again
        </button>
      )}
    </div>
  );
}
