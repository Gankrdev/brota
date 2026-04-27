"use client";

import { useMemo, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import type { CalendarTask } from "@/lib/dashboard/queries";
import { MonthGrid } from "@/components/calendar/month-grid";
import { WeekGrid } from "@/components/calendar/week-grid";
import { DayTasks } from "@/components/calendar/day-tasks";
import {
  TASK_DOT,
  TASK_LABEL,
  isSameDay,
  startOfDay,
  startOfWeek,
} from "@/components/calendar/task-types";
import { cn } from "@/lib/utils";

type ViewMode = "month" | "week";

interface SerializedTask extends Omit<CalendarTask, "scheduledFor"> {
  scheduledFor: string;
}

interface Props {
  initialTasks: SerializedTask[];
}

function formatMonth(d: Date): string {
  const formatted = new Intl.DateTimeFormat("es-CL", {
    month: "long",
    year: "numeric",
  }).format(d);
  return formatted.charAt(0).toUpperCase() + formatted.slice(1);
}

function formatWeekRange(d: Date): string {
  const start = startOfWeek(d);
  const end = new Date(start);
  end.setDate(start.getDate() + 6);
  const fmt = new Intl.DateTimeFormat("es-CL", { day: "numeric", month: "short" });
  return `${fmt.format(start)} – ${fmt.format(end)}`;
}

export function CalendarView({ initialTasks }: Props) {
  const tasks = useMemo<CalendarTask[]>(
    () =>
      initialTasks.map((t) => ({ ...t, scheduledFor: new Date(t.scheduledFor) })),
    [initialTasks],
  );

  const [view, setView] = useState<ViewMode>("month");
  const [cursor, setCursor] = useState<Date>(() => startOfDay(new Date()));
  const [selectedDate, setSelectedDate] = useState<Date>(() => startOfDay(new Date()));
  const [dayTasksOpen, setDayTasksOpen] = useState(false);

  function navigate(delta: number) {
    const next = new Date(cursor);
    if (view === "month") {
      next.setMonth(next.getMonth() + delta);
    } else {
      next.setDate(next.getDate() + delta * 7);
    }
    setCursor(next);
  }

  function handleSelectDate(date: Date) {
    if (isSameDay(date, selectedDate)) {
      setDayTasksOpen((o) => !o);
    } else {
      setSelectedDate(date);
      setDayTasksOpen(true);
    }
  }

  const dayTasks = useMemo(
    () => tasks.filter((t) => isSameDay(t.scheduledFor, selectedDate)),
    [tasks, selectedDate],
  );

  return (
    <div className="grid grid-cols-1 items-start gap-8 lg:grid-cols-12">
      <Card className="lg:col-span-8">
        <CardContent className="flex flex-col gap-6">
          <div className="flex items-center justify-between border-b border-border pb-3">
            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => navigate(-1)}
                aria-label="Anterior"
                className="rounded-full"
              >
                <ChevronLeft className="size-5" />
              </Button>
              <h2 className="font-heading text-2xl text-primary">
                {view === "month" ? formatMonth(cursor) : formatWeekRange(cursor)}
              </h2>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => navigate(1)}
                aria-label="Siguiente"
                className="rounded-full"
              >
                <ChevronRight className="size-5" />
              </Button>
            </div>

            <ToggleGroup
              type="single"
              value={view}
              onValueChange={(v) => v && setView(v as ViewMode)}
              spacing={1}
              size="sm"
              className="rounded-full bg-muted p-1"
            >
              <ToggleGroupItem
                value="month"
                className="data-[state=on]:bg-primary data-[state=on]:text-primary-foreground rounded-full px-4"
              >
                Mes
              </ToggleGroupItem>
              <ToggleGroupItem
                value="week"
                className="data-[state=on]:bg-primary data-[state=on]:text-primary-foreground rounded-full px-4"
              >
                Semana
              </ToggleGroupItem>
            </ToggleGroup>
          </div>

          {view === "month" ? (
            <MonthGrid
              monthDate={cursor}
              selectedDate={selectedDate}
              tasks={tasks}
              onSelectDate={handleSelectDate}
            />
          ) : (
            <WeekGrid
              weekDate={cursor}
              selectedDate={selectedDate}
              tasks={tasks}
              onSelectDate={handleSelectDate}
            />
          )}

          <div className="flex flex-wrap gap-4 border-t border-border pt-3">
            {(["WATERING", "FERTILIZING", "CHECK"] as const).map((type) => (
              <div key={type} className="flex items-center gap-2">
                <span className={cn("size-3 rounded-full", TASK_DOT[type])} />
                <span className="text-sm text-muted-foreground">{TASK_LABEL[type]}</span>
              </div>
            ))}
          </div>

          {/* Mobile accordion — visible only below lg */}
          <div
            className={cn(
              "overflow-hidden transition-all duration-300 lg:hidden",
              dayTasksOpen ? "max-h-[600px] opacity-100" : "max-h-0 opacity-0",
            )}
          >
            <DayTasks date={selectedDate} tasks={dayTasks} />
          </div>
        </CardContent>
      </Card>

      {/* Desktop side panel — visible only at lg+ */}
      <div className="hidden lg:col-span-4 lg:block">
        <DayTasks date={selectedDate} tasks={dayTasks} />
      </div>
    </div>
  );
}
