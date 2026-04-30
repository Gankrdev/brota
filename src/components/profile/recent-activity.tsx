import { Droplet, Microscope, Scissors, Sparkles, Wrench } from "lucide-react";
import type { RecentActivityItem } from "@/lib/profile/queries";

interface RecentActivityProps {
  items: RecentActivityItem[];
}

const TYPE_META: Record<
  RecentActivityItem["type"],
  { label: string; icon: React.ComponentType<{ className?: string }>; bg: string; fg: string }
> = {
  WATERING: { label: "Riego", icon: Droplet, bg: "bg-secondary-100", fg: "text-secondary-800" },
  FERTILIZING: { label: "Fertilización", icon: Sparkles, bg: "bg-accent-100", fg: "text-accent-800" },
  PRUNING: { label: "Poda", icon: Scissors, bg: "bg-primary-100", fg: "text-primary" },
  OTHER: { label: "Cuidado", icon: Wrench, bg: "bg-muted", fg: "text-muted-foreground" },
  DIAGNOSIS: { label: "Diagnóstico", icon: Microscope, bg: "bg-accent-100", fg: "text-accent-800" },
};

const RTF = new Intl.RelativeTimeFormat("es", { numeric: "auto" });

function formatRelative(date: Date): string {
  const diffMs = date.getTime() - Date.now();
  const diffDays = Math.round(diffMs / (24 * 60 * 60 * 1000));
  const diffHours = Math.round(diffMs / (60 * 60 * 1000));
  const diffMinutes = Math.round(diffMs / (60 * 1000));

  if (Math.abs(diffDays) >= 1) return RTF.format(diffDays, "day");
  if (Math.abs(diffHours) >= 1) return RTF.format(diffHours, "hour");
  return RTF.format(diffMinutes, "minute");
}

export function RecentActivity({ items }: RecentActivityProps) {
  if (items.length === 0) {
    return (
      <p className="text-sm italic text-muted-foreground">
        Aún no hay actividad registrada.
      </p>
    );
  }

  return (
    <ul className="flex flex-col gap-2">
      {items.map((item) => {
        const meta = TYPE_META[item.type];
        const Icon = meta.icon;
        return (
          <li
            key={item.id}
            className="flex items-center justify-between gap-3 rounded-lg p-2 transition-colors hover:bg-muted/50"
          >
            <div className="flex items-center gap-3">
              <div
                className={`flex size-10 items-center justify-center rounded-full ${meta.bg} ${meta.fg}`}
              >
                <Icon className="size-5" />
              </div>
              <div>
                <p className="text-sm font-medium text-foreground">{meta.label}</p>
                <p className="text-xs text-muted-foreground">{item.plantNickname}</p>
              </div>
            </div>
            <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
              {formatRelative(item.occurredAt)}
            </span>
          </li>
        );
      })}
    </ul>
  );
}
