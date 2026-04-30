"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Bell } from "lucide-react";
import { NAV_ITEMS } from "@/components/layout/nav-items";
import { InitialAvatar } from "@/components/profile/initial-avatar";
import { cn } from "@/lib/utils";

interface TopAppBarProps {
  userName: string | null;
  userEmail: string;
}

export function TopAppBar({ userName, userEmail }: TopAppBarProps) {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-40 hidden w-full items-center justify-between border-b border-border bg-background/90 px-6 py-3 shadow-sm backdrop-blur-md md:flex">
      <div className="flex items-center gap-6">
        <Link
          href="/"
          className="font-heading text-xl font-bold tracking-tight text-primary"
        >
          Brota
        </Link>
        <nav className="flex gap-4">
          {NAV_ITEMS.map(({ label, href }) => {
            const isActive = href === "/" ? pathname === "/" : pathname.startsWith(href) && href !== "#";
            return (
              <Link
                key={label}
                href={href}
                className={cn(
                  "font-heading text-[10px] font-medium uppercase tracking-wider transition-colors",
                  isActive
                    ? "border-b-2 border-primary text-primary"
                    : "text-muted-foreground hover:text-primary",
                )}
              >
                {label}
              </Link>
            );
          })}
        </nav>
      </div>
      <div className="flex items-center gap-4">
        <button
          type="button"
          aria-label="Notificaciones"
          className="text-primary transition-opacity hover:opacity-80 active:opacity-70"
        >
          <Bell className="size-6" />
        </button>
        <Link
          href="/perfil"
          aria-label="Perfil"
          className="rounded-full transition-opacity hover:opacity-80 active:opacity-70"
        >
          <InitialAvatar
            name={userName}
            email={userEmail}
            className="size-9"
          />
        </Link>
      </div>
    </header>
  );
}
