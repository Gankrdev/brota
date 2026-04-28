import Image from "next/image";
import Link from "next/link";
import { Sprout } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import type { GardenPlant, PlantHealth } from "@/lib/dashboard/queries";
import type { LightRequirement } from "@/generated/prisma/enums";

const LIGHT_LABEL: Record<LightRequirement, string> = {
  LOW: "Luz baja",
  MEDIUM_INDIRECT: "Indirecta media",
  BRIGHT_INDIRECT: "Indirecta intensa",
  DIRECT: "Luz directa",
};

const HEALTH_BADGE: Record<
  PlantHealth,
  { label: string; variant: "secondary" | "default" | "destructive" | "outline" }
> = {
  healthy: { label: "Saludable", variant: "secondary" },
  thirsty: { label: "Sedienta", variant: "default" },
  critical: { label: "Crítica", variant: "destructive" },
  pending_diagnosis: { label: "Sin diagnóstico", variant: "secondary" },
};

function frequencyLabel(days: number): string {
  if (days <= 3) return "Cada pocos días";
  if (days <= 7) return "Semanal";
  if (days <= 10) return "Cada semana y media";
  if (days <= 14) return "Quincenal";
  if (days <= 20) return "Cada 2-3 semanas";
  return "Mensual";
}

export function PlantCard({ plant }: { plant: GardenPlant }) {
  const badge = HEALTH_BADGE[plant.health];
  const meta = `${LIGHT_LABEL[plant.lightRequirement]} • ${frequencyLabel(plant.wateringFrequencyDays)}`;

  return (
    <Link
      href={`/jardin/${plant.id}`}
      className="group focus-visible:ring-ring rounded-xl focus-visible:ring-2 focus-visible:outline-none"
    >
      <Card className="gap-0 py-0 transition-shadow hover:shadow-md">
        <div className="relative aspect-4/5 w-full overflow-hidden bg-muted">
          {plant.photoUrl ? (
            <Image
              src={plant.photoUrl}
              alt={`Foto de ${plant.nickname}`}
              fill
              sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 25vw"
              className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
            />
          ) : (
            <div className="flex h-full items-center justify-center text-muted-foreground">
              <Sprout className="size-16" />
            </div>
          )}
          <Badge
            variant={badge.variant}
            className="absolute top-4 right-4 tracking-widest uppercase"
          >
            {badge.label}
          </Badge>
        </div>
        <CardContent className="flex flex-col gap-2 p-6">
          <h3 className="font-heading text-2xl text-primary">{plant.nickname}</h3>
          <p className="text-[10px] font-bold tracking-widest text-muted-foreground uppercase">
            {meta}
          </p>
        </CardContent>
      </Card>
    </Link>
  );
}
