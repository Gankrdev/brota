"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { NAV_ITEMS } from "@/components/layout/nav-items";
import { cn } from "@/lib/utils";

export function BottomNavBar() {
  const pathname = usePathname();

  return (
    <nav
      aria-label="Navegación principal"
      className="fixed bottom-0 left-0 z-50 flex h-20 w-full items-center justify-around rounded-t-xl border-t border-border bg-card px-4 pb-[env(safe-area-inset-bottom)] pt-2 shadow-[0_-4px_12px_rgba(27,48,34,0.08)] md:hidden"
    >
      {NAV_ITEMS.map(({ label, href, icon: Icon }) => {
        const isActive = href === "/" ? pathname === "/" : pathname.startsWith(href) && href !== "#";
        return (
          <Link
            key={label}
            href={href}
            className={cn(
              "flex flex-col items-center justify-center rounded-lg px-3 py-1 transition-all active:scale-95",
              isActive
                ? "bg-primary-50 text-primary"
                : "text-muted-foreground hover:bg-muted",
            )}
          >
            <Icon className="size-6" />
            <span className="mt-1 font-heading text-[10px] font-medium uppercase tracking-wider">
              {label}
            </span>
          </Link>
        );
      })}
    </nav>
  );
}
