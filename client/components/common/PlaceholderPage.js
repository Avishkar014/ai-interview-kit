export default function PlaceholderPage({ title, description }) {
  return (
    <main className="min-h-screen bg-[#f4f7f5] px-6 py-16 text-[#17231f]">
      <div className="mx-auto max-w-4xl">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[#2f7562]">AI Interview Prep Kit</p>
        <h1 className="mt-5 text-4xl font-bold tracking-tight">{title}</h1>
        <p className="mt-4 max-w-xl text-lg text-[#53635d]">{description}</p>
      </div>
    </main>
  );
}