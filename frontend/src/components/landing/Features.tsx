import {
  ShieldCheck,
  UploadCloud,
  FolderTree,
  Cloud,
  Star,
  Trash2,
  Clock,
  Search,
  Gauge,
  type LucideIcon,
} from "lucide-react";
import SectionHeading from "./SectionHeading";

interface Feature {
  icon: LucideIcon;
  title: string;
  description: string;
  iconClass: string;
}

const FEATURES: Feature[] = [
  {
    icon: ShieldCheck,
    title: "Secure Authentication",
    description:
      "Sign up and sign in with hardened credential flows and token-based sessions that keep your account safe.",
    iconClass: "from-indigo-500 to-blue-500",
  },
  {
    icon: UploadCloud,
    title: "Easy File Uploads",
    description:
      "Upload files of any size in one click, and pause or cancel large uploads whenever you need to.",
    iconClass: "from-sky-500 to-cyan-500",
  },
  {
    icon: FolderTree,
    title: "Nested Folder Organization",
    description:
      "Build deep folder hierarchies with breadcrumb navigation and structure your workspace exactly how you think.",
    iconClass: "from-amber-500 to-orange-500",
  },
  {
    icon: Cloud,
    title: "Reliable Cloud Storage",
    description:
      "Your files are safely stored in the cloud and available whenever and wherever you need them.",
    iconClass: "from-emerald-500 to-teal-500",
  },
  {
    icon: Star,
    title: "Starred Favorites",
    description:
      "Mark important files and folders as favorites and jump straight to them from a dedicated starred view.",
    iconClass: "from-yellow-500 to-amber-500",
  },
  {
    icon: Trash2,
    title: "Trash & Restore",
    description:
      "Deleted items move to trash so you can recover them — and auto-cleanup permanently removes them after 30 days.",
    iconClass: "from-rose-500 to-red-500",
  },
  {
    icon: Clock,
    title: "Recent Files",
    description:
      "Pick up right where you left off with quick access to the files you opened most recently.",
    iconClass: "from-violet-500 to-purple-500",
  },
  {
    icon: Search,
    title: "Instant Search",
    description:
      "Find any file or folder in seconds with fast full-text search across your entire drive.",
    iconClass: "from-fuchsia-500 to-pink-500",
  },
  {
    icon: Gauge,
    title: "Storage Quota",
    description:
      "Track usage against your storage limit with a live usage bar and enforced quotas on every upload.",
    iconClass: "from-slate-700 to-slate-900",
  },
];

export default function Features() {
  return (
    <section id="features" className="py-24">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <SectionHeading
          eyebrow="Features"
          title="Everything you need to manage your files"
          description="A focused set of tools to upload, organize, and access your files — without the bloat."
        />

        <div className="mt-14 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((f) => (
            <FeatureCard key={f.title} feature={f} />
          ))}
        </div>
      </div>
    </section>
  );
}

function FeatureCard({ feature }: { feature: Feature }) {
  const { icon: Icon, title, description, iconClass } = feature;
  return (
    <article className="group relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-lg">
      <div
        className={`grid h-11 w-11 place-items-center rounded-xl bg-gradient-to-br ${iconClass} text-white shadow-sm`}
      >
        <Icon className="h-5 w-5" />
      </div>
      <h3 className="mt-5 text-lg font-semibold text-slate-900">{title}</h3>
      <p className="mt-2 text-sm leading-6 text-slate-600">{description}</p>
      <div className="pointer-events-none absolute -right-12 -top-12 h-32 w-32 rounded-full bg-gradient-to-br from-slate-100 to-transparent opacity-0 transition group-hover:opacity-100" />
    </article>
  );
}
