import { useEffect, useRef, useState } from "react";
import { Loader2, LogOut, Menu, Search, X } from "lucide-react";
import { useFolder } from "../context/FolderContext";
import { useAuth } from "../context/AuthContext";
import { nodeService } from "../services/folderService";
import type { DriveNode } from "../types/drive";

interface Props {
  onOpenMobileSidebar: () => void;
}

export default function Header({ onOpenMobileSidebar }: Props) {
  const { navigateTo } = useFolder();
  const { user, logout } = useAuth();

  const [query, setQuery] = useState("");
  const [results, setResults] = useState<DriveNode[]>([]);
  const [searching, setSearching] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);
  const menuRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!menuOpen) return;
    const handleClick = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [menuOpen]);

  const handleLogout = async () => {
    if (loggingOut) return;
    setLoggingOut(true);
    try {
      await logout();
    } finally {
      setLoggingOut(false);
      setMenuOpen(false);
    }
  };

  const initials = (user?.name || user?.email || "?")
    .split(/\s+/)
    .map((p) => p[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();

  useEffect(() => {
    const q = query.trim();
    if (!q) {
      setResults([]);
      setSearching(false);
      return;
    }
    setSearching(true);
    const handle = window.setTimeout(async () => {
      try {
        const items = await nodeService.search(q);
        setResults(items);
      } catch {
        setResults([]);
      } finally {
        setSearching(false);
      }
    }, 250);
    return () => window.clearTimeout(handle);
  }, [query]);

  return (
    <div className="sticky top-0 z-40 border-b border-slate-200/70 bg-white/75 backdrop-blur-xl">
      <div className="flex items-center gap-3 px-4 py-3 sm:px-6 sm:py-4">
        <button
          type="button"
          onClick={onOpenMobileSidebar}
          className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-600 shadow-sm transition hover:bg-slate-50 hover:text-slate-900 md:hidden"
          aria-label="Open sidebar"
        >
          <Menu className="h-4 w-4" />
        </button>

        <div className="relative flex min-w-0 flex-1 items-center">
          <label className="relative w-full max-w-xl">
            <span className="sr-only">Search</span>
            <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onFocus={() => setShowResults(true)}
              onBlur={() => setTimeout(() => setShowResults(false), 150)}
              placeholder="Search folders and files"
              className="w-full rounded-full border border-slate-200 bg-white/80 py-2.5 pl-10 pr-10 text-sm text-slate-900 shadow-sm outline-none transition placeholder:text-slate-400 focus:border-indigo-300 focus:bg-white focus:ring-4 focus:ring-indigo-100"
            />
            {query && (
              <button
                type="button"
                onClick={() => setQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
                aria-label="Clear search"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </label>

          {showResults && query.trim() && (
            <div className="absolute left-0 top-full mt-2 w-full max-w-xl overflow-hidden rounded-2xl border border-slate-200 bg-white/95 shadow-xl shadow-slate-900/5 ring-1 ring-black/5 backdrop-blur">
              {searching && (
                <div className="flex items-center gap-2 px-4 py-3 text-sm text-slate-500">
                  <Loader2 className="h-3.5 w-3.5 animate-spin" /> Searching…
                </div>
              )}
              {!searching && results.length === 0 && (
                <div className="px-4 py-3 text-sm text-slate-500">No matches</div>
              )}
              {!searching && results.length > 0 && (
                <ul className="max-h-80 overflow-auto py-1">
                  {results.map((r) => (
                    <li key={r.id}>
                      <button
                        type="button"
                        className="flex w-full items-center gap-2 px-4 py-2 text-left text-sm hover:bg-slate-50"
                        onMouseDown={(e) => e.preventDefault()}
                        onClick={() => {
                          if (r.type === "FOLDER") {
                            navigateTo({ id: r.id, name: r.name });
                          }
                          setQuery("");
                        }}
                      >
                        <span
                          className={[
                            "rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider",
                            r.type === "FOLDER"
                              ? "bg-indigo-50 text-indigo-700 ring-1 ring-indigo-100"
                              : "bg-slate-100 text-slate-600",
                          ].join(" ")}
                        >
                          {r.type}
                        </span>
                        <span className="truncate">{r.name}</span>
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}
        </div>

        {user && (
          <div className="relative ml-2 shrink-0" ref={menuRef}>
            <button
              type="button"
              onClick={() => setMenuOpen((v) => !v)}
              className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-blue-500 text-sm font-semibold text-white shadow-sm ring-1 ring-white/40 transition hover:opacity-90"
              aria-label="Account menu"
              aria-haspopup="menu"
              aria-expanded={menuOpen}
            >
              {initials}
            </button>

            {menuOpen && (
              <div
                role="menu"
                className="absolute right-0 top-full z-50 mt-2 w-64 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xl shadow-slate-900/5 ring-1 ring-black/5"
              >
                <div className="border-b border-slate-100 px-4 py-3">
                  <div className="truncate text-sm font-semibold text-slate-900">
                    {user.name}
                  </div>
                  <div className="truncate text-xs text-slate-500">{user.email}</div>
                </div>
                <button
                  type="button"
                  role="menuitem"
                  onClick={handleLogout}
                  disabled={loggingOut}
                  className="flex w-full items-center gap-2 px-4 py-2.5 text-left text-sm text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {loggingOut ? (
                    <Loader2 className="h-4 w-4 animate-spin text-slate-500" />
                  ) : (
                    <LogOut className="h-4 w-4 text-slate-500" />
                  )}
                  <span>{loggingOut ? "Signing out…" : "Sign out"}</span>
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}



