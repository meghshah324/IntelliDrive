import { CheckCircle2 } from "lucide-react";
import SectionHeading from "./SectionHeading";
import DashboardMockup from "./DashboardMockup";

const HIGHLIGHTS = [
  "Sidebar navigation built for focus",
  "Folder grid that scales to thousands of files",
  "Recent files always one click away",
  "Live storage usage indicator",
];

export default function ProductPreview() {
  return (
    <section
      id="product"
      className="relative overflow-hidden bg-gradient-to-b from-slate-50 to-white py-24"
    >
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <SectionHeading
          eyebrow="Product"
          title="A workspace built for your files"
          description="Inspired by the apps you already love, designed to feel instantly familiar."
        />

        <div className="mt-14 grid items-center gap-10 lg:grid-cols-5">
          <ul className="space-y-4 lg:col-span-2">
            {HIGHLIGHTS.map((h) => (
              <li
                key={h}
                className="flex items-start gap-3 rounded-xl border border-slate-200 bg-white/70 p-4 backdrop-blur"
              >
                <CheckCircle2 className="mt-0.5 h-5 w-5 flex-shrink-0 text-emerald-500" />
                <span className="text-sm font-medium text-slate-800">{h}</span>
              </li>
            ))}
          </ul>

          <div className="lg:col-span-3">
            <div className="rounded-2xl border border-slate-200 bg-white/70 p-2 shadow-xl shadow-slate-900/10 backdrop-blur">
              <DashboardMockup />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
