export type LearningQuestionCategory =
  | "power"
  | "root"
  | "combined"
  | "equation";

export type LearningDifficulty = "facil" | "medio" | "dificil" | "impossivel";

export interface LearningPerformanceSnapshot {
  recentAnswers: readonly boolean[];
  streak: number;
}

export interface LearningMastery {
  power: number;
  root: number;
  combined: number;
  equation: number;
}

export interface LearningExperience {
  totalXp: number;
  level: number;
}

export interface LearningUnlocks {
  combinedUnlocked: boolean;
  equationUnlocked: boolean;
}

export interface LearningDistribution {
  power: number;
  root: number;
  combined: number;
  equation: number;
}

export interface LearningState {
  xp: LearningExperience;
  mastery: LearningMastery;
  unlocks: LearningUnlocks;
  performance: LearningPerformanceSnapshot;
}

export interface LearningProgressInput {
  category: LearningQuestionCategory;
  correct: boolean;
}

export interface LearningQuestionSelection {
  category: LearningQuestionCategory;
  distribution: LearningDistribution;
  unlocks: LearningUnlocks;
}

const MAX_RECENT_ANSWERS = 10;
const MAX_MASTERY = 100;

const XP_VALUES = {
  correct: {
    power: 8,
    root: 8,
    combined: 12,
    equation: 16,
  },
  wrong: {
    power: 1,
    root: 1,
    combined: 2,
    equation: 2,
  },
} as const;

const MASTERY_GAIN = {
  correct: {
    power: 6,
    root: 6,
    combined: 5,
    equation: 4,
  },
  wrong: {
    power: 1,
    root: 1,
    combined: 0,
    equation: 0,
  },
} as const;

const MASTERY_PENALTY = {
  power: 1,
  root: 1,
  combined: 2,
  equation: 2,
} as const;

export function createInitialLearningState(): LearningState {
  return {
    xp: {
      totalXp: 0,
      level: 1,
    },
    mastery: {
      power: 0,
      root: 0,
      combined: 0,
      equation: 0,
    },
    unlocks: {
      combinedUnlocked: false,
      equationUnlocked: false,
    },
    performance: {
      recentAnswers: [],
      streak: 0,
    },
  };
}

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

function getXpForLevel(level: number): number {
  if (level <= 1) {
    return 0;
  }

  let requiredXp = 0;

  for (let currentLevel = 1; currentLevel < level; currentLevel += 1) {
    requiredXp += 100 + (currentLevel - 1) * 25;
  }

  return requiredXp;
}

function getLevelFromXp(totalXp: number): number {
  let level = 1;

  while (getXpForLevel(level + 1) <= totalXp) {
    level += 1;
  }

  return level;
}

function updateRecentAnswers(
  recentAnswers: readonly boolean[],
  correct: boolean,
): readonly boolean[] {
  return [...recentAnswers, correct].slice(-MAX_RECENT_ANSWERS);
}

function getRecentAccuracy(recentAnswers: readonly boolean[]): number {
  if (recentAnswers.length === 0) {
    return 0;
  }

  const correctCount = recentAnswers.filter(Boolean).length;
  return correctCount / recentAnswers.length;
}

function getStreak(currentStreak: number, correct: boolean): number {
  return correct ? currentStreak + 1 : 0;
}

function getXpGain(input: LearningProgressInput): number {
  if (input.correct) {
    return XP_VALUES.correct[input.category];
  }

  return XP_VALUES.wrong[input.category];
}

function getMasteryGain(input: LearningProgressInput): number {
  if (input.correct) {
    return MASTERY_GAIN.correct[input.category];
  }

  return -MASTERY_PENALTY[input.category];
}

function updateCategoryMastery(
  mastery: LearningMastery,
  input: LearningProgressInput,
): LearningMastery {
  const delta = getMasteryGain(input);

  return {
    ...mastery,
    [input.category]: clamp(mastery[input.category] + delta, 0, MAX_MASTERY),
  };
}

function isEquationAllowedByDifficulty(difficulty: LearningDifficulty): boolean {
  return difficulty === "dificil" || difficulty === "impossivel";
}

