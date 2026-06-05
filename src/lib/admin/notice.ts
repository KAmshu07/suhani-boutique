// Centralized admin status-banner helpers. One place decides whether a banner
// reads as success or failure, and one place turns any thrown error into
// friendly, non-technical copy — the raw error is logged for the developer and
// never shown to the shop owner.

const ERROR_HINTS = ["problem", "fail", "can't", "cannot", "could not", "enter", "no phone"];

export function isErrorNotice(message: string): boolean {
  const m = message.toLowerCase();
  return ERROR_HINTS.some((hint) => m.includes(hint));
}

export function friendlyError(error: unknown, action = "save"): string {
  console.warn(`[admin] could not ${action}:`, error);
  return `Could not ${action} — please check your internet and try again.`;
}
