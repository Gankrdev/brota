"use client";

import { Bell, BellOff, BellRing } from "lucide-react";
import { Button } from "@/components/ui/button";
import { usePushNotifications } from "@/hooks/use-push-notifications";

export function NotificationToggle() {
  const { state, loading, subscribe, unsubscribe } = usePushNotifications();

  if (state === "unsupported") return null;

  if (state === "denied") {
    return (
      <div className="flex items-center gap-2 rounded-lg border border-destructive/30 bg-destructive/5 px-4 py-2 text-sm text-destructive">
        <BellOff className="size-4 shrink-0" />
        <span>Notificaciones bloqueadas. Actívalas desde los ajustes del navegador.</span>
      </div>
    );
  }

  if (state === "granted") {
    return (
      <Button
        variant="outline"
        size="sm"
        disabled={loading}
        onClick={unsubscribe}
        className="gap-2 border-primary/30 text-primary hover:bg-primary/5"
      >
        <BellRing className="size-4" />
        {loading ? "Desactivando..." : "Notificaciones activas"}
      </Button>
    );
  }

  return (
    <Button
      variant="outline"
      size="sm"
      disabled={loading}
      onClick={subscribe}
      className="gap-2"
    >
      <Bell className="size-4" />
      {loading ? "Activando..." : "Activar notificaciones"}
    </Button>
  );
}
