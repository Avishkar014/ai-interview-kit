"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { authService } from "../../services/auth.service";

export default function AppShell({ children, title, eyebrow = "Workspace" }) {
  const router = useRouter();
  async function logout() { await authService.logout(); router.replace("/login"); }
  return <div className="min-h-screen bg-[#f4f7f5] text-[#17231f]">
    <header className="border-b border-[#d9e4dd] bg-white/90">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4 lg:px-8">
        <Link href="/dashboard" className="font-bold tracking-tight text-[#1d5144]">AI Interview Prep Kit</Link>
        <nav className="hidden items-center gap-2 text-sm font-semibold text-[#53635d] sm:flex">
          <Link href="/dashboard" className="rounded-lg px-3 py-2 hover:bg-[#edf3ef]">Dashboard</Link>
          <Link href="/kits/new" className="rounded-lg px-3 py-2 hover:bg-[#edf3ef]">New kit</Link>
          <button onClick={logout} className="rounded-lg px-3 py-2 hover:bg-[#edf3ef]">Log out</button>
        </nav><details className="relative sm:hidden"><summary className="cursor-pointer list-none rounded-lg border border-[#c8d6ce] px-3 py-2 text-sm font-bold text-[#1d5144]">Menu</summary><nav className="absolute right-0 z-10 mt-2 grid min-w-40 gap-1 rounded-xl border border-[#d9e4dd] bg-white p-2 text-sm font-semibold shadow-lg"><Link href="/dashboard" className="rounded-lg px-3 py-2 hover:bg-[#edf3ef]">Dashboard</Link><Link href="/kits/new" className="rounded-lg px-3 py-2 hover:bg-[#edf3ef]">New kit</Link><button onClick={logout} className="rounded-lg px-3 py-2 text-left hover:bg-[#edf3ef]">Log out</button></nav></details>
      </div>
    </header>
    <main className="mx-auto max-w-7xl px-5 py-8 lg:px-8"><p className="text-xs font-bold uppercase tracking-[0.2em] text-[#2f7562]">{eyebrow}</p><h1 className="mt-2 text-3xl font-bold tracking-tight">{title}</h1>{children}</main>
  </div>;
}