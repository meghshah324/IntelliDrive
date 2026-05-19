import { UploadCloud, FolderTree, Globe2, type LucideIcon } from "lucide-react";
import SectionHeading from "./SectionHeading";

interface Step {
  number: string;
  icon: LucideIcon;
  title: string;
  description: string;
}

const STEPS: Step[] = [
  {
    number: "01",
    icon: UploadCloud,
    title: "Upload Files",
    description:
      "Drag and drop or click to upload. Your files are sent securely to the cloud.",
  },
  {
    number: "02",
    icon: FolderTree,
    title: "Organize in Folders",
    description:
      "Create folders and structure your workspace the way that works for you.",
  },
  {
    number: "03",
    icon: Globe2,
    title: "Access Anytime",
    description:
      "Sign in from any device and pick up exactly where you left off.",
  },
];

export default function HowItWorks() {
  return (
    <section className="py-24">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <SectionHeading
          eyebrow="How it works"
          title="Three steps to a tidier drive"
          description="Get started in minutes — no setup, no learning curve."
        />

        <div className="relative mt-14 grid grid-cols-1 gap-6 md:grid-cols-3">
          {/* Connector line */}
          <div className="absolute left-1/2 top-10 hidden h-px w-2/3 -translate-x-1/2 bg-gradient-to-r from-transparent via-slate-200 to-transparent md:block" />

          {STEPS.map(({ number, icon: Icon, title, description }) => (
            <div
              key={number}
              className="relative flex flex-col items-center rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm transition hover:shadow-md"
            >
              <div className="grid h-12 w-12 place-items-center rounded-2xl bg-gradient-to-br from-indigo-500 to-blue-500 text-white shadow-md shadow-indigo-200">
                <Icon className="h-6 w-6" />
              </div>
              <span className="mt-4 text-xs font-semibold tracking-widest text-indigo-600">
                STEP {number}
              </span>
              <h3 className="mt-2 text-lg font-semibold text-slate-900">
                {title}
              </h3>
              <p className="mt-2 text-sm leading-6 text-slate-600">
                {description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
