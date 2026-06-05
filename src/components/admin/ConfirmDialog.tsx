"use client";

import { createContext, useCallback, useContext, useEffect, useState } from "react";
import { ADMIN_BTN } from "@/data/constants";
import { XIcon } from "@/components/icons";

// Promise-based, in-app replacement for window.confirm. A single dialog is
// rendered by ConfirmProvider; useConfirm() returns a function that resolves
// true/false. The `body` is where callers SHOW what will be affected
// (order #, customer name, garment) instead of an abstract sentence.

export type ConfirmOptions = {
  title: string;
  body?: React.ReactNode;
  confirmLabel?: string;
  cancelLabel?: string;
  danger?: boolean;
};

type ConfirmFn = (opts: ConfirmOptions) => Promise<boolean>;

const ConfirmContext = createContext<ConfirmFn | null>(null);

export function useConfirm(): ConfirmFn {
  const fn = useContext(ConfirmContext);
  if (!fn) throw new Error("useConfirm must be used within ConfirmProvider");
  return fn;
}

type Pending = { opts: ConfirmOptions; resolve: (value: boolean) => void };

export function ConfirmProvider({ children }: { children: React.ReactNode }) {
  const [pending, setPending] = useState<Pending | null>(null);

  const confirm = useCallback<ConfirmFn>((opts) => {
    return new Promise<boolean>((resolve) => setPending({ opts, resolve }));
  }, []);

  const close = useCallback(
    (result: boolean) => {
      setPending((current) => {
        if (current) current.resolve(result);
        return null;
      });
    },
    [],
  );

  useEffect(() => {
    if (!pending) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") close(false);
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [pending, close]);

  return (
    <ConfirmContext.Provider value={confirm}>
      {children}
      {pending && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={pending.opts.title}
          className="fixed inset-0 z-50 flex items-center justify-center bg-brown/40 p-4"
          onClick={() => close(false)}
        >
          <div
            className="w-full max-w-sm rounded-xl bg-cream p-5 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-3">
              <h2 className="font-heading text-lg font-semibold text-brown">{pending.opts.title}</h2>
              <button
                onClick={() => close(false)}
                aria-label="Close"
                className="rounded-full p-1.5 text-brown-light hover:bg-cream-alt"
              >
                <XIcon className="h-5 w-5" />
              </button>
            </div>
            {pending.opts.body != null && (
              <div className="mt-3 text-base text-brown-light">{pending.opts.body}</div>
            )}
            <div className="mt-5 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
              <button autoFocus onClick={() => close(false)} className={ADMIN_BTN.SECONDARY}>
                {pending.opts.cancelLabel ?? "Cancel"}
              </button>
              <button
                onClick={() => close(true)}
                className={pending.opts.danger ? ADMIN_BTN.DANGER : ADMIN_BTN.PRIMARY}
              >
                {pending.opts.confirmLabel ?? "OK"}
              </button>
            </div>
          </div>
        </div>
      )}
    </ConfirmContext.Provider>
  );
}
