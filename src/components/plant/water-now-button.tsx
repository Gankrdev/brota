"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Droplet } from "lucide-react";
import { Button } from "@/components/ui/button";

export function WaterNowButton({ plantId }: { plantId: string }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function handleClick() {
    setError(null);
    startTransition(async () => {
      const res = await fetch(`/api/plants/${plantId}/water`, { method: "POST" });
      if (!res.ok) {
        setError("No se pudo registrar el riego.");
        return;
      }
      router.refresh();
    });
  }

  return (
    <div className="flex flex-col gap-1">
      <Button
        size="lg"
        onClick={handleClick}
        disabled={pending}
        className="h-11 px-6 text-base"
      >
        <Droplet className="size-5 fill-current" />
        {pending ? "Registrando..." : "Regar ahora"}
      </Button>
      {error && (
        <p role="alert" className="text-sm text-destructive">
          {error}
        </p>
      )}
    </div>
  );
}
