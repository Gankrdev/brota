import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { TopAppBar } from "@/components/layout/top-app-bar";
import { BottomNavBar } from "@/components/layout/bottom-nav-bar";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/login");
  }

  const userName = session.user.name ?? null;
  const userEmail = session.user.email ?? "";

  return (
    <>
      <TopAppBar userName={userName} userEmail={userEmail} />
      {children}
      <BottomNavBar userName={userName} userEmail={userEmail} />
    </>
  );
}
