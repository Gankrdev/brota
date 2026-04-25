import Image from "next/image";
import { Sprout, Flower2, Leaf, TreeDeciduous } from "lucide-react";
import { LoginForm } from "@/components/auth/login-form";

interface LoginPageProps {
  searchParams: Promise<{ from?: string }>;
}

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const { from } = await searchParams;
  const redirectTo = from && from.startsWith("/") ? from : "/";

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden">
      <div className="absolute inset-0 z-0">
        <Image
          src="/login-bg.jpg"
          alt="Invernadero con plantas tropicales y luz suave"
          fill
          priority
          sizes="100vw"
          className="object-cover"
        />
        <div className="absolute inset-0 bg-primary/20 backdrop-brightness-75" />
      </div>

      <div className="relative z-10 w-full max-w-md px-6 md:px-0">
        <div className="flex flex-col items-center rounded-xl border border-white/20 bg-background/85 p-8 shadow-[0_20px_50px_rgba(27,48,34,0.15)] backdrop-blur-md">
          <div className="mb-8 text-center">
            <Sprout className="mx-auto mb-2 size-10 text-primary" />
            <h1 className="mb-1 font-heading text-3xl text-primary">Brota</h1>
            <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
              Cuida, observa, brota
            </p>
          </div>

          <LoginForm redirectTo={redirectTo} />

          <div className="my-8 flex w-full items-center gap-4">
            <div className="h-px flex-1 bg-border/50" />
            <span className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
              O continúa con
            </span>
            <div className="h-px flex-1 bg-border/50" />
          </div>

          <button
            type="button"
            disabled
            aria-disabled="true"
            title="Disponible próximamente"
            className="flex w-full max-w-[220px] cursor-not-allowed items-center justify-center gap-2 rounded-lg border border-border/30 bg-muted py-3 opacity-60 transition-colors"
          >
            <svg className="size-5" viewBox="0 0 24 24" aria-hidden="true">
              <path
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                fill="#4285F4"
              />
              <path
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                fill="#34A853"
              />
              <path
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"
                fill="#FBBC05"
              />
              <path
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                fill="#EA4335"
              />
            </svg>
            <span className="text-sm font-semibold">Google</span>
          </button>
        </div>
      </div>

      <div className="pointer-events-none absolute bottom-4 left-0 z-10 hidden w-full items-center justify-between px-16 md:flex">
        <div className="flex gap-4 text-white/40">
          <Flower2 className="size-5" />
          <TreeDeciduous className="size-5" />
          <Leaf className="size-5" />
        </div>
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-white/40">
          EST. MMXXIV
        </p>
      </div>
    </main>
  );
}
