import { TopAppBar } from "@/components/layout/top-app-bar";
import { BottomNavBar } from "@/components/layout/bottom-nav-bar";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <TopAppBar />
      {children}
      <BottomNavBar />
    </>
  );
}
