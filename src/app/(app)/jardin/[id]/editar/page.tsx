import { notFound } from "next/navigation";
import { auth } from "@/lib/auth";
import { getPlantDetail } from "@/lib/dashboard/queries";
import { EditPlantForm } from "@/components/plant/edit-plant-form";

export default async function EditarPlantaPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error("Unauthenticated");
  }
  const { id } = await params;
  const plant = await getPlantDetail(id, session.user.id);

  if (!plant) notFound();

  return (
    <main className="mx-auto w-full max-w-3xl px-6 pb-32 pt-8 md:px-16 md:pb-16">
      <header className="mb-8">
        <h2 className="font-heading text-4xl text-primary">Editar planta</h2>
        <p className="mt-2 text-base text-muted-foreground">
          {plant.nickname} · {plant.species.commonName}
        </p>
      </header>

      <EditPlantForm
        plantId={id}
        currentPhotoUrl={plant.photoUrl}
        currentLocation={plant.location}
        speciesCommonName={plant.species.commonName}
      />
    </main>
  );
}
