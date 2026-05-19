import type { ComponentType, MouseEvent } from "react";
import type { LucideProps } from "lucide-react";

interface DropdownItemProps {
  icon: ComponentType<LucideProps>;
  label: string;
  onClick: (e: MouseEvent<HTMLButtonElement>) => void;
  disabled?: boolean;
}

export default function DropdownItem({
  icon: Icon,
  label,
  onClick,
  disabled,
}: DropdownItemProps) {
  return (
    <button
      type="button"
      role="menuitem"
      onClick={onClick}
      disabled={disabled}
      className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left text-sm text-slate-700 transition hover:bg-slate-100 focus:bg-slate-100 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50"
    >
      <Icon className="h-4 w-4 text-slate-500" />
      <span className="flex-1 truncate">{label}</span>
    </button>
  );
}
