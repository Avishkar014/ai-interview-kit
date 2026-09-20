"use client";

const categories = [
  { value: "technical", label: "Technical" },
  { value: "behavioural", label: "Behavioural" },
  { value: "system-design", label: "System Design" },
  { value: "company-fit", label: "Company Fit" },
];

export default function QuestionCard({
  question,
  requirements,
  onChange,
  onDelete,
  onPin,
  onMove,
}) {
  const protectedQuestion =
    question.edited ||
    question.pinned ||
    question.source === "manual";

  function updateField(field, value) {
    onChange({
      ...question,
      [field]: value,
      edited: true,
      source: question.source || "generated",
    });
  }

  return (
    <article
      className={`rounded-2xl border bg-white p-5 transition-shadow hover:shadow-md ${
        protectedQuestion
          ? "border-[#92b9a1]"
          : "border-[var(--line)]"
      }`}
    >
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <span className="rounded-full bg-[var(--brand-soft)] px-2.5 py-1 text-xs font-black capitalize text-[var(--brand)]">
            {question.category.replaceAll("-", " ")}
          </span>

          <span className="rounded-full bg-[var(--surface-muted)] px-2.5 py-1 text-xs font-bold text-[var(--muted)]">
            Difficulty {question.difficulty}/3
          </span>

          {protectedQuestion && (
            <span className="rounded-full bg-[#fff1d9] px-2.5 py-1 text-xs font-bold text-[#8a5a00]">
              Protected
            </span>
          )}
        </div>

        <div className="flex flex-wrap gap-1">
          <button
            type="button"
            onClick={onMove(-1)}
            aria-label="Move question up"
            className="control-button"
          >
            ↑
          </button>

          <button
            type="button"
            onClick={onMove(1)}
            aria-label="Move question down"
            className="control-button"
          >
            ↓
          </button>

          <button
            type="button"
            onClick={onPin}
            className="control-button text-xs"
          >
            {question.pinned ? "Unpin" : "Pin"}
          </button>

          <button
            type="button"
            onClick={onDelete}
            className="control-button text-xs text-[var(--danger)]"
          >
            Delete
          </button>
        </div>
      </div>

      {/* Question fields */}
      <div className="mt-5 grid gap-4 sm:grid-cols-2">
        <label className="block text-sm font-bold">
          Category

          <select
            value={question.category}
            onChange={(event) =>
              updateField("category", event.target.value)
            }
            className="field-input mt-2"
            aria-label="Question category"
          >
            {categories.map((category) => (
              <option
                key={category.value}
                value={category.value}
              >
                {category.label}
              </option>
            ))}
          </select>
        </label>

        <label className="block text-sm font-bold">
          Difficulty

          <select
            value={question.difficulty}
            onChange={(event) =>
              updateField(
                "difficulty",
                Number(event.target.value),
              )
            }
            className="field-input mt-2"
            aria-label="Question difficulty"
          >
            <option value={1}>1 — Easy</option>
            <option value={2}>2 — Medium</option>
            <option value={3}>3 — Hard</option>
          </select>
        </label>
      </div>

      <label className="mt-5 block text-sm font-bold">
        Interview prompt

        <textarea
          value={question.prompt}
          onChange={(event) =>
            updateField("prompt", event.target.value)
          }
          className="field-input min-h-24 resize-y text-base font-bold leading-6"
          aria-label="Question prompt"
        />
      </label>

      <label className="mt-4 block text-sm font-bold">
        Answer outline

        <textarea
          value={question.answer_outline}
          onChange={(event) =>
            updateField(
              "answer_outline",
              event.target.value,
            )
          }
          className="field-input min-h-24 resize-y font-normal leading-6"
          aria-label="Answer outline"
        />
      </label>

      {/* Requirements */}
      <div className="mt-5 border-t border-[var(--line)] pt-4">
        <p className="text-xs font-black uppercase tracking-wider text-[var(--muted)]">
          Linked requirements
        </p>

        <div className="mt-2 flex flex-wrap gap-2">
          {(question.requirement_ids || []).map((id) => (
            <span
              key={id}
              className="rounded-full bg-[var(--surface-muted)] px-2.5 py-1 text-xs font-semibold text-[var(--muted)]"
            >
              {requirements.find((item) => item.id === id)?.text || id}
            </span>
          ))}
        </div>
      </div>
    </article>
  );
}