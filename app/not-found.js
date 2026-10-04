import Link from "next/link";

export const metadata = { title: "পাতাটি পাওয়া যায়নি" };

export default function NotFound() {
  return (
    <main className="status-page" id="main">
      <span className="status-code" aria-hidden="true">৪০৪</span>
      <p className="eyebrow coral-eyebrow"><span className="eyebrow-line" /> পথ হারিয়েছে</p>
      <h1>এই পাতাটি <em>খুঁজে পাওয়া যায়নি।</em></h1>
      <p>ঠিকানাটি হয়তো বদলে গেছে, অথবা পাতাটি আর নেই। চলো, পরিচিত জায়গা থেকে আবার শুরু করি।</p>
      <div className="status-actions">
        <Link className="know-button" href="/">মূল পাতায় ফিরুন →</Link>
        <Link className="listen-button" href="/dashboard">শিক্ষার্থী প্যানেল</Link>
      </div>
    </main>
  );
}
