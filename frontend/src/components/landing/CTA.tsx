import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";

export default function CTA() {
  return (
    <section className="px-6 py-24 lg:px-8">
      <div className="relative mx-auto max-w-6xl overflow-hidden rounded-3xl border border-slate-200 bg-gradient-to-br from-slate-900 via-slate-900 to-indigo-900 px-8 py-16 text-center shadow-2xl shadow-slate-900/20 sm:px-16">
        <div className="pointer-events-none absolute inset-0 -z-0">
          <div className="absolute -left-20 top-0 h-72 w-72 rounded-full bg-indigo-500/30 blur-3xl" />
          <div className="absolute -right-20 bottom-0 h-72 w-72 rounded-full bg-cyan-400/20 blur-3xl" />
          <div
            className="absolute inset-0 opacity-20"
            style={{
              backgroundImage:
                "radial-gradient(circle at 1px 1px, rgba(255,255,255,0.18) 1px, transparent 0)",
              backgroundSize: "26px 26px",
            }}
          />
        </div>

        <div className="relative">
          <h2 className="text-3xl font-semibold tracking-tight text-white sm:text-4xl">
            Ready to bring order to your files?
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-base leading-7 text-slate-300">
            Start using IntelliDrive today — it's free to get started, and your
            files will thank you.
          </p>

          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link
              to="/sign-up"
              className="group inline-flex items-center gap-2 rounded-full bg-white px-6 py-3 text-sm font-semibold text-slate-900 shadow-lg transition hover:bg-slate-100"
            >
              Get Started Free
              <ArrowRight className="h-4 w-4 transition group-hover:translate-x-0.5" />
            </Link>
            <Link
              to="/sign-in"
              className="rounded-full border border-white/20 bg-white/5 px-6 py-3 text-sm font-semibold text-white backdrop-blur transition hover:bg-white/10"
            >
              I already have an account
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
