import { Link } from "react-router-dom";
import {
  ArrowRight,
  PlayCircle,
  FileText,
  Image as ImageIcon,
  FolderClosed,
  CheckCircle2,
} from "lucide-react";
import DashboardMockup from "./DashboardMockup";

export default function Hero() {
  return (
    <section
      id="home"
      className="relative overflow-hidden pt-12 pb-24 sm:pt-16 lg:pt-20"
    >
      {/* Soft gradient background */}
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute -top-40 left-1/2 h-[600px] w-[1100px] -translate-x-1/2 rounded-full bg-gradient-to-br from-indigo-200/60 via-sky-100/60 to-transparent blur-3xl" />
        <div className="absolute top-40 right-0 h-[400px] w-[400px] rounded-full bg-gradient-to-br from-cyan-200/40 to-transparent blur-3xl" />
        <div
          className="absolute inset-0 opacity-[0.35]"
          style={{
            backgroundImage:
              "radial-gradient(circle at 1px 1px, rgba(15,23,42,0.07) 1px, transparent 0)",
            backgroundSize: "28px 28px",
          }}
        />
      </div>

      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-3xl text-center">
          <span className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white/70 px-3.5 py-1.5 text-xs font-medium text-slate-600 shadow-sm backdrop-blur">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
            Now in early access · Built on AWS S3
          </span>
          <h1 className="mt-6 text-4xl font-semibold tracking-tight text-slate-900 sm:text-5xl lg:text-6xl">
            Store, Organize, and Access{" "}
            <span className="bg-gradient-to-r from-indigo-600 via-blue-600 to-cyan-500 bg-clip-text text-transparent">
              Files Securely
            </span>{" "}
            from Anywhere.
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-base leading-7 text-slate-600 sm:text-lg">
            IntelliDrive is the modern home for your files. Upload, organize,
            and access everything in one beautifully simple workspace — backed
            by enterprise-grade cloud storage.
          </p>

          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link
              to="/sign-up"
              className="group inline-flex items-center justify-center gap-2 rounded-full bg-slate-900 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-slate-900/10 transition hover:bg-slate-700"
            >
              Get Started Free
              <ArrowRight className="h-4 w-4 transition group-hover:translate-x-0.5" />
            </Link>
            <a
              href="#product"
              className="inline-flex items-center justify-center gap-2 rounded-full border border-slate-200 bg-white/80 px-6 py-3 text-sm font-semibold text-slate-800 backdrop-blur transition hover:bg-white"
            >
              <PlayCircle className="h-4 w-4" />
              See it in action
            </a>
          </div>

          <ul className="mt-6 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-xs text-slate-500">
            {["No credit card required", "Free 5GB storage", "Cancel anytime"].map(
              (item) => (
                <li key={item} className="inline-flex items-center gap-1.5">
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
                  {item}
                </li>
              )
            )}
          </ul>
        </div>

        {/* Dashboard preview with floating cards */}
        <div className="relative mx-auto mt-16 max-w-6xl">
          <div className="absolute inset-x-10 -bottom-6 h-24 rounded-full bg-indigo-300/30 blur-3xl" />

          {/* Floating cards */}
          <FloatingCard
            className="absolute -left-4 top-10 hidden w-56 sm:block"
            icon={<FileText className="h-5 w-5 text-blue-500" />}
            title="Q4-Report.pdf"
            subtitle="Uploaded · 2.4 MB"
          />
          <FloatingCard
            className="absolute -right-4 top-32 hidden w-56 sm:block"
            icon={<ImageIcon className="h-5 w-5 text-pink-500" />}
            title="brand-cover.png"
            subtitle="Synced · 1.1 MB"
          />
          <FloatingCard
            className="absolute -right-2 -bottom-6 hidden w-56 lg:block"
            icon={<FolderClosed className="h-5 w-5 text-amber-500" />}
            title="Marketing Assets"
            subtitle="42 files"
          />

          <div className="rounded-2xl border border-slate-200/80 bg-white/70 p-2 shadow-2xl shadow-slate-900/10 backdrop-blur">
            <DashboardMockup />
          </div>
        </div>
      </div>
    </section>
  );
}

interface FloatingCardProps {
  icon: React.ReactNode;
  title: string;
  subtitle: string;
  className?: string;
}

function FloatingCard({ icon, title, subtitle, className = "" }: FloatingCardProps) {
  return (
    <div
      className={`z-10 rounded-2xl border border-slate-200 bg-white/90 p-3.5 shadow-xl shadow-slate-900/5 backdrop-blur ${className}`}
    >
      <div className="flex items-center gap-3">
        <span className="grid h-9 w-9 place-items-center rounded-lg bg-slate-50">
          {icon}
        </span>
        <div className="min-w-0">
          <p className="truncate text-sm font-medium text-slate-900">{title}</p>
          <p className="truncate text-xs text-slate-500">{subtitle}</p>
        </div>
      </div>
    </div>
  );
}
