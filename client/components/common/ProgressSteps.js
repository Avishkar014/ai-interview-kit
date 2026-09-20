const stages = ["extracting_requirements", "researching_company", "generating_brief", "generating_questions", "checking_coverage", "generating_flashcards", "building_schedule", "validating", "completed"];

export default function ProgressSteps({ current, progress = 0 }) {
  const currentIndex = stages.indexOf(current);
  return <div className="space-y-4" aria-label="Generation progress">
    <div className="h-2 overflow-hidden rounded-full bg-[var(--surface-muted)]"><div className="h-full rounded-full bg-[var(--brand)] transition-all" style={{ width: `${progress}%` }} /></div>
    <ol className="grid gap-2 sm:grid-cols-3">
      {stages.map((stage, index) => <li key={stage} className="flex items-center gap-2 text-sm"><span className={`flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold ${index < currentIndex ? "bg-[var(--brand)] text-white" : index === currentIndex ? "border-2 border-[var(--brand)] text-[var(--brand)]" : "bg-[var(--surface-muted)] text-[var(--muted)]"}`}>{index < currentIndex ? "✓" : index + 1}</span><span className={index === currentIndex ? "font-bold text-[var(--brand)]" : "text-[var(--muted)]"}>{stage.replaceAll("_", " ")}</span></li>)}
    </ol>
  </div>;
}