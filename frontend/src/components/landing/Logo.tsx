import { Link } from "react-router-dom";
import { HardDrive } from "lucide-react";

interface LogoProps {
  className?: string;
}

export default function Logo({ className = "" }: LogoProps) {
  return (
    <Link to="/" className={`flex items-center gap-2 ${className}`}>
      <span className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-br from-indigo-500 via-blue-500 to-cyan-400 text-white shadow-md shadow-indigo-200">
        <HardDrive className="h-5 w-5" strokeWidth={2.25} />
      </span>
      <span className="text-lg font-semibold tracking-tight text-slate-900">
        IntelliDrive
      </span>
    </Link>
  );
}
