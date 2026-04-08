import { describe, expect, it } from "vitest";

import {
  createQuestionCycleKey,
  drawNextQuestionForPhase,
  getQuestionsForPhase,
} from "@/game/questions";
import { QuestionCycleState, QuestionSelectionContext } from "@/game/types";

const regularContext: QuestionSelectionContext = {
  battleStage: "apprentice",
  isBoss: false,
  isFinalBoss: false,
};

const bossContext: QuestionSelectionContext = {
  battleStage: "boss",
  isBoss: true,
  isFinalBoss: false,
};

describe("medium question generation", () => {
  it("uses only direct powers with exponents 3 and 4 in medium power questions", () => {
    const pool = getQuestionsForPhase(1, "medio", 1, new Set<string>(), regularContext);

    expect(pool.length).toBeGreaterThan(3);
    expect(pool.every((question) => !question.question.includes("+") && !question.question.includes("-"))).toBe(
      true,
    );
    expect(pool.some((question) => question.question.includes("\u00B3"))).toBe(true);
    expect(pool.some((question) => question.question.includes("\u2074"))).toBe(true);
  });

  it("keeps root questions a little richer in medium mode", () => {
    const pool = getQuestionsForPhase(2, "medio", 1, new Set<string>(), regularContext);

    expect(pool.some((question) => question.question.includes("+") || question.question.includes("-"))).toBe(
      true,
    );
  });

  it("preserves used medium questions across stage changes in the same phase", () => {
    const regularPool = getQuestionsForPhase(1, "medio", 1, new Set<string>(), regularContext);
    const bossPool = getQuestionsForPhase(1, "medio", 1, new Set<string>(), bossContext);
    const sharedQuestion = regularPool.find((question) =>
      bossPool.some((bossQuestion) => bossQuestion.question === question.question),
    );

    expect(sharedQuestion).toBeDefined();

    const cycleKey = createQuestionCycleKey(1, "medio", 1, regularContext);
    const seededState: QuestionCycleState = {
      cycleKey,
      usedKeys: [sharedQuestion!.question],
      lastQuestionKey: null,
      recentValues: [],
      cycleCount: 0,
    };

    const result = drawNextQuestionForPhase(1, "medio", 1, bossContext, seededState);

    expect(result.question).not.toBeNull();
    expect(result.question?.question).not.toBe(sharedQuestion!.question);
    expect(result.state.cycleKey).toBe(cycleKey);
    expect(result.state.usedKeys).toContain(sharedQuestion!.question);
  });
});
