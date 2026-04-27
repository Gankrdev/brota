"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import type { CalendarTask } from "@/lib/dashboard/queries";
import { TASK_DOT, TASK_LABEL, type TaskType } from "@/components/calendar/task-types";
import { cn } from "@/lib/utils";

interface Props {
  date: Date;
  tasks: CalendarTask[];
}

const ACTION_LABEL: Record<TaskType, string> = {
  WATERING: "Regar",
  FERTILIZING: "Fertilizar",
  CHECK: "Revisar",
};

function formatDayHeader(d: Date): string {
  return new Intl.DateTimeFormat("es-CL", {
    day: "numeric",
    month: "long",
  }).format(d);
}

export function DayTasks({ date, tasks }: Props) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [acknowledging, setAcknowledging] = useState<string | null>(null);

  const pendingTasks = tasks.filter((t) => t.status === "PENDING" || t.status === "SENT");

  function acknowledge(id: string) {
    setAcknowledging(id);
    startTransition(async () => {
      const res = await fetch(`/api/reminders/${id}/acknowledge`, { method: "POST" });
      setAcknowledging(null);
      if (res.ok) router.refresh();
    });
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-heading text-2xl text-primary">
          Tareas del {formatDayHeader(date)}
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          {pendingTasks.length === 0
            ? "Sin tareas pendientes."
            : `${pendingTasks.length} ${pendingTasks.length === 1 ? "tarea pendiente" : "tareas pendientes"}.`}
        </p>
      </CardHeader>

      <CardContent>
        {tasks.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            No hay tareas programadas para este día.
          </p>
        ) : (
          <ul className="flex flex-col gap-2">
            {tasks.map((task) => {
              const done = task.status === "ACKNOWLEDGED";
              return (
                <li
                  key={task.id}
                  className="flex items-start gap-3 rounded-lg border border-border bg-background p-3"
                >
                  <Checkbox
                    id={`task-${task.id}`}
                    checked={done}
                    disabled={done || (pending && acknowledging === task.id)}
                    onCheckedChange={() => acknowledge(task.id)}
                    className="mt-1 size-5"
                  />
                  <div className="grow">
                    <Label
                      htmlFor={`task-${task.id}`}
                      className={cn(
                        "block text-sm font-semibold",
                        done ? "text-muted-foreground line-through" : "text-foreground",
                      )}
                    >
                      {ACTION_LABEL[task.type]} {task.plantNickname}
                    </Label>
                    <div className="mt-1 flex items-center gap-2 text-muted-foreground">
                      <span className={cn("size-2 rounded-full", TASK_DOT[task.type])} />
                      <span className="text-xs">
                        {task.plantLocation ?? TASK_LABEL[task.type]}
                      </span>
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
