"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { authService } from "../../services/auth.service";
import AuthFrame from "../../components/common/AuthFrame";

export default function LoginPage() {
  const router = useRouter();
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  async function submit(event) { event.preventDefault(); setError(""); if (!form.email || form.password.length < 8) return setError("Enter a valid email and a password of at least 8 characters."); setBusy(true); try { await authService.login(form); router.replace("/dashboard"); } catch (err) { setError(err.response?.data?.message || "Unable to sign in."); setBusy(false); } }
  return <AuthFrame><div className="page-container grid min-h-[620px] items-center gap-12 py-12 lg:grid-cols-[0.9fr_1.1fr]"><div className="hidden rounded-3xl bg-[var(--brand)] p-10 text-white lg:block"><p className="text-xs font-black uppercase tracking-[0.18em] text-[#bde1cb]">Your preparation space</p><h1 className="mt-6 text-4xl font-black tracking-tight">A calmer way to get ready.</h1><p className="mt-5 leading-7 text-[#d7eee0]">Keep research, questions, practice, and the next best focus in one place.</p><div className="mt-12 grid gap-3 text-sm text-[#d7eee0]"><span>01 &nbsp; Role-aware question sets</span><span>02 &nbsp; Confidence-based practice</span><span>03 &nbsp; Clear weak spots</span></div></div><div className="surface mx-auto w-full max-w-md p-7 sm:p-9"><p className="eyebrow">Welcome back</p><h1 className="mt-3 text-3xl font-bold">Sign in to AI Prep</h1><p className="mt-2 text-[var(--muted)]">Return to your focused preparation workspace.</p><form onSubmit={submit} className="mt-8 space-y-5"><label className="field-label">Email<input required type="email" value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} className="field-input" /></label><label className="field-label">Password<input required minLength={8} type="password" value={form.password} onChange={(event) => setForm({ ...form, password: event.target.value })} className="field-input" /></label>{error && <p role="alert" className="rounded-lg bg-[#fbe9e7] px-3 py-2 text-sm text-[var(--danger)]">{error}</p>}<button disabled={busy} className="button button-primary w-full">{busy ? "Signing in..." : "Sign in"}</button></form><p className="mt-6 text-sm text-[var(--muted)]">New here? <Link className="font-bold text-[var(--brand)]" href="/register">Create an account</Link></p></div></div></AuthFrame>;
}