import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default function ClinicianDashboardPage() {
  redirect("/form/dashboard/patients/");
}