function evaluateUnlocks(
  difficulty: LearningDifficulty,
  mastery: LearningMastery,
  performance: LearningPerformanceSnapshot,
): LearningUnlocks {
  const recentAccuracy = getRecentAccuracy(performance.recentAnswers);

  const combinedUnlocked =
    mastery.power >= 45 &&
    mastery.root >= 45 &&
    recentAccuracy >= 0.7;

  const equationUnlocked =
    isEquationAllowedByDifficulty(difficulty) &&
    mastery.power >= 75 &&
    mastery.root >= 75 &&
    mastery.combined >= 60 &&
    recentAccuracy >= 0.8 &&
    performance.streak >= 5;

  return {
    combinedUnlocked,
    equationUnlocked,
  };
}

export function updateLearningState(
  difficulty: LearningDifficulty,
  state: LearningState,
  input: LearningProgressInput,
): LearningState {
  const totalXp = state.xp.totalXp + getXpGain(input);
  const level = getLevelFromXp(totalXp);

  const recentAnswers = updateRecentAnswers(
    state.performance.recentAnswers,
    input.correct,
  );

  const streak = getStreak(state.performance.streak, input.correct);

  const performance: LearningPerformanceSnapshot = {
    recentAnswers,
    streak,
  };

  const mastery = updateCategoryMastery(state.mastery, input);
  const unlocks = evaluateUnlocks(difficulty, mastery, performance);

  return {
    xp: {
      totalXp,
      level,
    },
    mastery,
    unlocks,
    performance,
  };
}

function normalizeDistribution(
  distribution: LearningDistribution,
): LearningDistribution {
  const total =
    distribution.power +
    distribution.root +
    distribution.combined +
    distribution.equation;

  if (total <= 0) {
    return {
      power: 1,
      root: 0,
      combined: 0,
      equation: 0,
    };
  }

  return {
    power: distribution.power / total,
    root: distribution.root / total,
    combined: distribution.combined / total,
    equation: distribution.equation / total,
  };
}

function getEasyAdaptiveDistribution(
  state: LearningState,
): LearningDistribution {
  const accuracy = getRecentAccuracy(state.performance.recentAnswers);

  if (!state.unlocks.combinedUnlocked) {
    if (accuracy < 0.5) {
      return normalizeDistribution({
        power: 0.5,
        root: 0.5,
        combined: 0,
        equation: 0,
      });
    }

    return normalizeDistribution({
      power: 0.45,
      root: 0.45,
      combined: 0.1,
      equation: 0,
    });
  }

  if (accuracy < 0.5) {
    return normalizeDistribution({
      power: 0.45,
      root: 0.45,
      combined: 0.1,
      equation: 0,
    });
  }

  if (accuracy < 0.75) {
    return normalizeDistribution({
      power: 0.4,
      root: 0.4,
      combined: 0.2,
      equation: 0,
    });
  }

  return normalizeDistribution({
    power: 0.3,
    root: 0.3,
    combined: 0.4,
    equation: 0,
  });
}

function getMediumAdaptiveDistribution(
  state: LearningState,
): LearningDistribution {
  const accuracy = getRecentAccuracy(state.performance.recentAnswers);

  if (!state.unlocks.combinedUnlocked) {
    return normalizeDistribution({
      power: 0.45,
      root: 0.45,
      combined: 0.1,
      equation: 0,
    });
  }

  if (accuracy < 0.6) {
    return normalizeDistribution({
      power: 0.4,
      root: 0.4,
      combined: 0.2,
      equation: 0,
    });
  }

  return normalizeDistribution({
    power: 0.3,
    root: 0.3,
    combined: 0.4,
    equation: 0,
  });
}

function getHardAdaptiveDistribution(
  state: LearningState,
): LearningDistribution {
  const accuracy = getRecentAccuracy(state.performance.recentAnswers);

  if (!state.unlocks.equationUnlocked) {
    if (accuracy < 0.6) {
      return normalizeDistribution({
        power: 0.3,
        root: 0.3,
        combined: 0.4,
        equation: 0,
      });
    }

    return normalizeDistribution({
      power: 0.25,
      root: 0.25,
      combined: 0.5,
      equation: 0,
    });
  }

  if (accuracy < 0.65) {
    return normalizeDistribution({
      power: 0.25,
      root: 0.25,
      combined: 0.4,
      equation: 0.1,
    });
  }

  return normalizeDistribution({
    power: 0.2,
    root: 0.2,
    combined: 0.4,
    equation: 0.2,
  });
}

