export default function Loading() {
  return (
    <main className="status-page" id="main" aria-busy="true">
      <span className="loading-mark" aria-hidden="true">ভা</span>
      <p role="status">তোমার পাঠ প্রস্তুত হচ্ছে…</p>
    </main>
  );
}
