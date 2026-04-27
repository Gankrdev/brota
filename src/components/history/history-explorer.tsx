"use client";

import { useMemo, useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { HistoryFilters } from "@/components/history/history-filters";
import { HistoryFeed } from "@/components/history/history-feed";
import type { HistoryEntry, PlantOption } from "@/lib/dashboard/queries";
import type { CareType } from "@/generated/prisma/enums";

interface SerializedEntry extends Omit<HistoryEntry, "occurredAt"> {
  occurredAt: string;
}

interface Props {
  initialEntries: SerializedEntry[];
  initialHasMore: boolean;
  plants: PlantOption[];
  pageSize: number;
}

function deserialize(entries: SerializedEntry[]): HistoryEntry[] {
  return entries.map((e) => ({ ...e, occurredAt: new Date(e.occurredAt) }));
}

export function HistoryExplorer({
  initialEntries,
  initialHasMore,
  plants,
  pageSize,
}: Props) {
  const [entries, setEntries] = useState<HistoryEntry[]>(() =>
    deserialize(initialEntries),
  );
  const [hasMore, setHasMore] = useState(initialHasMore);
  const [selectedPlantId, setSelectedPlantId] = useState<string | "all">("all");
  const [selectedTypes, setSelectedTypes] = useState<CareType[]>([]);
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const filtered = useMemo(() => {
    return entries.filter((e) => {
      if (selectedPlantId !== "all" && e.plantId !== selectedPlantId) return false;
      if (selectedTypes.length > 0 && !selectedTypes.includes(e.type)) return false;
      return true;
    });
  }, [entries, selectedPlantId, selectedTypes]);

  function toggleType(type: CareType) {
    setSelectedTypes((prev) =>
      prev.includes(type) ? prev.filter((t) => t !== type) : [...prev, type],
    );
  }

  function loadMore() {
    setError(null);
    startTransition(async () => {
      const params = new URLSearchParams({
        offset: String(entries.length),
        limit: String(pageSize),
      });
      const res = await fetch(`/api/history?${params.toString()}`);
      if (!res.ok) {
        setError("No se pudo cargar más historial.");
        return;
      }
      const data = (await res.json()) as {
        entries: SerializedEntry[];
        hasMore: boolean;
      };
      setEntries((prev) => [...prev, ...deserialize(data.entries)]);
      setHasMore(data.hasMore);
    });
  }

  return (
    <div className="flex flex-col gap-8 md:flex-row md:items-start">
      <aside className="w-full shrink-0 md:sticky md:top-24 md:w-64">
        <HistoryFilters
          plants={plants}
          selectedPlantId={selectedPlantId}
          onSelectPlant={setSelectedPlantId}
          selectedTypes={selectedTypes}
          onToggleType={toggleType}
        />
      </aside>

      <section className="flex-1">
        <HistoryFeed entries={filtered} />

        {hasMore && (
          <div className="mt-8 flex flex-col items-center gap-2">
            <Button
              variant="outline"
              size="lg"
              onClick={loadMore}
              disabled={pending}
              className="rounded-full px-6"
            >
              {pending ? "Cargando..." : "Cargar más historial"}
            </Button>
            {error && (
              <p role="alert" className="text-sm text-destructive">
                {error}
              </p>
            )}
          </div>
        )}
      </section>
    </div>
  );
}
