
export default function Home() {
  return (
    <main style={{
      minHeight: "100vh",
      background: "#0f172a",
      color: "white",
      fontFamily: "Arial, sans-serif",
      padding: "40px 20px",
      textAlign: "center"
    }}>
      <h1>Shaloms AI</h1>
      <p>Your AI-powered learning assistant</p>

      <section style={{
        background: "#1e293b",
        padding: "24px",
        borderRadius: "16px",
        maxWidth: "500px",
        margin: "30px auto"
      }}>
        <h2>Quiz Generator</h2>
        <p>Generate quizzes and test your knowledge.</p>
        <button
          style={{
            background: "#38bdf8",
            color: "#0f172a",
            border: "none",
            padding: "12px 20px",
            borderRadius: "8px",
            fontWeight: "bold"
          }}
          onClick={() => alert("Welcome to Shaloms AI!")}
        >
          Get Started
        </button>
      </section>
    </main>
  );
            }
