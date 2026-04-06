import { describe, expect, it } from "vitest";

import {
  chooseStoryOption,
  chooseStoryRole,
  completeStoryChallenge,
  createInitialStoryProgress,
} from "@/game/story-mode";

describe("story mode engine", () => {
  it("moves from the prologue into role selection when an opening choice is made", () => {
    const initialProgress = createInitialStoryProgress();
    const nextProgress = chooseStoryOption(initialProgress, "call-the-class");

    expect(nextProgress.sceneId).toBe("role-select");
    expect(nextProgress.decisions.prologue).toBe("call-the-class");
    expect(nextProgress.insight).toBeGreaterThan(initialProgress.insight);
    expect(nextProgress.resolve).toBeGreaterThan(initialProgress.resolve);
  });

  it("applies the selected role bonuses before the first boss phase", () => {
    const initialProgress = chooseStoryOption(createInitialStoryProgress(), "library-first");
    const nextProgress = chooseStoryRole(initialProgress, "analyst");

    expect(nextProgress.sceneId).toBe("newton-choice");
    expect(nextProgress.roleId).toBe("analyst");
    expect(nextProgress.insight).toBeGreaterThan(initialProgress.insight);
  });

  it("raises the next challenge level after a successful math answer", () => {
    const start = {
      ...createInitialStoryProgress(),
      sceneId: "newton-challenge" as const,
    };
    const nextProgress = completeStoryChallenge(start, "newton", true, "newton-aftermath");

    expect(nextProgress.sceneId).toBe("newton-aftermath");
    expect(nextProgress.correctAnswers).toBe(1);
    expect(nextProgress.mathLevel).toBe(1);
  });
});
