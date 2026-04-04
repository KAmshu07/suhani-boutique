"use client";

export default function GlobalError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="en">
      <body style={{ fontFamily: "sans-serif", textAlign: "center", padding: "4rem" }}>
        <h1>Something went wrong</h1>
        <p>An unexpected error occurred. Please try again.</p>
        <button
          onClick={reset}
          style={{
            marginTop: "1rem",
            padding: "0.75rem 2rem",
            cursor: "pointer",
            borderRadius: "9999px",
            border: "none",
            backgroundColor: "#C4956A",
            color: "#FBF8F4",
          }}
        >
          Try Again
        </button>
      </body>
    </html>
  );
}
