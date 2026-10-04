import Link from "next/link";
import { getOptionalSession } from "@/lib/auth";
import { getMongoDatabase } from "@/lib/mongodb";
import styles from "./landing.module.css";

const languages = [
  { native: "中文", name: "ম্যান্ডারিন", script: "你好", id: "zh" },
  { native: "日本語", name: "জাপানি", script: "こんにちは", id: "ja" },
  { native: "Deutsch", name: "জার্মান", script: "Hallo", id: "de" },
  { native: "한국어", name: "কোরিয়ান", script: "안녕하세요", id: "ko" },
  { native: "العربية", name: "আরবি", script: "مرحبا", id: "ar" },
];

export default async function Home() {
  const session = await getOptionalSession();
  let publishedContent = [];
  try {
    const db = await getMongoDatabase();
    publishedContent = await db.collection("learningContent")
      .find({ published: true }, { projection: { title: 1, language: 1, category: 1, summary: 1, body: 1 } })
      .sort({ updatedAt: -1 })
      .limit(3)
      .toArray();
  } catch (error) {
    console.error("Unable to load published learning content:", error);
  }
  const startHref = session ? "/dashboard" : "/register";
  const panelHref = session ? "/dashboard" : "/login";

  return (
    <main className={styles.site} id="main">
      <header className={styles.header}>
        <Link className={styles.brand} href="/" aria-label="ভাষাসেতু হোম">
          <span className={styles.brandMark}>ভা</span>
          <span className={styles.brandName}>ভাষাসেতু</span>
        </Link>
        <nav className={styles.navigation} aria-label="প্রধান নেভিগেশন">
          <a href="#languages">ভাষাসমূহ</a>
          <a href="#approach">শেখার পথ</a>
        </nav>
        <Link className={styles.headerAction} href={panelHref}>{session ? "প্যানেলে প্রবেশ" : "সাইন ইন"} <span aria-hidden="true">↗</span></Link>
      </header>

      <section className={styles.hero} aria-labelledby="hero-title">
        <div className={styles.heroImage} role="img" aria-label="আলো-ভরা পাঠাগারে বইয়ের সারি" />
        <div className={styles.heroContent}>
          <p className={styles.heroEyebrow}><span /> বাংলায় শুরু, পৃথিবীর পথে</p>
          <h1 id="hero-title">ভাষাসেতু</h1>
          <p className={styles.heroCopy}>বাংলা থেকেই শুরু হোক<br />নতুন ভাষার পথচলা।</p>
          <div className={styles.heroActions}>
            <Link className={styles.primaryAction} href={startHref}>{session ? "প্যানেলে যান" : "অ্যাকাউন্ট খুলুন"} <span aria-hidden="true">→</span></Link>
            <a className={styles.secondaryAction} href="#languages">ভাষাগুলো দেখুন <span aria-hidden="true">↓</span></a>
          </div>
        </div>
        <div className={styles.heroFoot}>
          <span>একটি নতুন ভাষা · অসংখ্য নতুন সংযোগ</span>
          <span className={styles.heroIndex}>ঢাকা <i>·</i> পৃথিবী</span>
        </div>
        <div className={styles.heroScripts} aria-hidden="true">
          <span>你好</span><span>こんにちは</span><span>Hallo</span><span>안녕</span><span>مرحبا</span>
        </div>
      </section>

      <section className={styles.languagesSection} id="languages" aria-labelledby="languages-title">
        <div className={styles.sectionIntro}>
          <p className={styles.eyebrow}><span>০১</span> পছন্দ তোমার</p>
          <h2 id="languages-title">পরিচিত ভাষার বাইরে,<br /> <em>অপেক্ষায় নতুন এক জগৎ।</em></h2>
          <p className={styles.sectionCopy}>নিজের ভাষায় শিখে নাও এমন একটি ভাষা, যা তোমার কাছে এখনো নতুন।</p>
        </div>
        <div className={styles.languageList}>
          {languages.map((language, index) => (
            <Link className={styles.languageItem} href={startHref} key={language.id}>
              <span className={styles.languageIndex}>{["০১", "০২", "০৩", "০৪", "০৫"][index]}</span>
              <span className={`${styles.languageScript} ${styles[`script${language.id}`]}`} lang={language.id}>{language.script}</span>
              <span className={styles.languageInfo}><strong>{language.name}</strong><small>{language.native}</small></span>
              <span className={styles.languageArrow} aria-hidden="true">↗</span>
            </Link>
          ))}
        </div>
      </section>

      {publishedContent.length > 0 && (
        <section className={styles.publicContent} aria-labelledby="published-title">
          <div className={styles.publicContentHeading}>
            <p className={styles.eyebrow}><span>০৩</span> নতুন পাঠ</p>
            <h2 id="published-title">শেখার টেবিলে <em>নতুন কী?</em></h2>
          </div>
          <div className={styles.publicContentList}>
            {publishedContent.map((item) => (
              <article className={styles.publicContentItem} key={item._id}>
                <span>{item.language.toUpperCase()} <i>·</i> {item.category}</span>
                <h3>{item.title}</h3>
                <p>{item.summary || item.body.slice(0, 180)}</p>
                <Link href={startHref}>শেখা শুরু করো <span aria-hidden="true">↗</span></Link>
              </article>
            ))}
          </div>
        </section>
      )}

      <section className={styles.approachSection} id="approach" aria-labelledby="approach-title">
        <div className={styles.approachHeading}>
          <p className={styles.eyebrow}><span>০২</span> ছোট ছোট ধাপ</p>
          <h2 id="approach-title">শেখা হোক<br /><em>তোমার নিজের ছন্দে।</em></h2>
        </div>
        <div className={styles.steps}>
          <article className={styles.step}>
            <span className={styles.stepNumber}>০১</span>
            <h3>একটি ভাষা বেছে নাও</h3>
            <p>যে ভাষাটি তোমার কৌতূহল জাগায়, সেখান থেকেই শুরু।</p>
          </article>
          <article className={styles.step}>
            <span className={styles.stepNumber}>০২</span>
            <h3>শব্দের সঙ্গে পরিচিত হও</h3>
            <p>বাংলা অর্থ জানো, উচ্চারণ শোনো, নিজের মতো করে মনে রাখো।</p>
          </article>
          <article className={styles.step}>
            <span className={styles.stepNumber}>০৩</span>
            <h3>ফিরে এসে অনুশীলন করো</h3>
            <p>প্রতিটি ছোট্ট প্রচেষ্টাই তোমাকে নতুন ভাষার কাছে নিয়ে যায়।</p>
          </article>
        </div>
      </section>

      <section className={styles.closing}>
        <div>
          <p className={styles.eyebrow}><span>ভাষাসেতু</span> · পরের শব্দটি তোমার</p>
          <h2>আজই শুরু হোক।</h2>
        </div>
        <Link className={styles.closingAction} href={startHref}>{session ? "প্যানেলে যাও" : "নিবন্ধন করে শুরু করো"} <span aria-hidden="true">→</span></Link>
      </section>

      <footer className={styles.footer}>
        <Link className={styles.footerBrand} href="/">ভাষাসেতু</Link>
        <span>তৃতীয় ভাষা শিক্ষা উদ্যোগের আলোকে তৈরি একটি শেখার প্রোটোটাইপ।</span>
        <Link href={panelHref}>শিক্ষার্থী প্যানেল ↗</Link>
      </footer>
    </main>
  );
}