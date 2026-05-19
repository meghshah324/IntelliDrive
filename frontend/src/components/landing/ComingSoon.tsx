import { Sparkles, Users, Lightbulb, Network } from "lucide-react";
import SectionHeading from "./SectionHeading";

const ROADMAP = [
  {
    icon: Sparkles,
    title: "AI-powered search",
    description:
      "Find any file using natural language — ask, don't dig.",
  },
  {
    icon: Users,
    title: "Shared workspaces",
    description:
      "Collaborate with teammates inside organized, permissioned spaces.",
  },
  {
    icon: Lightbulb,
    title: "Smart recommendations",
    description:
      "Surface the files you need before you even search for them.",
  },
  {
    icon: Network,
    title: "Team collaboration",
    description:
      "Real-time presence and shared folders for your whole team.",
  },
];

export default function ComingSoon() {
  return (
    <section className="bg-gradient-to-b from-white to-slate-50 py-24">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <SectionHeading
          eyebrow="Coming Soon"
          title="A roadmap to a smarter drive"
          description="We're focused on the basics today — and building the intelligent, collaborative future of file storage tomorrow."
        />

        <div className="mt-14 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {ROADMAP.map(({ icon: Icon, title, description }) => (
            <div
              key={title}
              className="relative overflow-hidden rounded-2xl border border-dashed border-slate-300 bg-white/70 p-6 backdrop-blur transition hover:border-indigo-300 hover:bg-white"
            >
              <span className="absolute right-4 top-4 rounded-full bg-indigo-50 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-indigo-600">
                Soon
              </span>
              <div className="grid h-10 w-10 place-items-center rounded-lg bg-gradient-to-br from-indigo-500 to-purple-500 text-white">
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
