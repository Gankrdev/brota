"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Check, Pencil, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

interface BioEditorProps {
  initialBio: string | null;
}

const PLACEHOLDER = "Cuenta algo sobre tu vínculo con las plantas…";
const MAX_LENGTH = 280;

export function BioEditor({ initialBio }: BioEditorProps) {
  const router = useRouter();
  const [bio, setBio] = useState(initialBio ?? "");
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function save() {
    setIsSaving(true);
    setError(null);
    try {
      const trimmed = bio.trim();
      const res = await fetch("/api/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bio: trimmed.length > 0 ? trimmed : null }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error ?? "No se pudo guardar la descripción.");
      }
      setIsEditing(false);
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error inesperado.");
    } finally {
      setIsSaving(false);
    }
  }

  function cancel() {
    setBio(initialBio ?? "");
    setError(null);
    setIsEditing(false);
  }

  if (!isEditing) {
    return (
      <div className="group flex items-start gap-2">
        <p className="flex-1 text-base text-muted-foreground">
          {initialBio?.trim() || (
            <span className="italic opacity-70">{PLACEHOLDER}</span>
          )}
        </p>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          aria-label="Editar descripción"
          onClick={() => setIsEditing(true)}
          className="-mt-1 shrink-0 opacity-60 transition-opacity hover:opacity-100"
        >
          <Pencil className="size-4" />
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      <Textarea
        value={bio}
        onChange={(e) => setBio(e.target.value.slice(0, MAX_LENGTH))}
        placeholder={PLACEHOLDER}
        rows={3}
        autoFocus
        disabled={isSaving}
        className="resize-none"
      />
      <div className="flex items-center justify-between gap-2">
        <span className="text-xs text-muted-foreground">
          {bio.length}/{MAX_LENGTH}
        </span>
        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={cancel}
            disabled={isSaving}
          >
            <X className="size-4" />
            Cancelar
          </Button>
          <Button type="button" size="sm" onClick={save} disabled={isSaving}>
            <Check className="size-4" />
            {isSaving ? "Guardando…" : "Guardar"}
          </Button>
        </div>
      </div>
      {error && <p className="text-sm text-destructive">{error}</p>}
    </div>
  );
}
