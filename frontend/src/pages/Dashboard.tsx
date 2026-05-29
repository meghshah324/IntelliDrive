import { useEffect, useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import Header from "../components/Header";
import MainContent from "../components/MainContent";
import RecentContent from "../components/recent/RecentContent";
import StarredContent from "../components/starred/StarredContent";
import TrashContent from "../components/trash/TrashContent";
import UploadDrawer from "../components/upload/UploadDrawer";
import { FolderProvider } from "../context/FolderContext";
import { UploadProvider } from "../context/upload";

type SidebarItem = "home" | "recents" | "starred" | "trash";

interface Props {
  /** Which secondary view the dashboard should render. Defaults to home. */
  view?: SidebarItem;
}

export default function Dashboard({ view = "home" }: Props) {
  const { folderId } = useParams<{ folderId?: string }>();
  const navigate = useNavigate();

  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [activeSidebar, setActiveSidebar] = useState<SidebarItem>(view);

  // Keep the sidebar selection in sync with the URL-driven `view` prop.
  // Without this, navigating from the Starred page into a folder (which
  // pushes /dashboard/folders/:id) would leave `activeSidebar === "starred"`
  // and the explorer would never render.
  useEffect(() => {
    setActiveSidebar(view);
  }, [view]);

  const handleChangeActive = (id: SidebarItem) => {
    setActiveSidebar(id);
    if (id === "home") navigate("/dashboard");
    else if (id === "recents") navigate("/dashboard/recents");
    else if (id === "starred") navigate("/dashboard/starred");
    else if (id === "trash") navigate("/dashboard/trash");
  };

  return (
    <UploadProvider>
      <FolderProvider
        folderId={folderId ?? null}
        onNavigate={(id) =>
          navigate(id ? `/dashboard/folders/${id}` : "/dashboard", { replace: false })
        }
      >
        <div className="flex h-screen bg-gradient-to-b from-slate-50 via-white to-slate-50 text-slate-900 antialiased">
          <Sidebar
            collapsed={collapsed}
            onToggleCollapsed={() => setCollapsed((v) => !v)}
            mobileOpen={mobileOpen}
            onCloseMobile={() => setMobileOpen(false)}
            active={activeSidebar}
            onChangeActive={handleChangeActive}
          />

          <div className="flex min-w-0 flex-1 flex-col">
            <Header onOpenMobileSidebar={() => setMobileOpen(true)} />

            <div className="min-h-0 flex-1">
              {activeSidebar === "recents" ? (
                <RecentContent />
              ) : activeSidebar === "starred" ? (
                <StarredContent />
              ) : activeSidebar === "trash" ? (
                <TrashContent />
              ) : (
                <MainContent />
              )}
            </div>

            <div className="border-t border-slate-200/70 bg-white/70 px-6 py-3 text-xs text-slate-500 backdrop-blur">
              <div className="flex items-center justify-between">
                <span className="font-medium tracking-tight text-slate-600">
                  IntelliDrive
                </span>
                <Link className="font-medium transition hover:text-slate-900" to="/">
                  Back to Home
                </Link>
              </div>
            </div>
          </div>

          <UploadDrawer />
        </div>
      </FolderProvider>
    </UploadProvider>
  );
}


