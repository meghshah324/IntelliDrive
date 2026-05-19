const COMPANIES = [
  "Northwind",
  "Lumina",
  "Acme Corp",
  "Stellar",
  "Quantix",
  "Vertex",
];

export default function TrustedBy() {
  return (
    <section className="border-y border-slate-200/60 bg-white/40 py-12">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <p className="text-center text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
          Trusted by modern teams worldwide
        </p>
        <div className="mt-8 grid grid-cols-2 items-center justify-items-center gap-x-8 gap-y-6 sm:grid-cols-3 lg:grid-cols-6">
          {COMPANIES.map((name) => (
            <span
              key={name}
              className="text-base font-semibold tracking-tight text-slate-400 transition hover:text-slate-600 sm:text-lg"
            >
              {name}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}
