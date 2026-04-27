"use client";

import { useMemo, useState } from "react";
import { Search, Sprout } from "lucide-react";
import { Card } from "@/components/ui/card";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { PlantCard } from "@/components/garden/plant-card";
import type { GardenPlant } from "@/lib/dashboard/queries";
import type { LightRequirement } from "@/generated/prisma/enums";

const LIGHT_FILTERS: { value: LightRequirement; label: string }[] = [
  { value: "LOW", label: "Luz baja" },
  { value: "MEDIUM_INDIRECT", label: "Indirecta media" },
  { value: "BRIGHT_INDIRECT", label: "Indirecta intensa" },
  { value: "DIRECT", label: "Directa" },
];

type WaterFilter = "frequent" | "weekly" | "occasional";

const WATER_FILTERS: { value: WaterFilter; label: string; max: number; min: number }[] = [
  { value: "frequent", label: "Riego frecuente", min: 0, max: 4 },
  { value: "weekly", label: "Semanal", min: 5, max: 10 },
  { value: "occasional", label: "Ocasional", min: 11, max: 999 },
];

function matchesWater(days: number, filters: string[]): boolean {
  if (filters.length === 0) return true;
  return WATER_FILTERS.some(
    (f) => filters.includes(f.value) && days >= f.min && days <= f.max,
  );
}

export function GardenExplorer({ plants }: { plants: GardenPlant[] }) {
  const [query, setQuery] = useState("");
  const [lightFilters, setLightFilters] = useState<string[]>([]);
  const [waterFilters, setWaterFilters] = useState<string[]>([]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return plants.filter((p) => {
      if (q) {
        const haystack = `${p.nickname} ${p.speciesCommonName} ${p.location ?? ""}`.toLowerCase();
        if (!haystack.includes(q)) return false;
      }
      if (lightFilters.length > 0 && !lightFilters.includes(p.lightRequirement))
        return false;
      if (!matchesWater(p.wateringFrequencyDays, waterFilters)) return false;
      return true;
    });
  }, [plants, query, lightFilters, waterFilters]);

  return (
    <>
      <section className="flex flex-col gap-6 pb-12">
        <div className="relative w-full md:max-w-md">
          <Search className="absolute bottom-2 left-0 size-5 text-muted-foreground" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Buscar por nombre, especie o ubicación..."
            className="w-full rounded-none border-0 border-b border-border bg-transparent pb-2 pl-8 text-base text-foreground placeholder-muted-foreground transition-colors outline-none focus:border-primary"
          />
        </div>

        <div className="flex flex-col gap-3">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-[10px] font-bold tracking-widest text-muted-foreground uppercase">
              Luz
            </span>
            <ToggleGroup
              type="multiple"
              variant="outline"
              size="sm"
              spacing={1}
              value={lightFilters}
              onValueChange={setLightFilters}
            >
              {LIGHT_FILTERS.map((f) => (
                <ToggleGroupItem
                  key={f.value}
                  value={f.value}
                  className="rounded-full"
                >
                  {f.label}
                </ToggleGroupItem>
              ))}
            </ToggleGroup>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-[10px] font-bold tracking-widest text-muted-foreground uppercase">
              Riego
            </span>
            <ToggleGroup
              type="multiple"
              variant="outline"
              size="sm"
              spacing={1}
              value={waterFilters}
              onValueChange={setWaterFilters}
            >
              {WATER_FILTERS.map((f) => (
                <ToggleGroupItem
                  key={f.value}
                  value={f.value}
                  className="rounded-full"
                >
                  {f.label}
                </ToggleGroupItem>
              ))}
            </ToggleGroup>
          </div>
        </div>
      </section>

      {filtered.length === 0 ? (
        <Card className="items-center gap-3 border-dashed p-16 text-center ring-0">
          <Sprout className="size-12 text-secondary" />
          <p className="font-heading text-2xl text-primary">
            {plants.length === 0 ? "Tu jardín está vacío" : "Sin resultados"}
          </p>
          <p className="max-w-md text-sm text-muted-foreground">
            {plants.length === 0
              ? "Aún no agregas plantas. Cuando lo hagas, aparecerán aquí con su ficha y estado de salud."
              : "Ninguna planta coincide con tu búsqueda o filtros. Prueba ajustarlos."}
          </p>
        </Card>
      ) : (
        <section className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filtered.map((plant) => (
            <PlantCard key={plant.id} plant={plant} />
          ))}
        </section>
      )}
    </>
  );
}
