"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { NAV_ITEMS } from "@/components/layout/nav-items";
import { InitialAvatar } from "@/components/profile/initial-avatar";
import { cn } from "@/lib/utils";

interface BottomNavBarProps {
  userName: string | null;
  userEmail: string;
}

export function BottomNavBar({ userName, userEmail }: BottomNavBarProps) {
  const pathname = usePathname();
  const isProfileActive = pathname.startsWith("/perfil");

  return (
    <nav
      aria-label="Navegación principal"
      className="fixed bottom-0 left-0 z-50 flex h-20 w-full items-center justify-around rounded-t-xl border-t border-border bg-card px-2 pb-[env(safe-area-inset-bottom)] pt-2 shadow-[0_-4px_12px_rgba(27,48,34,0.08)] md:hidden"
    >
      {NAV_ITEMS.map(({ label, href, icon: Icon }) => {
        const isActive = href === "/" ? pathname === "/" : pathname.startsWith(href) && href !== "#";
        return (
          <Link
            key={label}
            href={href}
            className={cn(
              "flex flex-col items-center justify-center rounded-lg px-2 py-1 transition-all active:scale-95",
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
      <Link
        href="/perfil"
        aria-label="Perfil"
        className={cn(
          "flex flex-col items-center justify-center rounded-lg px-2 py-1 transition-all active:scale-95",
          isProfileActive ? "bg-primary-50" : "hover:bg-muted",
        )}
      >
        <InitialAvatar
          name={userName}
          email={userEmail}
          className={cn(
            "size-6",
            isProfileActive && "ring-2 ring-primary ring-offset-1 ring-offset-card",
          )}
          fallbackClassName="text-[10px]"
        />
        <span
          className={cn(
            "mt-1 font-heading text-[10px] font-medium uppercase tracking-wider",
            isProfileActive ? "text-primary" : "text-muted-foreground",
          )}
        >
          Perfil
        </span>
      </Link>
    </nav>
  );
}
