import { NewPlantForm } from "@/components/plant/new-plant-form";

export default function NuevaPlantaPage() {
  return (
    <main className="mx-auto w-full max-w-3xl px-6 pb-32 pt-8 md:px-16 md:pb-16">
      <header className="mb-8">
        <h2 className="font-heading text-4xl text-primary">Nueva planta</h2>
        <p className="mt-2 text-base text-muted-foreground">
          Añade un nuevo miembro a tu familia botánica.
        </p>
      </header>

      <NewPlantForm />
    </main>
  );
}
