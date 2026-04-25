import {
  LayoutDashboard,
  Flower2,
  LineChart,
  Calendar,
  type LucideIcon,
} from "lucide-react";

export interface NavItem {
  label: string;
  href: string;
  icon: LucideIcon;
}

export const NAV_ITEMS: NavItem[] = [
  { label: "Inicio", href: "/", icon: LayoutDashboard },
  { label: "Jardín", href: "#", icon: Flower2 },
  { label: "Historial", href: "#", icon: LineChart },
  { label: "Calendario", href: "#", icon: Calendar },
];
