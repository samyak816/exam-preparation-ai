"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTheme } from "next-themes";
import { BookOpen, Sun, Moon, Menu, X } from "lucide-react";

export function Navbar() {
  const pathname = usePathname();
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);
  const [mobileOpen, setMobileOpen] = React.useState(false);

  React.useEffect(() => setMounted(true), []);

  const navLinks = [
    { name: "Dashboard", href: "/dashboard" },
    { name: "Upload", href: "/upload" },
    { name: "Ask AI", href: "/chat" },
    { name: "Quiz", href: "/quiz" },
  ];

  return (
    <nav
      className="fixed top-0 left-0 right-0 h-16 z-50 border-b"
      style={{
        backgroundColor: "rgb(var(--card))",
        borderColor: "rgb(var(--border))",
      }}
    >
      <div className="h-full px-6 md:px-8 flex items-center justify-between mx-auto">
        {/* Logo */}
        <Link href="/" className="flex items-center space-x-3 group shrink-0">
          <div className="text-indigo-600 dark:text-indigo-400">
            <BookOpen className="w-5 h-5" />
          </div>
          <span className="font-bold text-lg tracking-tight" style={{ color: "rgb(var(--foreground))" }}>
            Exam Prep AI
          </span>
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center space-x-2">
          {navLinks.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.name}
                href={link.href}
                className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                  isActive
                    ? "bg-muted text-foreground font-semibold"
                    : "hover:bg-muted/50"
                }`}
                style={{
                  backgroundColor: isActive ? "rgb(var(--muted))" : "transparent",
                  color: isActive ? "rgb(var(--foreground))" : "rgb(var(--muted-foreground))"
                }}
              >
                {link.name}
              </Link>
            );
          })}
        </div>

        {/* Right Section */}
        <div className="flex items-center space-x-3">
          {/* Theme Toggle */}
          {mounted && (
            <button
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
              title={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
              className="p-1.5 rounded-md transition-colors focus:outline-none"
              style={{ color: "rgb(var(--muted-foreground))" }}
            >
              {theme === "dark" ? (
                <Sun className="w-4 h-4 hover:text-amber-400" />
              ) : (
                <Moon className="w-4 h-4 hover:text-indigo-600" />
              )}
            </button>
          )}

          {/* Get Started CTA */}
          <Link
            href="/dashboard"
            className="hidden sm:inline-flex px-4 py-1.5 text-sm font-semibold rounded-md border shadow-sm transition-colors hover:bg-muted"
            style={{ borderColor: "rgb(var(--border))", color: "rgb(var(--foreground))", backgroundColor: "rgb(var(--card))" }}
          >
            Dashboard
          </Link>

          {/* Mobile Menu Toggle */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="md:hidden p-2 rounded-lg transition-colors hover:bg-gray-100 dark:hover:bg-gray-800"
            aria-label="Toggle navigation menu"
            style={{ color: "rgb(var(--foreground))" }}
          >
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Dropdown */}
      {mobileOpen && (
        <div
          className="md:hidden border-t shadow-lg"
          style={{
            backgroundColor: "rgb(var(--card))",
            borderColor: "rgb(var(--border))",
          }}
        >
          <div className="p-4 space-y-1">
            {navLinks.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.name}
                  href={link.href}
                  onClick={() => setMobileOpen(false)}
                  className={`block px-4 py-3 rounded-lg text-sm font-semibold transition-colors ${
                    isActive
                      ? "bg-indigo-50 text-indigo-700 dark:bg-indigo-950/50 dark:text-indigo-400"
                      : "hover:bg-gray-100 dark:hover:bg-gray-800"
                  }`}
                  style={{ color: isActive ? undefined : "rgb(var(--foreground))" }}
                >
                  {link.name}
                </Link>
              );
            })}
          </div>
        </div>
      )}
    </nav>
  );
}
