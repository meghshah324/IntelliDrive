import {
  ShieldCheck,
  UploadCloud,
  FolderTree,
  Cloud,
  Zap,
  LayoutDashboard,
  Lock,
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
      "Sign up and sign in with hardened credential flows that keep your account safe.",
    iconClass: "from-indigo-500 to-blue-500",
  },
  {
    icon: UploadCloud,
    title: "File Upload & Download",
    description:
      "Move files in and out of the cloud effortlessly, with reliable transfers every time.",
    iconClass: "from-sky-500 to-cyan-500",
  },
  {
    icon: FolderTree,
    title: "Folder Organization",
    description:
      "Create nested folders and structure your workspace exactly how you think.",
    iconClass: "from-amber-500 to-orange-500",
  },
  {
    icon: Cloud,
    title: "AWS S3 Cloud Storage",
    description:
      "Built on industry-leading S3 infrastructure for durability and scale.",
    iconClass: "from-emerald-500 to-teal-500",
  },
  {
    icon: Zap,
    title: "Fast File Access",
    description:
      "Snappy navigation, quick previews, and instant access to your recent files.",
    iconClass: "from-yellow-500 to-amber-500",
  },
  {
    icon: LayoutDashboard,
    title: "Responsive Dashboard",
    description:
      "A thoughtfully designed dashboard that works beautifully on every screen.",
    iconClass: "from-fuchsia-500 to-pink-500",
  },
  {
    icon: Lock,
    title: "Secure Data Handling",
    description:
      "Protected access patterns and trusted storage practices keep your data private.",
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
