"use client";

import type { CalendarTask } from "@/lib/dashboard/queries";
import {
  TASK_DOT,
  TASK_LABEL,
  isSameDay,
  startOfDay,
  startOfWeek,
} from "@/components/calendar/task-types";
import { cn } from "@/lib/utils";

const WEEKDAYS_FULL = ["DOM", "LUN", "MAR", "MIÉ", "JUE", "VIE", "SÁB"];

interface Props {
  weekDate: Date;
  selectedDate: Date;
  tasks: CalendarTask[];
  onSelectDate: (d: Date) => void;
}

export function WeekGrid({ weekDate, selectedDate, tasks, onSelectDate }: Props) {
  const start = startOfWeek(weekDate);
  const today = startOfDay(new Date());
  const days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(start);
    d.setDate(start.getDate() + i);
    return d;
  });

  return (
    <div className="grid grid-cols-1 gap-px overflow-hidden rounded-lg border border-border bg-border sm:grid-cols-7">
      {days.map((date) => {
        const dayTasks = tasks.filter((t) => isSameDay(t.scheduledFor, date));
        const isSelected = isSameDay(date, selectedDate);
        const isToday = isSameDay(date, today);

        return (
          <button
            key={date.toISOString()}
            type="button"
            onClick={() => onSelectDate(date)}
            className={cn(
              "flex min-h-[160px] flex-col gap-2 bg-card p-3 text-left transition-colors hover:bg-muted",
              isSelected &&
                "relative z-10 border-2 border-primary shadow-[0_4px_12px_rgba(6,27,14,0.12)]",
            )}
          >
            <div className="flex items-baseline justify-between">
              <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                {WEEKDAYS_FULL[date.getDay()]}
              </span>
              <span
                className={cn(
                  "text-base",
                  (isSelected || isToday) && "font-bold text-primary",
                )}
              >
                {date.getDate()}
              </span>
            </div>

            {dayTasks.length === 0 ? (
              <span className="text-xs italic text-muted-foreground">
                Sin tareas
              </span>
            ) : (
              <ul className="flex flex-col gap-1">
                {dayTasks.slice(0, 5).map((t) => (
                  <li
                    key={t.id}
                    className={cn(
                      "flex items-center gap-1.5 text-xs text-foreground",
                      t.status === "ACKNOWLEDGED" && "text-muted-foreground line-through",
                    )}
                  >
                    <span
                      className={cn("size-2 shrink-0 rounded-full", TASK_DOT[t.type])}
                    />
                    <span className="truncate">
                      {TASK_LABEL[t.type]} {t.plantNickname}
                    </span>
                  </li>
                ))}
                {dayTasks.length > 5 && (
                  <li className="text-[10px] text-muted-foreground">
                    +{dayTasks.length - 5} más
                  </li>
                )}
              </ul>
            )}
          </button>
        );
      })}
    </div>
  );
}
