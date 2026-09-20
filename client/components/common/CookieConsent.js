"use client";

import { useState, useSyncExternalStore } from "react";

const STORAGE_KEY = "ai-interview-prep-cookie-consent";

export default function CookieConsent() {
  const visible = useSyncExternalStore((onChange) => { window.addEventListener("storage", onChange); window.addEventListener("cookie-preferences-reset", onChange); window.addEventListener("cookie-consent-updated", onChange); return () => { window.removeEventListener("storage", onChange); window.removeEventListener("cookie-preferences-reset", onChange); window.removeEventListener("cookie-consent-updated", onChange); }; }, () => window.localStorage.getItem(STORAGE_KEY) === null, () => false);
  const [preferencesOpen, setPreferencesOpen] = useState(false);

  function save(value) {
    window.localStorage.setItem(STORAGE_KEY, value);
    window.dispatchEvent(new Event("cookie-consent-updated"));
    setPreferencesOpen(false);
  }

  if (!visible) return null;

  return <div className="cookie-consent" role="dialog" aria-modal="false" aria-labelledby="cookie-title">
    <div>
      <p className="eyebrow">Privacy controls</p>
      <h2 id="cookie-title" className="mt-2 text-lg font-bold">A small note about cookies</h2>
      <p className="mt-2 max-w-xl text-sm leading-6 text-[var(--muted)]">Essential cookies keep authentication and the workspace working. This app does not use analytics or marketing cookies.</p>
      {preferencesOpen && <div className="mt-4 rounded-xl border border-[var(--line)] bg-[var(--surface-muted)] p-4 text-sm"><p className="font-bold">Essential cookies</p><p className="mt-1 text-[var(--muted)]">Always enabled for secure sessions and account access.</p></div>}
    </div>
    <div className="flex flex-wrap gap-2 sm:justify-end">
      <button type="button" className="button button-quiet" onClick={() => setPreferencesOpen(!preferencesOpen)}>{preferencesOpen ? "Close preferences" : "Manage preferences"}</button>
      <button type="button" className="button button-secondary" onClick={() => save("essential")}>Essential only</button>
      <button type="button" className="button button-primary" onClick={() => save("all")}>Accept all</button>
    </div>
  </div>;
}

export function reopenCookiePreferences() {
  window.localStorage.removeItem(STORAGE_KEY);
  window.dispatchEvent(new Event("cookie-preferences-reset"));
}
