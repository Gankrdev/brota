"use client";

import Image from "next/image";
import { RotateCcw, AlertTriangle, CheckCircle, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { DiagnosisResponse } from "@/app/api/diagnosis/route";

interface DiagnosisResultProps {
  result: DiagnosisResponse;
  photoUrl: string;
  onReset: () => void;
}

const STATUS_CONFIG = {
  healthy: {
    label: "Saludable",
    icon: CheckCircle,
    color: "text-green-600",
    bg: "bg-green-50",
    border: "border-green-200",
  },
  attention: {
    label: "Necesita atención",
    icon: AlertTriangle,
    color: "text-amber-600",
    bg: "bg-amber-50",
    border: "border-amber-200",
  },
  critical: {
    label: "Estado crítico",
    icon: AlertCircle,
    color: "text-destructive",
    bg: "bg-red-50",
    border: "border-red-200",
  },
} as const;

const SEVERITY_DOT: Record<string, string> = {
  low: "bg-amber-400",
  medium: "bg-orange-500",
  high: "bg-destructive",
};

export function DiagnosisResult({ result, photoUrl, onReset }: DiagnosisResultProps) {
  const status = STATUS_CONFIG[result.healthStatus];
  const StatusIcon = status.icon;

  return (
    <div className="flex flex-col gap-8">
      {/* Header */}
      <div>
        <h1 className="font-heading text-4xl text-primary">Diagnóstico de Planta</h1>
        <p className="mt-1 text-lg text-muted-foreground">{result.summary}</p>
      </div>

      {/* Photo with overlay */}
      <section className="relative aspect-square w-full overflow-hidden rounded-xl bg-muted shadow-md md:aspect-[2/1]">
        <Image
          src={photoUrl}
          alt="Foto analizada"
          fill
          className="object-cover"
          sizes="(max-width: 768px) 100vw, 80vw"
        />

        {/* Issue markers — one per detected issue, positioned decoratively */}
        {result.detectedIssues.slice(0, 2).map((issue, i) => (
          <div
            key={issue.title}
            className="absolute flex size-12 animate-pulse items-center justify-center rounded-full border-2 border-destructive bg-destructive/20"
            style={{
              top: i === 0 ? "30%" : "60%",
              left: i === 0 ? "20%" : undefined,
              right: i === 1 ? "30%" : undefined,
            }}
          >
            <div className="size-2 rounded-full bg-destructive" />
          </div>
        ))}

        {/* Status badge */}
        <div className="absolute bottom-4 left-4 right-4 rounded-lg border border-border/30 bg-card/95 p-4 shadow-md backdrop-blur md:right-auto md:w-72">
          <div className="mb-2 flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
              Estado general
            </span>
            <span className={`text-[10px] font-bold uppercase tracking-widest ${status.color}`}>
              {result.healthScore}% Salud
            </span>
          </div>
          <div className="flex items-center gap-2">
            <StatusIcon className={`size-5 ${status.color}`} />
            <p className={`font-semibold ${status.color}`}>{status.label}</p>
          </div>
        </div>
      </section>

      {/* Findings + Recommendations */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        {/* Detected issues */}
        <section className="flex flex-col gap-4 rounded-xl border border-border bg-card p-6">
          <h3 className="border-b border-border pb-3 font-heading text-2xl text-primary">
            Detecciones de la IA
          </h3>

          {result.detectedIssues.length === 0 ? (
            <div className="flex items-center gap-3 py-2">
              <CheckCircle className="size-5 text-green-600" />
              <p className="text-sm text-muted-foreground">
                No se detectaron problemas. La planta luce bien.
              </p>
            </div>
          ) : (
            <ul className="flex flex-col gap-4 pt-1">
              {result.detectedIssues.map((issue) => (
                <li key={issue.title} className="flex items-start gap-4">
                  <div
                    className={`mt-1 size-2.5 shrink-0 rounded-full ${SEVERITY_DOT[issue.severity] ?? "bg-muted-foreground"}`}
                  />
                  <div>
                    <p className="font-semibold text-foreground">{issue.title}</p>
                    <p className="text-sm text-muted-foreground">
                      {issue.description}{" "}
                      <span className="font-medium">Probabilidad: {issue.probability}%</span>
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>

        {/* Recommended actions */}
        <section className="flex flex-col gap-4 rounded-xl border border-border bg-card p-6">
          <h3 className="border-b border-border pb-3 font-heading text-2xl text-primary">
            Recomendaciones
          </h3>

          {result.recommendedActions.length === 0 ? (
            <p className="text-sm text-muted-foreground py-2">
              No se requieren acciones por ahora.
            </p>
          ) : (
            <ul className="flex flex-col gap-4 pt-1">
              {result.recommendedActions.map((item) => (
                <li key={item.order} className="flex items-center gap-4">
                  <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-accent-100 text-xs font-bold text-primary">
                    {item.order}
                  </div>
                  <p className="text-sm text-foreground">{item.action}</p>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>

      {/* CTA */}
      <div className="flex justify-center pb-8">
        <Button
          size="lg"
          onClick={onReset}
          className="h-14 w-full rounded-full px-8 text-base shadow-md md:w-auto"
        >
          <RotateCcw className="size-5" />
          Nuevo diagnóstico
        </Button>
      </div>
    </div>
  );
}
