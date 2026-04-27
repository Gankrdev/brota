import Image from "next/image";
import { Sprout, Droplet } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import type { NeedsAttentionPlant } from "@/lib/dashboard/queries";

function badgeFor(daysOverdue: number) {
  if (daysOverdue >= 3)
    return { label: "MUY SECA", variant: "destructive" as const };
  if (daysOverdue >= 1) return { label: "SEDIENTA", variant: "default" as const };
  return { label: "REGAR HOY", variant: "secondary" as const };
}

interface Props {
  plants: NeedsAttentionPlant[];
}

export function NeedsAttention({ plants }: Props) {
  if (plants.length === 0) {
    return (
      <Card className="items-center gap-3 border-dashed p-12 text-center ring-0 [&>img:first-child]:rounded-none">
        <Sprout className="size-10 text-secondary" />
        <p className="font-heading text-xl text-primary">Todo en orden</p>
        <p className="max-w-sm text-sm text-muted-foreground">
          Ninguna planta necesita atención hoy. Cuando agregues plantas y registres
          riegos, las que se atrasen aparecerán aquí.
        </p>
      </Card>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
      {plants.map((plant) => {
        const badge = badgeFor(plant.daysOverdue);
        return (
          <Card key={plant.id} className="gap-0 py-0">
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
              <Badge
                variant={badge.variant}
                className="absolute top-2 right-2 tracking-widest uppercase"
              >
                {badge.label}
              </Badge>
            </div>
            <CardContent className="flex grow flex-col gap-3 p-4">
              <div>
                <h3 className="text-lg font-bold text-primary">{plant.nickname}</h3>
                <p className="text-[10px] font-bold tracking-widest text-muted-foreground uppercase">
                  {plant.location ?? plant.speciesCommonName}
                </p>
              </div>
              <div className="grow" />
              <Button variant="default" className="w-full">
                <Droplet className="size-4 fill-current" />
                Regar ahora
              </Button>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
