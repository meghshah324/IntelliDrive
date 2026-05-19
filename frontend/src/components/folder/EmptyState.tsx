import { FolderPlus } from "lucide-react";

interface Props {
  onCreateFolder: () => void;
}

export default function EmptyState({ onCreateFolder }: Props) {
  return (
    <div className="relative flex h-full flex-col items-center justify-center overflow-hidden px-6 py-16 text-center">
      <div className="pointer-events-none absolute inset-x-0 top-1/3 -z-10 mx-auto h-64 w-64 rounded-full bg-gradient-to-br from-indigo-200/50 via-sky-100/40 to-transparent blur-3xl" />
      <div className="grid h-16 w-16 place-items-center rounded-2xl bg-gradient-to-br from-indigo-500 via-blue-500 to-cyan-400 text-white shadow-lg shadow-indigo-200">
        <FolderPlus className="h-7 w-7" aria-hidden />
      </div>
      <h2 className="mt-5 text-lg font-semibold tracking-tight text-slate-900">
        This folder is empty
      </h2>
      <p className="mt-1 max-w-md text-sm text-slate-600">
        Create a sub-folder or upload files to start organising your workspace.
      </p>
      <button
        type="button"
        onClick={onCreateFolder}
        className="mt-6 inline-flex items-center justify-center rounded-full bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-slate-900/10 transition hover:bg-slate-700 focus:outline-none focus:ring-4 focus:ring-indigo-100"
      >
        New folder
      </button>
    </div>
  );
}
