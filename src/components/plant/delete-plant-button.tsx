"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface Props {
  plantId: string;
  className?: string;
}

export function DeletePlantButton({ plantId, className }: Props) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [confirming, setConfirming] = useState(false);

  function handleClick() {
    if (!confirming) {
      setConfirming(true);
      return;
    }
    startTransition(async () => {
      await fetch(`/api/plants/${plantId}`, { method: "DELETE" });
      router.push("/jardin");
      router.refresh();
    });
  }

  return (
    <Button
      variant="outline"
      size="icon-lg"
      onClick={handleClick}
      onBlur={() => setConfirming(false)}
      disabled={pending}
      aria-label={confirming ? "Confirmar eliminación" : "Eliminar planta"}
      className={cn(
        "transition-colors",
        confirming
          ? "border-destructive bg-destructive/10 text-destructive hover:bg-destructive/20"
          : "bg-card/80 backdrop-blur-md",
        className,
      )}
    >
      <Trash2 className="size-5" />
    </Button>
  );
}
