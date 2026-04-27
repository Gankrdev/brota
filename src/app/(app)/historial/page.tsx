import { Leaf } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import {
  getCareEventCountSince,
  getCareHistory,
  getPlantOptions,
} from "@/lib/dashboard/queries";
import { HistoryExplorer } from "@/components/history/history-explorer";

const PAGE_SIZE = 20;

export default async function HistorialPage() {
  const startOfMonth = new Date();
  startOfMonth.setDate(1);
  startOfMonth.setHours(0, 0, 0, 0);

  const [{ entries, hasMore }, plants, monthCount] = await Promise.all([
    getCareHistory({ limit: PAGE_SIZE }),
    getPlantOptions(),
    getCareEventCountSince(startOfMonth),
  ]);

  const serialized = entries.map((e) => ({
    ...e,
    occurredAt: e.occurredAt.toISOString(),
  }));

  return (
    <main className="mx-auto w-full max-w-7xl flex-grow px-6 pb-32 pt-20 md:px-16 md:pb-16">
      <section className="flex flex-col gap-6 pb-12 pt-12 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="font-heading text-4xl text-primary md:text-5xl">
            Historial de cuidados
          </h1>
          <p className="mt-2 max-w-2xl text-lg text-muted-foreground">
            Revisa las acciones recientes en tu jardín digital.
          </p>
        </div>

        <Card className="md:w-fit">
          <CardContent className="flex items-center gap-4 p-4">
            <div className="flex size-12 items-center justify-center rounded-full bg-secondary-100 text-secondary-800">
              <Leaf className="size-6 fill-current" />
            </div>
            <div>
              <p className="font-heading text-2xl text-primary">
                {monthCount} {monthCount === 1 ? "acción" : "acciones"}
              </p>
              <p className="text-sm text-muted-foreground">registradas este mes</p>
            </div>
          </CardContent>
        </Card>
      </section>

      <HistoryExplorer
        initialEntries={serialized}
        initialHasMore={hasMore}
        plants={plants}
        pageSize={PAGE_SIZE}
      />
    </main>
  );
}
