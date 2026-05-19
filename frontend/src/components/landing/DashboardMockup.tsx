import {
  Home,
  FolderClosed,
  Clock,
  Star,
  Trash2,
  Search,
  Upload,
  FileText,
  Image as ImageIcon,
  FileVideo,
  FileSpreadsheet,
  HardDrive,
  Plus,
} from "lucide-react";

interface FolderTile {
  name: string;
  files: number;
  tone: string;
}

interface RecentFile {
  name: string;
  meta: string;
  icon: React.ReactNode;
  iconBg: string;
}

const FOLDERS: FolderTile[] = [
  { name: "Projects", files: 24, tone: "from-indigo-100 to-indigo-50" },
  { name: "Designs", files: 12, tone: "from-pink-100 to-pink-50" },
  { name: "Documents", files: 38, tone: "from-amber-100 to-amber-50" },
  { name: "Archive", files: 7, tone: "from-emerald-100 to-emerald-50" },
];

const RECENTS: RecentFile[] = [
  {
    name: "Annual-Report-2026.pdf",
    meta: "Edited 2h ago · 4.2 MB",
    icon: <FileText className="h-4 w-4 text-blue-600" />,
    iconBg: "bg-blue-50",
  },
  {
    name: "team-photo.png",
    meta: "Edited yesterday · 1.8 MB",
    icon: <ImageIcon className="h-4 w-4 text-pink-600" />,
    iconBg: "bg-pink-50",
  },
  {
    name: "Q1-Forecast.xlsx",
    meta: "Edited 3d ago · 220 KB",
    icon: <FileSpreadsheet className="h-4 w-4 text-emerald-600" />,
    iconBg: "bg-emerald-50",
  },
  {
    name: "product-demo.mp4",
    meta: "Edited 5d ago · 38 MB",
    icon: <FileVideo className="h-4 w-4 text-violet-600" />,
    iconBg: "bg-violet-50",
  },
];

export default function DashboardMockup() {
  return (
    <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
      {/* Window chrome */}
      <div className="flex items-center gap-1.5 border-b border-slate-200 bg-slate-50 px-4 py-2.5">
        <span className="h-2.5 w-2.5 rounded-full bg-red-400" />
        <span className="h-2.5 w-2.5 rounded-full bg-amber-400" />
        <span className="h-2.5 w-2.5 rounded-full bg-emerald-400" />
        <div className="ml-3 hidden h-5 w-64 items-center gap-2 rounded-md border border-slate-200 bg-white px-2 text-[11px] text-slate-400 sm:flex">
          intellidrive.app/dashboard
        </div>
      </div>

      <div className="grid grid-cols-12">
        {/* Sidebar */}
        <aside className="col-span-3 hidden border-r border-slate-200 bg-slate-50/60 p-4 md:block">
          <button className="flex w-full items-center justify-center gap-2 rounded-lg bg-slate-900 px-3 py-2 text-xs font-semibold text-white">
            <Plus className="h-3.5 w-3.5" /> New
          </button>
          <nav className="mt-5 space-y-1 text-sm">
            <SidebarItem icon={<Home className="h-4 w-4" />} label="Home" active />
            <SidebarItem icon={<FolderClosed className="h-4 w-4" />} label="My Files" />
            <SidebarItem icon={<Clock className="h-4 w-4" />} label="Recent" />
            <SidebarItem icon={<Star className="h-4 w-4" />} label="Starred" />
            <SidebarItem icon={<Trash2 className="h-4 w-4" />} label="Trash" />
          </nav>

          {/* Storage card */}
          <div className="mt-6 rounded-xl border border-slate-200 bg-white p-3.5">
            <div className="flex items-center gap-2 text-xs font-medium text-slate-700">
              <HardDrive className="h-3.5 w-3.5" /> Storage
            </div>
            <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-slate-100">
              <div className="h-full w-2/3 rounded-full bg-gradient-to-r from-indigo-500 to-cyan-400" />
            </div>
            <p className="mt-2 text-[11px] text-slate-500">6.4 GB of 10 GB used</p>
          </div>
        </aside>

        {/* Main */}
        <main className="col-span-12 p-4 md:col-span-9 md:p-5">
          <div className="flex items-center justify-between gap-3">
            <div className="flex flex-1 items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 text-sm">
              <Search className="h-4 w-4 text-slate-400" />
              <span className="text-xs text-slate-400">Search files and folders</span>
            </div>
            <button className="flex items-center gap-1.5 rounded-lg bg-indigo-600 px-3 py-1.5 text-xs font-semibold text-white shadow-sm hover:bg-indigo-500">
              <Upload className="h-3.5 w-3.5" /> Upload
            </button>
          </div>

          <h3 className="mt-5 text-xs font-semibold uppercase tracking-wider text-slate-500">
            Folders
          </h3>
          <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-4">
            {FOLDERS.map((f) => (
              <div
                key={f.name}
                className={`group rounded-xl border border-slate-200 bg-gradient-to-br ${f.tone} p-3 transition hover:shadow-md`}
              >
                <FolderClosed className="h-5 w-5 text-slate-700" />
                <p className="mt-3 text-sm font-semibold text-slate-900">
                  {f.name}
                </p>
                <p className="text-[11px] text-slate-500">{f.files} files</p>
              </div>
            ))}
          </div>

          <h3 className="mt-6 text-xs font-semibold uppercase tracking-wider text-slate-500">
            Recent
          </h3>
          <div className="mt-3 overflow-hidden rounded-xl border border-slate-200">
            {RECENTS.map((r, i) => (
              <div
                key={r.name}
                className={`flex items-center gap-3 px-3.5 py-2.5 ${
                  i !== RECENTS.length - 1 ? "border-b border-slate-100" : ""
                } hover:bg-slate-50`}
              >
                <span className={`grid h-8 w-8 place-items-center rounded-lg ${r.iconBg}`}>
                  {r.icon}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-slate-900">
                    {r.name}
                  </p>
                  <p className="truncate text-[11px] text-slate-500">{r.meta}</p>
                </div>
                <span className="hidden text-[11px] text-slate-400 sm:inline">
                  Owner · You
                </span>
              </div>
            ))}
          </div>
        </main>
      </div>
    </div>
  );
}

interface SidebarItemProps {
  icon: React.ReactNode;
  label: string;
  active?: boolean;
}

function SidebarItem({ icon, label, active = false }: SidebarItemProps) {
  return (
    <div
      className={`flex items-center gap-2.5 rounded-lg px-3 py-2 transition ${
        active
          ? "bg-white text-slate-900 shadow-sm"
          : "text-slate-600 hover:bg-white/70 hover:text-slate-900"
      }`}
    >
      {icon}
      <span className="text-xs font-medium">{label}</span>
    </div>
  );
}
