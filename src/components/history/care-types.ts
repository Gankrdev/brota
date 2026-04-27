import { Droplet, FlaskConical, Scissors, Sparkles } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import type { CareType } from "@/generated/prisma/enums";

export const CARE_TYPES: CareType[] = ["WATERING", "FERTILIZING", "PRUNING", "OTHER"];

export const CARE_TYPE_LABEL: Record<CareType, string> = {
  WATERING: "Riego",
  FERTILIZING: "Fertilización",
  PRUNING: "Poda",
  OTHER: "Otro",
};

export const CARE_TYPE_ICON: Record<CareType, LucideIcon> = {
  WATERING: Droplet,
  FERTILIZING: FlaskConical,
  PRUNING: Scissors,
  OTHER: Sparkles,
};

export const CARE_TYPE_COLOR: Record<CareType, { bg: string; text: string; border: string }> = {
  WATERING: {
    bg: "bg-primary/10",
    text: "text-primary",
    border: "border-primary/30",
  },
  FERTILIZING: {
    bg: "bg-accent/15",
    text: "text-accent-700",
    border: "border-accent/30",
  },
  PRUNING: {
    bg: "bg-secondary-200",
    text: "text-secondary-800",
    border: "border-secondary-300",
  },
  OTHER: {
    bg: "bg-muted",
    text: "text-muted-foreground",
    border: "border-border",
  },
};
