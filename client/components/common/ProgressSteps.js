const stages = ["extracting_requirements", "researching_company", "generating_brief", "generating_questions", "checking_coverage", "generating_flashcards", "building_schedule", "validating", "completed"];

export default function ProgressSteps({ current, progress = 0 }) {
  const currentIndex = stages.indexOf(current);
  return <div className="space-y-3" aria-label="Generation progress">
    <div className="h-2 overflow-hidden rounded-full bg-[#e3ebe6]"><div className="h-full rounded-full bg-[#2f7562] transition-all" style={{ width: `${progress}%` }} /></div>
    <ol className="grid gap-2 sm:grid-cols-3">
      {stages.map((stage, index) => <li key={stage} className="flex items-center gap-2 text-sm"><span className={`flex h-5 w-5 items-center justify-center rounded-full text-xs font-bold ${index < currentIndex ? "bg-[#2f7562] text-white" : index === currentIndex ? "border-2 border-[#2f7562] text-[#2f7562]" : "bg-[#e3ebe6] text-[#718079]"}`}>{index < currentIndex ? "✓" : index + 1}</span><span className={index === currentIndex ? "font-bold text-[#1d5144]" : "text-[#718079]"}>{stage.replaceAll("_", " ")}</span></li>)}
    </ol>
  </div>;
}