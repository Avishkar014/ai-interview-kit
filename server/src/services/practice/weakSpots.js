const categoryLabels = {
  technical: "Technical",
  "system-design": "System Design",
  "company-fit": "Company Fit",
  behavioural: "Behavioural",
};

function roundPercentage(averageConfidence) {
  return Math.round((averageConfidence / 5) * 100);
}

function addScore(groups, key, name, category, confidence) {
  const existing = groups.get(key) || { name, category, totalConfidence: 0, reviewedCount: 0 };
  existing.totalConfidence += confidence;
  existing.reviewedCount += 1;
  groups.set(key, existing);
}

export function aggregateWeakSpots({ kit, practiceRecords }) {
  const questions = kit.questions || [];
  const flashcards = new Map((kit.flashcards || []).map((flashcard) => [flashcard.id, flashcard]));
  const requirements = new Map((kit.role?.requirements || []).map((requirement) => [requirement.id, requirement]));
  const questionsByRequirement = new Map();

  for (const question of questions) {
    for (const requirementId of question.requirement_ids || []) {
      const related = questionsByRequirement.get(requirementId) || [];
      related.push(question.category);
      questionsByRequirement.set(requirementId, related);
    }
  }

  const groups = new Map();
  for (const record of practiceRecords || []) {
    const confidence = Number(record.confidence);
    if (!Number.isInteger(confidence) || confidence < 1 || confidence > 5) continue;
    const flashcard = flashcards.get(record.flashcardId);
    if (!flashcard) continue;

    const categories = new Set();
    for (const requirementId of flashcard.requirement_ids || []) {
      const requirement = requirements.get(requirementId);
      if (!requirement) continue;
      const relatedCategories = questionsByRequirement.get(requirementId) || [];
      const category = relatedCategories[0] || requirement.kind;
      categories.add(category);
      addScore(groups, `requirement:${requirementId}`, requirement.text, category, confidence);
    }
    for (const category of categories) {
      addScore(groups, `category:${category}`, categoryLabels[category] || category, category, confidence);
    }
  }

  const weakSpots = [...groups.values()]
    .map(({ totalConfidence, ...spot }) => ({ ...spot, averageConfidence: totalConfidence / spot.reviewedCount, percentage: roundPercentage(totalConfidence / spot.reviewedCount) }))
    .sort((left, right) => left.percentage - right.percentage || left.name.localeCompare(right.name));

  return {
    weakSpots,
    focusTomorrow: weakSpots.filter((spot) => spot.reviewedCount > 0).slice(0, 3).map((spot) => spot.name),
  };
}

export default aggregateWeakSpots;