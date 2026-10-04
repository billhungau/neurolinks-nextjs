import { redirect } from "next/navigation";
import { getClinicianSession } from "@/lib/clinical/auth";
import { AdminShell } from "./AdminShell";

export const dynamic = "force-dynamic";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await getClinicianSession();
  if (!session) redirect("/form/login/");
  return <AdminShell email={session.email ?? "Authenticated clinician"}>{children}</AdminShell>;
}
