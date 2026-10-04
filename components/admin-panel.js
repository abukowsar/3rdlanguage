"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { BookOpenText, ChevronRight, ExternalLink, Languages, LayoutDashboard, LogOut, Users } from "lucide-react";
import { authClient } from "@/lib/auth-client";
import styles from "./admin.module.css";

const EMPTY_DRAFT = {
  title: "",
  language: "zh",
  category: "শুভেচ্ছা ও পরিচয়",
  summary: "",
  body: "",
  published: false,
};
const STATUS_LABELS = { pending: "পর্যালোচনাধীন", approved: "অনুমোদিত", rejected: "প্রত্যাখ্যাত" };
const LANGUAGE_LIST = [
  { id: "zh", glyph: "中", name: "ম্যান্ডারিন", native: "中文" },
  { id: "ja", glyph: "日", name: "জাপানি", native: "日本語" },
  { id: "de", glyph: "De", name: "জার্মান", native: "Deutsch" },
  { id: "ko", glyph: "한", name: "কোরিয়ান", native: "한국어" },
  { id: "ar", glyph: "ع", name: "আরবি", native: "العربية" },
];
const NAVIGATION = [
  { id: "overview", label: "সারসংক্ষেপ", Icon: LayoutDashboard },
  { id: "applicants", label: "আবেদনকারী", Icon: Users },
  { id: "content", label: "শেখার কনটেন্ট", Icon: BookOpenText },
  { id: "languages", label: "ভাষাসমূহ", Icon: Languages },
];

