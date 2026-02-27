"use client";

import Link from "next/link";
import { ThemeToggle } from "./ThemeToggle";

export function Navigation() {
  return (
    <nav className="fixed inset-x-0 top-0 z-50 flex h-14 items-center justify-between px-6 backdrop-blur-md bg-nav-bg md:px-8">
      <Link
        href="/"
        className="font-display text-lg tracking-tight text-foreground"
      >
        Lady Bandit Studios
      </Link>

      <ThemeToggle />
    </nav>
  );
}
