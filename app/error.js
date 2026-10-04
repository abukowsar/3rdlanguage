"use client";

import { useEffect } from "react";
import Link from "next/link";

export default function Error({ error, retry }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <main className="status-page" id="main">
      <span className="status-code" aria-hidden="true">!</span>
      <p className="eyebrow coral-eyebrow"><span className="eyebrow-line" /> একটু সমস্যা হয়েছে</p>
      <h1>কিছু একটা <em>ঠিকমতো চলেনি।</em></h1>
      <p>পাতাটি এই মুহূর্তে দেখানো যাচ্ছে না। আবার চেষ্টা করো, সমস্যা থাকলে কিছুক্ষণ পরে ফিরে এসো।</p>
      <div className="status-actions">
        <button className="know-button" type="button" onClick={() => retry()}>আবার চেষ্টা করুন</button>
        <Link className="listen-button" href="/">মূল পাতায় ফিরুন</Link>
      </div>
    </main>
  );
}
