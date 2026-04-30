"use client";

import { BarChart3 } from "lucide-react";
import { Bar, BarChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

interface WeeklyActivityChartProps {
  data: { day: string; count: number }[];
}

const TODAY_INDEX = (() => {
  const day = new Date().getDay();
  return day === 0 ? 6 : day - 1;
})();

type BarDatum = { day: string; count: number; fill: string };

export function WeeklyActivityChart({ data }: WeeklyActivityChartProps) {
  const totalCount = data.reduce((sum, d) => sum + d.count, 0);

  if (totalCount === 0) {
    return (
      <div className="flex h-40 w-full flex-col items-center justify-center gap-2 rounded-lg border border-dashed border-border bg-muted/30 text-center">
        <BarChart3 className="size-8 text-muted-foreground/60" />
        <p className="text-sm text-muted-foreground">
          Aún no hay actividad esta semana.
        </p>
        <p className="text-xs text-muted-foreground/80">
          Registra un riego o cuidado para verlo aquí.
        </p>
      </div>
    );
  }

  const maxCount = Math.max(...data.map((d) => d.count), 1);
  const colored: BarDatum[] = data.map((d, i) => ({
    ...d,
    fill: i === TODAY_INDEX ? "var(--primary)" : "var(--secondary-200)",
  }));

  return (
    <div className="h-40 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={colored} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
          <XAxis
            dataKey="day"
            tickLine={false}
            axisLine={false}
            tick={{ fontSize: 11, fill: "var(--muted-foreground)" }}
          />
          <YAxis hide domain={[0, maxCount]} />
          <Tooltip
            cursor={{ fill: "var(--muted)", opacity: 0.4 }}
            contentStyle={{
              backgroundColor: "var(--card)",
              border: "1px solid var(--border)",
              borderRadius: 8,
              fontSize: 12,
            }}
            labelStyle={{ color: "var(--foreground)", fontWeight: 600 }}
            formatter={(value) => {
              const n = Number(value);
              return [`${n} ${n === 1 ? "tarea" : "tareas"}`, ""];
            }}
          />
          <Bar dataKey="count" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
