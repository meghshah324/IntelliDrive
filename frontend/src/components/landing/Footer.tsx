import { Link } from "react-router-dom";
import { Github, Twitter, Linkedin, Youtube } from "lucide-react";
import Logo from "./Logo";

interface FooterColumn {
  heading: string;
  links: { label: string; href: string }[];
}

const COLUMNS: FooterColumn[] = [
  {
    heading: "Product",
    links: [
      { label: "Features", href: "#features" },
      { label: "Product", href: "#product" },
      { label: "Coming Soon", href: "#" },
      { label: "Changelog", href: "#" },
    ],
  },
  {
    heading: "Company",
    links: [
      { label: "About", href: "#about" },
      { label: "Blog", href: "#" },
      { label: "Careers", href: "#" },
      { label: "Contact", href: "#" },
    ],
  },
  {
    heading: "Resources",
    links: [
      { label: "Help Center", href: "#" },
      { label: "Community", href: "#" },
      { label: "Status", href: "#" },
      { label: "Guides", href: "#" },
    ],
  },
];

const SOCIALS = [
  { icon: Twitter, label: "Twitter", href: "#" },
  { icon: Github, label: "GitHub", href: "#" },
  { icon: Linkedin, label: "LinkedIn", href: "#" },
  { icon: Youtube, label: "YouTube", href: "#" },
];

export default function Footer() {
  return (
    <footer className="border-t border-slate-200 bg-white">
      <div className="mx-auto max-w-7xl px-6 py-16 lg:px-8">
        <div className="grid grid-cols-2 gap-10 md:grid-cols-5">
          <div className="col-span-2">
            <Logo />
            <p className="mt-4 max-w-sm text-sm leading-6 text-slate-600">
              The modern home for your files. Secure cloud storage, beautifully
              organized.
            </p>
            <div className="mt-5 flex items-center gap-2">
              {SOCIALS.map(({ icon: Icon, label, href }) => (
                <a
                  key={label}
                  href={href}
                  aria-label={label}
                  className="grid h-9 w-9 place-items-center rounded-lg border border-slate-200 text-slate-500 transition hover:border-slate-300 hover:bg-slate-50 hover:text-slate-900"
                >
                  <Icon className="h-4 w-4" />
                </a>
              ))}
            </div>
          </div>

          {COLUMNS.map((col) => (
            <div key={col.heading}>
              <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                {col.heading}
              </h4>
              <ul className="mt-4 space-y-2.5">
                {col.links.map((link) => (
                  <li key={link.label}>
                    <a
                      href={link.href}
                      className="text-sm text-slate-600 transition hover:text-slate-900"
                    >
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-slate-200 pt-6 sm:flex-row">
          <p className="text-xs text-slate-500">
            © {new Date().getFullYear()} IntelliDrive. All rights reserved.
          </p>
          <div className="flex items-center gap-5 text-xs text-slate-500">
            <Link to="#" className="hover:text-slate-900">
              Privacy
            </Link>
            <Link to="#" className="hover:text-slate-900">
              Terms
            </Link>
            <Link to="#" className="hover:text-slate-900">
              Cookies
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
