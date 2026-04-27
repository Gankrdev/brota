"use client";

import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
  const pendingTasks = tasks.filter((t) => t.status === "PENDING" || t.status === "SENT");

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
                <li key={task.id}>
                  <Link
                    href={`/jardin/${task.plantId}`}
                    className={cn(
                      "flex items-center gap-3 rounded-lg border border-border bg-background p-3 transition-colors hover:bg-muted active:scale-[0.98]",
                      done && "opacity-50",
                    )}
                  >
                    <span className={cn("size-2.5 shrink-0 rounded-full", TASK_DOT[task.type])} />
                    <div className="grow">
                      <p className={cn(
                        "text-sm font-semibold",
                        done ? "text-muted-foreground line-through" : "text-foreground",
                      )}>
                        {ACTION_LABEL[task.type]} · {task.plantNickname}
                      </p>
                      {task.plantLocation && (
                        <p className="text-xs text-muted-foreground">{task.plantLocation}</p>
                      )}
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {TASK_LABEL[task.type]}
                    </span>
                  </Link>
                </li>
              );
            })}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
