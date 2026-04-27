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
  Check,
} from "lucide-react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Toggle } from "@/components/ui/toggle";

const LOCATIONS = [
  { value: "Salón",      label: "Salón",      Icon: Sofa },
  { value: "Dormitorio", label: "Dormitorio", Icon: BedDouble },
  { value: "Terraza",    label: "Terraza",    Icon: Trees },
  { value: "Cocina",     label: "Cocina",     Icon: UtensilsCrossed },
  { value: "Otro",       label: "Otro",       Icon: MapPin },
] as const;

type LocationValue = (typeof LOCATIONS)[number]["value"];

function isLocationValue(val: string | null): val is LocationValue {
  return LOCATIONS.some((l) => l.value === val);
}

interface Props {
  plantId: string;
  currentPhotoUrl: string | null;
  currentLocation: string | null;
  speciesCommonName: string;
}

export function EditPlantForm({ plantId, currentPhotoUrl, currentLocation, speciesCommonName }: Props) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const fileRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [file, setFile] = useState<File | null>(null);

  const initialLocation = isLocationValue(currentLocation) ? currentLocation : null;
  const [location, setLocation] = useState<LocationValue | null>(initialLocation);

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const picked = e.target.files?.[0];
    if (!picked) return;
    setFile(picked);
    setPreview(URL.createObjectURL(picked));
  }

  function handleSubmit(e: React.SyntheticEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);

    startTransition(async () => {
      // Verify photo matches species before saving
      if (file) {
        const verifyBody = new FormData();
        verifyBody.append("photo", file);
        verifyBody.append("expectedSpecies", speciesCommonName);

        const verifyRes = await fetch("/api/ai/verify-plant-photo", {
          method: "POST",
          body: verifyBody,
        });

        if (verifyRes.ok) {
          const { match } = await verifyRes.json();
          if (!match) {
            setError(
              `La foto no parece corresponder a "${speciesCommonName}". Verifica que sea la misma planta.`,
            );
            return;
          }
        }
      }

      const body = new FormData();
      if (location) body.append("location", location);
      if (file) body.append("photo", file);

      const res = await fetch(`/api/plants/${plantId}`, { method: "PATCH", body });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(data.error ?? "No se pudo guardar los cambios. Intenta de nuevo.");
        return;
      }

      router.push(`/jardin/${plantId}`);
      router.refresh();
    });
  }

  const displayPhoto = preview ?? currentPhotoUrl;

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-10">
      {/* Photo */}
      <section>
        <button
          type="button"
          onClick={() => fileRef.current?.click()}
          className="relative flex w-full items-center justify-center overflow-hidden rounded-xl border-2 border-dashed border-border bg-muted aspect-4/3 md:aspect-21/9 transition-colors hover:border-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          aria-label="Cambiar foto de la planta"
        >
          {displayPhoto ? (
            <>
              <Image
                src={displayPhoto}
                alt="Foto de la planta"
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 768px"
              />
              <div className="absolute inset-0 flex items-center justify-center bg-black/30 opacity-0 transition-opacity hover:opacity-100">
                <Camera className="size-8 text-white" />
              </div>
            </>
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
        {displayPhoto && (
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

      {/* Error */}
      {error && (
        <p role="alert" className="text-sm text-destructive">
          {error}
        </p>
      )}

      {/* Submit */}
      <div className="pt-2">
        <Button
          type="submit"
          size="lg"
          disabled={pending}
          className="h-14 w-full text-base shadow-lg shadow-primary/20"
        >
          <Check className="size-5" />
          {pending ? "Verificando foto..." : "Guardar cambios"}
        </Button>
      </div>
    </form>
  );
}
