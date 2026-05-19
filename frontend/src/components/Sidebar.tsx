import { useMemo } from "react";
import { HardDrive, Home, Trash2, Clock3, Star, ChevronLeft, X } from "lucide-react";
import StorageBar from "./StorageBar";
import { useFolder } from "../context/FolderContext";

type SidebarItem = "home" | "recents" | "starred" | "trash";

interface Props {
  /** Desktop collapsed (icon-only) state. */
  collapsed: boolean;
  onToggleCollapsed: () => void;
  /** Mobile drawer open state. */
  mobileOpen: boolean;
  onCloseMobile: () => void;
  /** Currently active section. */
  active: SidebarItem;
  onChangeActive: (id: SidebarItem) => void;
}

function NavButton({
  active,
  collapsed,
  icon,
  label,
  onClick,
}: {
  active: boolean;
  collapsed: boolean;
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={collapsed ? label : undefined}
      className={[
        "group flex w-full items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium transition",
        active
          ? "bg-white text-slate-900 shadow-sm ring-1 ring-slate-200"
          : "text-slate-600 hover:bg-white/70 hover:text-slate-900",
        collapsed ? "justify-center" : "",
      ].join(" ")}
    >
      <span
        className={[
          "flex h-4 w-4 items-center justify-center transition",
          active ? "text-indigo-600" : "text-slate-500 group-hover:text-slate-900",
        ].join(" ")}
      >
        {icon}
      </span>
      {!collapsed && <span className="truncate">{label}</span>}
    </button>
  );
}

export default function Sidebar({
  collapsed,
  onToggleCollapsed,
  mobileOpen,
  onCloseMobile,
  active,
  onChangeActive,
}: Props) {
  const { navigateTo } = useFolder();
  const widthClass = useMemo(() => (collapsed ? "w-[72px]" : "w-[260px]"), [collapsed]);

  const handleHome = () => {
    onChangeActive("home");
    navigateTo({ id: null, name: "IntelliDrive" });
    onCloseMobile();
  };

  const SidebarBody = (
    <>
      <div className="flex items-center justify-between px-2 pb-4">
        <div className="flex items-center gap-2">
          <span className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-br from-indigo-500 via-blue-500 to-cyan-400 text-white shadow-md shadow-indigo-200">
            <HardDrive className="h-5 w-5" strokeWidth={2.25} />
          </span>
          {!collapsed && (
            <div className="text-base font-semibold tracking-tight text-slate-900">
              IntelliDrive
            </div>
          )}
        </div>
        {/* Mobile close */}
        <button
          type="button"
          onClick={onCloseMobile}
          className="rounded-full p-1.5 text-slate-500 hover:bg-slate-100 md:hidden"
          aria-label="Close sidebar"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      <nav className="flex-1 space-y-1 overflow-auto px-1">
        <NavButton
          active={active === "home"}
          collapsed={collapsed}
          icon={<Home className="h-4 w-4" />}
          label="Home"
          onClick={handleHome}
        />
        <NavButton
          active={active === "recents"}
          collapsed={collapsed}
          icon={<Clock3 className="h-4 w-4" />}
          label="Recents"
          onClick={() => {
            onChangeActive("recents");
            onCloseMobile();
          }}
        />
        <NavButton
          active={active === "starred"}
          collapsed={collapsed}
          icon={<Star className="h-4 w-4" />}
          label="Starred"
          onClick={() => {
            onChangeActive("starred");
            onCloseMobile();
          }}
        />
        <NavButton
          active={active === "trash"}
          collapsed={collapsed}
          icon={<Trash2 className="h-4 w-4" />}
          label="Trash"
          onClick={() => {
            onChangeActive("trash");
            onCloseMobile();
          }}
        />
      </nav>

      <div className="mt-auto space-y-3 px-2 pt-3">
        {!collapsed && (
          <div className="rounded-2xl border border-slate-200 bg-white/80 p-3.5 shadow-sm backdrop-blur">
            <StorageBar />
          </div>
        )}

        <button
          type="button"
          onClick={onToggleCollapsed}
          className="hidden w-full items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-600 shadow-sm transition hover:bg-slate-50 hover:text-slate-900 md:inline-flex"
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          <ChevronLeft
            className={["h-4 w-4 transition-transform", collapsed ? "rotate-180" : ""].join(" ")}
          />
          {!collapsed && <span>Collapse</span>}
        </button>
      </div>
    </>
  );

  return (
    <>
      {/* Desktop sidebar */}
      <aside
        className={[
          "hidden h-screen flex-col border-r border-slate-200/70 bg-slate-50/70 px-3 py-4 backdrop-blur-xl md:flex",
          widthClass,
        ].join(" ")}
      >
        {SidebarBody}
      </aside>

      {/* Mobile drawer */}
      <div
        className={[
          "fixed inset-0 z-40 md:hidden",
          mobileOpen ? "" : "pointer-events-none",
        ].join(" ")}
        aria-hidden={!mobileOpen}
      >
        <div
          className={[
            "absolute inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity",
            mobileOpen ? "opacity-100" : "opacity-0",
          ].join(" ")}
          onClick={onCloseMobile}
        />
        <aside
          className={[
            "absolute left-0 top-0 flex h-full w-[280px] flex-col border-r border-slate-200 bg-white px-3 py-4 shadow-2xl shadow-slate-900/10 transition-transform",
            mobileOpen ? "translate-x-0" : "-translate-x-full",
          ].join(" ")}
        >
          {SidebarBody}
        </aside>
      </div>
    </>
  );
}



