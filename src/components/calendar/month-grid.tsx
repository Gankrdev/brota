"use client";

import type { CalendarTask } from "@/lib/dashboard/queries";
import { isSameDay, startOfDay } from "@/components/calendar/task-types";
import { cn } from "@/lib/utils";

const WEEKDAYS = ["DOM", "LUN", "MAR", "MIÉ", "JUE", "VIE", "SÁB"];

interface WateringRange {
  plantId: string;
  plantNickname: string;
  start: Date;
  end: Date;
}

interface DayMeta {
  rangeStarts: WateringRange[];  // bar starts on this day
  rangeMids: WateringRange[];    // bar passes through this day
  rangeEnds: WateringRange[];    // bar ends on this day
  otherTasks: CalendarTask[];    // non-watering tasks
}

function buildRanges(tasks: CalendarTask[]): WateringRange[] {
  // Group watering reminders by plantId
  const byPlant = new Map<string, CalendarTask[]>();
  for (const t of tasks) {
    if (t.type !== "WATERING") continue;
    const list = byPlant.get(t.plantId) ?? [];
    list.push(t);
    byPlant.set(t.plantId, list);
  }

  const ranges: WateringRange[] = [];
  for (const [plantId, plantTasks] of byPlant) {
    if (plantTasks.length < 2) continue;
    const sorted = [...plantTasks].sort(
      (a, b) => a.scheduledFor.getTime() - b.scheduledFor.getTime(),
    );
    ranges.push({
      plantId,
      plantNickname: sorted[0].plantNickname,
      start: startOfDay(sorted[0].scheduledFor),
      end: startOfDay(sorted[sorted.length - 1].scheduledFor),
    });
  }
  return ranges;
}

function buildDayMeta(date: Date, ranges: WateringRange[], allTasks: CalendarTask[]): DayMeta {
  const d = startOfDay(date);
  const rangeStarts: WateringRange[] = [];
  const rangeMids: WateringRange[] = [];
  const rangeEnds: WateringRange[] = [];

  for (const r of ranges) {
    if (isSameDay(r.start, d) && isSameDay(r.end, d)) {
      rangeStarts.push(r); // single-day range
    } else if (isSameDay(r.start, d)) {
      rangeStarts.push(r);
    } else if (isSameDay(r.end, d)) {
      rangeEnds.push(r);
    } else if (d > r.start && d < r.end) {
      rangeMids.push(r);
    }
  }

  const otherTasks = allTasks.filter(
    (t) => t.type !== "WATERING" && isSameDay(t.scheduledFor, d),
  );

  return { rangeStarts, rangeMids, rangeEnds, otherTasks };
}

function buildMonthCells(monthDate: Date): { date: Date; inMonth: boolean }[] {
  const year = monthDate.getFullYear();
  const month = monthDate.getMonth();
  const firstOfMonth = new Date(year, month, 1);
  const startOffset = firstOfMonth.getDay();
  const start = new Date(year, month, 1 - startOffset);
  const cells: { date: Date; inMonth: boolean }[] = [];
  for (let i = 0; i < 42; i++) {
    const d = new Date(start);
    d.setDate(start.getDate() + i);
    cells.push({ date: startOfDay(d), inMonth: d.getMonth() === month });
  }
  const lastUsedRow = Math.floor(cells.findLastIndex((c) => c.inMonth) / 7);
  return cells.slice(0, (lastUsedRow + 1) * 7);
}

interface Props {
  monthDate: Date;
  selectedDate: Date;
  tasks: CalendarTask[];
  onSelectDate: (d: Date) => void;
}

export function MonthGrid({ monthDate, selectedDate, tasks, onSelectDate }: Props) {
  const cells = buildMonthCells(monthDate);
  const today = startOfDay(new Date());
  const ranges = buildRanges(tasks);

  return (
    <div className="w-full">
      <div className="mb-2 grid grid-cols-7">
        {WEEKDAYS.map((d) => (
          <div
            key={d}
            className="py-2 text-center text-[10px] font-bold uppercase tracking-widest text-muted-foreground"
          >
            {d}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-px overflow-hidden rounded-lg border border-border bg-border">
        {cells.map(({ date, inMonth }) => {
          const meta = buildDayMeta(date, ranges, tasks);
          const isSelected = isSameDay(date, selectedDate);
          const isToday = isSameDay(date, today);
          const hasRange = meta.rangeStarts.length > 0 || meta.rangeMids.length > 0 || meta.rangeEnds.length > 0;

          return (
            <button
              key={date.toISOString()}
              type="button"
              onClick={() => onSelectDate(date)}
              className={cn(
                "relative flex min-h-[80px] flex-col gap-1 bg-card p-1.5 text-left transition-colors hover:bg-muted md:min-h-[100px] md:p-2",
                !inMonth && "bg-background text-muted-foreground",
                isSelected &&
                  "relative z-10 border-2 border-primary shadow-[0_4px_12px_rgba(6,27,14,0.12)]",
              )}
            >
              <span
                className={cn(
                  "text-sm",
                  isSelected && "font-bold text-primary",
                  isToday && !isSelected && "font-bold text-primary",
                )}
              >
                {date.getDate()}
              </span>

              {/* Watering range bars */}
              {hasRange && (
                <div className="flex flex-col gap-0.5">
                  {/* Range starts here */}
                  {meta.rangeStarts.map((r) => {
                    const singleDay = isSameDay(r.start, r.end);
                    return (
                      <div
                        key={`start-${r.plantId}`}
                        title={`Regar ${r.plantNickname}`}
                        className={cn(
                          "h-1.5 bg-primary",
                          singleDay ? "rounded-full" : "rounded-l-full",
                        )}
                      />
                    );
                  })}
                  {/* Range passes through */}
                  {meta.rangeMids.map((r) => (
                    <div
                      key={`mid-${r.plantId}`}
                      title={`Regar ${r.plantNickname}`}
                      className="h-1.5 bg-primary/40"
                    />
                  ))}
                  {/* Range ends here */}
                  {meta.rangeEnds.map((r) => (
                    <div
                      key={`end-${r.plantId}`}
                      title={`Regar ${r.plantNickname}`}
                      className="h-1.5 rounded-r-full bg-primary/70"
                    />
                  ))}
                </div>
              )}

              {/* Other task dots */}
              {meta.otherTasks.slice(0, 2).map((t) => (
                <div
                  key={t.id}
                  className={cn(
                    "h-1 w-full rounded-full",
                    t.type === "FERTILIZING" ? "bg-secondary-500" : "bg-accent",
                    t.status === "ACKNOWLEDGED" && "opacity-30",
                  )}
                />
              ))}
              {meta.otherTasks.length > 2 && (
                <span className="text-[10px] text-muted-foreground">
                  +{meta.otherTasks.length - 2}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
