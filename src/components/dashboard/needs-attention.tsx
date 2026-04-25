import Image from "next/image";
import { Sprout, Droplet } from "lucide-react";
import type { NeedsAttentionPlant } from "@/lib/dashboard/queries";

function badgeFor(daysOverdue: number) {
  if (daysOverdue >= 3) return { label: "MUY SECA", variant: "danger" as const };
  if (daysOverdue >= 1) return { label: "SEDIENTA", variant: "warning" as const };
  return { label: "REGAR HOY", variant: "neutral" as const };
}

const BADGE_STYLES: Record<"danger" | "warning" | "neutral", string> = {
  danger: "bg-destructive text-white",
  warning: "bg-accent text-accent-foreground",
  neutral: "bg-muted text-foreground",
};

interface Props {
  plants: NeedsAttentionPlant[];
}

export function NeedsAttention({ plants }: Props) {
  if (plants.length === 0) {
    return (
      <div className="flex flex-col items-center gap-3 rounded-lg border border-dashed border-border bg-card p-12 text-center">
        <Sprout className="size-10 text-secondary" />
        <p className="font-heading text-xl text-primary">Todo en orden</p>
        <p className="max-w-sm text-sm text-muted-foreground">
          Ninguna planta necesita atención hoy. Cuando agregues plantas y registres riegos, las que se atrasen aparecerán aquí.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
      {plants.map((plant) => {
        const badge = badgeFor(plant.daysOverdue);
        return (
          <article
            key={plant.id}
            className="flex flex-col overflow-hidden rounded-lg border border-border bg-card shadow-sm transition-shadow hover:shadow-md"
          >
            <div className="relative h-48 w-full bg-muted">
              {plant.photoUrl ? (
                <Image
                  src={plant.photoUrl}
                  alt={`Foto de ${plant.nickname}`}
                  fill
                  sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                  className="object-cover"
                />
              ) : (
                <div className="flex h-full items-center justify-center text-muted-foreground">
                  <Sprout className="size-12" />
                </div>
              )}
              <span
                className={`absolute right-2 top-2 rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-widest ${BADGE_STYLES[badge.variant]}`}
              >
                {badge.label}
              </span>
            </div>
            <div className="flex flex-grow flex-col gap-2 p-4">
              <div>
                <h3 className="text-lg font-bold text-primary">{plant.nickname}</h3>
                <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                  {plant.location ?? plant.speciesCommonName}
                </p>
              </div>
              <div className="flex-grow" />
              <button
                type="button"
                className="flex w-full items-center justify-center gap-1 rounded-md bg-accent py-2 text-sm font-semibold text-accent-foreground transition-opacity hover:opacity-90"
              >
                <Droplet className="size-4 fill-current" />
                Regar ahora
              </button>
            </div>
          </article>
        );
      })}
    </div>
  );
}
