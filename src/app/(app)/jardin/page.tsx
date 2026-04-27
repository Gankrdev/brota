import { getAllPlants } from "@/lib/dashboard/queries";
import { GardenExplorer } from "@/components/garden/garden-explorer";

export default async function JardinPage() {
  const plants = await getAllPlants();

  return (
    <main className="mx-auto w-full max-w-7xl flex-grow px-6 pb-32 pt-20 md:px-16 md:pb-16">
      <section className="pb-8 pt-12">
        <h1 className="font-heading text-4xl text-primary md:text-5xl">Mi jardín</h1>
        <p className="mt-2 max-w-2xl text-lg text-muted-foreground">
          Catálogo vivo de tu colección.
        </p>
      </section>

      <GardenExplorer plants={plants} />
    </main>
  );
}
