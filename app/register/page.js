import { redirect } from "next/navigation";
import { getOptionalSession } from "@/lib/auth";
import AuthForm from "@/components/auth-form";

export const metadata = { title: "নিবন্ধন" };

export default async function RegisterPage() {
  const session = await getOptionalSession();
  if (session) redirect("/dashboard");
  return <AuthForm mode="register" />;
}