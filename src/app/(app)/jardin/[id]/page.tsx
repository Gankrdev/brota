import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Pencil, Sprout, StickyNote } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { getPlantDetail } from "@/lib/dashboard/queries";
import { CareGrid } from "@/components/plant/care-grid";
import { CareHistory } from "@/components/plant/care-history";
import { WaterNowButton } from "@/components/plant/water-now-button";

const HEALTH_BADGE = {
  healthy: { label: "Saludable", variant: "secondary" as const },
  thirsty: { label: "Sedienta", variant: "default" as const },
  critical: { label: "Crítica", variant: "destructive" as const },
};

export default async function PlantDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const plant = await getPlantDetail(id);

  if (!plant) notFound();

  const badge = HEALTH_BADGE[plant.health];

  return (
    <main className="pb-32 md:pb-16">
      <section className="relative h-[400px] w-full bg-muted md:h-[520px]">
        {plant.photoUrl ? (
          <Image
            src={plant.photoUrl}
            alt={`Foto de ${plant.nickname}`}
            fill
            sizes="100vw"
            className="object-cover"
            priority
          />
        ) : (
          <div className="flex h-full items-center justify-center text-muted-foreground">
            <Sprout className="size-24" />
          </div>
        )}

        <Button
          asChild
          variant="outline"
          size="icon-lg"
          aria-label="Volver al jardín"
          className="absolute top-6 left-6 rounded-full bg-card/80 backdrop-blur-md"
        >
          <Link href="/jardin">
            <ArrowLeft className="size-5" />
          </Link>
        </Button>
      </section>

      <div className="relative z-10 mx-auto -mt-6 w-full max-w-7xl px-6 md:px-16">
        <Card className="rounded-t-xl p-6 md:mt-12 md:rounded-xl md:p-8">
          <CardContent className="md:flex md:items-end md:justify-between md:gap-6">
            <div className="flex-1">
              <div className="mb-2 flex flex-wrap items-center gap-2">
                {plant.species.family && (
                  <Badge
                    variant="secondary"
                    className="bg-accent-100 tracking-widest text-accent-800 uppercase"
                  >
                    {plant.species.family}
                  </Badge>
                )}
                {plant.location && (
                  <span className="text-[10px] font-bold tracking-widest text-muted-foreground uppercase">
                    {plant.location}
                  </span>
                )}
                <Badge variant={badge.variant} className="tracking-widest uppercase">
                  {badge.label}
                </Badge>
              </div>
              <h1 className="font-heading text-4xl text-primary md:text-5xl">
                {plant.nickname}
              </h1>
              <p className="mt-1 text-sm text-muted-foreground italic">
                {plant.species.commonName}
                {plant.species.scientificName ? ` · ${plant.species.scientificName}` : ""}
              </p>
              {plant.species.description && (
                <p className="mt-4 max-w-2xl text-base text-muted-foreground">
                  {plant.species.description}
                </p>
              )}
            </div>

            <div className="mt-6 flex gap-3 md:mt-0">
              <Button
                asChild
                variant="secondary"
                size="lg"
                className="h-11 flex-1 px-6 text-base md:flex-none"
              >
                <Link href={`/jardin/${plant.id}/editar`}>
                  <Pencil className="size-5" />
                  Editar
                </Link>
              </Button>
              <WaterNowButton plantId={plant.id} />
            </div>
          </CardContent>
        </Card>

        <div className="mt-8 grid grid-cols-1 gap-6 md:grid-cols-12">
          <div className="md:col-span-8">
            <CareGrid
              light={plant.species.lightRequirement}
              wateringFrequencyDays={plant.species.wateringFrequencyDays}
              wateringFrequencyMin={plant.species.wateringFrequencyMin}
              wateringFrequencyMax={plant.species.wateringFrequencyMax}
              humidityIdealMin={plant.species.humidityIdealMin}
              humidityIdealMax={plant.species.humidityIdealMax}
              idealTempMinC={plant.species.idealTempMinC}
              idealTempMaxC={plant.species.idealTempMaxC}
            />
          </div>

          <div className="flex flex-col gap-6 md:col-span-4">
            <CareHistory events={plant.history} />

            {plant.notes && (
              <Card className="border-secondary-200 bg-secondary-50">
                <CardContent className="flex flex-col gap-2">
                  <div className="flex items-center gap-2">
                    <StickyNote className="size-5 text-primary" />
                    <h3 className="font-semibold text-primary">Notas personales</h3>
                  </div>
                  <p className="text-sm text-foreground italic">{plant.notes}</p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
