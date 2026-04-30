import { auth } from "@/lib/auth";
import { getPlantsNeedingAttention, getUpcomingReminders } from "@/lib/dashboard/queries";
import { greetingFor, attentionSubtitle } from "@/components/dashboard/greeting";
import { QuickActions } from "@/components/dashboard/quick-actions";
import { NeedsAttention } from "@/components/dashboard/needs-attention";
import { UpNext } from "@/components/dashboard/up-next";
import { NotificationToggle } from "@/components/dashboard/notification-toggle";

export default async function DashboardPage() {
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error("Unauthenticated");
  }
  const userId = session.user.id;
  const firstName = session.user.name?.split(" ")[0] ?? "";

  const [needsAttention, reminders] = await Promise.all([
    getPlantsNeedingAttention(userId),
    getUpcomingReminders(userId),
  ]);

  const greeting = greetingFor(new Date());
  const subtitle = attentionSubtitle(needsAttention.length);

  return (
    <main className="mx-auto flex w-full max-w-7xl flex-grow flex-col gap-12 p-6 pb-32 md:flex-row md:p-16 md:pb-16">
      <div className="flex flex-grow flex-col gap-12">
        <section className="flex flex-col gap-2">
          <div className="flex items-start justify-between gap-4">
            <h1 className="font-heading text-4xl text-primary md:text-5xl">
              {greeting}{firstName ? `, ${firstName}` : ""}.
            </h1>
            <NotificationToggle />
          </div>
          <p className="text-lg text-muted-foreground">{subtitle}</p>
        </section>

        <section className="flex flex-col gap-6">
          <h2 className="font-heading text-2xl text-primary">Acciones rápidas</h2>
          <QuickActions hasOverduePlants={needsAttention.length > 0} />
        </section>

        <section className="flex flex-col gap-6">
          <h2 className="font-heading text-2xl text-primary">Necesitan atención</h2>
          <NeedsAttention plants={needsAttention} />
        </section>
      </div>

      <UpNext reminders={reminders} />
    </main>
  );
}
