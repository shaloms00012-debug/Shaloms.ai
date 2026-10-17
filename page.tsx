 "use client";

import { useMemo, useState } from "react";

type Mode = "home" | "quiz" | "ask" | "books" | "progress";
type Subject = "S1 Mathematics" | "S2 Mathematics" | "S3 Mathematics" | "S3 Physics";
type Message = { role: "user" | "assistant"; text: string };

const subjects: Subject[] = ["S1 Mathematics", "S2 Mathematics", "S3 Mathematics", "S3 Physics"];

export default function Home() {
  const [mode, setMode] = useState<Mode>("home");
  const [subject, setSubject] = useState<Subject>("S3 Mathematics");
  const [question, setQuestion] = useState("");
  const [image, setImage] = useState<File | null>(null);
  const [answer, setAnswer] = useState("");
  const [busy, setBusy] = useState(false);
  const [quizCount, setQuizCount] = useState("5");
  const [difficulty, setDifficulty] = useState("Mixed");
  const [quiz, setQuiz] = useState<any[]>([]);
  const [choices, setChoices] = useState<Record<number, string>>({});
  const [graded, setGraded] = useState(false);
  const [score, setScore] = useState<number | null>(null);
  const [history, setHistory] = useState<Message[]>([
    { role: "assistant", text: "Muraho! I’m Shaloms AI. Ask me a Mathematics or Physics question and I’ll explain it step by step using the available textbooks." }
  ]);
  const [chatInput, setChatInput] = useState("");
  const [notice, setNotice] = useState("");

  const nav = [
    { id: "home" as Mode, icon: "⌂", label: "Home" },
    { id: "quiz" as Mode, icon: "✦", label: "Quizzes" },
    { id: "ask" as Mode, icon: "◉", label: "Ask a question" },
    { id: "progress" as Mode, icon: "▥", label: "My progress" },
    { id: "books" as Mode, icon: "▤", label: "Books" },
  ];

  async function askAI(text: string, file?: File | null) {
    if (!text.trim() && !file) return;
    setBusy(true); setAnswer(""); setNotice("");
    try {
      let imageData: string | undefined;
      if (file) {
        if (!file.type.startsWith("image/")) throw new Error("Please upload a photo or screenshot of the question.");
        if (file.size > 8 * 1024 * 1024) throw new Error("Please choose an image smaller than 8 MB.");
        imageData = await new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => resolve(String(reader.result));
          reader.onerror = reject;
          reader.readAsDataURL(file);
        });
      }
      const res = await fetch("/api/ask", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question: text, subject, imageData })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Something went wrong.");
      setAnswer(data.answer || "I couldn't find a clear answer. Try sending a clearer question.");
    } catch (e: any) { setNotice(e.message || "Could not get an answer."); }
    finally { setBusy(false); }
  }

  async function makeQuiz() {
    setBusy(true); setNotice(""); setQuiz([]); setChoices({}); setGraded(false); setScore(null);
    try {
      const res = await fetch("/api/quiz", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ subject, count: Number(quizCount), difficulty })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Could not generate quiz.");
      setQuiz(data.questions || []);
      if (!data.questions?.length) throw new Error("No questions were returned. Please try again.");
    } catch (e: any) { setNotice(e.message || "Could not generate quiz."); }
    finally { setBusy(false); }
  }

  function gradeQuiz() {
    const total = quiz.reduce((sum, q, i) => sum + (choices[i] === q.answer ? 1 : 0), 0);
    setScore(total); setGraded(true);
  }

  const progressPercent = useMemo(() => score === null ? 0 : Math.round((score / Math.max(quiz.length, 1)) * 100), [score, quiz.length]);

  async function sendChat() {
    const text = chatInput.trim();
    if (!text) return;
    setHistory(prev => [...prev, { role: "user", text }]);
    setChatInput("");
    setBusy(true); setNotice("");
    try {
      const res = await fetch("/api/ask", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question: text, subject })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Could not get an answer.");
      setHistory(prev => [...prev, { role: "assistant", text: data.answer }]);
    } catch (e: any) { setNotice(e.message || "Could not get an answer."); }
    finally { setBusy(false); }
  }

  return <main className="app-shell">
    <header className="topbar">
      <button className="brand" onClick={() => setMode("home")} aria-label="Shaloms AI home">
        <span className="brand-mark">✦<small>▱</small></span>
        <span>Shaloms <b>AI</b></span>
      </button>
      <nav className="nav-links">
        {nav.map(item => <button key={item.id} className={mode === item.id ? "nav-item active" : "nav-item"} onClick={() => setMode(item.id)}>
          <span>{item.icon}</span>{item.label}
        </button>)}
      </nav>
      <span className="student-pill"><span className="online-dot" /> Student space</span>
    </header>

    <section className="hero">
      <div className="hero-copy">
        <div className="eyebrow"><span className="sparkle">✦</span> YOUR PERSONAL STUDY PARTNER</div>
        <h1>Learn smarter.<br/><span className="gradient-text">Practice better.</span></h1>
        <p className="hero-sub">Your AI study companion for <strong>Mathematics</strong> and <strong className="purple">Physics</strong>.</p>
        <div className="welcome">
          <div className="welcome-icon">✦</div>
          <p><b>Welcome!</b> This AI was created by <strong>Shema</strong>, a student at <strong>GS Kabasare</strong>, with the aid of <strong>Teacher Prosper</strong>.</p>
        </div>
        <div className="hero-actions">
          <button className="btn primary" onClick={() => setMode("quiz")}>Start learning <span>→</span></button>
          <button className="btn ghost" onClick={() => setMode("ask")}>Ask a question <span>↗</span></button>
        </div>
      </div>
      <div className="portrait-wrap">
        <div className="portrait-glow" />
        <img src="/shalom-portrait.jpg" alt="Portrait provided for Shaloms AI" className="portrait" />
        <div className="portrait-tag">Made for learners<br/><b>in Rwanda 🇷🇼</b></div>
        <div className="floating-note">Learn today.<br/><b>Lead tomorrow.</b></div>
      </div>
      <div className="hero-decoration deco-one">◇</div><div className="hero-decoration deco-two">✳</div>
    </section>

    <section className="subject-row">
      <div><span className="section-kicker">LET'S GET STARTED</span><h2>What would you like to do?</h2></div>
      <label className="subject-picker">Your class / subject
        <select value={subject} onChange={e => setSubject(e.target.value as Subject)}>
          {subjects.map(s => <option key={s}>{s}</option>)}
        </select>
      </label>
    </section>

    {notice && <div className="notice" role="alert"><span>ⓘ</span>{notice}<button onClick={() => setNotice("")}>×</button></div>}

    {mode === "home" && <section className="feature-grid">
      <article className="feature-card teal-card"><div className="card-top"><div className="card-icon">?</div><span className="card-label">PRACTISE</span></div><h3>Take a quiz</h3><p>Test your knowledge with practice questions and get instant marking with explanations.</p><button onClick={() => setMode("quiz")} className="card-link">Start quiz <span>→</span></button><div className="card-art">∑</div></article>
      <article className="feature-card purple-card"><div className="card-top"><div className="card-icon">↑</div><span className="card-label">GET HELP</span></div><h3>Upload a question</h3><p>Type a problem or upload a clear photo and learn how to solve it step by step.</p><button onClick={() => setMode("ask")} className="card-link">Ask Shaloms AI <span>→</span></button><div className="card-art">▤</div></article>
      <article className="feature-card gold-card"><div className="card-top"><div className="card-icon">▤</div><span className="card-label">EXPLORE</span></div><h3>Explore textbooks</h3><p>Study with your uploaded REB books for S1, S2 and S3 Mathematics and S3 Physics.</p><button onClick={() => setMode("books")} className="card-link">Browse books <span>→</span></button><div className="card-art">▱</div></article>
    </section>}

    {mode === "quiz" && <section className="workspace">
      <div className="workspace-heading"><div><span className="section-kicker">PRACTICE ZONE</span><h2>Quiz time <span>✦</span></h2><p>Try your best. Every question is a chance to learn.</p></div><div className="round-icon">✎</div></div>
      <div className="quiz-controls">
        <label>Subject<select value={subject} onChange={e => setSubject(e.target.value as Subject)}>{subjects.map(s => <option key={s}>{s}</option>)}</select></label>
        <label>Number of questions<select value={quizCount} onChange={e => setQuizCount(e.target.value)}><option value="5">5 questions</option><option value="10">10 questions</option><option value="15">15 questions</option></select></label>
        <label>Difficulty<select value={difficulty} onChange={e => setDifficulty(e.target.value)}><option>Mixed</option><option>Easy</option><option>Medium</option><option>Hard</option></select></label>
        <button className="btn primary" onClick={makeQuiz} disabled={busy}>{busy ? "Preparing…" : "Generate quiz ✦"}</button>
      </div>
      {quiz.length > 0 && <div className="quiz-list">{quiz.map((q, i) => <article className="question-card" key={i}>
        <div className="question-number">QUESTION {String(i+1).padStart(2,"0")}</div><h3>{q.question}</h3>
        <div className="options">{(q.options || []).map((option: string, j: number) => <label key={j} className={choices[i] === option ? "option selected" : "option"}><input type="radio" name={`q-${i}`} checked={choices[i] === option} disabled={graded} onChange={() => setChoices(p => ({...p, [i]: option}))}/><span className="option-letter">{String.fromCharCode(65+j)}</span>{option}</label>)}</div>
        {graded && <div className={choices[i] === q.answer ? "feedback correct" : "feedback incorrect"}><b>{choices[i] === q.answer ? "Correct!" : `Correct answer: ${q.answer}`}</b><p>{q.explanation}</p></div>}
      </article>)}
      <div className="quiz-submit">{graded ? <div className="score-panel"><strong>Your score: {score}/{quiz.length} ({progressPercent}%)</strong><button className="btn primary" onClick={makeQuiz}>Try another quiz ↻</button></div> : <button className="btn primary" onClick={gradeQuiz}>Submit and mark answers ✓</button>}</div></div>}
      {quiz.length === 0 && <div className="empty-state"><div>✦</div><h3>Your next breakthrough starts here.</h3><p>Choose your subject and generate a quiz based on your study books.</p></div>}
    </section>}

    {mode === "ask" && <section className="workspace">
      <div className="workspace-heading"><div><span className="section-kicker">AI QUESTION HELPER</span><h2>Let's solve it together <span>✦</span></h2><p>Ask about a textbook topic, paste a question, or upload a photo.</p></div><div className="round-icon">?</div></div>
      <div className="ask-layout">
        <div className="ask-form">
          <label className="field-label">Selected subject</label>
          <select value={subject} onChange={e => setSubject(e.target.value as Subject)}>{subjects.map(s => <option key={s}>{s}</option>)}</select>
          <label className="field-label" htmlFor="question">Write your question</label>
          <textarea id="question" value={question} onChange={e => setQuestion(e.target.value)} placeholder="Example: Explain Pythagoras' theorem and solve a sample question…" rows={6}/>
          <label className="upload-zone"><span className="upload-symbol">↑</span><b>{image ? image.name : "Upload a question photo"}</b><small>JPG, PNG or WEBP · max 8 MB</small><input type="file" accept="image/*" onChange={e => setImage(e.target.files?.[0] || null)}/></label>
          <button className="btn primary full" onClick={() => askAI(question, image)} disabled={busy || (!question.trim() && !image)}>{busy ? "Working on your answer…" : "Explain my question ✦"}</button>
        </div>
        <div className="answer-panel"><div className="answer-header"><span className="answer-star">✦</span><div><b>Shaloms AI explains</b><small>Textbook-guided learning</small></div><span className="ai-badge">AI</span></div>
          {answer ? <div className="answer-content">{answer}</div> : <div className="empty-answer"><div className="big-bulb">✧</div><h3>Your explanation will appear here</h3><p>We’ll aim to show the method, the working, and the final answer — so you understand the “why”, too.</p><div className="answer-tip">✦ Tip: include all numbers and diagrams in your photo.</div></div>}
        </div>
      </div>
    </section>}

    {mode === "books" && <section className="workspace">
      <div className="workspace-heading"><div><span className="section-kicker">YOUR STUDY LIBRARY</span><h2>Books that power your learning <span>✦</span></h2><p>Shaloms AI is set up to use these uploaded study books as its knowledge base.</p></div><div className="round-icon">▤</div></div>
      <div className="book-grid">{[
        {name:"Senior 1 Mathematics",tag:"S1 · MATHEMATICS",color:"book-blue",desc:"Sets, numbers, linear equations, ratio, statistics and probability."},
        {name:"Senior 2 Mathematics",tag:"S2 · MATHEMATICS",color:"book-purple",desc:"Indices, surds, polynomials, equations, vectors and geometry."},
        {name:"Senior 3 Mathematics",tag:"S3 · MATHEMATICS",color:"book-teal",desc:"Quadratic equations, number bases, functions, geometry and probability."},
        {name:"Senior 3 Physics",tag:"S3 · PHYSICS",color:"book-gold",desc:"Circular motion, momentum, heat, electricity, optics and electronics."}
      ].map((b, i) => <article className="book-card" key={b.name}><div className={`book-cover ${b.color}`}><span>REB • STUDENT BOOK</span><div className="book-symbol">{["∑","x²","△","ϟ"][i]}</div><strong>{b.name}</strong><small>RWANDA</small></div><div className="book-details"><span className="book-tag">{b.tag}</span><h3>{b.name}</h3><p>{b.desc}</p><button className="text-button" onClick={() => {setSubject(subjects[i]);setMode("ask")}}>Ask about this book →</button></div></article>)}</div>
      <p className="source-note">Answers should be checked against your teacher’s guidance and the exact wording of your textbook, especially where a diagram or page is unclear.</p>
    </section>}

    {mode === "progress" && <section className="workspace">
      <div className="workspace-heading"><div><span className="section-kicker">YOUR GROWTH</span><h2>Small steps. Big progress. <span>✦</span></h2><p>Keep practising — consistency is a superpower.</p></div><div className="round-icon">↗</div></div>
      <div className="progress-grid"><div className="progress-card"><span className="metric-icon teal">✓</span><div><small>Latest quiz score</small><h3>{score === null ? "Not yet" : `${score}/${quiz.length}`}</h3><p>{score === null ? "Take a quiz to record a result." : `${progressPercent}% on your latest quiz`}</p></div></div><div className="progress-card"><span className="metric-icon purple">✦</span><div><small>Study focus</small><h3>{subject}</h3><p>Selected learning area</p></div></div><div className="progress-card"><span className="metric-icon gold">◎</span><div><small>Learning mindset</small><h3>Keep going!</h3><p>Every mistake can teach you something.</p></div></div></div>
      <div className="empty-state"><div>↗</div><h3>Your learning journey is just beginning.</h3><p>This starter version keeps progress in the current session. Add accounts and a database to save scores across devices.</p><button className="btn primary" onClick={() => setMode("quiz")}>Take a quiz →</button></div>
    </section>}

    <footer className="footer"><div className="footer-brand">✦ Shaloms <b>AI</b></div><p>Built for curious minds and a brighter learning future in Rwanda.</p><span>Learn • Practise • Grow</span></footer>
  </main>;
}
