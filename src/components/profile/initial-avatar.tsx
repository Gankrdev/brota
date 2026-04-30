import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

interface InitialAvatarProps {
  name: string | null;
  email: string;
  className?: string;
  fallbackClassName?: string;
}

function getInitials(name: string | null, email: string): string {
  const source = name?.trim() || email.split("@")[0];
  const parts = source.split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

const PALETTE = [
  "bg-primary text-primary-foreground",
  "bg-secondary-200 text-secondary-900",
  "bg-accent-100 text-accent-800",
  "bg-primary-100 text-primary",
];

function pickColor(seed: string): string {
  let h = 0;
  for (let i = 0; i < seed.length; i++) {
    h = (h << 5) - h + seed.charCodeAt(i);
    h |= 0;
  }
  return PALETTE[Math.abs(h) % PALETTE.length];
}

export function InitialAvatar({ name, email, className, fallbackClassName }: InitialAvatarProps) {
  const initials = getInitials(name, email);
  const color = pickColor(name || email);

  return (
    <Avatar className={className}>
      <AvatarFallback className={cn("font-heading", color, fallbackClassName)}>
        {initials}
      </AvatarFallback>
    </Avatar>
  );
}
