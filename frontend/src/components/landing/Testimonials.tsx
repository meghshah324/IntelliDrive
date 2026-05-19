import { Star } from "lucide-react";
import SectionHeading from "./SectionHeading";

interface Testimonial {
  quote: string;
  name: string;
  role: string;
  initials: string;
  tone: string;
}

const TESTIMONIALS: Testimonial[] = [
  {
    quote:
      "IntelliDrive replaced three different tools for me. Uploads are fast and the dashboard just feels right.",
    name: "Maya Patel",
    role: "Product Designer, Lumina",
    initials: "MP",
    tone: "from-indigo-500 to-blue-500",
  },
  {
    quote:
      "Finally a clean drive that doesn't bury my files under endless menus. Folders, search, done.",
    name: "Daniel Cho",
    role: "Founder, Quantix",
    initials: "DC",
    tone: "from-emerald-500 to-teal-500",
  },
  {
    quote:
      "The S3-backed storage gives me the confidence I need. Snappy interface, zero learning curve.",
    name: "Sara Nilsen",
    role: "Engineering Lead, Vertex",
    initials: "SN",
    tone: "from-pink-500 to-rose-500",
  },
];

export default function Testimonials() {
  return (
    <section
      id="about"
      className="bg-gradient-to-b from-slate-50 to-white py-24"
    >
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <SectionHeading
          eyebrow="Loved by users"
          title="What people are saying"
          description="Built for teams and individuals who care about how their files are organized."
        />

        <div className="mt-14 grid grid-cols-1 gap-6 md:grid-cols-3">
          {TESTIMONIALS.map((t) => (
            <figure
              key={t.name}
              className="flex h-full flex-col rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:shadow-md"
            >
              <div className="flex gap-0.5 text-amber-400">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} className="h-4 w-4 fill-current" />
                ))}
              </div>
              <blockquote className="mt-4 flex-1 text-sm leading-6 text-slate-700">
                “{t.quote}”
              </blockquote>
              <figcaption className="mt-6 flex items-center gap-3">
                <span
                  className={`grid h-10 w-10 place-items-center rounded-full bg-gradient-to-br ${t.tone} text-sm font-semibold text-white`}
                >
                  {t.initials}
                </span>
                <div>
                  <p className="text-sm font-semibold text-slate-900">
                    {t.name}
                  </p>
                  <p className="text-xs text-slate-500">{t.role}</p>
                </div>
              </figcaption>
            </figure>
          ))}
        </div>
      </div>
    </section>
  );
}
