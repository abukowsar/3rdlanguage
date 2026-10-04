import { redirect } from "next/navigation";
import { getOptionalSession } from "@/lib/auth";
import AuthForm from "@/components/auth-form";

export const metadata = { title: "সাইন ইন" };

export default async function LoginPage() {
  const session = await getOptionalSession();
  if (session) redirect("/dashboard");
  return <AuthForm mode="login" />;
}