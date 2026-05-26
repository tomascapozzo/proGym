import { redirect } from "next/navigation";
import { getCurrentMembership } from "@/lib/auth";
import ClubEntry from "@/components/club/ClubEntry";

export default async function NewClubPage() {
  const { user, membership } = await getCurrentMembership();

  if (!user) redirect("/auth/login");
  if (membership) redirect("/dashboard");

  return <ClubEntry />;
}
