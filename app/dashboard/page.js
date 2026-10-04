"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";
import { LANGUAGES, UNITS } from "../lessons";

const STORAGE_KEY = "bhashasetu-next-v1";
const DEFAULT_PROGRESS = {
  xp: 0,
  streak: 0,
  lastDay: null,
  known: {},
  lang: "zh",
  unit: "greet",
};
const bn = (value) => String(value).replace(/\d/g, (digit) => "০১২৩৪৫৬৭৮৯"[digit]);
const shuffle = (items) => {
  const result = [...items];
  for (let index = result.length - 1; index > 0; index -= 1) {
    const next = Math.floor(Math.random() * (index + 1));
    [result[index], result[next]] = [result[next], result[index]];
  }
  return result;
};

function awardPoints(progress, points) {
  const today = new Date();
  const todayKey = `${today.getFullYear()}-${today.getMonth() + 1}-${today.getDate()}`;
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayKey = `${yesterday.getFullYear()}-${yesterday.getMonth() + 1}-${yesterday.getDate()}`;
  const streak = progress.lastDay === todayKey
    ? progress.streak
    : progress.lastDay === yesterdayKey
      ? progress.streak + 1
      : 1;

  return { ...progress, xp: progress.xp + points, streak, lastDay: todayKey };
}

