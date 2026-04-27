"use client";

import { useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  Camera,
  Sofa,
  BedDouble,
  UtensilsCrossed,
  Trees,
  MapPin,
  Sprout,
  Droplets,
  ArrowLeft,
} from "lucide-react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Toggle } from "@/components/ui/toggle";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const LOCATIONS = [
  { value: "Salón",      label: "Salón",      Icon: Sofa },
  { value: "Dormitorio", label: "Dormitorio", Icon: BedDouble },
  { value: "Terraza",    label: "Terraza",    Icon: Trees },
  { value: "Cocina",     label: "Cocina",     Icon: UtensilsCrossed },
  { value: "Otro",       label: "Otro",       Icon: MapPin },
] as const;

type LocationValue = (typeof LOCATIONS)[number]["value"];

function todayISO(): string {
  return new Date().toISOString().slice(0, 10);
}

function daysAgoISO(days: number): string {
  const d = new Date();
  d.setDate(d.getDate() - days);
  return d.toISOString().slice(0, 10);
}

const QUICK_DATES = [
  { label: "Hoy",        value: () => todayISO() },
  { label: "Ayer",       value: () => daysAgoISO(1) },
  { label: "Hace 3 días", value: () => daysAgoISO(3) },
  { label: "Hace 1 semana", value: () => daysAgoISO(7) },
] as const;

export function NewPlantForm() {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [step, setStep] = useState<1 | 2>(1);

  const fileRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [location, setLocation] = useState<LocationValue | null>(null);

  const [lastWatered, setLastWatered] = useState<string>(todayISO());

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const picked = e.target.files?.[0];
    if (!picked) return;
    setFile(picked);
    setPreview(URL.createObjectURL(picked));
  }

  function handleNextStep(e: React.SyntheticEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!file) {
      setError("Agrega una foto de la planta para que la IA pueda identificarla.");
      return;
    }
    setError(null);
    setStep(2);
  }

  function handleSubmit(e: React.SyntheticEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!file) return;

    setError(null);
    startTransition(async () => {
      const body = new FormData();
      if (location) body.append("location", location);
      body.append("photo", file);
      body.append("lastWatered", lastWatered);

      const res = await fetch("/api/plants", { method: "POST", body });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(data.error ?? "No se pudo guardar la planta. Intenta de nuevo.");
        setStep(1);
        return;
      }

      const { id } = await res.json();
      router.push(`/jardin/${id}`);
      router.refresh();
    });
  }

  if (step === 2) {
    return (
      <form onSubmit={handleSubmit} className="flex flex-col gap-10">
        <section className="flex flex-col gap-4">
          <div className="flex items-center gap-3">
            <div className="flex size-12 items-center justify-center rounded-full bg-primary-100">
              <Droplets className="size-6 text-primary" />
            </div>
            <div>
              <p className="font-heading text-xl text-primary">¿Cuándo la regaste por última vez?</p>
              <p className="text-sm text-muted-foreground">
                Usaremos esto para programar los próximos riegos.
              </p>
            </div>
          </div>

          {/* Quick options */}
          <div className="grid grid-cols-2 gap-3">
            {QUICK_DATES.map(({ label, value }) => {
              const iso = value();
              const active = lastWatered === iso;
              return (
                <button
                  key={label}
                  type="button"
                  onClick={() => setLastWatered(iso)}
                  className={[
                    "rounded-xl border-2 px-4 py-3 text-sm font-semibold transition-all active:scale-95",
                    active
                      ? "border-primary bg-primary-100 text-primary"
                      : "border-border bg-muted text-foreground hover:border-primary/40",
                  ].join(" ")}
                >
                  {label}
                </button>
              );
            })}
          </div>

          {/* Date picker */}
          <div className="flex flex-col gap-2">
            <Label
              htmlFor="lastWatered"
              className="text-[10px] font-bold tracking-widest text-muted-foreground uppercase"
            >
              O elige una fecha
            </Label>
            <Input
              id="lastWatered"
              type="date"
              value={lastWatered}
              max={todayISO()}
              onChange={(e) => setLastWatered(e.target.value)}
              className="text-base"
            />
          </div>
        </section>

        {error && (
          <p role="alert" className="text-sm text-destructive">
            {error}
          </p>
        )}

        <div className="flex flex-col gap-3 pt-2">
          <Button
            type="submit"
            size="lg"
            disabled={pending}
            className="h-14 w-full text-base shadow-lg shadow-primary/20"
          >
            <Sprout className="size-5" />
            {pending ? "Identificando planta..." : "Añadir a mi jardín"}
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="lg"
            disabled={pending}
            onClick={() => setStep(1)}
            className="h-12 w-full text-base"
          >
            <ArrowLeft className="size-4" />
            Volver
          </Button>
        </div>
      </form>
    );
  }

  return (
    <form onSubmit={handleNextStep} className="flex flex-col gap-10">
      {/* Photo upload */}
      <section>
        <button
          type="button"
          onClick={() => fileRef.current?.click()}
          className="relative flex w-full items-center justify-center overflow-hidden rounded-xl border-2 border-dashed border-border bg-muted aspect-4/3 md:aspect-21/9 transition-colors hover:border-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          aria-label="Subir foto de la planta"
        >
          {preview ? (
            <Image
              src={preview}
              alt="Vista previa"
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 768px"
            />
          ) : (
            <div className="flex flex-col items-center gap-3 p-8 text-center">
              <div className="flex size-16 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg">
                <Camera className="size-7" />
              </div>
              <p className="font-heading text-lg text-primary">Subir foto de la planta</p>
              <p className="text-sm text-muted-foreground">
                Toca para abrir la cámara o elige una imagen
              </p>
            </div>
          )}
        </button>
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
            className="mt-2 text-sm text-muted-foreground underline underline-offset-2 hover:text-primary"
          >
            Cambiar foto
          </button>
        )}
      </section>

      {/* Location chips */}
      <section className="flex flex-col gap-3">
        <span className="text-[10px] font-bold tracking-widest text-muted-foreground uppercase">
          Ubicación
        </span>
        <div className="flex gap-3 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {LOCATIONS.map(({ value, label, Icon }) => (
            <Toggle
              key={value}
              pressed={location === value}
              onPressedChange={(pressed) => setLocation(pressed ? value : null)}
              variant="outline"
              className="flex h-auto shrink-0 flex-col items-center gap-2 rounded-xl px-5 py-3 data-[state=on]:border-primary data-[state=on]:bg-primary-100 data-[state=on]:text-primary"
            >
              <Icon className="size-5" />
              <span className="text-xs font-semibold">{label}</span>
            </Toggle>
          ))}
        </div>
      </section>

      {error && (
        <p role="alert" className="text-sm text-destructive">
          {error}
        </p>
      )}

      <div className="pt-2">
        <Button
          type="submit"
          size="lg"
          className="h-14 w-full text-base shadow-lg shadow-primary/20"
        >
          Siguiente
        </Button>
      </div>
    </form>
  );
}
