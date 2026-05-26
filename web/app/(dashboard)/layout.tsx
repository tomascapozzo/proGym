import { redirect } from "next/navigation";
import { getCurrentMembership } from "@/lib/auth";
import { ClubProvider } from "@/lib/clubContext";
import Sidebar from "@/components/dashboard/Sidebar";
import { createClient } from "@/lib/supabase/server";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, membership, club } = await getCurrentMembership();

  if (!user) redirect("/auth/login");
  if (!membership || !club) redirect("/club/new");

  const supabase = await createClient();
  const { data: profile } = await supabase
    .from("profiles")
    .select("name")
    .eq("id", user.id)
    .single();

  return (
    <ClubProvider club={club} membership={membership}>
      <div style={{ display: "flex", height: "100vh", overflow: "hidden", background: "var(--pg-bg)" }}>
        <Sidebar coachName={profile?.name || "Coach"} teamName={club.name} />
        <main style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden", background: "var(--pg-bg)" }}>
          {children}
        </main>
      </div>
    </ClubProvider>
  );
}
