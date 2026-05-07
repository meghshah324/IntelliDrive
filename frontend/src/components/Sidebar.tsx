import { useMemo, useState } from "react";
import { Folder, Home, Link, Star, Trash2, ChevronLeft, Clock3 } from "lucide-react";
import StorageBar from "./StorageBar";

type SidebarItemId = "home" | "recents" | "shared" | "trash" | "favourites";

function SidebarButton({
  active,
  collapsed,
  icon,
  label,
  onClick,
}: {
  active?: boolean;
  collapsed: boolean;
  icon: React.ReactNode;
  label: string;
  onClick?: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={[
        "flex w-full items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium transition-all duration-200",
        active ? "bg-slate-900 text-white" : "text-slate-700 hover:bg-slate-100",
      ].join(" ")}
      title={collapsed ? label : undefined}
    >
      <span className={active ? "text-white" : "text-slate-700"}>{icon}</span>
      {!collapsed && <span className="truncate">{label}</span>}
    </button>
  );
}

export default function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const [active, setActive] = useState<SidebarItemId>("home");

  const widthClass = useMemo(() => (collapsed ? "w-[72px]" : "w-[240px]"), [collapsed]);

  return (
    <aside
      className={[
        "flex h-screen flex-col border-r border-slate-200 bg-slate-50/80 px-3 py-4 backdrop-blur",
        widthClass,
      ].join(" ")}
    >
      <div className="px-2 pb-4">
        <div className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white shadow-sm ring-1 ring-slate-200">
            <Folder className="h-4 w-4 text-slate-800" aria-hidden="true" />
          </div>
          {!collapsed && <div className="text-base font-semibold text-slate-900">IntelliDrive</div>}
        </div>
      </div>

      <div className="flex-1 overflow-auto px-1">
        <div className="space-y-1">
          <SidebarButton
            collapsed={collapsed}
            active={active === "home"}
            icon={<Home className="h-4 w-4" aria-hidden="true" />}
            label="Home"
            onClick={() => setActive("home")}
          />
          <SidebarButton
            collapsed={collapsed}
            active={active === "recents"}
            icon={<Clock3 className="h-4 w-4" aria-hidden="true" />}
            label="Recents"
            onClick={() => setActive("recents")}
          />
          <SidebarButton
            collapsed={collapsed}
            active={active === "shared"}
            icon={<Link className="h-4 w-4" aria-hidden="true" />}
            label="Shared"
            onClick={() => setActive("shared")}
          />
          <SidebarButton
            collapsed={collapsed}
            active={active === "trash"}
            icon={<Trash2 className="h-4 w-4" aria-hidden="true" />}
            label="Trash"
            onClick={() => setActive("trash")}
          />
        </div>

        <div className="mt-6">
          {!collapsed && <div className="px-2 pb-2 text-xs font-semibold text-slate-500">Views</div>}
          <SidebarButton
            collapsed={collapsed}
            active={active === "favourites"}
            icon={<Star className="h-4 w-4" aria-hidden="true" />}
            label="Favourites"
            onClick={() => setActive("favourites")}
          />
        </div>
      </div>

      <div className="mt-auto space-y-3 px-2 pb-1">
        {!collapsed && (
          <div className="rounded-2xl bg-white p-3 shadow-sm ring-1 ring-slate-200">
            <StorageBar />
          </div>
        )}

        <button
          type="button"
          onClick={() => setCollapsed((v) => !v)}
          className={[
            "inline-flex w-full items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 shadow-sm transition-all duration-200 hover:bg-slate-50",
            collapsed ? "px-2" : "",
          ].join(" ")}
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          <ChevronLeft
            className={[
              "h-4 w-4 transition-transform duration-200",
              collapsed ? "rotate-180" : "",
            ].join(" ")}
            aria-hidden="true"
          />
          {!collapsed && <span>Collapse</span>}
        </button>
      </div>
    </aside>
  );
}

