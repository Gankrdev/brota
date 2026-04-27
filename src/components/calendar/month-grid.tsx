"use client";

import type { CalendarTask } from "@/lib/dashboard/queries";
import { TASK_BAR, isSameDay, startOfDay } from "@/components/calendar/task-types";
import { cn } from "@/lib/utils";

const WEEKDAYS = ["DOM", "LUN", "MAR", "MIÉ", "JUE", "VIE", "SÁB"];

interface Props {
  monthDate: Date;
  selectedDate: Date;
  tasks: CalendarTask[];
  onSelectDate: (d: Date) => void;
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
  // Trim trailing rows that contain only out-of-month days
  const lastUsedRow = Math.floor(
    cells.findLastIndex((c) => c.inMonth) / 7,
  );
  return cells.slice(0, (lastUsedRow + 1) * 7);
}

export function MonthGrid({ monthDate, selectedDate, tasks, onSelectDate }: Props) {
  const cells = buildMonthCells(monthDate);
  const today = startOfDay(new Date());

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
          const dayTasks = tasks.filter((t) => isSameDay(t.scheduledFor, date));
          const isSelected = isSameDay(date, selectedDate);
          const isToday = isSameDay(date, today);

          return (
            <button
              key={date.toISOString()}
              type="button"
              onClick={() => onSelectDate(date)}
              className={cn(
                "flex min-h-[100px] flex-col gap-1 bg-card p-2 text-left transition-colors hover:bg-muted",
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
              {dayTasks.slice(0, 3).map((t) => (
                <div
                  key={t.id}
                  className={cn(
                    "h-1 w-full rounded-full",
                    TASK_BAR[t.type],
                    t.status === "ACKNOWLEDGED" && "opacity-30",
                  )}
                />
              ))}
              {dayTasks.length > 3 && (
                <span className="text-[10px] text-muted-foreground">
                  +{dayTasks.length - 3} más
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
