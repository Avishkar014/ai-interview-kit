"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { authService } from "../../services/auth.service";
import Footer from "./Footer";

const navigation = [
  { href: "/dashboard", label: "Overview", icon: "▦" },
  { href: "/kits/new", label: "Build a kit", icon: "+" },
];

export default function AppShell({ children, title, eyebrow = "Workspace", description, hideFooter = false }) {
  const router = useRouter();
  const pathname = usePathname();
  async function logout() { await authService.logout(); router.replace("/login"); }
  return <div className="min-h-screen bg-[var(--canvas)] text-[var(--ink)]">
    <header className="border-b border-[var(--line)] bg-white/95 lg:hidden">
      <div className="page-container flex items-center justify-between py-4"><Link href="/dashboard" className="brand-mark">AI<span>Prep</span></Link><details className="relative"><summary className="cursor-pointer list-none rounded-lg border border-[var(--line)] px-3 py-2 text-sm font-bold text-[var(--brand)]">Menu</summary><nav className="absolute right-0 z-20 mt-2 grid min-w-48 gap-1 rounded-xl border border-[var(--line)] bg-white p-2 text-sm font-bold shadow-xl">{navigation.map((item) => <Link key={item.href} href={item.href} className="rounded-lg px-3 py-2 hover:bg-[var(--surface-muted)]">{item.label}</Link>)}<button onClick={logout} className="rounded-lg px-3 py-2 text-left text-[var(--danger)] hover:bg-[#fbe9e7]">Log out</button></nav></details></div>
    </header>
    <div className="mx-auto flex min-h-screen max-w-[1440px]">
      <aside className="hidden w-64 shrink-0 border-r border-[var(--line)] bg-white px-5 py-7 lg:flex lg:flex-col"><Link href="/dashboard" className="brand-mark">AI<span>Prep</span></Link><p className="mt-1 text-xs text-[var(--muted)]">Interview preparation, with intent.</p><nav className="mt-12 grid gap-2">{navigation.map((item) => { const active = pathname === item.href || (item.href === "/dashboard" && pathname.startsWith("/kits/")); return <Link key={item.href} href={item.href} className={`flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-bold ${active ? "bg-[var(--brand-soft)] text-[var(--brand)]" : "text-[var(--muted)] hover:bg-[var(--surface-muted)] hover:text-[var(--ink)]"}`}><span className="w-5 text-center text-lg">{item.icon}</span>{item.label}</Link>; })}</nav><div className="mt-auto pt-12"><button onClick={logout} className="w-full rounded-xl px-3 py-3 text-left text-sm font-bold text-[var(--muted)] hover:bg-[#fbe9e7] hover:text-[var(--danger)]">Log out</button></div></aside>
      <div className="min-w-0 flex-1"><main className="page-container page-enter py-7 sm:py-10"><div className="section-heading"><div><p className="eyebrow">{eyebrow}</p><h1 className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl">{title}</h1>{description && <p className="mt-2 max-w-2xl text-[var(--muted)]">{description}</p>}</div></div>{children}</main>{!hideFooter && <Footer />}</div>
    </div>
  </div>;
}