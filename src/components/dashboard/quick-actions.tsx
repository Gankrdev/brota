"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Droplet, Plus } from "lucide-react";

interface QuickActionsProps {
  hasOverduePlants: boolean;
}

export function QuickActions({ hasOverduePlants }: QuickActionsProps) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function waterAllDue() {
    setError(null);
    startTransition(async () => {
      const res = await fetch("/api/plants/water-all-due", { method: "POST" });
      if (!res.ok) {
        setError("No se pudo registrar el riego. Intenta de nuevo.");
        return;
      }
      router.refresh();
    });
  }

  return (
    <div className="flex flex-col gap-2">
      <div className="flex flex-wrap gap-4">
        <button
          type="button"
          onClick={waterAllDue}
          disabled={!hasOverduePlants || pending}
          className="flex items-center gap-2 rounded-md bg-primary px-6 py-4 text-base font-semibold text-primary-foreground shadow-sm transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <Droplet className="size-5 fill-current" />
          {pending ? "Registrando..." : "Regar todas las pendientes"}
        </button>
        <Link
          href="/plants/new"
          className="flex items-center gap-2 rounded-md bg-secondary px-6 py-4 text-base font-semibold text-secondary-foreground shadow-sm transition-opacity hover:opacity-90"
        >
          <Plus className="size-5" />
          Agregar planta
        </Link>
      </div>
      {error && (
        <p role="alert" className="text-sm text-destructive">
          {error}
        </p>
      )}
    </div>
  );
}
