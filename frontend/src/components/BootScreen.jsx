import Icon from "./Icon.jsx";
import Logo from "./Logo.jsx";
import OrbitField from "./OrbitField.jsx";
import RadarScope from "./RadarScope.jsx";

export default function BootScreen({ error, onRetry, retrying = false }) {
  return (
    <div className="boot">
      <OrbitField />
      <RadarScope className="boot__radar" fast={retrying} />
      <Logo size={30} />
      {error ? (
        <div className="boot__message" role="alert">
          <p className="eyebrow eyebrow--alarm">Uplink failed</p>
          <p className="boot__detail">{error.message}</p>
          <button type="button" className="btn btn--ghost" onClick={() => onRetry()} disabled={retrying}>
            <Icon name="refresh" size={14} />
            {retrying ? "Retrying" : "Try again"}
          </button>
        </div>
      ) : (
        <p className="eyebrow boot__status" role="status">
          Establishing uplink
        </p>
      )}
    </div>
  );
}
