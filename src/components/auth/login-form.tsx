"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { ArrowRight, Eye, EyeOff } from "lucide-react";

interface LoginFormProps {
  redirectTo: string;
}

export function LoginForm({ redirectTo }: LoginFormProps) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [remember, setRemember] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);

    startTransition(async () => {
      const res = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (!res || res.error) {
        setError("Email o contraseña incorrectos.");
        return;
      }

      router.replace(redirectTo);
      router.refresh();
    });
  }

  return (
    <form className="w-full space-y-6" onSubmit={onSubmit} noValidate>
      <div className="space-y-4">
        <div>
          <label
            htmlFor="email"
            className="mb-1 block text-xs font-bold uppercase tracking-widest text-muted-foreground"
          >
            Email
          </label>
          <input
            id="email"
            type="email"
            autoComplete="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="hola@ejemplo.com"
            className="w-full border-b border-border bg-transparent py-2 text-base outline-none transition-colors focus:border-primary"
          />
        </div>

        <div>
          <label
            htmlFor="password"
            className="mb-1 block text-xs font-bold uppercase tracking-widest text-muted-foreground"
          >
            Contraseña
          </label>
          <div className="relative">
            <input
              id="password"
              type={showPassword ? "text" : "password"}
              autoComplete="current-password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full border-b border-border bg-transparent py-2 pr-8 text-base outline-none transition-colors focus:border-primary"
            />
            <button
              type="button"
              onClick={() => setShowPassword((v) => !v)}
              aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
              className="absolute right-0 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              {showPassword ? <EyeOff className="size-5" /> : <Eye className="size-5" />}
            </button>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between py-1">
        <label className="flex cursor-pointer items-center">
          <input
            type="checkbox"
            checked={remember}
            onChange={(e) => setRemember(e.target.checked)}
            className="h-4 w-4 rounded border-border text-primary focus:ring-primary/20"
          />
          <span className="ml-2 text-sm text-muted-foreground">Recuérdame</span>
        </label>
        <a href="#" className="text-sm text-accent-700 hover:underline">
          ¿Olvidaste tu contraseña?
        </a>
      </div>

      {error && (
        <p
          role="alert"
          className="rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive"
        >
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="flex w-full items-center justify-center gap-2 rounded-lg bg-primary py-3 text-base font-semibold text-primary-foreground shadow-md transition-all hover:shadow-lg active:scale-[0.98] disabled:opacity-60"
      >
        <span>{pending ? "Ingresando..." : "Ingresar"}</span>
        {!pending && <ArrowRight className="size-5" />}
      </button>
    </form>
  );
}
