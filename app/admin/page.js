import { redirect } from "next/navigation";
import { getAdminAccess } from "@/lib/admin";
import AdminPanel from "@/components/admin-panel";

export const metadata = { title: "প্রশাসন", robots: { index: false } };

export default async function AdminPage() {
  const access = await getAdminAccess();

  if (access.status === 401) redirect("/login");
  if (access.status === 403) redirect("/dashboard");

  if (access.status === 503) {
    return (
      <main className="admin-setup">
        <h1>অ্যাডমিন অ্যাক্সেস সেটআপ বাকি</h1>
        <p>প্রশাসকের লগইন ইমেইলটি .env.local ফাইলে ADMIN_EMAIL হিসেবে যোগ করে সার্ভার পুনরায় চালু করুন।</p>
      </main>
    );
  }

  return <AdminPanel administrator={access.session.user} />;
}