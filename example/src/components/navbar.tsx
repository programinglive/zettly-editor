import React, { useState } from "react";
import { Github, Star, Sun, Moon, Menu, X, ExternalLink } from "lucide-react";

export interface NavbarProps {
  theme: "light" | "dark";
  onToggleTheme: () => void;
  githubStars: number | null;
}

export const Navbar: React.FC<NavbarProps> = ({
  theme,
  onToggleTheme,
  githubStars,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLinks = [
    { label: "Playground", href: "#playground" },
    { label: "Docs", href: "#docs" },
    { label: "Installation", href: "#installation" },
  ];

  const handleNavClick = (href: string) => {
    setMobileMenuOpen(false);
    const target = document.querySelector(href);
    if (target) {
      target.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b border-zinc-200/80 bg-white/80 backdrop-blur-md transition-colors duration-200 dark:border-zinc-800/80 dark:bg-zinc-950/80">
      <div className="mx-auto flex h-13 max-w-6xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Typographic wordmark — no logo image, no SVG, no icon */}
        <a
          href="#playground"
          onClick={(e) => {
            e.preventDefault();
            handleNavClick("#playground");
          }}
          className="flex items-center gap-2 transition-opacity hover:opacity-80"
        >
          <span className="font-semibold tracking-tight text-zinc-900 dark:text-zinc-100 text-sm sm:text-base">
            Zettly Editor
          </span>
          <span className="rounded-full bg-zinc-100 px-2 py-0.5 text-[10px] font-medium text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400">
            v0.3.0
          </span>
        </a>

        {/* Desktop Navigation links */}
        <nav className="hidden md:flex items-center gap-6 text-xs font-medium text-zinc-600 dark:text-zinc-300">
          {navLinks.map((link) => (
            <button
              key={link.label}
              type="button"
              onClick={() => handleNavClick(link.href)}
              className="transition-colors hover:text-indigo-600 dark:hover:text-indigo-400 cursor-pointer"
            >
              {link.label}
            </button>
          ))}
        </nav>

        {/* Actions: GitHub & Theme Toggle */}
        <div className="flex items-center gap-2.5">
          <a
            href="https://github.com/programinglive/zettly-editor"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 rounded-full border border-zinc-200 bg-zinc-50/80 px-2.5 py-1 text-xs font-medium text-zinc-700 transition hover:bg-zinc-100 dark:border-zinc-800 dark:bg-zinc-900/80 dark:text-zinc-300 dark:hover:bg-zinc-800"
            aria-label="View on GitHub"
          >
            <Github className="h-3.5 w-3.5" aria-hidden="true" />
            <span className="hidden sm:inline">GitHub</span>
            <span className="flex items-center gap-0.5 rounded-full bg-white px-1.5 py-0.2 text-[10px] font-semibold text-zinc-700 shadow-2xs dark:bg-zinc-800 dark:text-zinc-300">
              <Star className="h-2.5 w-2.5 text-amber-500 fill-amber-500" />
              {githubStars !== null ? githubStars : "3"}
            </span>
          </a>

          <button
            type="button"
            onClick={onToggleTheme}
            className="rounded-full p-1.5 text-zinc-600 transition hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-800 cursor-pointer"
            aria-label="Toggle theme"
          >
            {theme === "light" ? (
              <Moon className="h-4 w-4" />
            ) : (
              <Sun className="h-4 w-4 text-amber-400" />
            )}
          </button>

          {/* Mobile hamburger button */}
          <button
            type="button"
            onClick={() => setMobileMenuOpen((prev) => !prev)}
            className="md:hidden rounded-lg p-1.5 text-zinc-600 transition hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-800 cursor-pointer"
            aria-label="Open navigation menu"
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Mobile drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b border-zinc-200 bg-white/95 px-4 py-3 backdrop-blur-md dark:border-zinc-800 dark:bg-zinc-950/95">
          <nav className="flex flex-col gap-1.5">
            {navLinks.map((link) => (
              <button
                key={link.label}
                type="button"
                onClick={() => handleNavClick(link.href)}
                className="flex items-center justify-between rounded-lg px-3 py-2 text-left text-sm font-medium text-zinc-700 transition hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-900 cursor-pointer"
              >
                <span>{link.label}</span>
                <ExternalLink className="h-3 w-3 text-zinc-400" />
              </button>
            ))}
          </nav>
        </div>
      )}
    </header>
  );
};
