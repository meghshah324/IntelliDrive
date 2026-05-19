import { ChevronRight, Home } from "lucide-react";
import { useFolder } from "../../context/FolderContext";

export default function Breadcrumbs() {
  const { breadcrumbs, navigateTo } = useFolder();

  return (
    <nav
      aria-label="Breadcrumb"
      className="flex flex-wrap items-center gap-1 px-1 text-sm text-slate-600"
    >
      {breadcrumbs.map((crumb, idx) => {
        const isLast = idx === breadcrumbs.length - 1;
        return (
          <span key={`${crumb.id ?? "root"}-${idx}`} className="flex items-center gap-1">
            {idx > 0 && <ChevronRight className="h-4 w-4 text-slate-400" />}
            <button
              type="button"
              onClick={() => !isLast && navigateTo(crumb)}
              disabled={isLast}
              className={[
                "inline-flex items-center gap-1 rounded-lg px-2 py-1 transition",
                isLast
                  ? "cursor-default font-semibold text-slate-900"
                  : "text-slate-500 hover:bg-slate-100 hover:text-slate-900",
              ].join(" ")}
            >
              {idx === 0 && <Home className="h-3.5 w-3.5" aria-hidden />}
              <span className="max-w-[200px] truncate">{crumb.name}</span>
            </button>
          </span>
        );
      })}
    </nav>
  );
}