export default function Home() {
  const router = useRouter();
  const { data: session, isPending: sessionPending } = authClient.useSession();
  const storageKey = session?.user?.id ? `${STORAGE_KEY}:${session.user.id}` : null;
  const [progress, setProgress] = useState(DEFAULT_PROGRESS);
  const [ready, setReady] = useState(false);
  const [index, setIndex] = useState(0);
  const [revealed, setRevealed] = useState(false);
  const [mode, setMode] = useState("learn");
  const [quiz, setQuiz] = useState(null);
  const [speechMessage, setSpeechMessage] = useState("");

  useEffect(() => {
    if (sessionPending || !storageKey) return undefined;
    const timer = window.setTimeout(() => {
      try {
        const saved = window.localStorage.getItem(storageKey);
        if (saved) {
          const parsed = JSON.parse(saved);
          setProgress({ ...DEFAULT_PROGRESS, ...parsed, known: parsed.known || {} });
        }
      } catch {
        window.localStorage.removeItem(storageKey);
      }
      setReady(true);
    }, 0);
    return () => window.clearTimeout(timer);
  }, [sessionPending, storageKey]);

  useEffect(() => {
    if (ready && storageKey) window.localStorage.setItem(storageKey, JSON.stringify(progress));
  }, [progress, ready, storageKey]);

  async function signOut() {
    const result = await authClient.signOut();
    if (result.error) return;
    router.replace("/login");
    router.refresh();
  }

  const language = LANGUAGES.find((item) => item.id === progress.lang) || LANGUAGES[0];
  const unit = UNITS.find((item) => item.id === progress.unit) || UNITS[0];
  const itemIndex = Math.min(index, unit.items.length - 1);
  const phrase = language.lessons[unit.id][itemIndex];
  const translation = unit.items[itemIndex];
  const knownKey = `${language.id}:${unit.id}:${itemIndex}`;
  const isKnown = Boolean(progress.known[knownKey]);
  const learnedInUnit = unit.items.reduce(
    (total, _item, itemNumber) => total + Number(Boolean(progress.known[`${language.id}:${unit.id}:${itemNumber}`])),
    0,
  );
  const learnedTotal = Object.values(progress.known).filter(Boolean).length;

  function chooseLanguage(id) {
    setProgress((current) => ({ ...current, lang: id }));
    setIndex(0);
    setRevealed(false);
    setQuiz(null);
    setMode("learn");
  }

  function chooseUnit(id) {
    setProgress((current) => ({ ...current, unit: id }));
    setIndex(0);
    setRevealed(false);
    setQuiz(null);
    setMode("learn");
  }

  function moveCard(direction) {
    setIndex((current) => Math.max(0, Math.min(unit.items.length - 1, current + direction)));
    setRevealed(false);
  }

  function markKnown() {
    setProgress((current) => {
      const known = { ...current.known };
      if (known[knownKey]) {
        delete known[knownKey];
        return { ...current, known };
      }
      known[knownKey] = true;
      return awardPoints({ ...current, known }, 5);
    });
    if (!isKnown && itemIndex < unit.items.length - 1) {
      setIndex(itemIndex + 1);
      setRevealed(false);
    }
  }

  function startQuiz() {
    const questions = shuffle(unit.items.map((_item, questionIndex) => questionIndex)).map(
      (questionIndex, questionNumber) => ({
        index: questionIndex,
        direction: questionNumber % 2 === 0 ? "toBn" : "toTarget",
        options: shuffle([
          questionIndex,
          ...shuffle(unit.items.map((_item, optionIndex) => optionIndex).filter((optionIndex) => optionIndex !== questionIndex)).slice(0, 3),
        ]),
      }),
    );
    setQuiz({ questions, at: 0, score: 0, answered: false, selected: null });
    setMode("quiz");
    setRevealed(false);
  }

  function answerQuiz(option) {
    if (!quiz || quiz.answered) return;
    const question = quiz.questions[quiz.at];
    const correct = option === question.index;
    setQuiz((current) => ({
      ...current,
      answered: true,
      selected: option,
      score: current.score + Number(correct),
    }));
    if (correct) setProgress((current) => awardPoints(current, 10));
  }

  function speak(text) {
    if (!("speechSynthesis" in window)) {
      setSpeechMessage("এই ব্রাউজারে উচ্চারণ শোনার সুবিধা নেই।");
      return;
    }
    const utterance = new SpeechSynthesisUtterance(text.replace(/…/g, " "));
    utterance.lang = language.tts;
    utterance.rate = 0.85;
    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(utterance);
    setSpeechMessage("");
  }

  function resetProgress() {
    if (!window.confirm("সব শব্দ, পয়েন্ট ও দিনের ধারা মুছে ফেলবেন?")) return;
    setProgress({ ...DEFAULT_PROGRESS, lang: language.id, unit: unit.id });
    setIndex(0);
    setRevealed(false);
    setQuiz(null);
    setMode("learn");
  }

  useEffect(() => {
    function onKeyDown(event) {
      if (mode !== "learn" || event.target.closest("button, input, textarea, select")) return;
      if (event.key === "ArrowRight") {
        setIndex((current) => Math.min(unit.items.length - 1, current + 1));
        setRevealed(false);
      }
      if (event.key === "ArrowLeft") {
        setIndex((current) => Math.max(0, current - 1));
        setRevealed(false);
      }
      if (event.code === "Space") {
        event.preventDefault();
        setRevealed((current) => !current);
      }
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [mode, unit.items.length]);

  const completedQuiz = quiz && quiz.at >= quiz.questions.length;
  const currentQuestion = quiz && !completedQuiz ? quiz.questions[quiz.at] : null;
  const quizPrompt = currentQuestion?.direction === "toBn"
    ? language.lessons[unit.id][currentQuestion.index][0]
    : unit.items[currentQuestion?.index || 0][0];

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <Link className="brand" href="/" aria-label="ভাষাসেতু হোম">
          <span className="brand-mark">ভা</span>
          <span className="brand-copy"><strong>ভাষাসেতু</strong><small>ভাষা শেখার নোটবুক</small></span>
        </Link>

        <div className="side-section">
          <p className="eyebrow side-eyebrow">তোমার ভাষা</p>
          <nav className="language-list" aria-label="ভাষা বেছে নিন">
            {LANGUAGES.map((item) => (
              <button
                className={`language-option ${item.id === language.id ? "is-active" : ""}`}
                key={item.id}
                onClick={() => chooseLanguage(item.id)}
                aria-pressed={item.id === language.id}
              >
                <span className={`language-glyph script-${item.id}`} lang={item.tts}>{item.glyph}</span>
                <span className="language-names"><strong>{item.bn}</strong><small>{item.native}</small></span>
                {item.id === language.id && <span className="active-dot" aria-hidden="true" />}
              </button>
            ))}
          </nav>
        </div>

        <div className="side-section unit-section">
          <p className="eyebrow side-eyebrow">পাঠের বিষয়</p>
          <nav className="unit-list" aria-label="পাঠ বেছে নিন">
            {UNITS.map((item, unitNumber) => {
              const count = item.items.reduce(
                (total, _lesson, lessonIndex) => total + Number(Boolean(progress.known[`${language.id}:${item.id}:${lessonIndex}`])),
                0,
              );
              return (
                <button
                  className={`unit-option ${item.id === unit.id ? "is-active" : ""}`}
                  key={item.id}
                  onClick={() => chooseUnit(item.id)}
                  aria-pressed={item.id === unit.id}
                >
                  <span className="unit-number">{bn(unitNumber + 1)}</span>
                  <span className="unit-name">{item.bn}</span>
                  <span className="unit-count">{bn(count)}/{bn(item.items.length)}</span>
                </button>
              );
            })}
          </nav>
        </div>

        <div className="sidebar-bottom">
          <span className="side-spark" aria-hidden="true">✳</span>
          <p>একটি শব্দ, এক ধাপ এগিয়ে।</p>
          <span>তোমার অগ্রগতি শুধু এই ব্রাউজারেই থাকে।</span>
        </div>
      </aside>

      <main className="workspace" id="main">
        <header className="topbar">
          <div className="breadcrumb"><span>আমার পড়াশোনা</span><span aria-hidden="true">/</span><strong>{language.bn}</strong></div>
          <div className="topbar-account">
            <span className="account-name" title={session?.user?.email}>{session?.user?.name}</span>
            <button className="reset-button" onClick={signOut}>সাইন আউট</button>
            <button className="reset-button" onClick={resetProgress}>অগ্রগতি মুছুন</button>
          </div>
        </header>

        <div className="page-content">
          <section className="welcome-row" aria-labelledby="welcome-title">
            <div className="welcome-copy">
              <p className="eyebrow coral-eyebrow"><span className="eyebrow-line" /> প্রতিদিন একটু করে</p>
              <h1 id="welcome-title">নতুন শব্দে,<br /><em>নতুন দিগন্ত।</em></h1>
              <p className="welcome-description">বাংলায় শিখুন {language.bn}। ছোট্ট একটি পাঠ, আরেকটু বড় পৃথিবী।</p>
              <div className="welcome-meta"><span className="live-dot" /> আজকের পাঠ <strong>{unit.bn}</strong></div>
            </div>
            <div className="study-photo" role="img" aria-label="বইয়ে ভরা শান্ত একটি পাঠাগার">
              <span className="photo-caption">শব্দের ওপারে<br /><strong>আরেকটি পৃথিবী</strong></span>
              <span className="photo-index">ভাষাসেতু · ০০১</span>
            </div>
          </section>

          <section className="stats-strip" aria-label="তোমার শেখার পরিসংখ্যান">
            <div className="stat-item"><span className="stat-label">মোট পয়েন্ট</span><strong>{bn(progress.xp)}</strong><span className="stat-detail">শেখার প্রতিটি ধাপে</span></div>
            <div className="stat-item"><span className="stat-label">দিনের ধারা</span><strong>{bn(progress.streak)} <small>দিন</small></strong><span className="stat-detail">আজ একটু সময় দাও</span></div>
            <div className="stat-item"><span className="stat-label">শেখা শব্দ</span><strong>{bn(learnedTotal)}</strong><span className="stat-detail">পাঁচটি ভাষায় তোমার সংগ্রহ</span></div>
          </section>

          <section className="lesson-section" aria-labelledby="lesson-title">
            <div className="lesson-heading">
              <div>
                <p className="eyebrow section-eyebrow">তোমার শেখার জায়গা</p>
                <h2 id="lesson-title">{unit.bn}</h2>
                <p className="lesson-subtitle">{language.bn} · {bn(unit.items.length)}টি শব্দ ও বাক্য</p>
              </div>
              <div className="mode-switch" role="group" aria-label="শেখার ধরন">
                <button className={mode === "learn" ? "is-selected" : ""} onClick={() => { setMode("learn"); setQuiz(null); }} aria-pressed={mode === "learn"}>শিখি</button>
                <button className={mode === "quiz" ? "is-selected" : ""} onClick={startQuiz} aria-pressed={mode === "quiz"}>অনুশীলন</button>
              </div>
            </div>

            <div className="lesson-layout">
              <section className="study-area" aria-live="polite">
                {mode === "learn" ? (
                  <article className="flashcard">
                    <div className="card-topline">
                      <span>শব্দ <strong>{bn(itemIndex + 1)}</strong> <i>/</i> {bn(unit.items.length)}</span>
                      {isKnown && <span className="mastered-label"><span /> শেখা হয়েছে</span>}
                    </div>
                    <div className="phrase-area">
                      <span className="phrase-label">{language.bn} ভাষায়</span>
                      <p className={`target-phrase script-${language.id}`} dir={language.dir} lang={language.tts}>{phrase[0]}</p>
                      <p className="romanization" dir={language.id === "ar" ? "rtl" : "ltr"}>{phrase[1]}</p>
                    </div>
                    <div className="meaning-area">
                      <div className="meaning-heading"><span>বাংলা অর্থ</span><button className="reveal-button" onClick={() => setRevealed((current) => !current)} aria-expanded={revealed}>{revealed ? "অর্থ লুকান" : "অর্থ দেখুন"}</button></div>
                      <div className={`meaning-copy ${revealed ? "is-visible" : ""}`}>
                        <p>{translation[0]}</p>
                        <span>{translation[1]}</span>
                      </div>
                    </div>
                    <div className="card-footer">
                      <button className="listen-button" onClick={() => speak(phrase[0])}><span aria-hidden="true">♫</span> উচ্চারণ শুনুন</button>
                      <div className="card-controls">
                        <button className="step-button" onClick={() => moveCard(-1)} disabled={itemIndex === 0}>← <span>আগের</span></button>
                        <button className={`know-button ${isKnown ? "is-known" : ""}`} onClick={markKnown}>{isKnown ? "আবার দেখব" : "শিখেছি"}</button>
                        <button className="step-button next-step" onClick={() => moveCard(1)} disabled={itemIndex === unit.items.length - 1}><span>পরের</span> →</button>
                      </div>
                    </div>
                    {speechMessage && <p className="speech-message" role="status">{speechMessage}</p>}
                  </article>
                ) : completedQuiz ? (
                  <article className="quiz-card quiz-result">
                    <p className="eyebrow coral-eyebrow">এই পাঠের ফল</p>
                    <div className="result-score">{bn(quiz.score)}<span> / {bn(quiz.questions.length)}</span></div>
                    <h3>{quiz.score === quiz.questions.length ? "দারুণ হয়েছে!" : quiz.score >= quiz.questions.length / 2 ? "ভালো এগোচ্ছো।" : "আরেকবার চেষ্টা করো।"}</h3>
                    <p className="result-copy">{quiz.score === quiz.questions.length ? "এই পাঠের প্রতিটি উত্তর ঠিক হয়েছে।" : "ফ্ল্যাশকার্ডগুলো আরেকবার দেখলে শব্দগুলো আরও মনে থাকবে।"}</p>
                    <div className="result-actions"><button className="listen-button" onClick={() => { setMode("learn"); setQuiz(null); }}>শিখি মোডে ফিরি</button><button className="know-button" onClick={startQuiz}>আবার অনুশীলন</button></div>
                  </article>
                ) : currentQuestion ? (
                  <article className="quiz-card">
                    <div className="card-topline"><span>প্রশ্ন <strong>{bn(quiz.at + 1)}</strong> <i>/</i> {bn(quiz.questions.length)}</span><span className="quiz-score">{bn(quiz.score)} পয়েন্ট</span></div>
                    <div className="quiz-progress"><span style={{ width: `${(quiz.at / quiz.questions.length) * 100}%` }} /></div>
                    <p className="quiz-instruction">{currentQuestion.direction === "toBn" ? "এর বাংলা অর্থ কোনটি?" : `${language.bn} ভাষায় কোনটি সঠিক?`}</p>
                    <p className={`quiz-prompt ${currentQuestion.direction === "toBn" ? `script-${language.id}` : ""}`} dir={currentQuestion.direction === "toBn" ? language.dir : "ltr"} lang={currentQuestion.direction === "toBn" ? language.tts : "bn"}>{quizPrompt}</p>
                    <div className="answer-list">
                      {currentQuestion.options.map((option) => {
                        const correct = option === currentQuestion.index;
                        const selected = quiz.selected === option;
                        const answerText = currentQuestion.direction === "toBn" ? unit.items[option][0] : language.lessons[unit.id][option][0];
                        return <button key={option} className={`answer-option ${quiz.answered && correct ? "is-correct" : ""} ${quiz.answered && selected && !correct ? "is-wrong" : ""}`} onClick={() => answerQuiz(option)} disabled={quiz.answered} dir={currentQuestion.direction === "toTarget" ? language.dir : "ltr"} lang={currentQuestion.direction === "toTarget" ? language.tts : "bn"}><span className="answer-marker" />{answerText}</button>;
                      })}
                    </div>
                    <div className={`quiz-feedback ${quiz.answered ? (quiz.selected === currentQuestion.index ? "is-correct" : "is-wrong") : ""}`} aria-live="polite">
                      {quiz.answered && (quiz.selected === currentQuestion.index ? "ঠিক উত্তর!" : `সঠিক উত্তর: ${currentQuestion.direction === "toBn" ? unit.items[currentQuestion.index][0] : language.lessons[unit.id][currentQuestion.index][0]}`)}
                    </div>
                    <div className="quiz-footer"><span>{quiz.answered ? "চালিয়ে যেতে প্রস্তুত?" : "একটি উত্তর বেছে নাও"}</span><button className="know-button" onClick={() => setQuiz((current) => ({ ...current, at: current.at + 1, answered: false, selected: null }))} disabled={!quiz.answered}>{quiz.at === quiz.questions.length - 1 ? "ফল দেখুন" : "পরের প্রশ্ন →"}</button></div>
                  </article>
                ) : null}
                {mode === "learn" && <p className="keyboard-hint">শব্দ বদলাতে ← → চাপো <span>·</span> অর্থ দেখতে স্পেসবার</p>}
              </section>

              <aside className="lesson-aside" aria-label="পাঠের অগ্রগতি">
                <section className="progress-panel">
                  <div className="panel-heading"><span className="progress-mark" aria-hidden="true">✳</span><span>এই পাঠে</span></div>
                  <p className="progress-numbers"><strong>{bn(learnedInUnit)}</strong><span> / {bn(unit.items.length)} শব্দ</span></p>
                  <div className="progress-track"><span style={{ width: `${(learnedInUnit / unit.items.length) * 100}%` }} /></div>
                  <p className="progress-caption">{learnedInUnit === unit.items.length ? "পাঠটি সম্পূর্ণ হয়েছে!" : `আর ${bn(unit.items.length - learnedInUnit)}টি শব্দ শিখলেই পাঠ শেষ`}</p>
                </section>
                <section className="note-panel">
                  <span className="note-index">ছোট্ট অভ্যাস</span>
                  <p>শুধু পড়ো না,<br /><em>উচ্চারণও শোনো।</em></p>
                  <span className="note-rule" />
                  <span className="note-foot">শুনে শেখা সহজে মনে থাকে</span>
                </section>
                <p className="source-note">তৃতীয় ভাষা শিক্ষা উদ্যোগের আলোকে তৈরি একটি শেখার প্রোটোটাইপ।</p>
              </aside>
            </div>
          </section>

          <footer className="page-footer"><span>ভাষাসেতু <i>·</i> শিখি, শুনি, এগিয়ে যাই</span><span>তোমার শেখা, তোমারই যাত্রা</span></footer>
        </div>
      </main>
    </div>
  );
}
