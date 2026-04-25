import { ArrowRight, CalendarClock, Droplet, FlaskConical, Eye } from "lucide-react";
import type { UpcomingReminder } from "@/lib/dashboard/queries";

const REMINDER_ICON = {
  WATERING: Droplet,
  FERTILIZING: FlaskConical,
  CHECK: Eye,
} as const;

const REMINDER_LABEL = {
  WATERING: "Regar",
  FERTILIZING: "Fertilizar",
  CHECK: "Revisar",
} as const;

function formatDayLabel(date: Date, today: Date): string {
  const ms = date.getTime() - today.getTime();
  const days = Math.floor(ms / (24 * 60 * 60 * 1000));
  if (days <= 0) return "HOY";
  if (days === 1) return "MAÑANA";
  return new Intl.DateTimeFormat("es-CL", { weekday: "short" })
    .format(date)
    .toUpperCase()
    .replace(".", "");
}

interface Props {
  reminders: UpcomingReminder[];
}

export function UpNext({ reminders }: Props) {
  return (
    <aside className="flex w-full flex-col gap-6 rounded-xl border border-border bg-card p-6 shadow-sm md:w-80">
      <h2 className="border-b border-border pb-2 font-heading text-2xl text-primary">
        Próximamente
      </h2>

      {reminders.length === 0 ? (
        <div className="flex flex-col items-center gap-3 py-8 text-center">
          <CalendarClock className="size-8 text-secondary" />
          <p className="text-sm text-muted-foreground">
            Aún no hay recordatorios programados.
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {reminders.map((r) => {
            const Icon = REMINDER_ICON[r.type];
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            const dayLabel = formatDayLabel(r.scheduledFor, today);
            return (
              <div key={r.id} className="flex items-start gap-4">
                <span className="min-w-10 text-[10px] font-bold uppercase tracking-widest text-primary">
                  {dayLabel}
                </span>
                <div className="flex flex-grow items-center justify-between rounded-md bg-secondary-100 p-2 text-foreground">
                  <span className="text-sm">
                    {REMINDER_LABEL[r.type]} {r.plantNickname}
                  </span>
                  <Icon className="size-4" />
                </div>
              </div>
            );
          })}
        </div>
      )}

      <button
        type="button"
        className="mt-auto flex items-center justify-center gap-1 rounded-md py-2 text-base font-semibold text-primary transition-colors hover:bg-muted"
      >
        Ver calendario completo <ArrowRight className="size-4" />
      </button>
    </aside>
  );
}
