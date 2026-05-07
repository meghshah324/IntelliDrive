import { Folder } from "lucide-react";

export default function MainContent() {
  return (
    <div className="flex h-full items-center justify-center p-8">
      <div className="flex max-w-md flex-col items-center text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white shadow-sm ring-1 ring-slate-200">
          <Folder className="h-7 w-7 text-slate-700" aria-hidden="true" />
        </div>
        <h2 className="mt-5 text-lg font-semibold text-slate-900">No files yet</h2>
        <p className="mt-1 text-sm text-slate-600">Upload to get started!</p>
      </div>
    </div>
  );
}

