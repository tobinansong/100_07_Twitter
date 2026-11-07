export default function Tabs({ items, value, onChange, label }) {
  return (
    <div className="tabs" role="group" aria-label={label}>
      {items.map((item) => (
        <button
          key={item.value}
          type="button"
          className="tab"
          aria-pressed={value === item.value}
          onClick={() => onChange(item.value)}
        >
          {item.label}
          {item.count !== undefined && <span className="tab__count">{item.count}</span>}
        </button>
      ))}
    </div>
  );
}
