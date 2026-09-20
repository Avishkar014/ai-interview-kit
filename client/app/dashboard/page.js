"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import AuthGate from "../../components/common/AuthGate";
import AppShell from "../../components/common/AppShell";
import IconMark from "../../components/common/IconMark";
import StatusBadge from "../../components/common/StatusBadge";
import { kitsService } from "../../services/kits.service";

function DashboardContent() {
  const [kits, setKits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => { kitsService.list().then(setKits).catch(() => setError("Unable to load your kits right now.")).finally(() => setLoading(false)); }, []);

  async function remove(id) {
    if (!window.confirm("Delete this interview kit? This cannot be undone.")) return;
    try { await kitsService.remove(id); setKits((items) => items.filter((kit) => kit._id !== id)); } catch (_error) { setError("Unable to delete this kit."); }
  }

  return <AppShell title="My interview kits" eyebrow="Your workspace" description="Keep every role, question, and next practice step in view."><div className="mt-8 flex flex-col justify-between gap-4 rounded-2xl bg-[var(--brand)] p-6 text-white sm:flex-row sm:items-center sm:p-8"><div><p className="text-xs font-black uppercase tracking-[0.16em] text-[#bde1cb]">Make your next session count</p><h2 className="mt-2 text-2xl font-black">Build a kit from a job description.</h2><p className="mt-2 text-sm text-[#d7eee0]">Research-backed prep, ready when you are.</p></div><Link href="/kits/new" className="button bg-white text-[var(--brand)] hover:bg-[#eef8f0]">Create new kit <span className="ml-2">→</span></Link></div>{error && <p role="alert" className="mt-6 rounded-xl bg-[#fbe9e7] p-4 text-sm text-[var(--danger)]">{error}</p>}{loading ? <div className="mt-8 grid gap-4 md:grid-cols-2 lg:grid-cols-3">{[1, 2, 3].map((item) => <div key={item} className="surface h-56 animate-pulse bg-white/70" />)}</div> : kits.length === 0 ? <div className="surface mt-8 p-10 text-center sm:p-16"><IconMark tone="gold">✦</IconMark><h2 className="mt-5 text-2xl font-bold">Your first kit starts here</h2><p className="mx-auto mt-3 max-w-md text-[var(--muted)]">Add a role and job description to create your own focused preparation plan.</p><Link href="/kits/new" className="button button-primary mt-7">Create a kit</Link></div> : <div className="stagger mt-8 grid gap-4 md:grid-cols-2 lg:grid-cols-3">{kits.map((kit) => <article key={kit._id} className="surface p-5 transition-transform hover:-translate-y-0.5"><div className="flex items-start justify-between gap-3"><div><p className="eyebrow">{kit.source?.company || "Company"}</p><h2 className="mt-2 text-xl font-bold">{kit.role?.title || kit.source?.role || "Interview kit"}</h2></div><StatusBadge status={kit.status} /></div><div className="mt-5 grid grid-cols-2 gap-3 text-sm"><div><p className="text-xs font-bold uppercase tracking-wider text-[var(--muted)]">Location</p><p className="mt-1 font-semibold">{kit.source?.location || "Not set"}</p></div><div><p className="text-xs font-bold uppercase tracking-wider text-[var(--muted)]">Updated</p><p className="mt-1 font-semibold">{kit.updatedAt ? new Date(kit.updatedAt).toLocaleDateString() : "Recently"}</p></div></div>{kit.status === "processing" && <div className="mt-5"><div className="flex justify-between text-xs font-bold text-[var(--muted)]"><span>Generating</span><span>{kit.generationProgress?.progress || 0}%</span></div><div className="mt-2 h-2 rounded-full bg-[var(--surface-muted)]"><div className="h-full rounded-full bg-[var(--brand)] transition-all" style={{ width: `${kit.generationProgress?.progress || 0}%` }} /></div></div>}<div className="mt-6 flex gap-2"><Link href={`/kits/${kit._id}`} className="button button-secondary flex-1">Open kit</Link><button onClick={() => remove(kit._id)} className="button button-quiet text-[var(--danger)]">Delete</button></div></article>)}</div>}</AppShell>;
}

export default function DashboardPage() { return <AuthGate><DashboardContent /></AuthGate>; }