"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import {
  CARE_TYPES,
  CARE_TYPE_ICON,
  CARE_TYPE_LABEL,
} from "@/components/history/care-types";
import type { PlantOption } from "@/lib/dashboard/queries";
import type { CareType } from "@/generated/prisma/enums";

interface Props {
  plants: PlantOption[];
  selectedPlantId: string | "all";
  onSelectPlant: (id: string | "all") => void;
  selectedTypes: CareType[];
  onToggleType: (type: CareType) => void;
}

export function HistoryFilters({
  plants,
  selectedPlantId,
  onSelectPlant,
  selectedTypes,
  onToggleType,
}: Props) {
  return (
    <div className="flex flex-col gap-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-[10px] font-bold tracking-widest text-muted-foreground uppercase">
            Filtrar por planta
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-row gap-2 overflow-x-auto pb-2 md:flex-col md:overflow-x-visible md:pb-0">
            <button
              type="button"
              onClick={() => onSelectPlant("all")}
              className={cn(
                "shrink-0 rounded-lg px-4 py-2 text-left text-sm transition-colors md:w-full",
                selectedPlantId === "all"
                  ? "bg-secondary-100 font-semibold text-secondary-800"
                  : "text-foreground hover:bg-muted",
              )}
            >
              Todas las plantas
            </button>
            {plants.map((p) => (
              <button
                key={p.id}
                type="button"
                onClick={() => onSelectPlant(p.id)}
                className={cn(
                  "shrink-0 rounded-lg px-4 py-2 text-left text-sm transition-colors md:w-full",
                  selectedPlantId === p.id
                    ? "bg-secondary-100 font-semibold text-secondary-800"
                    : "text-foreground hover:bg-muted",
                )}
              >
                {p.nickname}
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card className="hidden md:block">
        <CardHeader>
          <CardTitle className="text-[10px] font-bold tracking-widest text-muted-foreground uppercase">
            Tipo de cuidado
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-3">
            {CARE_TYPES.map((type) => {
              const Icon = CARE_TYPE_ICON[type];
              const checked = selectedTypes.includes(type);
              return (
                <div key={type} className="flex items-center gap-3">
                  <Checkbox
                    id={`type-${type}`}
                    checked={checked}
                    onCheckedChange={() => onToggleType(type)}
                    className="size-5"
                  />
                  <Label
                    htmlFor={`type-${type}`}
                    className="flex cursor-pointer items-center gap-2 text-sm text-foreground"
                  >
                    <Icon className="size-4 text-muted-foreground" />
                    {CARE_TYPE_LABEL[type]}
                  </Label>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
