/**
 * upload/UploadProvider.tsx
 * ─────────────────────────────────────────────────────────
 * WHY: The only file that touches React Context. Its sole job
 * is creating the provider and exposing the consumer hook.
 * All logic lives in useUploadQueue and the scheduler.
 */

import { createContext, useContext } from "react";
import type { ReactNode } from "react";
import { useUploadQueue } from "./useUploadQueue";
import type { UploadContextValue } from "./types";

const UploadContext = createContext<UploadContextValue | null>(null);

interface ProviderProps {
  children: ReactNode;
}

export function UploadProvider({ children }: ProviderProps) {
  const value = useUploadQueue();
  return (
    <UploadContext.Provider value={value}>{children}</UploadContext.Provider>
  );
}

export function useUploads(): UploadContextValue {
  const ctx = useContext(UploadContext);
  if (!ctx) throw new Error("useUploads must be used inside <UploadProvider>");
  return ctx;
}
