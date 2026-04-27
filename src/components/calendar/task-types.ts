import type { CalendarTask } from "@/lib/dashboard/queries";

export type TaskType = CalendarTask["type"];

export const TASK_LABEL: Record<TaskType, string> = {
  WATERING: "Regar",
  FERTILIZING: "Fertilizar",
  CHECK: "Revisar",
};

export const TASK_DOT: Record<TaskType, string> = {
  WATERING: "bg-primary",
  FERTILIZING: "bg-secondary-500",
  CHECK: "bg-accent",
};

export const TASK_BAR: Record<TaskType, string> = {
  WATERING: "bg-primary",
  FERTILIZING: "bg-secondary-500",
  CHECK: "bg-accent",
};

export function isSameDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

export function startOfDay(d: Date): Date {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
}

export function addDays(d: Date, days: number): Date {
  const x = new Date(d);
  x.setDate(x.getDate() + days);
  return x;
}

export function startOfWeek(d: Date): Date {
  const x = startOfDay(d);
  const day = x.getDay();
  return addDays(x, -day);
}
