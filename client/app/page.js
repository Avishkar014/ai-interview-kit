import Link from "next/link";

export default function Home() {
  return (
    <main className="min-h-screen bg-[#f4f7f5] px-6 py-16 text-[#17231f]">
      <div className="mx-auto max-w-4xl">
        <p className="mb-4 text-sm font-semibold uppercase tracking-[0.2em] text-[#2f7562]">AI Interview Prep Kit</p>
        <h1 className="max-w-2xl text-5xl font-bold tracking-tight">Build confidence for the conversation that matters.</h1>
        <p className="mt-6 max-w-xl text-lg leading-8 text-[#53635d]">Your focused workspace for research-backed kits, deliberate practice, and a preparation plan that stays visible.</p>
        <div className="mt-10 flex flex-wrap gap-4">
          <Link href="/dashboard" className="rounded-lg bg-[#1d5144] px-5 py-3 font-semibold text-white hover:bg-[#163d34]">Open dashboard</Link>
          <Link href="/create" className="rounded-lg border border-[#b8c8c0] px-5 py-3 font-semibold hover:bg-white">Create a kit</Link>
        </div>
      </div>
    </main>
  );
}