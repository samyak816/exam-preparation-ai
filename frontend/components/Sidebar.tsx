"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, FileText, UploadCloud, MessageSquare, BrainCircuit, Activity, Mic } from "lucide-react";

export function Sidebar() {
  const pathname = usePathname();

  const links = [
    { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    { name: "My Notes", href: "/upload", icon: FileText },
    { name: "Upload Notes", href: "/upload", icon: UploadCloud },
    { name: "Ask AI", href: "/chat", icon: MessageSquare },
    { name: "Voice Tutor", href: "/chat", icon: Mic },
    { name: "Quiz", href: "/quiz", icon: BrainCircuit },
    { name: "Progress", href: "/progress", icon: Activity },
  ];

  return (
    <aside
      className="w-64 border-r hidden md:flex flex-col flex-shrink-0 min-h-[calc(100vh-4rem)]"
      style={{
        backgroundColor: "rgb(var(--sidebar))",
        borderColor: "rgb(var(--sidebar-border))",
      }}
    >
      <div className="flex flex-col py-6 px-3 flex-1">
        <div className="space-y-1">
          {links.map((link) => {
            const isActive = pathname === link.href;
            const Icon = link.icon;

            return (
              <Link
                key={link.name}
                href={link.href}
                title={link.name}
                className="flex items-center space-x-3 px-3 py-2 rounded-md text-sm transition-colors duration-150"
                style={{
                  backgroundColor: isActive ? "rgb(var(--sidebar-active))" : "transparent",
                  color: isActive ? "rgb(var(--sidebar-active-foreground))" : "rgb(var(--sidebar-foreground))",
                  fontWeight: isActive ? 600 : 500,
                  borderLeft: isActive ? "3px solid rgb(var(--primary))" : "3px solid transparent",
                }}
              >
                <Icon className="w-4 h-4 shrink-0" />
                <span>{link.name}</span>
              </Link>
            );
          })}
        </div>
      </div>
    </aside>
  );
}
