const durationByDifficulty = { 1: 20, 2: 30, 3: 45 };

function createSchedule(questions, requirements, days_available) {
  if (!Number.isInteger(days_available) || days_available < 1) throw new Error("days_available must be a positive integer");

  const mustIds = new Set(requirements.filter((requirement) => requirement.priority === "must").map((requirement) => requirement.id));
  const weighted = questions.map((question, index) => ({
    question,
    index,
    weight: question.difficulty * 2 + (question.requirement_ids.some((id) => mustIds.has(id)) ? 1 : 0),
  })).sort((left, right) => right.weight - left.weight || left.index - right.index);

  const days = Array.from({ length: days_available }, (_value, index) => ({ day: index + 1, focus: "Review", question_ids: [], minutes: 0, _categories: [], _requirements: [] }));
  weighted.forEach(({ question }, index) => {
    const day = days[index % days_available];
    day.question_ids.push(question.id);
    day.minutes += durationByDifficulty[question.difficulty];
    if (!day._categories.includes(question.category)) day._categories.push(question.category);
    for (const requirement of requirements.filter((item) => question.requirement_ids.includes(item.id))) {
      if (!day._requirements.includes(requirement.text)) day._requirements.push(requirement.text);
    }
  });

  return {
    days_available,
    days: days.map(({ day, question_ids, minutes, _categories, _requirements }) => ({
      day,
      focus: [..._categories, ..._requirements].join(", ") || "Review",
      question_ids,
      minutes: Number.isInteger(minutes) ? minutes : 0,
    })),
  };
}

export { createSchedule, durationByDifficulty };
export default createSchedule;