"use client";

import Link from "next/link";
import { reopenCookiePreferences } from "./CookieConsent";

export default function Footer() {
  return <footer className="site-footer">
    <div className="page-container footer-grid">
      <div><Link href="/" className="brand-mark">AI<span>Prep</span></Link><p className="mt-3 max-w-sm text-sm leading-6 text-[var(--muted)]">A calm, structured workspace for turning a job description into focused interview preparation.</p></div>
      <div><p className="eyebrow">Navigate</p><div className="mt-3 grid gap-2 text-sm"><Link href="/dashboard" className="footer-link">Dashboard</Link><Link href="/kits/new" className="footer-link">Build a kit</Link><Link href="/login" className="footer-link">Sign in</Link></div></div>
      <div><p className="eyebrow">Privacy</p><button type="button" onClick={reopenCookiePreferences} className="footer-link mt-3">Cookie preferences</button><p className="mt-3 text-xs text-[var(--muted)]">Essential session cookies only.</p></div>
    </div>
    <div className="page-container footer-bottom"><span>© {new Date().getFullYear()} AI Interview Prep Kit</span><span>Built for better preparation.</span></div>
  </footer>;
}
