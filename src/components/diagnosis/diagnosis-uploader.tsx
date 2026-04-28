"use client";

import { useRef, useState, useTransition } from "react";
import Image from "next/image";
import { Camera, Microscope, Bug, HeartPulse, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { DiagnosisResponse } from "@/app/api/diagnosis/route";

interface DiagnosisUploaderProps {
  onResult: (result: DiagnosisResponse, photoUrl: string) => void;
  plantId?: string;
  speciesName?: string;
}

const FEATURES = [
  {
    icon: Bug,
    title: "Detección de plagas",
    description: "Identifica insectos y hongos dañinos rápidamente.",
  },
  {
    icon: HeartPulse,
    title: "Guía de recuperación",
    description: "Pasos detallados para curar a tu planta.",
  },
  {
    icon: Zap,
    title: "Análisis en segundos",
    description: "Resultados instantáneos basados en miles de especies.",
  },
];

export function DiagnosisUploader({ onResult, plantId, speciesName }: DiagnosisUploaderProps) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const picked = e.target.files?.[0];
    if (!picked) return;
    setFile(picked);
    setPreview(URL.createObjectURL(picked));
    setError(null);
  }

  function handleAnalyze() {
    if (!file) {
      setError("Agrega una foto para continuar.");
      return;
    }

    startTransition(async () => {
      setError(null);
      const body = new FormData();
      body.append("photo", file);
      if (plantId) body.append("plantId", plantId);
      if (speciesName) body.append("speciesName", speciesName);

      const res = await fetch("/api/diagnosis", { method: "POST", body });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error ?? "No se pudo analizar la foto. Intenta de nuevo.");
        return;
      }

      onResult(data as DiagnosisResponse, preview!);
    });
  }

  return (
    <div className="flex flex-col gap-8">
      {/* Header */}
      <div className="text-center">
        <h2 className="font-heading text-4xl text-primary">Diagnóstico por IA</h2>
        <p className="mt-2 text-lg text-muted-foreground">
          Analiza la salud de tu planta al instante
        </p>
      </div>

      {/* Main grid */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-12">
        {/* Upload box */}
        <button
          type="button"
          onClick={() => !pending && fileRef.current?.click()}
          disabled={pending}
          aria-label="Subir foto para diagnóstico"
          className="group relative flex min-h-90 cursor-pointer flex-col items-center justify-center overflow-hidden rounded-xl border border-border bg-card text-center transition-transform duration-200 hover:-translate-y-1 md:col-span-8"
        >
          {/* Decorative blobs */}
          <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-primary-100 blur-3xl opacity-40 transition-opacity duration-500 group-hover:opacity-60" />
          <div className="absolute -bottom-10 -left-10 h-40 w-40 rounded-full bg-accent-100 blur-3xl opacity-40 transition-opacity duration-500 group-hover:opacity-60" />

          {preview ? (
            <Image
              src={preview}
              alt="Vista previa"
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 66vw"
            />
          ) : (
            <div className="relative flex flex-col items-center gap-4 p-8">
              <div className="flex size-20 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-md transition-transform duration-300 group-hover:scale-110">
                <Camera className="size-9" />
              </div>
              <h3 className="font-heading text-2xl text-primary">
                Haz una foto o sube una imagen
              </h3>
              <p className="max-w-sm text-base text-muted-foreground">
                Nuestra IA analizará manchas, plagas o deficiencias con precisión botánica.
              </p>
            </div>
          )}
        </button>

        {/* Feature cards */}
        <div className="flex flex-col gap-4 md:col-span-4">
          {FEATURES.map(({ icon: Icon, title, description }) => (
            <div
              key={title}
              className="flex items-start gap-4 rounded-xl bg-muted/60 p-5"
            >
              <div className="mt-0.5 flex shrink-0 size-9 items-center justify-center rounded-full bg-card text-primary shadow-sm">
                <Icon className="size-5" />
              </div>
              <div>
                <p className="font-semibold text-primary">{title}</p>
                <p className="mt-0.5 text-sm text-muted-foreground">{description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <input
        ref={fileRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        capture="environment"
        className="hidden"
        onChange={handleFileChange}
      />

      {preview && (
        <button
          type="button"
          onClick={() => fileRef.current?.click()}
          className="text-sm text-muted-foreground underline underline-offset-2 hover:text-primary"
        >
          Cambiar foto
        </button>
      )}

      {error && (
        <p role="alert" className="text-sm text-destructive">
          {error}
        </p>
      )}

      <Button
        size="lg"
        disabled={!file || pending}
        onClick={handleAnalyze}
        className="h-14 w-full text-base shadow-lg shadow-primary/20 md:w-auto md:self-center md:px-12"
      >
        <Microscope className="size-5" />
        {pending ? "Analizando planta..." : "Analizar planta"}
      </Button>
    </div>
  );
}
