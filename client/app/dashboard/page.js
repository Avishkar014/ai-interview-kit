"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import AuthGate from "../../components/common/AuthGate";
import AppShell from "../../components/common/AppShell";
import StatusBadge from "../../components/common/StatusBadge";
import { kitsService } from "../../services/kits.service";

function DashboardContent() {
  const [kits, setKits] = useState([]); const [loading, setLoading] = useState(true); const [error, setError] = useState("");
  useEffect(() => { kitsService.list().then(setKits).catch(() => setError("Unable to load your kits.")).finally(() => setLoading(false)); }, []);
  async function remove(id) { if (!window.confirm("Delete this interview kit? This cannot be undone.")) return; await kitsService.remove(id); setKits((items) => items.filter((kit) => kit._id !== id)); }
  return <AppShell title="My Interview Kits"><div className="mt-8 flex items-center justify-between"><p className="text-[#68766f]">Research, practice, and review in one place.</p><Link href="/kits/new" className="rounded-lg bg-[#1d5144] px-4 py-3 text-sm font-bold text-white">Create new kit</Link></div>{error && <p role="alert" className="mt-6 rounded-lg bg-[#fde8e7] p-4 text-[#a33835]">{error}</p>}{loading ? <div className="mt-8 grid gap-4 md:grid-cols-2 lg:grid-cols-3">{[1, 2, 3].map((item) => <div key={item} className="h-48 animate-pulse rounded-2xl bg-white" />)}</div> : kits.length === 0 ? <div className="mt-8 rounded-2xl border border-dashed border-[#b9ccc0] bg-white p-12 text-center"><h2 className="text-xl font-bold">Your first kit starts here</h2><p className="mt-2 text-[#68766f]">Add a role and job description to build a focused plan.</p><Link href="/kits/new" className="mt-6 inline-block rounded-lg border border-[#2f7562] px-4 py-3 font-bold text-[#1d5144]">Create a kit</Link></div> : <div className="mt-8 grid gap-4 md:grid-cols-2 lg:grid-cols-3">{kits.map((kit) => <article key={kit._id} className="rounded-2xl border border-[#d9e4dd] bg-white p-5 shadow-sm"><div className="flex items-start justify-between gap-3"><div><p className="text-xs font-bold uppercase tracking-wider text-[#2f7562]">{kit.source?.company || "Company"}</p><h2 className="mt-2 text-xl font-bold">{kit.role?.title || kit.source?.role || "Interview kit"}</h2></div><StatusBadge status={kit.status} /></div><p className="mt-5 text-sm text-[#68766f]">Updated {kit.updatedAt ? new Date(kit.updatedAt).toLocaleDateString() : "recently"}</p>{kit.status === "processing" && <div className="mt-4 h-2 rounded-full bg-[#e3ebe6]"><div className="h-full rounded-full bg-[#2f7562]" style={{ width: `${kit.generationProgress?.progress || 0}%` }} /></div>}<div className="mt-5 flex gap-2"><Link href={`/kits/${kit._id}`} className="rounded-lg bg-[#edf3ef] px-3 py-2 text-sm font-bold text-[#1d5144]">Open kit</Link><button onClick={() => remove(kit._id)} className="rounded-lg px-3 py-2 text-sm font-bold text-[#a33835] hover:bg-[#fde8e7]">Delete</button></div></article>)}</div>}</AppShell>;
}

export default function DashboardPage() { return <AuthGate><DashboardContent /></AuthGate>; }