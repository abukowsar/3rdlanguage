"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";
import styles from "./auth.module.css";

export default function AuthForm({ mode }) {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");
  const isRegister = mode === "register";

  async function submit(event) {
    event.preventDefault();
    setPending(true);
    setError("");
    const formData = new FormData(event.currentTarget);
    const email = String(formData.get("email") || "").trim().toLowerCase();
    const password = String(formData.get("password") || "");

    try {
      const result = isRegister
        ? await authClient.signUp.email({
            name: String(formData.get("name") || "").trim(),
            email,
            password,
            callbackURL: "/dashboard",
          })
        : await authClient.signIn.email({ email, password, callbackURL: "/dashboard" });

      if (result.error) {
        setError(result.error.message || "তথ্যগুলো যাচাই করে আবার চেষ্টা করুন।");
        return;
      }

      router.replace("/dashboard");
      router.refresh();
    } catch {
      setError("এই মুহূর্তে কাজটি করা যাচ্ছে না। আবার চেষ্টা করুন।");
    } finally {
      setPending(false);
    }
  }

  return (
    <main className={styles.page} id="main">
      <header className={styles.header}>
        <Link className={styles.brand} href="/">
          <span className={styles.mark}>ভা</span>
          <span>ভাষাসেতু</span>
        </Link>
        <Link className={styles.homeLink} href="/">মূল পাতায় ফিরুন <span aria-hidden="true">↗</span></Link>
      </header>

      <div className={styles.layout}>
        <section className={styles.intro}>
          <p className={styles.eyebrow}><span /> তোমার ভাষা-যাত্রা</p>
          <h1>{isRegister ? <>একটি নতুন<br /><em>শুরু।</em></> : <>আবার দেখা,<br /><em>শিক্ষার্থী।</em></>}</h1>
          <p>{isRegister ? "তোমার নিজের অ্যাকাউন্ট তৈরি করো, শেখার অগ্রগতি রেখে দাও নিজের কাছেই।" : "তোমার শেখা যেখানে থেমেছিল, সেখান থেকেই আবার শুরু করো।"}</p>
          <div className={styles.scriptLine} aria-hidden="true">你好 <span>こんにちは</span> مرحبا</div>
        </section>

        <section className={styles.formSection} aria-labelledby="form-title">
          <p className={styles.formEyebrow}>{isRegister ? "নতুন অ্যাকাউন্ট" : "তোমার অ্যাকাউন্ট"}</p>
          <h2 id="form-title">{isRegister ? "নিবন্ধন করো" : "সাইন ইন করো"}</h2>
          <p className={styles.formLead}>{isRegister ? "শুরু করতে কয়েকটি তথ্য দাও।" : "তোমার ইমেইল ও পাসওয়ার্ড দিয়ে প্রবেশ করো।"}</p>

          <form className={styles.form} onSubmit={submit}>
            {isRegister && (
              <label className={styles.field}>
                <span>আপনার নাম</span>
                <input name="name" type="text" autoComplete="name" minLength={2} maxLength={80} required placeholder="পুরো নাম" />
              </label>
            )}
            <label className={styles.field}>
              <span>ইমেইল</span>
              <input name="email" type="email" autoComplete="email" required placeholder="name@example.com" />
            </label>
            <label className={styles.field}>
              <span>পাসওয়ার্ড</span>
              <input name="password" type="password" autoComplete={isRegister ? "new-password" : "current-password"} minLength={8} maxLength={128} required placeholder={isRegister ? "কমপক্ষে ৮টি অক্ষর" : "তোমার পাসওয়ার্ড"} />
            </label>

            {error && <p className={styles.error} role="alert">{error}</p>}
            <button className={styles.submit} type="submit" disabled={pending}>
              {pending ? "একটু অপেক্ষা করো…" : isRegister ? "অ্যাকাউন্ট তৈরি করো" : "প্যানেলে প্রবেশ করো"}
              {!pending && <span aria-hidden="true">→</span>}
            </button>
          </form>

          <p className={styles.switchMode}>
            {isRegister ? "আগে থেকেই অ্যাকাউন্ট আছে?" : "এখানে নতুন?"}{" "}
            <Link href={isRegister ? "/login" : "/register"}>{isRegister ? "সাইন ইন করো" : "নিবন্ধন করো"}</Link>
          </p>
          <p className={styles.privacyNote}>তোমার শেখার অগ্রগতি এই ডিভাইসের ব্রাউজারে সংরক্ষিত থাকে।</p>
        </section>
      </div>
    </main>
  );
}