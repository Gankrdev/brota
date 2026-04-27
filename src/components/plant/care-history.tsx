import { Droplet, FlaskConical, Scissors, Sparkles, Stethoscope } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { PlantHistoryEvent } from "@/lib/dashboard/queries";
import type { CareType } from "@/generated/prisma/enums";

const AMOUNT_LABEL: Record<"LIGHT" | "NORMAL" | "HEAVY", string> = {
  LIGHT: "ligero",
  NORMAL: "normal",
  HEAVY: "abundante",
};

const HEALTH_LABEL: Record<"HEALTHY" | "ATTENTION" | "CRITICAL", string> = {
  HEALTHY: "Diagnóstico: saludable",
  ATTENTION: "Diagnóstico: requiere atención",
  CRITICAL: "Diagnóstico: crítico",
};

const CARE_LABEL: Record<CareType, string> = {
  WATERING: "Riego registrado",
  FERTILIZING: "Fertilización registrada",
  PRUNING: "Poda registrada",
  OTHER: "Cuidado registrado",
};

const CARE_ICON: Record<CareType, LucideIcon> = {
  WATERING: Droplet,
  FERTILIZING: FlaskConical,
  PRUNING: Scissors,
  OTHER: Sparkles,
};

function formatDate(date: Date): string {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const target = new Date(date);
  target.setHours(0, 0, 0, 0);
  const diffDays = Math.round((today.getTime() - target.getTime()) / (24 * 60 * 60 * 1000));

  const time = new Intl.DateTimeFormat("es-CL", {
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);

  if (diffDays === 0) return `Hoy, ${time}`;
  if (diffDays === 1) return `Ayer, ${time}`;

  return new Intl.DateTimeFormat("es-CL", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(date);
}

export function CareHistory({ events }: { events: PlantHistoryEvent[] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-heading text-2xl text-primary">
          Historial de cuidados
        </CardTitle>
      </CardHeader>
      <CardContent>
        {events.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            Aún no hay eventos registrados. Cuando registres un cuidado o un diagnóstico,
            aparecerá aquí.
          </p>
        ) : (
          <ol className="relative space-y-6 border-l-2 border-border pl-6">
            {events.map((e) => {
              let Icon: LucideIcon;
              let dotColor: string;
              let title: string;
              let subtitle: string | null = null;

              if (e.kind === "care") {
                Icon = CARE_ICON[e.careType];
                dotColor = "bg-primary";
                title = CARE_LABEL[e.careType];
                if (e.careType === "WATERING" && e.amount) {
                  subtitle = `Riego ${AMOUNT_LABEL[e.amount]}${e.notes ? ` — ${e.notes}` : ""}`;
                } else {
                  subtitle = e.notes;
                }
              } else {
                Icon = Stethoscope;
                dotColor = "bg-accent";
                title = HEALTH_LABEL[e.healthStatus];
              }

              return (
                <li key={`${e.kind}-${e.id}`} className="relative">
                  <span
                    className={`absolute -left-7.75 flex size-6 items-center justify-center rounded-full border-4 border-card ${dotColor}`}
                  >
                    <Icon className="size-3 fill-current text-white" />
                  </span>
                  <p className="text-xs text-muted-foreground">{formatDate(e.at)}</p>
                  <p className="text-sm font-semibold text-foreground">{title}</p>
                  {subtitle && (
                    <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p>
                  )}
                </li>
              );
            })}
          </ol>
        )}
      </CardContent>
    </Card>
  );
}
