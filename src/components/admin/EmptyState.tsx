// A guided empty state: a faded example block (so the screen demonstrates its
// own output) + a plain message + an optional primary action passed as children.
// Pure presentation — no hooks, usable inside any admin editor.

export default function EmptyState({
  message,
  children,
}: {
  message: string;
  children?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col items-center gap-4 rounded-xl border border-dashed border-brown-light/25 px-6 py-10 text-center">
      <div className="flex w-full max-w-xs flex-col gap-2 opacity-40" aria-hidden="true">
        <div className="h-3 w-2/3 rounded bg-brown-light/30" />
        <div className="h-3 w-full rounded bg-brown-light/20" />
        <div className="h-3 w-1/2 rounded bg-brown-light/20" />
      </div>
      <p className="text-base text-brown-light">{message}</p>
      {children}
    </div>
  );
}
