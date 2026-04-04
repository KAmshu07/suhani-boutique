"use client";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <main className="flex flex-1 flex-col items-center justify-center gap-6 px-6 text-center">
      <h1 className="font-heading text-2xl font-semibold uppercase tracking-widest text-brown">
        Something went wrong
      </h1>
      <p className="max-w-md text-brown-light">
        {error.message || "An unexpected error occurred. Please try again."}
      </p>
      <button
        onClick={reset}
        className="rounded-full bg-gold px-8 py-3 font-body text-sm font-medium text-cream transition-opacity hover:opacity-90"
      >
        Try Again
      </button>
    </main>
  );
}
