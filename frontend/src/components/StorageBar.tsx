type StorageBarProps = {
  usedGb?: number;
  totalGb?: number;
};

export default function StorageBar({ usedGb = 3.4, totalGb = 15 }: StorageBarProps) {
  const safeTotal = totalGb <= 0 ? 1 : totalGb;
  const pct = Math.max(0, Math.min(100, (usedGb / safeTotal) * 100));

  return (
    <div className="w-full">
      <div className="mb-2 flex items-center justify-between text-xs text-slate-600">
        <span className="font-medium text-slate-700">Storage</span>
        <span>
          {usedGb.toFixed(1)} GB of {totalGb} GB
        </span>
      </div>
      <div className="h-2 w-full rounded-full bg-slate-200">
        <div
          className="h-2 rounded-full bg-slate-900 transition-all duration-200"
          style={{ width: `${pct}%` }}
          aria-label="Storage used"
        />
      </div>
    </div>
  );
}

