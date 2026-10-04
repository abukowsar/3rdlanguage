import { redirect } from "next/navigation";
import { getOptionalSession } from "@/lib/auth";

export const metadata = { title: "শিক্ষার্থী প্যানেল", robots: { index: false } };

export default async function DashboardLayout({ children }) {
  const session = await getOptionalSession();
  if (!session) redirect("/login");
  return children;
}