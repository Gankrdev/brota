export function greetingFor(date: Date): string {
  const hour = date.getHours();
  if (hour < 12) return "Buenos días";
  if (hour < 19) return "Buenas tardes";
  return "Buenas noches";
}

export function attentionSubtitle(needsAttentionCount: number): string {
  if (needsAttentionCount === 0) return "Tu jardín está prosperando.";
  if (needsAttentionCount === 1) return "1 planta necesita atención hoy.";
  return `${needsAttentionCount} plantas necesitan atención hoy.`;
}
