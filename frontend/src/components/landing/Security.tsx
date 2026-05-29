import { ShieldCheck, KeyRound, Server, Lock } from "lucide-react";
import SectionHeading from "./SectionHeading";

const PILLARS = [
  {
    icon: KeyRound,
    title: "Secure authentication",
    description:
      "Modern sign-in flows with proper credential handling and protected sessions.",
  },
  {
    icon: ShieldCheck,
    title: "Protected storage",
    description:
      "Files are stored with strict access controls so only you can reach them.",
  },
  {
    icon: Lock,
    title: "Encrypted data handling",
    description:
      "Your data is encrypted while it travels, so it stays private from start to finish.",
  },
  {
    icon: Server,
    title: "Reliable infrastructure",
    description:
      "Built on durable, redundant cloud storage that's always available and ready to scale with you.",
  },
];

export default function Security() {
  return (
    <section className="py-24">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="grid items-start gap-12 lg:grid-cols-2">
          <div>
            <SectionHeading
              align="left"
              eyebrow="Security"
              title="Your files, protected at every layer"
              description="Security is foundational at IntelliDrive. From sign-in to storage, every layer is built with safe defaults."
            />
          </div>

          {/* Visual */}
          <div className="relative">
            <div className="absolute -inset-4 -z-10 rounded-3xl bg-gradient-to-br from-indigo-100 via-sky-50 to-transparent blur-2xl" />
            <div className="rounded-3xl border border-slate-200 bg-white/80 p-8 shadow-xl shadow-slate-900/5 backdrop-blur">
              <div className="grid h-20 w-20 place-items-center rounded-2xl bg-gradient-to-br from-indigo-500 to-blue-600 text-white shadow-lg shadow-indigo-200">
                <ShieldCheck className="h-9 w-9" />
              </div>
              <p className="mt-6 text-lg font-semibold text-slate-900">
                Trust by design
              </p>
              <p className="mt-2 text-sm leading-6 text-slate-600">
                Your data is treated like our own — handled with care, protected
                by best practices, and stored on infrastructure trusted by
                enterprises worldwide.
              </p>

              <div className="mt-6 grid grid-cols-3 gap-3 text-center">
                {["Encrypted", "Private", "Secure Sign-in"].map((b) => (
                  <span
                    key={b}
                    className="rounded-lg border border-slate-200 bg-slate-50 px-2 py-2 text-[11px] font-semibold tracking-wide text-slate-700"
                  >
                    {b}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="mt-14 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {PILLARS.map(({ icon: Icon, title, description }) => (
            <div
              key={title}
              className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:shadow-md"
            >
              <div className="grid h-10 w-10 place-items-center rounded-lg bg-slate-900 text-white">
                <Icon className="h-5 w-5" />
              </div>
              <p className="mt-4 text-base font-semibold text-slate-900">
                {title}
              </p>
              <p className="mt-1.5 text-sm leading-6 text-slate-600">
                {description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
