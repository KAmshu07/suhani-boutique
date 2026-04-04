import Link from "next/link";

export default function NotFound() {
  return (
    <main className="flex flex-1 flex-col items-center justify-center gap-6 px-6 text-center">
      <h1 className="font-heading text-6xl font-bold text-gold">404</h1>
      <p className="font-heading text-xl font-semibold uppercase tracking-widest text-brown">
        Page not found
      </p>
      <p className="max-w-md text-brown-light">
        The page you are looking for does not exist or has been moved.
      </p>
      <Link
        href="/"
        className="rounded-full bg-gold px-8 py-3 font-body text-sm font-medium text-cream transition-opacity hover:opacity-90"
      >
        Back to Home
      </Link>
    </main>
  );
}
