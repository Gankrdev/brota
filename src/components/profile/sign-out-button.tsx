import { LogOut } from "lucide-react";
import { signOut } from "@/lib/auth";
import { Button } from "@/components/ui/button";

export function SignOutButton() {
  return (
    <form
      action={async () => {
        "use server";
        await signOut({ redirectTo: "/login" });
      }}
    >
      <Button type="submit" variant="destructive" size="lg" className="gap-2 rounded-full">
        <LogOut className="size-5" />
        Cerrar sesión
      </Button>
    </form>
  );
}
