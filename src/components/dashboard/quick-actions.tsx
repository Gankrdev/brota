"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Droplet, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";

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
        <Button
          size="lg"
          onClick={waterAllDue}
          disabled={!hasOverduePlants || pending}
          className="h-12 px-6 text-base"
        >
          <Droplet className="size-5 fill-current" />
          {pending ? "Registrando..." : "Regar todas las pendientes"}
        </Button>
        <Button asChild variant="secondary" size="lg" className="h-12 px-6 text-base">
          <Link href="/jardin/nueva">
            <Plus className="size-5" />
            Agregar planta
          </Link>
        </Button>
      </div>
      {error && (
        <p role="alert" className="text-sm text-destructive">
          {error}
        </p>
      )}
    </div>
  );
}
