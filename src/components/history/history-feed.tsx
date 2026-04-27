"use client";

import { StickyNote } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import {
  CARE_TYPE_COLOR,
  CARE_TYPE_ICON,
  CARE_TYPE_LABEL,
} from "@/components/history/care-types";
import type { HistoryEntry } from "@/lib/dashboard/queries";

const AMOUNT_LABEL: Record<"LIGHT" | "NORMAL" | "HEAVY", string> = {
  LIGHT: "Riego ligero",
  NORMAL: "Riego normal",
  HEAVY: "Riego abundante",
};

interface DayGroup {
  key: string;
  label: string;
  fullDate: string;
  entries: HistoryEntry[];
}

function startOfDay(d: Date): Date {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
}

function dayLabel(date: Date, today: Date): string {
  const diffDays = Math.round(
    (today.getTime() - startOfDay(date).getTime()) / (24 * 60 * 60 * 1000),
  );
  if (diffDays === 0) return "Hoy";
  if (diffDays === 1) return "Ayer";
  return new Intl.DateTimeFormat("es-CL", { weekday: "long" }).format(date)
    .replace(/^\w/, (c) => c.toUpperCase());
}

function fullDateLabel(date: Date): string {
  return new Intl.DateTimeFormat("es-CL", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(date);
}

function formatTime(date: Date): string {
  return new Intl.DateTimeFormat("es-CL", {
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

function entryTitle(entry: HistoryEntry): string {
  if (entry.type === "WATERING" && entry.amount) {
    return AMOUNT_LABEL[entry.amount];
  }
  return CARE_TYPE_LABEL[entry.type];
}

function groupByDay(entries: HistoryEntry[]): DayGroup[] {
  const today = startOfDay(new Date());
  const groups = new Map<string, DayGroup>();

  for (const entry of entries) {
    const day = startOfDay(entry.occurredAt);
    const key = day.toISOString();
    if (!groups.has(key)) {
      groups.set(key, {
        key,
        label: dayLabel(day, today),
        fullDate: fullDateLabel(day),
        entries: [],
      });
    }
    groups.get(key)!.entries.push(entry);
  }

  return Array.from(groups.values());
}

export function HistoryFeed({ entries }: { entries: HistoryEntry[] }) {
  if (entries.length === 0) {
    return (
      <Card className="items-center gap-3 border-dashed p-12 text-center ring-0">
        <StickyNote className="size-10 text-secondary" />
        <p className="font-heading text-xl text-primary">Sin actividad</p>
        <p className="max-w-sm text-sm text-muted-foreground">
          Aún no hay cuidados registrados que coincidan con estos filtros. Cuando
          registres un riego, fertilización o poda, aparecerá aquí.
        </p>
      </Card>
    );
  }

  const groups = groupByDay(entries);

  return (
    <div className="flex flex-col gap-10">
      {groups.map((group) => (
        <section key={group.key}>
          <header className="mb-6">
            <h2 className="font-heading text-2xl text-primary">{group.label}</h2>
            <p className="text-sm text-muted-foreground">{group.fullDate}</p>
          </header>

          <ol className="relative ml-6 space-y-4 border-l-2 border-secondary-200 pl-6">
            {group.entries.map((entry) => {
              const Icon = CARE_TYPE_ICON[entry.type];
              const color = CARE_TYPE_COLOR[entry.type];
              return (
                <li key={entry.id} className="relative">
                  <span
                    className={cn(
                      "absolute -left-[37px] flex size-10 items-center justify-center rounded-full border shadow-sm",
                      color.bg,
                      color.text,
                      color.border,
                    )}
                  >
                    <Icon className="size-5 fill-current" />
                  </span>
                  <Card>
                    <CardContent className="flex flex-col gap-3 p-4">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <h4 className="text-base font-semibold text-primary">
                            {entryTitle(entry)}
                          </h4>
                          <p className="mt-0.5 text-sm text-muted-foreground">
                            {entry.plantNickname}
                          </p>
                        </div>
                        <Badge variant="outline" className="shrink-0">
                          {formatTime(entry.occurredAt)}
                        </Badge>
                      </div>
                      {entry.notes && (
                        <div className="flex items-start gap-2 rounded-lg border border-border bg-background p-3">
                          <StickyNote className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
                          <p className="text-sm text-foreground italic">
                            &ldquo;{entry.notes}&rdquo;
                          </p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </li>
              );
            })}
          </ol>
        </section>
      ))}
    </div>
  );
}