export default function AdminPanel({ administrator }) {
  const router = useRouter();
  const [tab, setTab] = useState("overview");
  const [applicants, setApplicants] = useState([]);
  const [items, setItems] = useState([]);
  const [applicantSummary, setApplicantSummary] = useState({ total: 0, pending: 0, approved: 0, rejected: 0 });
  const [contentSummary, setContentSummary] = useState({ total: 0, published: 0, drafts: 0 });
  const [applicantTotal, setApplicantTotal] = useState(0);
  const [contentTotal, setContentTotal] = useState(0);
  const [applicantPage, setApplicantPage] = useState(1);
  const [contentPage, setContentPage] = useState(1);
  const [applicantPageSize, setApplicantPageSize] = useState(10);
  const [contentPageSize, setContentPageSize] = useState(10);
  const [applicantSearch, setApplicantSearch] = useState("");
  const [applicantStatus, setApplicantStatus] = useState("all");
  const [applicantRefreshKey, setApplicantRefreshKey] = useState(0);
  const [contentSearch, setContentSearch] = useState("");
  const [contentLanguage, setContentLanguage] = useState("all");
  const [contentPublished, setContentPublished] = useState("all");
  const [contentRefreshKey, setContentRefreshKey] = useState(0);
  const [draft, setDraft] = useState(EMPTY_DRAFT);
  const [editingId, setEditingId] = useState(null);
  const [applicantLoading, setApplicantLoading] = useState(true);
  const [contentLoading, setContentLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [workingId, setWorkingId] = useState("");
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [selectedApplicant, setSelectedApplicant] = useState(null);

  useEffect(() => {
    let active = true;
    const timer = window.setTimeout(async () => {
      setApplicantLoading(true);
      try {
        const params = new URLSearchParams({
          page: String(applicantPage),
          pageSize: String(applicantPageSize),
          q: applicantSearch,
          status: applicantStatus,
        });
        const response = await fetch(`/api/admin/applicants?${params}`, { cache: "no-store" });
        const result = await response.json();
        if (!response.ok) throw new Error(result.error || "আবেদনকারীদের তথ্য আনা যায়নি।");
        if (active && applicantPage > result.totalPages) {
          setApplicantPage(result.totalPages);
          return;
        }
        if (active) {
          setApplicants(result.applicants);
          setApplicantTotal(result.total);
          setApplicantSummary(result.summary);
        }
      } catch (loadError) {
        if (active) setError(loadError.message || "ডেটা লোড করা যায়নি।");
      } finally {
        if (active) setApplicantLoading(false);
      }
    }, 250);
    return () => { active = false; window.clearTimeout(timer); };
  }, [applicantPage, applicantPageSize, applicantSearch, applicantStatus, applicantRefreshKey]);

  useEffect(() => {
    let active = true;
    const timer = window.setTimeout(async () => {
      setContentLoading(true);
      try {
        const params = new URLSearchParams({
          page: String(contentPage),
          pageSize: String(contentPageSize),
          q: contentSearch,
          language: contentLanguage,
          published: contentPublished,
        });
        const response = await fetch(`/api/admin/content?${params}`, { cache: "no-store" });
        const result = await response.json();
        if (!response.ok) throw new Error(result.error || "কনটেন্ট আনা যায়নি।");
        if (active && contentPage > result.totalPages) {
          setContentPage(result.totalPages);
          return;
        }
        if (active) {
          setItems(result.items);
          setContentTotal(result.total);
          setContentSummary(result.summary);
        }
      } catch (loadError) {
        if (active) setError(loadError.message || "কনটেন্ট আনা যায়নি।");
      } finally {
        if (active) setContentLoading(false);
      }
    }, 180);
    return () => { active = false; window.clearTimeout(timer); };
  }, [contentPage, contentPageSize, contentSearch, contentLanguage, contentPublished, contentRefreshKey]);

  useEffect(() => {
    if (!selectedApplicant) return undefined;
    function onKeyDown(event) {
      if (event.key === "Escape") setSelectedApplicant(null);
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [selectedApplicant]);

  async function updateApplicant(userId, status) {
    setWorkingId(userId);
    setError("");
    setNotice("");

    try {
      const response = await fetch("/api/admin/applicants", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, status }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "অবস্থা আপডেট করা যায়নি।");
      setApplicants((current) => current.map((applicant) => (
        applicant._id === userId ? { ...applicant, applicantStatus: status } : applicant
      )));
      setNotice("আবেদনকারীর অবস্থা আপডেট হয়েছে।");
      setApplicantRefreshKey((current) => current + 1);
    } catch (updateError) {
      setError(updateError.message || "অবস্থা আপডেট করা যায়নি।");
    } finally {
      setWorkingId("");
    }
  }

  async function refreshApplicants() {
    setError("");
    setApplicantRefreshKey((current) => current + 1);
  }

  function editContent(item) {
    setEditingId(item._id);
    setDraft({
      title: item.title,
      language: item.language,
      category: item.category,
      summary: item.summary || "",
      body: item.body,
      published: item.published === true,
    });
    setError("");
    setNotice("");
  }

  function resetDraft() {
    setDraft(EMPTY_DRAFT);
    setEditingId(null);
    setError("");
    setNotice("");
  }

  async function saveContent(event) {
    event.preventDefault();
    setSaving(true);
    setError("");
    setNotice("");

    try {
      const response = await fetch("/api/admin/content", {
        method: editingId ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...draft, id: editingId }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "কনটেন্ট সংরক্ষণ করা যায়নি।");

      if (editingId) {
        setItems((current) => current.map((item) => item._id === editingId ? { ...item, ...draft } : item));
        setNotice("কনটেন্ট আপডেট হয়েছে।");
      } else {
        setItems((current) => [result.item, ...current]);
        setNotice("নতুন কনটেন্ট যোগ হয়েছে।");
      }
      setDraft(EMPTY_DRAFT);
      setEditingId(null);
      setContentRefreshKey((current) => current + 1);
    } catch (saveError) {
      setError(saveError.message || "কনটেন্ট সংরক্ষণ করা যায়নি।");
    } finally {
      setSaving(false);
    }
  }

  async function deleteContent(id) {
    if (!window.confirm("এই কনটেন্টটি স্থায়ীভাবে মুছে ফেলবেন?")) return;
    setWorkingId(id);
    setError("");
    setNotice("");

    try {
      const response = await fetch("/api/admin/content", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "কনটেন্ট মুছে ফেলা যায়নি।");
      setItems((current) => current.filter((item) => item._id !== id));
      if (editingId === id) resetDraft();
      setNotice("কনটেন্ট মুছে ফেলা হয়েছে।");
      const nextLastPage = Math.max(1, Math.ceil((contentTotal - 1) / contentPageSize));
      if (contentPage > nextLastPage) setContentPage(nextLastPage);
      else setContentRefreshKey((current) => current + 1);
    } catch (deleteError) {
      setError(deleteError.message || "কনটেন্ট মুছে ফেলা যায়নি।");
    } finally {
      setWorkingId("");
    }
  }

  async function signOut() {
    await authClient.signOut();
    router.replace("/login");
    router.refresh();
  }

  const applicantPages = Math.max(1, Math.ceil(applicantTotal / applicantPageSize));
  const contentPages = Math.max(1, Math.ceil(contentTotal / contentPageSize));
  const firstApplicant = applicantTotal === 0 ? 0 : (applicantPage - 1) * applicantPageSize + 1;
  const lastApplicant = Math.min(applicantPage * applicantPageSize, applicantTotal);
  const firstContent = contentTotal === 0 ? 0 : (contentPage - 1) * contentPageSize + 1;
  const lastContent = Math.min(contentPage * contentPageSize, contentTotal);
  const activeNavigation = NAVIGATION.find((item) => item.id === tab) || NAVIGATION[0];

  function openLanguageContent(language) {
    setContentLanguage(language);
    setContentPage(1);
    setTab("content");
  }

  return (
    <main className={styles.page} id="main">
      <aside className={styles.sidebar}>
        <Link className={styles.brand} href="/">
          <span className={styles.mark}>ভা</span>
          <span className={styles.brandText}>ভাষাসেতু<small>প্রশাসন</small></span>
        </Link>
        <div className={styles.sidebarLabel}>কাজের জায়গা</div>
        <nav className={styles.navigation} aria-label="প্রশাসনিক বিভাগ">
          {NAVIGATION.map(({ id, label, Icon }) => (
            <button key={id} className={`${styles.navItem} ${tab === id ? styles.navItemActive : ""}`} aria-current={tab === id ? "page" : undefined} onClick={() => setTab(id)}>
              <Icon size={17} strokeWidth={1.8} aria-hidden="true" />
              <span>{label}</span>
              {id === "applicants" && applicantSummary.pending > 0 && <span className={styles.navBadge}>{applicantSummary.pending}</span>}
              {tab === id && <ChevronRight className={styles.navArrow} size={15} aria-hidden="true" />}
            </button>
          ))}
        </nav>
        <div className={styles.sidebarBottom}>
          <div className={styles.adminProfile}><span>{administrator.name?.slice(0, 1) || "A"}</span><div><strong>{administrator.name}</strong><small>প্রশাসক</small></div></div>
          <Link className={styles.sidebarLink} href="/dashboard"><ExternalLink size={15} aria-hidden="true" /> শিক্ষার্থী প্যানেল</Link>
          <button className={styles.sidebarLink} onClick={signOut}><LogOut size={15} aria-hidden="true" /> সাইন আউট</button>
        </div>
      </aside>

      <section className={styles.mainArea}>
        <header className={styles.topbar}>
          <div><span className={styles.topbarEyebrow}>ভাষাসেতু / প্রশাসন</span><h1>{activeNavigation.label}</h1></div>
          <div className={styles.topbarAccount}><span className={styles.statusDot} />সিস্টেম সচল<span className={styles.topbarDivider} />{administrator.email}</div>
        </header>

        <div className={styles.content}>
          <div className={styles.heading}>
            <div>
              <p className={styles.eyebrow}>প্রশাসক প্যানেল <span>·</span> ভাষাসেতু</p>
              <h2>{tab === "overview" ? <>পরিচালনা <em>কেন্দ্র</em></> : activeNavigation.label}</h2>
              <p>আবেদনকারী, শেখার কনটেন্ট ও ভাষার কার্যক্রম পরিচালনা করো।</p>
            </div>
            <div className={styles.summary}>
              <div><strong>{applicantSummary.total}</strong><span>মোট আবেদনকারী</span></div>
              <div><strong>{applicantSummary.pending}</strong><span>পর্যালোচনাধীন</span></div>
              <div><strong>{applicantSummary.approved}</strong><span>অনুমোদিত</span></div>
              <div><strong>{applicantSummary.rejected}</strong><span>প্রত্যাখ্যাত</span></div>
              <div><strong>{contentSummary.published}</strong><span>প্রকাশিত পাঠ</span></div>
              <div><strong>{contentSummary.drafts}</strong><span>খসড়া</span></div>
            </div>
          </div>

          {error && <p className={styles.messageError} role="alert">{error}</p>}
          {notice && <p className={styles.messageNotice} role="status">{notice}</p>}

          {tab === "overview" ? (
            <section className={styles.overview} aria-label="প্রশাসনিক সারসংক্ষেপ">
              <div className={styles.overviewSection}>
                <div className={styles.sectionHeading}><div><h2>সাম্প্রতিক আবেদনকারী</h2><p>নতুন নিবন্ধন পর্যালোচনা করো</p></div><button className={styles.textAction} onClick={() => { setApplicantStatus("all"); setApplicantSearch(""); setApplicantPage(1); setTab("applicants"); }}>সব আবেদনকারী দেখুন <ChevronRight size={15} aria-hidden="true" /></button></div>
                {applicantLoading ? <p className={styles.empty}>আবেদনকারীর তথ্য আনা হচ্ছে…</p> : applicants.length === 0 ? <p className={styles.empty}>এখনো কোনো আবেদনকারী নিবন্ধন করেনি।</p> : (
                  <div className={styles.tableWrap}><table className={styles.table}><thead><tr><th>আবেদনকারী</th><th>নিবন্ধনের তারিখ</th><th>অবস্থা</th><th /></tr></thead><tbody>{applicants.slice(0, 5).map((applicant) => { const status = applicant.applicantStatus || "pending"; return <tr key={applicant._id}><td><strong>{applicant.name}</strong><small>{applicant.email}</small></td><td>{applicant.createdAt ? new Intl.DateTimeFormat("bn-BD", { dateStyle: "medium" }).format(new Date(applicant.createdAt)) : "—"}</td><td><span className={`${styles.statusPill} ${styles[`status_${status}`]}`}>{STATUS_LABELS[status]}</span></td><td><button className={styles.detailButton} onClick={() => setSelectedApplicant(applicant)}>দেখুন</button></td></tr>; })}</tbody></table></div>
                )}
              </div>
              <div className={styles.overviewSection}>
                <div className={styles.sectionHeading}><div><h2>কনটেন্টের অবস্থা</h2><p>সাম্প্রতিক পাঠ ও প্রকাশনা</p></div><button className={styles.textAction} onClick={() => setTab("content")}>কনটেন্ট পরিচালনা <ChevronRight size={15} aria-hidden="true" /></button></div>
                <div className={styles.contentOverviewStats}><div><span>প্রকাশিত</span><strong>{contentSummary.published}</strong></div><div><span>খসড়া</span><strong>{contentSummary.drafts}</strong></div><div><span>মোট পাঠ</span><strong>{contentSummary.total}</strong></div></div>
                {contentLoading ? <p className={styles.empty}>কনটেন্ট আনা হচ্ছে…</p> : items.length === 0 ? <p className={styles.empty}>এখনো কোনো শেখার কনটেন্ট নেই।</p> : <ul className={styles.overviewContentList}>{items.slice(0, 5).map((item) => <li key={item._id}><div><strong>{item.title}</strong><small>{item.language.toUpperCase()} · {item.category}</small></div><span className={item.published ? styles.published : styles.draft}>{item.published ? "প্রকাশিত" : "খসড়া"}</span></li>)}</ul>}
              </div>
            </section>
          ) : tab === "languages" ? (
            <section className={styles.languageWorkspace} aria-label="ভাষা পরিচালনা">
              <div className={styles.sectionHeading}><div><h2>শেখার ভাষাসমূহ</h2><p>ভাষা বেছে নিয়ে তার পাঠ ও প্রকাশিত কনটেন্ট পরিচালনা করো</p></div></div>
              <div className={styles.languageGrid}>{LANGUAGE_LIST.map((language) => <button className={styles.languageCard} key={language.id} onClick={() => openLanguageContent(language.id)}><span className={styles.languageGlyph} lang={language.id}>{language.glyph}</span><span className={styles.languageDetails}><strong>{language.name}</strong><small>{language.native}</small></span><span className={styles.languageOpen}>কনটেন্ট দেখুন <ChevronRight size={14} aria-hidden="true" /></span></button>)}</div>
            </section>
          ) : tab === "applicants" ? (
          <section className={styles.section} aria-labelledby="applicants-title">
            <div className={styles.sectionHeading}>
              <div><h2 id="applicants-title">নিবন্ধিত আবেদনকারী</h2><p>মোট {applicantSummary.total}টি অ্যাকাউন্ট</p></div>
              <button className={styles.refreshButton} onClick={refreshApplicants} disabled={applicantLoading}>পুনরায় লোড</button>
            </div>
            <div className={styles.filterBar}>
              <label className={styles.searchField}><span className={styles.srOnly}>নাম বা ইমেইল খুঁজুন</span><input type="search" value={applicantSearch} placeholder="নাম বা ইমেইল খুঁজুন" onChange={(event) => { setApplicantSearch(event.target.value); setApplicantPage(1); }} /></label>
              <label className={styles.filterField}><span>অবস্থা</span><select value={applicantStatus} onChange={(event) => { setApplicantStatus(event.target.value); setApplicantPage(1); }}><option value="all">সব অবস্থা</option><option value="pending">পর্যালোচনাধীন</option><option value="approved">অনুমোদিত</option><option value="rejected">প্রত্যাখ্যাত</option></select></label>
              <label className={styles.filterField}><span>প্রতি পাতায়</span><select value={applicantPageSize} onChange={(event) => { setApplicantPageSize(Number(event.target.value)); setApplicantPage(1); }}><option value={10}>১০</option><option value={25}>২৫</option><option value={50}>৫০</option></select></label>
            </div>
            {applicantLoading ? <p className={styles.empty}>আবেদনকারীর তথ্য আনা হচ্ছে…</p> : applicants.length === 0 ? (
              <p className={styles.empty}>{applicantSearch || applicantStatus !== "all" ? "এই অনুসন্ধানে কোনো আবেদনকারী পাওয়া যায়নি।" : "এখনো কোনো আবেদনকারী নিবন্ধন করেনি।"}</p>
            ) : (
              <div className={styles.tableWrap}>
                <table className={styles.table}>
                  <thead><tr><th>আবেদনকারী</th><th>নিবন্ধনের তারিখ</th><th>অবস্থা</th><th>বিস্তারিত</th></tr></thead>
                  <tbody>
                    {applicants.map((applicant) => {
                      const status = applicant.applicantStatus || "pending";
                      return (
                        <tr key={applicant._id}>
                          <td><strong>{applicant.name}</strong><small>{applicant.email}</small></td>
                          <td>{applicant.createdAt ? new Intl.DateTimeFormat("bn-BD", { dateStyle: "medium" }).format(new Date(applicant.createdAt)) : "—"}</td>
                          <td>
                            <label className={styles.statusControl}>
                              <span className={styles.srOnly}>{applicant.name} আবেদনকারীর অবস্থা</span>
                              <select value={status} disabled={workingId === applicant._id} onChange={(event) => updateApplicant(applicant._id, event.target.value)}>
                                {Object.entries(STATUS_LABELS).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
                              </select>
                            </label>
                          </td>
                          <td><button className={styles.detailButton} onClick={() => setSelectedApplicant(applicant)}>দেখুন</button></td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
            <div className={styles.pagination}>
              <span>{firstApplicant}–{lastApplicant} / {applicantTotal}</span>
              <div><button disabled={applicantPage <= 1 || applicantLoading} onClick={() => setApplicantPage((current) => current - 1)}>আগের</button><strong>{applicantPage} / {applicantPages}</strong><button disabled={applicantPage >= applicantPages || applicantLoading} onClick={() => setApplicantPage((current) => current + 1)}>পরের</button></div>
            </div>
          </section>
          ) : (
          <section className={styles.contentSection} aria-label="শেখার কনটেন্ট পরিচালনা">
            <div className={styles.contentList}>
              <div className={styles.sectionHeading}>
                    <div><h2>কনটেন্ট তালিকা</h2><p>মোট {contentSummary.total}টি পাঠ</p></div>
                    <button className={styles.refreshButton} onClick={() => setContentRefreshKey((current) => current + 1)} disabled={contentLoading}>পুনরায় লোড</button>
              </div>
                  <div className={styles.filterBar}>
                    <label className={styles.searchField}><span className={styles.srOnly}>শিরোনাম বা বিষয় খুঁজুন</span><input type="search" value={contentSearch} placeholder="শিরোনাম বা বিষয় খুঁজুন" onChange={(event) => { setContentSearch(event.target.value); setContentPage(1); }} /></label>
                    <label className={styles.filterField}><span>ভাষা</span><select value={contentLanguage} onChange={(event) => { setContentLanguage(event.target.value); setContentPage(1); }}><option value="all">সব ভাষা</option><option value="zh">ম্যান্ডারিন</option><option value="ja">জাপানি</option><option value="de">জার্মান</option><option value="ko">কোরিয়ান</option><option value="ar">আরবি</option></select></label>
                    <label className={styles.filterField}><span>প্রকাশনা</span><select value={contentPublished} onChange={(event) => { setContentPublished(event.target.value); setContentPage(1); }}><option value="all">সব</option><option value="published">প্রকাশিত</option><option value="draft">খসড়া</option></select></label>
                    <label className={styles.filterField}><span>প্রতি পাতায়</span><select value={contentPageSize} onChange={(event) => { setContentPageSize(Number(event.target.value)); setContentPage(1); }}><option value={10}>১০</option><option value={25}>২৫</option><option value={50}>৫০</option></select></label>
                  </div>
                  {contentLoading ? <p className={styles.empty}>কনটেন্ট আনা হচ্ছে…</p> : items.length === 0 ? (
                    <p className={styles.empty}>{contentSearch || contentLanguage !== "all" || contentPublished !== "all" ? "এই ফিল্টারে কোনো কনটেন্ট নেই।" : "এখনো কোনো শেখার কনটেন্ট নেই।"}</p>
              ) : (
                <ul className={styles.itemList}>
                  {items.map((item) => (
                    <li className={styles.item} key={item._id}>
                      <div><span className={item.published ? styles.published : styles.draft}>{item.published ? "প্রকাশিত" : "খসড়া"}</span><strong>{item.title}</strong><small>{item.language.toUpperCase()} · {item.category}</small></div>
                      <div className={styles.itemActions}><button onClick={() => editContent(item)}>সম্পাদনা</button><button className={styles.deleteButton} disabled={workingId === item._id} onClick={() => deleteContent(item._id)}>মুছুন</button></div>
                    </li>
                  ))}
                </ul>
              )}
              <div className={styles.pagination}>
                <span>{firstContent}–{lastContent} / {contentTotal}</span>
                <div><button disabled={contentPage <= 1 || contentLoading} onClick={() => setContentPage((current) => current - 1)}>আগের</button><strong>{contentPage} / {contentPages}</strong><button disabled={contentPage >= contentPages || contentLoading} onClick={() => setContentPage((current) => current + 1)}>পরের</button></div>
              </div>
            </div>

            <form className={styles.editor} onSubmit={saveContent}>
              <div className={styles.sectionHeading}><div><h2>{editingId ? "কনটেন্ট সম্পাদনা" : "নতুন কনটেন্ট"}</h2><p>সর্বোচ্চ ১৫,০০০ অক্ষর</p></div></div>
              <label className={styles.field}><span>শিরোনাম</span><input value={draft.title} maxLength={120} required onChange={(event) => setDraft({ ...draft, title: event.target.value })} /></label>
              <div className={styles.fieldRow}>
                <label className={styles.field}><span>ভাষা</span><select value={draft.language} onChange={(event) => setDraft({ ...draft, language: event.target.value })}><option value="zh">ম্যান্ডারিন</option><option value="ja">জাপানি</option><option value="de">জার্মান</option><option value="ko">কোরিয়ান</option><option value="ar">আরবি</option></select></label>
                <label className={styles.field}><span>বিষয়</span><input value={draft.category} maxLength={80} required onChange={(event) => setDraft({ ...draft, category: event.target.value })} /></label>
              </div>
              <label className={styles.field}><span>সংক্ষিপ্ত বিবরণ</span><input value={draft.summary} maxLength={320} onChange={(event) => setDraft({ ...draft, summary: event.target.value })} /></label>
              <label className={styles.field}><span>মূল লেখা</span><textarea value={draft.body} maxLength={15000} rows={7} required onChange={(event) => setDraft({ ...draft, body: event.target.value })} /></label>
              <label className={styles.publishToggle}><input type="checkbox" checked={draft.published} onChange={(event) => setDraft({ ...draft, published: event.target.checked })} /><span>প্রকাশিত</span></label>
              <div className={styles.editorActions}><button className={styles.saveButton} type="submit" disabled={saving}>{saving ? "সংরক্ষণ হচ্ছে…" : editingId ? "পরিবর্তন সংরক্ষণ" : "কনটেন্ট যোগ করো"}</button>{editingId && <button className={styles.cancelButton} type="button" onClick={resetDraft}>বাতিল</button>}</div>
            </form>
          </section>
          )}
        </div>
      </section>

      {selectedApplicant && (
        <div className={styles.modalBackdrop} onMouseDown={(event) => { if (event.target === event.currentTarget) setSelectedApplicant(null); }}>
          <section className={styles.applicantModal} role="dialog" aria-modal="true" aria-labelledby="applicant-detail-title">
            <div className={styles.sectionHeading}><div><p className={styles.eyebrow}>আবেদনকারীর প্রোফাইল</p><h2 id="applicant-detail-title">{selectedApplicant.name || "নাম দেওয়া হয়নি"}</h2></div><button className={styles.closeButton} aria-label="বন্ধ করুন" onClick={() => setSelectedApplicant(null)}>×</button></div>
            <dl className={styles.detailList}><div><dt>ইমেইল</dt><dd>{selectedApplicant.email}</dd></div><div><dt>নিবন্ধনের তারিখ</dt><dd>{selectedApplicant.createdAt ? new Intl.DateTimeFormat("bn-BD", { dateStyle: "full" }).format(new Date(selectedApplicant.createdAt)) : "—"}</dd></div><div><dt>বর্তমান অবস্থা</dt><dd>{STATUS_LABELS[selectedApplicant.applicantStatus || "pending"]}</dd></div></dl>
            <button className={styles.closeAction} onClick={() => setSelectedApplicant(null)}>সম্পন্ন</button>
          </section>
        </div>
      )}
    </main>
  );
}