import { Sun, Droplet, Wind, Thermometer } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import type { LightRequirement } from "@/generated/prisma/enums";

const LIGHT_LABEL: Record<LightRequirement, string> = {
  LOW: "Luz baja",
  MEDIUM_INDIRECT: "Indirecta media",
  BRIGHT_INDIRECT: "Indirecta intensa",
  DIRECT: "Luz directa",
};

const LIGHT_DESCRIPTION: Record<LightRequirement, string> = {
  LOW: "Tolera espacios con poca luz natural. Evita la luz solar directa.",
  MEDIUM_INDIRECT: "Prefiere luz indirecta moderada. Cerca de una ventana con cortina filtrante.",
  BRIGHT_INDIRECT: "Necesita luz brillante pero filtrada. El sol directo puede quemar las hojas.",
  DIRECT: "Necesita varias horas de luz solar directa al día.",
};

interface CareGridProps {
  light: LightRequirement;
  wateringFrequencyDays: number;
  wateringFrequencyMin: number;
  wateringFrequencyMax: number;
  humidityIdealMin: number | null;
  humidityIdealMax: number | null;
  idealTempMinC: number | null;
  idealTempMaxC: number | null;
}

interface CareCard {
  icon: LucideIcon;
  label: string;
  title: string;
  description: string;
}

function buildCards(p: CareGridProps): CareCard[] {
  const wateringTitle =
    p.wateringFrequencyMin === p.wateringFrequencyMax
      ? `Cada ${p.wateringFrequencyDays} días`
      : `Cada ${p.wateringFrequencyMin}-${p.wateringFrequencyMax} días`;

  const humidityTitle =
    p.humidityIdealMin != null && p.humidityIdealMax != null
      ? `${p.humidityIdealMin}% - ${p.humidityIdealMax}%`
      : "Sin requerimiento específico";

  const tempTitle =
    p.idealTempMinC != null && p.idealTempMaxC != null
      ? `${p.idealTempMinC}°C - ${p.idealTempMaxC}°C`
      : "Sin requerimiento específico";

  return [
    {
      icon: Sun,
      label: "Luz",
      title: LIGHT_LABEL[p.light],
      description: LIGHT_DESCRIPTION[p.light],
    },
    {
      icon: Droplet,
      label: "Agua",
      title: wateringTitle,
      description:
        "Deja que el sustrato se seque ligeramente entre riegos. Las hojas amarillas suelen indicar exceso de agua.",
    },
    {
      icon: Wind,
      label: "Humedad",
      title: humidityTitle,
      description:
        "Si vives en un ambiente seco, agrupa plantas o usa un plato con piedras y agua para aumentar la humedad local.",
    },
    {
      icon: Thermometer,
      label: "Temperatura",
      title: tempTitle,
      description:
        "Mantenla lejos de corrientes frías y de fuentes de calor directo como radiadores o estufas.",
    },
  ];
}

export function CareGrid(props: CareGridProps) {
  const cards = buildCards(props);

  return (
    <div className="flex flex-col gap-4">
      <h2 className="font-heading text-2xl text-primary">Requerimientos de cuidado</h2>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {cards.map(({ icon: Icon, label, title, description }) => (
          <Card key={label}>
            <CardContent className="flex grow flex-col justify-between gap-4 p-2">
              <div className="flex items-start justify-between">
                <div className="rounded-lg bg-secondary-100 p-2 text-primary shadow-sm">
                  <Icon className="size-5" />
                </div>
                <span className="text-[10px] font-bold tracking-widest text-muted-foreground uppercase">
                  {label}
                </span>
              </div>
              <div className="flex flex-col gap-1">
                <h3 className="text-base font-semibold text-foreground">{title}</h3>
                <p className="text-sm text-muted-foreground">{description}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
