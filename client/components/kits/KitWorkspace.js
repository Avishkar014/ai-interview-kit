"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import QuestionCard from "../questions/QuestionCard";
import StatusBadge from "../common/StatusBadge";
import { kitsService } from "../../services/kits.service";

const tabs = [
  "Overview",
  "Company",
  "Role",
  "Questions",
  "Flashcards",
  "Schedule",
  "Practice",
];

const categories = [
  "technical",
  "behavioural",
  "system-design",
  "company-fit",
];

export default function KitWorkspace({ kitId }) {
  const [kit, setKit] = useState(null);
  const [tab, setTab] = useState("Overview");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState("");
  const [regenerating, setRegenerating] = useState("");
  useEffect(() => {
    kitsService
      .get(kitId)
      .then(setKit)
      .catch(() => setError("Unable to load this kit."))
      .finally(() => setLoading(false));
  }, [kitId]);

  const questions = useMemo(
    () => kit?.questions || [],
    [kit?.questions],
  );

  const requirements = kit?.role?.requirements || [];

  const grouped = useMemo(
    () =>
      categories.map((category) => ({
        category,
        items: questions.filter(
          (question) => question.category === category,
        ),
      })),
    [questions],
  );

  if (loading) {
    return (
      <div className="animate-pulse rounded-2xl bg-white p-8">
        <div className="h-8 w-1/2 rounded bg-[#e3ebe6]" />
        <div className="mt-8 h-48 rounded bg-[#edf3ef]" />
      </div>
    );
  }

  if (error || !kit) {
    return (
      <p
        role="alert"
        className="rounded-lg bg-[#fde8e7] p-4 text-[#a33835]"
      >
        {error || "Kit not found."}
      </p>
    );
  }

  function updateQuestion(index, value) {
    setKit({
      ...kit,
      questions: questions.map((question, itemIndex) =>
        itemIndex === index ? value : question,
      ),
    });
  }

  function moveQuestion(index, offset) {
    const target = index + offset;

    if (target < 0 || target >= questions.length) {
      return;
    }

    const next = [...questions];

    [next[index], next[target]] = [
      next[target],
      next[index],
    ];

    setKit({
      ...kit,
      questions: next,
    });
  }

  function deleteQuestion(index) {
    const question = questions[index];

    if (
      question.edited ||
      question.pinned ||
      question.source === "manual"
    ) {
      setNotice(
        "Protected questions cannot be deleted. Unpin or remove the manual/edit state first.",
      );
      return;
    }

    if (window.confirm("Delete this question?")) {
      setKit({
        ...kit,
        questions: questions.filter(
          (_item, itemIndex) => itemIndex !== index,
        ),
      });
    }
  }

  async function saveQuestions() {
    setSaving(true);
    setNotice("");

    try {
      const updated = await kitsService.updateQuestions(
        kitId,
        questions,
      );

      setKit(updated);
      setNotice("Question changes saved.");
    } catch (_error) {
      setNotice("Unable to save question changes.");
    } finally {
      setSaving(false);
    }
  }
  async function regenerateCategory(category) {
  const protectedCount = questions.filter(
    (question) =>
      question.category === category &&
      (
        question.edited ||
        question.pinned ||
        question.source === "manual"
      ),
  ).length;

  if (
    protectedCount > 0 &&
    !window.confirm(
      `${protectedCount} protected question(s) will be preserved. Regenerate the remaining ${category.replaceAll("-", " ")} questions?`,
    )
  ) {
    return;
  }

  setRegenerating(category);
  setNotice("");

  try {
    const result = await kitsService.regenerateQuestions(
      kitId,
      category,
    );

    setKit(result.kit);

    setNotice(
      result.message ||
        `${category.replaceAll("-", " ")} questions regenerated.`,
    );
  } catch (error) {
    setNotice(
      error?.response?.data?.message ||
        `Unable to regenerate ${category.replaceAll("-", " ")} questions.`,
    );
  } finally {
    setRegenerating("");
  }
}

  function addManual() {
    const used = new Set(
      questions.map((question) => question.id),
    );

    let number = questions.length + 1;

    while (used.has(`q${number}`)) {
      number += 1;
    }

    const next = {
      id: `q${number}`,
      requirement_ids: requirements[0]
        ? [requirements[0].id]
        : [],
      category: "technical",
      prompt: "New interview question",
      answer_outline: "Add your answer outline.",
      difficulty: 2,
      source: "manual",
      edited: true,
      pinned: true,
    };

    setKit({
      ...kit,
      questions: [...questions, next],
    });

    setTab("Questions");
    setNotice("Manual question added.");
  }

  return (
    <div className="rounded-2xl border border-[#d9e4dd] bg-white shadow-sm">
      {/* Header */}
      <div className="border-b border-[#d9e4dd] p-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-[#2f7562]">
              {kit.source?.company || "Company"}
            </p>

            <h2 className="mt-2 text-3xl font-bold">
              {kit.role?.title || kit.source?.role}
            </h2>

            <p className="mt-2 text-[#68766f]">
              {kit.source?.location} ·{" "}
              <StatusBadge status={kit.status} />
            </p>
          </div>

          <Link
            href={`/kits/${kitId}/practice`}
            className="rounded-lg bg-[#1d5144] px-4 py-3 text-sm font-bold text-white"
          >
            Start practice
          </Link>
        </div>

        <div className="mt-6 flex gap-1 overflow-x-auto">
          {tabs.map((item) => (
            <button
              key={item}
              type="button"
              onClick={() => setTab(item)}
              className={`whitespace-nowrap rounded-lg px-3 py-2 text-sm font-bold ${
                tab === item
                  ? "bg-[#1d5144] text-white"
                  : "text-[#68766f] hover:bg-[#edf3ef]"
              }`}
            >
              {item}
            </button>
          ))}
        </div>
      </div>

      <div className="p-6">
        {/* Overview */}
        {tab === "Overview" && (
          <div className="grid gap-4 md:grid-cols-3">
            <Stat
              label="Questions"
              value={questions.length}
            />

            <Stat
              label="Flashcards"
              value={kit.flashcards?.length || 0}
            />

            <Stat
              label="Coverage gaps"
              value={
                kit.coverage?.uncovered_requirement_ids
                  ?.length || 0
              }
            />
          </div>
        )}

        {/* Company */}
        {tab === "Company" && (
          <section className="max-w-3xl">
            <h3 className="text-xl font-bold">
              Company brief
            </h3>

            <p className="mt-4 leading-7 text-[#53635d]">
              {kit.company_brief?.summary}
            </p>

            <h4 className="mt-6 font-bold">
              What they do
            </h4>

            <p className="mt-2 leading-7 text-[#53635d]">
              {kit.company_brief?.what_they_do}
            </p>

            <h4 className="mt-6 font-bold">
              Sources
            </h4>

            <ul className="mt-2 space-y-2">
              {(kit.company_brief?.sources || []).map(
                (source) => (
                  <li key={source}>
                    <a
                      className="text-[#2f7563] underline"
                      href={source}
                      target="_blank"
                      rel="noreferrer"
                    >
                      {source}
                    </a>
                  </li>
                ),
              )}
            </ul>
          </section>
        )}

        {/* Role */}
        {tab === "Role" && (
          <section>
            <h3 className="text-xl font-bold">
              {kit.role?.title} · {kit.role?.seniority}
            </h3>

            <ul className="mt-4 space-y-2 text-[#53635d]">
              {(kit.role?.responsibilities || []).map(
                (item) => (
                  <li key={item}>• {item}</li>
                ),
              )}
            </ul>

            <div className="mt-8 grid gap-4 md:grid-cols-2">
              <RequirementGroup
                title="Must have"
                items={requirements.filter(
                  (item) => item.priority === "must",
                )}
              />

              <RequirementGroup
                title="Nice to have"
                items={requirements.filter(
                  (item) => item.priority === "nice",
                )}
              />
            </div>
          </section>
        )}

        {/* Questions */}
        {tab === "Questions" && (
          <section>
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h3 className="text-xl font-bold">
                  Question builder
                </h3>

                <p className="mt-1 text-sm text-[#68766f]">
                  Edit, categorize, reorder, pin, or add
                  questions before saving.
                </p>
              </div>

              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={addManual}
                  className="rounded-lg border border-[#2f7562] px-3 py-2 text-sm font-bold text-[#1d5144]"
                >
                  Add question
                </button>

                <button
                  type="button"
                  onClick={saveQuestions}
                  disabled={saving}
                  className="rounded-lg bg-[#1d5144] px-3 py-2 text-sm font-bold text-white disabled:opacity-60"
                >
                  {saving
                    ? "Saving..."
                    : "Save changes"}
                </button>
              </div>
            </div>

            {notice && (
              <p className="mt-4 rounded-lg bg-[#edf3ef] p-3 text-sm text-[#1d5144]">
                {notice}
              </p>
            )}

            <div className="mt-6 space-y-8">
              {grouped.map(
                ({ category, items }) => (
                  <section key={category}>
                    <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
                      <h4 className="text-sm font-bold uppercase tracking-wider text-[#2f7562]">
                        {category.replaceAll("-", " ")} ·{" "}
                        {items.length}
                      </h4>

                      <button
                        type="button"
                        onClick={() => regenerateCategory(category)}
                        disabled={regenerating === category}
                        className="rounded-lg border border-[#2f7562] px-3 py-2 text-xs font-bold text-[#1d5144] transition hover:bg-[#edf3ef] disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        {regenerating === category
                          ? "Regenerating..."
                          : "Regenerate section"}
                      </button>
                    </div>

                    <div className="space-y-3">
                      {items.map((question) => {
                        const index =
                          questions.indexOf(question);

                        return (
                          <QuestionCard
                            key={question.id}
                            question={question}
                            requirements={requirements}
                            onChange={(value) =>
                              updateQuestion(
                                index,
                                value,
                              )
                            }
                            onDelete={() =>
                              deleteQuestion(index)
                            }
                            onPin={() =>
                              updateQuestion(index, {
                                ...question,
                                pinned:
                                  !question.pinned,
                              })
                            }
                            onMove={(offset) => () =>
                              moveQuestion(
                                index,
                                offset,
                              )
                            }
                          />
                        );
                      })}
                    </div>
                  </section>
                ),
              )}
            </div>
          </section>
        )}

        {/* Flashcards */}
        {tab === "Flashcards" && (
          <div className="grid gap-4 md:grid-cols-2">
            {(kit.flashcards || []).map((card) => (
              <article
                key={card.id}
                className="rounded-xl border border-[#d9e4dd] p-5"
              >
                <p className="text-xs font-bold uppercase tracking-wider text-[#2f7562]">
                  Topic
                </p>

                <h3 className="mt-2 font-bold">
                  {card.front}
                </h3>

                <p className="mt-5 text-[#53635d]">
                  {card.back}
                </p>
              </article>
            ))}
          </div>
        )}

        {/* Schedule */}
        {tab === "Schedule" && (
          <div className="grid gap-3 md:grid-cols-2">
            {(kit.schedule?.days || []).map((day) => (
              <article
                key={day.day}
                className="rounded-xl border border-[#d9e4dd] p-5"
              >
                <div className="flex justify-between">
                  <h3 className="font-bold">
                    Day {day.day}
                  </h3>

                  <span className="text-sm text-[#68766f]">
                    {day.minutes} min
                  </span>
                </div>

                <p className="mt-2 text-[#53635d]">
                  {day.focus}
                </p>

                <p className="mt-4 text-sm text-[#68766f]">
                  {day.question_ids.length} questions
                </p>
              </article>
            ))}
          </div>
        )}

        {/* Practice */}
        {tab === "Practice" && (
          <div className="rounded-xl bg-[#edf3ef] p-6">
            <h3 className="text-xl font-bold">
              Ready to practice?
            </h3>

            <p className="mt-2 text-[#53635d]">
              Work through your flashcards in confidence
              order.
            </p>

            <Link
              href={`/kits/${kitId}/practice`}
              className="mt-5 inline-block rounded-lg bg-[#1d5144] px-4 py-3 text-sm font-bold text-white"
            >
              Open practice mode
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}

function Stat({ label, value }) {
  return (
    <div className="rounded-xl bg-[#edf3ef] p-5">
      <p className="text-sm text-[#68766f]">
        {label}
      </p>

      <p className="mt-2 text-3xl font-bold text-[#1d5144]">
        {value}
      </p>
    </div>
  );
}

function RequirementGroup({ title, items }) {
  return (
    <div className="rounded-xl border border-[#d9e4dd] p-5">
      <h4 className="font-bold">{title}</h4>

      <ul className="mt-4 space-y-3">
        {items.map((item) => (
          <li
            key={item.id}
            className="flex gap-2 text-sm text-[#53635d]"
          >
            <span className="font-bold text-[#2f7562]">
              {item.id}
            </span>

            {item.text}
          </li>
        ))}
      </ul>
    </div>
  );
}