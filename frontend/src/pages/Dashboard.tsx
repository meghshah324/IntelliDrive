import { Link, Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import Sidebar from "../components/Sidebar";
import Header from "../components/Header";
import MainContent from "../components/MainContent";

export default function Dashboard() {
  const { isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/sign-in" replace />;
  }

  return (
    <div className="flex h-screen bg-white text-slate-900">
      <div className="flex-none">
        <Sidebar />
      </div>

      <div className="flex min-w-0 flex-1 flex-col bg-slate-50">
        <Header />
        <div className="min-h-0 flex-1">
          <MainContent />
        </div>

        <div className="border-t border-slate-200 bg-white/80 px-6 py-3 text-xs text-slate-500">
          <div className="flex items-center justify-between">
            <span>IntelliDrive</span>
            <Link className="transition hover:text-slate-700" to="/">
              Back to Home
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
