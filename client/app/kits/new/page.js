"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import AuthGate from "../../../components/common/AuthGate";
import AppShell from "../../../components/common/AppShell";
import ProgressSteps from "../../../components/common/ProgressSteps";
import { kitsService } from "../../../services/kits.service";

function NewKitContent() {
  const router = useRouter();
  const [form, setForm] = useState({ company_url: "", company: "", role: "", location: "", days: 14, jd: "" });
  const [busy, setBusy] = useState(false); const [error, setError] = useState(""); const [progress, setProgress] = useState(null);
  useEffect(() => {
    if (!progress?.kitId || progress.status !== "processing") return undefined;
    const timer = window.setInterval(async () => {
      try { const next = await kitsService.status(progress.kitId); setProgress(next); if (next.status === "completed") { window.clearInterval(timer); router.replace(`/kits/${progress.kitId}`); } } catch (_error) { setError("Unable to read generation progress."); }
    }, 1500);
    return () => window.clearInterval(timer);
  }, [progress, router]);
  async function submit(event) { event.preventDefault(); setError(""); setBusy(true); try { const result = await kitsService.create({ ...form, days: Number(form.days) }); setProgress({ kitId: result.kitId, status: result.status, generationProgress: { stage: "queued", progress: 0 } }); } catch (err) { setError(err.response?.data?.message || "Unable to start kit generation."); setBusy(false); } }
  const update = (key) => (event) => setForm({ ...form, [key]: event.target.value });
  return <AppShell title="Create a new kit" eyebrow="Kit builder"><div className="mt-8 grid gap-8 lg:grid-cols-[1fr_0.7fr]">{!progress ? <form onSubmit={submit} className="rounded-2xl border border-[#d9e4dd] bg-white p-6 shadow-sm"><div className="grid gap-5 sm:grid-cols-2"><label className="text-sm font-bold sm:col-span-2">Company website<input required type="url" placeholder="https://company.com" value={form.company_url} onChange={update("company_url")} className="mt-2 w-full rounded-lg border border-[#c8d6ce] px-3 py-3 font-normal" /></label><label className="text-sm font-bold">Company name<input type="text" value={form.company} onChange={update("company")} className="mt-2 w-full rounded-lg border border-[#c8d6ce] px-3 py-3 font-normal" /></label><label className="text-sm font-bold">Job title<input required type="text" value={form.role} onChange={update("role")} className="mt-2 w-full rounded-lg border border-[#c8d6ce] px-3 py-3 font-normal" /></label><label className="text-sm font-bold">Location<input required type="text" value={form.location} onChange={update("location")} className="mt-2 w-full rounded-lg border border-[#c8d6ce] px-3 py-3 font-normal" /></label><label className="text-sm font-bold">Days before interview<input required min="1" max="365" type="number" value={form.days} onChange={update("days")} className="mt-2 w-full rounded-lg border border-[#c8d6ce] px-3 py-3 font-normal" /></label><label className="text-sm font-bold sm:col-span-2">Job description<textarea required minLength={20} rows={12} value={form.jd} onChange={update("jd")} className="mt-2 w-full rounded-lg border border-[#c8d6ce] px-3 py-3 font-normal" /></label></div>{error && <p role="alert" className="mt-5 rounded-lg bg-[#fde8e7] p-3 text-sm text-[#a33835]">{error}</p>}<button disabled={busy} className="mt-6 rounded-lg bg-[#1d5144] px-5 py-3 font-bold text-white disabled:opacity-60">{busy ? "Starting..." : "Build interview kit"}</button></form> : <section className="rounded-2xl border border-[#d9e4dd] bg-white p-6 shadow-sm lg:col-span-2"><div className="flex items-center justify-between"><div><p className="text-sm font-bold uppercase tracking-wider text-[#2f7562]">Generation in progress</p><h2 className="mt-2 text-2xl font-bold">Your preparation workspace is taking shape</h2></div><span className="text-2xl font-bold text-[#2f7562]">{progress.generationProgress?.progress || 0}%</span></div><div className="mt-8"><ProgressSteps current={progress.generationProgress?.stage || "extracting_requirements"} progress={progress.generationProgress?.progress || 0} /></div>{progress.status === "failed" && <div className="mt-8 rounded-lg bg-[#fde8e7] p-4 text-[#a33835]">Generation failed. Return to your dashboard and try again.</div>}</section>}<aside className="rounded-2xl bg-[#1d5144] p-6 text-white"><p className="text-sm font-bold uppercase tracking-wider text-[#bde1cb]">A better prep loop</p><h2 className="mt-4 text-2xl font-bold">Research first. Practice deliberately.</h2><p className="mt-4 leading-7 text-[#d7eee0]">Your kit connects role requirements to questions, flashcards, and a schedule you can actually follow.</p></aside></div></AppShell>;
}

export default function NewKitPage() { return <AuthGate><NewKitContent /></AuthGate>; }