import { getAdminSession } from "@/lib/getAdminSession";
import AdminShell from "@/components/admin/AdminShell";

export default async function AdminDashboardLayout({ children }) {
  const session = await getAdminSession();

  return (
    <AdminShell adminName={session?.name} adminEmail={session?.email}>
      {children}
    </AdminShell>
  );
}
