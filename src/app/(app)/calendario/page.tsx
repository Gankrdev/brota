import { auth } from "@/lib/auth";
import { getCalendarTasks } from "@/lib/dashboard/queries";
import { CalendarView } from "@/components/calendar/calendar-view";

export default async function CalendarioPage() {
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error("Unauthenticated");
  }
  const now = new Date();
  const from = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const to = new Date(now.getFullYear(), now.getMonth() + 2, 0, 23, 59, 59);

  const tasks = await getCalendarTasks(session.user.id, from, to);
  const serialized = tasks.map((t) => ({
    ...t,
    scheduledFor: t.scheduledFor.toISOString(),
  }));

  return (
    <main className="mx-auto w-full max-w-7xl flex-grow px-6 pb-32 pt-20 md:px-16 md:pb-16">
      <section className="pb-8 pt-12">
        <h1 className="font-heading text-4xl text-primary md:text-5xl">
          Calendario de cuidados
        </h1>
        <p className="mt-2 max-w-2xl text-lg text-muted-foreground">
          Organiza el cuidado de tus plantas. Marca tareas a medida que las completes.
        </p>
      </section>

      <CalendarView initialTasks={serialized} />
    </main>
  );
}
