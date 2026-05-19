import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Menu, X } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import Logo from "./Logo";

interface NavLinkItem {
  label: string;
  href: string;
}

const NAV_LINKS: NavLinkItem[] = [
  { label: "Home", href: "#home" },
  { label: "Features", href: "#features" },
  { label: "Product", href: "#product" },
  { label: "About", href: "#about" },
];

export default function LandingNavbar() {
  const { isAuthenticated } = useAuth();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={`sticky top-0 z-50 w-full transition-all ${
        scrolled
          ? "border-b border-slate-200/70 bg-white/75 backdrop-blur-xl"
          : "border-b border-transparent bg-white/40 backdrop-blur-md"
      }`}
    >
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-6 py-3.5 lg:px-8">
        <Logo />

        <ul className="hidden items-center gap-8 md:flex">
          {NAV_LINKS.map((link) => (
            <li key={link.label}>
              <a
                href={link.href}
                className="text-sm font-medium text-slate-600 transition hover:text-slate-900"
              >
                {link.label}
              </a>
            </li>
          ))}
        </ul>

        <div className="hidden items-center gap-2 md:flex">
          <Link
            to={isAuthenticated ? "/dashboard" : "/sign-in"}
            className="rounded-full px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-100 hover:text-slate-900"
          >
            {isAuthenticated ? "Dashboard" : "Login"}
          </Link>
          <Link
            to={isAuthenticated ? "/dashboard" : "/sign-up"}
            className="rounded-full bg-slate-900 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-700"
          >
            Get Started
          </Link>
        </div>

        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className="grid h-10 w-10 place-items-center rounded-lg text-slate-700 hover:bg-slate-100 md:hidden"
          aria-label="Toggle navigation"
          aria-expanded={open}
        >
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </nav>

      {open && (
        <div className="border-t border-slate-200 bg-white/95 px-6 py-4 backdrop-blur md:hidden">
          <ul className="flex flex-col gap-1">
            {NAV_LINKS.map((link) => (
              <li key={link.label}>
                <a
                  href={link.href}
                  onClick={() => setOpen(false)}
                  className="block rounded-lg px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100"
                >
                  {link.label}
                </a>
              </li>
            ))}
          </ul>
          <div className="mt-3 flex flex-col gap-2">
            <Link
              to={isAuthenticated ? "/dashboard" : "/sign-in"}
              onClick={() => setOpen(false)}
              className="rounded-lg border border-slate-200 px-4 py-2 text-center text-sm font-medium text-slate-800 hover:bg-slate-50"
            >
              {isAuthenticated ? "Dashboard" : "Login"}
            </Link>
            <Link
              to={isAuthenticated ? "/dashboard" : "/sign-up"}
              onClick={() => setOpen(false)}
              className="rounded-lg bg-slate-900 px-4 py-2 text-center text-sm font-semibold text-white hover:bg-slate-700"
            >
              Get Started
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
