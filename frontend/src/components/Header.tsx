import { useMemo, useState } from "react";
import { Filter, LayoutGrid, List, ChevronDown } from "lucide-react";
import CreateDropdown from "./CreateDropdown";

type ViewMode = "grid" | "list";

export default function Header() {
  const [viewMode, setViewMode] = useState<ViewMode>("grid");
  const sortLabel = useMemo(() => "Modified", []);

  return (
    <div className="sticky top-0 z-10 border-b border-slate-200 bg-white/90 backdrop-blur">
      <div className="flex items-center justify-between gap-4 px-6 py-4">
        <div className="flex min-w-0 flex-1 items-center gap-3">
          <label className="w-full max-w-xl">
            <span className="sr-only">Find</span>
            <input
              placeholder="Find"
              className="w-full rounded-full border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-900 shadow-sm outline-none transition-all duration-200 placeholder:text-slate-400 focus:border-slate-300 focus:ring-4 focus:ring-slate-100"
            />
          </label>
        </div>

        <div className="flex flex-none items-center gap-2">
          <button
            type="button"
            className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-700 shadow-sm transition-all duration-200 hover:bg-slate-50"
            aria-label="Filter"
          >
            <Filter className="h-4 w-4" aria-hidden="true" />
          </button>

          <button
            type="button"
            className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-2.5 text-sm font-medium text-slate-800 shadow-sm transition-all duration-200 hover:bg-slate-50"
            aria-label="Sort"
          >
            <span>{sortLabel}</span>
            <ChevronDown className="h-4 w-4 text-slate-600" aria-hidden="true" />
          </button>

          <div className="flex items-center rounded-full border border-slate-200 bg-white p-1 shadow-sm">
            <button
              type="button"
              onClick={() => setViewMode("grid")}
              className={[
                "inline-flex h-8 w-8 items-center justify-center rounded-full transition-all duration-200",
                viewMode === "grid" ? "bg-slate-900 text-white" : "text-slate-700 hover:bg-slate-50",
              ].join(" ")}
              aria-label="Grid view"
              aria-pressed={viewMode === "grid"}
            >
              <LayoutGrid className="h-4 w-4" aria-hidden="true" />
            </button>
            <button
              type="button"
              onClick={() => setViewMode("list")}
              className={[
                "inline-flex h-8 w-8 items-center justify-center rounded-full transition-all duration-200",
                viewMode === "list" ? "bg-slate-900 text-white" : "text-slate-700 hover:bg-slate-50",
              ].join(" ")}
              aria-label="List view"
              aria-pressed={viewMode === "list"}
            >
              <List className="h-4 w-4" aria-hidden="true" />
            </button>
          </div>

          <CreateDropdown />
        </div>
      </div>
    </div>
  );
}

