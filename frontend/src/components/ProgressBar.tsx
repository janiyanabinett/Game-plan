interface Props {
  value: number;
  max?: number;
  color?: string;
  showLabel?: boolean;
}

export default function ProgressBar({ value, max = 100, color = 'bg-blue-500', showLabel = false }: Props) {
  const pct = Math.min(100, Math.round((value / max) * 100));
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 bg-gray-200 rounded-full h-2 overflow-hidden">
        <div className={`${color} h-2 rounded-full transition-all duration-500`} style={{ width: `${pct}%` }} />
      </div>
      {showLabel && <span className="text-xs text-gray-500 w-8 text-right">{pct}%</span>}
    </div>
  );
}