function getImpossibleAdaptiveDistribution(
  state: LearningState,
): LearningDistribution {
  const accuracy = getRecentAccuracy(state.performance.recentAnswers);

  if (accuracy < 0.6) {
    return normalizeDistribution({
      power: 0.2,
      root: 0.2,
      combined: 0.45,
      equation: 0.15,
    });
  }

  return normalizeDistribution({
    power: 0.15,
    root: 0.15,
    combined: 0.45,
    equation: 0.25,
  });
}

export function getAdaptiveDistribution(
  difficulty: LearningDifficulty,
  state: LearningState,
): LearningDistribution {
  if (difficulty === "facil") {
    return getEasyAdaptiveDistribution(state);
  }

  if (difficulty === "medio") {
    return getMediumAdaptiveDistribution(state);
  }

  if (difficulty === "dificil") {
    return getHardAdaptiveDistribution(state);
  }

  return getImpossibleAdaptiveDistribution(state);
}

export function pickQuestionCategory(
  distribution: LearningDistribution,
): LearningQuestionCategory {
  const roll = Math.random();

  if (roll < distribution.power) {
    return "power";
  }

  if (roll < distribution.power + distribution.root) {
    return "root";
  }

  if (roll < distribution.power + distribution.root + distribution.combined) {
    return "combined";
  }

  return "equation";
}

function coerceCategoryForDifficulty(
  difficulty: LearningDifficulty,
  state: LearningState,
  category: LearningQuestionCategory,
): LearningQuestionCategory {
  if (category === "equation" && !isEquationAllowedByDifficulty(difficulty)) {
    return state.unlocks.combinedUnlocked ? "combined" : "power";
  }

  if (category === "equation" && !state.unlocks.equationUnlocked) {
    return state.unlocks.combinedUnlocked ? "combined" : "power";
  }

  if (category === "combined" && !state.unlocks.combinedUnlocked) {
    return "power";
  }

  return category;
}

export function getLearningQuestionSelection(
  difficulty: LearningDifficulty,
  state: LearningState,
): LearningQuestionSelection {
  const distribution = getAdaptiveDistribution(difficulty, state);
  const rawCategory = pickQuestionCategory(distribution);
  const category = coerceCategoryForDifficulty(difficulty, state, rawCategory);

  return {
    category,
    distribution,
    unlocks: state.unlocks,
  };
}

export function getMasteryLabel(value: number): string {
  if (value < 20) {
    return "iniciante";
  }

  if (value < 40) {
    return "em aquecimento";
  }

  if (value < 60) {
    return "em progresso";
  }

  if (value < 80) {
    return "consolidando";
  }

  return "dominado";
}

export function isQuestionCategoryUnlocked(
  difficulty: LearningDifficulty,
  category: LearningQuestionCategory,
  state: LearningState,
): boolean {
  if (category === "equation") {
    return isEquationAllowedByDifficulty(difficulty) && state.unlocks.equationUnlocked;
  }

  if (category === "combined") {
    return state.unlocks.combinedUnlocked;
  }

  return true;
}

export function getLearningSummary(
  difficulty: LearningDifficulty,
  state: LearningState,
): {
  accuracy: number;
  level: number;
  totalXp: number;
  streak: number;
  masteryLabels: Record<LearningQuestionCategory, string>;
  unlocks: LearningUnlocks;
  equationAllowedByDifficulty: boolean;
} {
  return {
    accuracy: getRecentAccuracy(state.performance.recentAnswers),
    level: state.xp.level,
    totalXp: state.xp.totalXp,
    streak: state.performance.streak,
    masteryLabels: {
      power: getMasteryLabel(state.mastery.power),
      root: getMasteryLabel(state.mastery.root),
      combined: getMasteryLabel(state.mastery.combined),
      equation: getMasteryLabel(state.mastery.equation),
    },
    unlocks: state.unlocks,
    equationAllowedByDifficulty: isEquationAllowedByDifficulty(difficulty),
  };
}