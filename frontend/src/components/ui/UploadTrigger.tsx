import { forwardRef, useImperativeHandle, useRef } from "react";
import type { ChangeEvent } from "react";

export interface UploadTriggerHandle {
  /** Programmatically open the native file picker. */
  open: () => void;
}

interface UploadTriggerProps {
  /** Called with the selected files (never empty). */
  onFiles: (files: File[]) => void;
  /** When true, render as a folder picker (webkitdirectory). */
  directory?: boolean;
  /** Allow multiple files. Defaults to true. */
  multiple?: boolean;
  /** Optional accept filter, e.g. "image/*". */
  accept?: string;
}

/**
 * Headless hidden <input type="file"> wrapper.
 * Parent owns a ref and calls `.open()` to trigger the native picker.
 */
const UploadTrigger = forwardRef<UploadTriggerHandle, UploadTriggerProps>(
  function UploadTrigger(
    { onFiles, directory = false, multiple = true, accept },
    ref,
  ) {
    const inputRef = useRef<HTMLInputElement>(null);

    useImperativeHandle(ref, () => ({
      open: () => inputRef.current?.click(),
    }));

    const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
      const list = e.target.files;
      if (!list || list.length === 0) return;
      onFiles(Array.from(list));
      // reset so selecting the same path again still fires onChange
      e.target.value = "";
    };

    // Folder-picker attributes are non-standard — apply via a typed object.
    const dirProps = directory
      ? ({
          webkitdirectory: "",
          directory: "",
        } as Record<string, string>)
      : {};

    return (
      <input
        ref={inputRef}
        type="file"
        multiple={multiple}
        accept={accept}
        onChange={handleChange}
        className="hidden"
        {...dirProps}
      />
    );
  },
);

export default UploadTrigger;
