import { Flower2, Microscope, Sprout, Droplet } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { auth } from "@/lib/auth";
import { getProfileData } from "@/lib/profile/queries";
import { InitialAvatar } from "@/components/profile/initial-avatar";
import { BioEditor } from "@/components/profile/bio-editor";
import { WeeklyActivityChart } from "@/components/profile/weekly-activity-chart";
import { SignOutButton } from "@/components/profile/sign-out-button";
import { RecentActivity } from "@/components/profile/recent-activity";

export default async function PerfilPage() {
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error("Unauthenticated");
  }
  const profile = await getProfileData(session.user.id);

  return (
    <main className="mx-auto w-full max-w-7xl grow px-6 pb-32 pt-12 md:px-16 md:pb-16">
      <section className="mb-12 grid grid-cols-1 gap-4 md:grid-cols-3">
        <Card className="md:col-span-2">
          <CardContent className="flex flex-col items-center gap-6 p-6 md:flex-row md:items-start md:p-8">
            <InitialAvatar
              name={profile.name}
              email={profile.email}
              className="size-32 shrink-0 border-4 border-card shadow-sm"
              fallbackClassName="text-4xl"
            />
            <div className="flex w-full flex-col gap-3 text-center md:text-left">
              <div>
                <h1 className="font-heading text-3xl text-primary md:text-4xl">
                  {profile.name ?? profile.email.split("@")[0]}
                </h1>
                <p className="text-sm text-muted-foreground">{profile.email}</p>
              </div>
              <BioEditor initialBio={profile.bio} />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-primary text-primary-foreground">
          <CardContent className="flex h-full flex-col justify-between gap-4 p-6">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-primary-foreground/70">
                Días cuidando
              </p>
              <div className="mt-2 flex items-baseline gap-2">
                <span className="font-heading text-5xl">{profile.daysCaring}</span>
                <span className="text-sm text-primary-foreground/80">
                  {profile.daysCaring === 1 ? "día" : "días"}
                </span>
              </div>
            </div>
            <p className="text-sm text-primary-foreground/80">
              Tu jardín está prosperando contigo.
            </p>
          </CardContent>
        </Card>
      </section>

      <section className="mb-12 grid grid-cols-2 gap-4 md:grid-cols-4">
        <StatCard
          icon={<Sprout className="size-5" />}
          value={profile.stats.plantCount}
          label="Plantas en jardín"
        />
        <StatCard
          icon={<Flower2 className="size-5" />}
          value={profile.stats.speciesCount}
          label="Especies distintas"
        />
        <StatCard
          icon={<Droplet className="size-5" />}
          value={profile.stats.wateringsThisMonth}
          label="Riegos este mes"
        />
        <StatCard
          icon={<Microscope className="size-5" />}
          value={profile.stats.diagnosisCount}
          label="Diagnósticos"
        />
      </section>

      <Card className="mb-12">
        <CardContent className="flex flex-col gap-6 p-6 md:p-8">
          <h2 className="font-heading text-2xl text-primary">Actividad reciente</h2>
          <WeeklyActivityChart data={profile.weeklyActivity} />
          <RecentActivity items={profile.recentActivity} />
        </CardContent>
      </Card>

      <section className="mt-12 flex justify-center">
        <SignOutButton />
      </section>
    </main>
  );
}

function StatCard({
  icon,
  value,
  label,
}: {
  icon: React.ReactNode;
  value: number;
  label: string;
}) {
  return (
    <Card className="transition-transform hover:-translate-y-0.5">
      <CardContent className="flex flex-col items-center gap-2 p-4 text-center">
        <div className="flex size-10 items-center justify-center rounded-full bg-secondary-100 text-secondary-800">
          {icon}
        </div>
        <span className="font-heading text-2xl text-primary">{value}</span>
        <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
          {label}
        </span>
      </CardContent>
    </Card>
  );
}
