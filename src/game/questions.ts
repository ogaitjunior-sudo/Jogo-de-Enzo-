import {
  COMPLEXITY_BANDS,
  PHASE_CONFIGS,
  getComplexityBandConfig,
  getDifficultyModeConfig,
  getEndlessComplexityBandConfig,
} from "./progression";
import {
  ComplexityBandConfig,
  Difficulty,
  MathQuestion,
  Phase,
  QuestionCycleState,
  QuestionDrawResult,
  QuestionSelectionContext,
  QuestionTier,
  QuestionTopic,
} from "./types";

const QUESTION_POOL_CACHE = new Map<string, readonly MathQuestion[]>();

const SUPERSCRIPT_DIGITS: Record<string, string> = {
  "⁰": "0",
  "¹": "1",
  "²": "2",
  "³": "3",
  "⁴": "4",
  "⁵": "5",
  "⁶": "6",
  "⁷": "7",
  "⁸": "8",
  "⁹": "9",
};

interface QuestionProfile {
  operationCount: number;
  termCount: number;
  maxExponent: number;
  maxBase: number;
  maxRootValue: number;
  hasParentheses: boolean;
  hasMultiplication: boolean;
  hasDivision: boolean;
  containsBothTopics: boolean;
  answerAbs: number;
}

type BeginnerEquationForm =
  | "power-equals"
  | "power-plus-constant"
  | "power-known-plus-square"
  | "root-equals"
  | "root-plus-constant"
  | "root-known-plus-root";

interface BeginnerBandRule {
  label: string;
  minOperand: number;
  maxOperand: number;
  extraOperands: readonly number[];
  maxOperations: 0 | 1 | 2 | 3;
  maxTerms: 1 | 2 | 3 | 4;
  allowEquations: boolean;
  equationForms: readonly BeginnerEquationForm[];
  maxConstant: number;
}

interface BeginnerTopicPolicy {
  regular: readonly BeginnerBandRule[];
  boss: readonly BeginnerBandRule[];
  finalBoss: readonly BeginnerBandRule[];
}

const DEFAULT_QUESTION_SELECTION_CONTEXT: QuestionSelectionContext = {
  battleStage: "apprentice",
  isBoss: false,
  isFinalBoss: false,
};

function createBeginnerBandRule(
  label: string,
  minOperand: number,
  maxOperand: number,
  maxOperations: 0 | 1 | 2 | 3,
  maxTerms: 1 | 2 | 3 | 4,
  options: Partial<
    Pick<BeginnerBandRule, "allowEquations" | "equationForms" | "maxConstant" | "extraOperands">
  > = {},
): BeginnerBandRule {
  return {
    label,
    minOperand,
    maxOperand,
    maxOperations,
    maxTerms,
    allowEquations: options.allowEquations ?? false,
    equationForms: options.equationForms ?? [],
    maxConstant: options.maxConstant ?? 0,
    extraOperands: options.extraOperands ?? [],
  };
}

const FRIENDLY_LARGE_VALUES = [120, 150, 200, 250, 300] as const;
const FRIENDLY_HARD_VALUES = [25, 50, 75, 100] as const;

const BEGINNER_QUESTION_RULES: Record<Difficulty, Record<QuestionTopic, BeginnerTopicPolicy>> = {
  facil: {
    potenciacao: {
      regular: [
        createBeginnerBandRule("quadrados 0-5", 0, 5, 0, 1),
        createBeginnerBandRule("quadrados 6-10", 6, 10, 0, 1),
        createBeginnerBandRule("quadrados 11-15", 11, 15, 0, 1),
      ],
      boss: [
        createBeginnerBandRule("boss facil 0-8", 0, 8, 0, 1),
        createBeginnerBandRule("boss facil 9-12", 9, 12, 0, 1),
        createBeginnerBandRule("boss facil 13-15", 13, 15, 1, 2),
      ],
      finalBoss: [
        createBeginnerBandRule("final facil 0-10", 0, 10, 0, 1),
        createBeginnerBandRule("final facil 11-15", 11, 15, 1, 2),
        createBeginnerBandRule("final facil leve+", 12, 16, 1, 2),
      ],
    },
    radiciacao: {
      regular: [
        createBeginnerBandRule("raizes 0-5", 0, 5, 0, 1),
        createBeginnerBandRule("raizes 6-10", 6, 10, 0, 1),
        createBeginnerBandRule("raizes 11-15", 11, 15, 0, 1),
      ],
      boss: [
        createBeginnerBandRule("boss raiz facil 0-8", 0, 8, 0, 1),
        createBeginnerBandRule("boss raiz facil 9-12", 9, 12, 0, 1),
        createBeginnerBandRule("boss raiz facil 13-15", 13, 15, 1, 2),
      ],
      finalBoss: [
        createBeginnerBandRule("final raiz facil 0-10", 0, 10, 0, 1),
        createBeginnerBandRule("final raiz facil 11-15", 11, 15, 1, 2),
        createBeginnerBandRule("final raiz facil leve+", 12, 16, 1, 2),
      ],
    },
    combinada: {
      regular: [
        createBeginnerBandRule("mix facil 0-5", 0, 5, 1, 2),
        createBeginnerBandRule("mix facil 6-10", 6, 10, 1, 2),
        createBeginnerBandRule("mix facil 11-15", 11, 15, 1, 2),
      ],
      boss: [
        createBeginnerBandRule("mix boss facil 0-8", 0, 8, 1, 2),
        createBeginnerBandRule("mix boss facil 9-12", 9, 12, 1, 2),
        createBeginnerBandRule("mix boss facil 13-15", 13, 15, 1, 2),
      ],
      finalBoss: [
        createBeginnerBandRule("mix final facil 0-10", 0, 10, 1, 2),
        createBeginnerBandRule("mix final facil 11-15", 11, 15, 1, 2),
        createBeginnerBandRule("mix final facil leve+", 12, 16, 1, 2),
      ],
    },
  },
  medio: {
    potenciacao: {
      regular: [
        createBeginnerBandRule("cubos 2-5", 2, 5, 1, 2),
        createBeginnerBandRule("cubos 3-5", 3, 5, 1, 2),
        createBeginnerBandRule("cubos 3-6", 3, 6, 1, 2),
      ],
      boss: [
        createBeginnerBandRule("boss medio cubos 2-5", 2, 5, 1, 2),
        createBeginnerBandRule("boss medio cubos 3-6", 3, 6, 1, 2),
        createBeginnerBandRule("boss medio cubos 4-6", 4, 6, 1, 2),
      ],
      finalBoss: [
        createBeginnerBandRule("final medio cubos 3-5", 3, 5, 1, 2),
        createBeginnerBandRule("final medio cubos 4-6", 4, 6, 1, 2),
        createBeginnerBandRule("final medio cubos 4-7", 4, 7, 1, 2),
      ],
    },
    radiciacao: {
      regular: [
        createBeginnerBandRule("raizes 6-10", 6, 10, 1, 2),
        createBeginnerBandRule("raizes 8-12", 8, 12, 1, 2),
        createBeginnerBandRule("raizes 10-14", 10, 14, 1, 2),
      ],
      boss: [
        createBeginnerBandRule("boss raiz medio 7-11", 7, 11, 1, 2),
        createBeginnerBandRule("boss raiz medio 9-13", 9, 13, 1, 2),
        createBeginnerBandRule("boss raiz medio 11-15", 11, 15, 1, 2),
      ],
      finalBoss: [
        createBeginnerBandRule("final raiz medio 8-12", 8, 12, 1, 2),
        createBeginnerBandRule("final raiz medio 10-14", 10, 14, 1, 2),
        createBeginnerBandRule("final raiz medio 12-16", 12, 16, 1, 2),
      ],
    },
    combinada: {
      regular: [
        createBeginnerBandRule("mix medio 2-5", 2, 5, 1, 2),
        createBeginnerBandRule("mix medio 3-5", 3, 5, 1, 2),
        createBeginnerBandRule("mix medio 3-6", 3, 6, 1, 2),
      ],
      boss: [
        createBeginnerBandRule("mix boss medio 2-5", 2, 5, 1, 2),
        createBeginnerBandRule("mix boss medio 3-6", 3, 6, 1, 2),
        createBeginnerBandRule("mix boss medio 4-6", 4, 6, 1, 2),
      ],
      finalBoss: [
        createBeginnerBandRule("mix final medio 3-5", 3, 5, 1, 2),
        createBeginnerBandRule("mix final medio 4-6", 4, 6, 1, 2),
        createBeginnerBandRule("mix final medio 4-7", 4, 7, 1, 2),
      ],
    },
  },
  dificil: {
    potenciacao: {
      regular: [
        createBeginnerBandRule("quadrados amplos", 10, 30, 0, 1),
        createBeginnerBandRule("quadrados em pares", 20, 60, 1, 2, { extraOperands: FRIENDLY_HARD_VALUES }),
        createBeginnerBandRule("quadrados de treino", 40, 100, 2, 3, {
          extraOperands: [...FRIENDLY_HARD_VALUES, ...FRIENDLY_LARGE_VALUES],
        }),
      ],
      boss: [
        createBeginnerBandRule("equacao de treino", 10, 30, 0, 1, {
          allowEquations: true,
          equationForms: ["power-equals", "power-plus-constant"],
          maxConstant: 12,
        }),
        createBeginnerBandRule("equacao forte", 20, 60, 1, 2, {
          allowEquations: true,
          equationForms: ["power-equals", "power-plus-constant", "power-known-plus-square"],
          maxConstant: 18,
          extraOperands: FRIENDLY_HARD_VALUES,
        }),
        createBeginnerBandRule("equacao de chefe", 40, 100, 2, 3, {
          allowEquations: true,
          equationForms: ["power-equals", "power-plus-constant", "power-known-plus-square"],
          maxConstant: 24,
          extraOperands: [...FRIENDLY_HARD_VALUES, ...FRIENDLY_LARGE_VALUES],
        }),
      ],
      finalBoss: [
        createBeginnerBandRule("revisao forte", 20, 50, 1, 2, {
          allowEquations: true,
          equationForms: ["power-equals", "power-plus-constant", "power-known-plus-square"],
          maxConstant: 16,
        }),
        createBeginnerBandRule("revisao final forte", 40, 100, 2, 3, {
          allowEquations: true,
          equationForms: ["power-equals", "power-plus-constant", "power-known-plus-square"],
          maxConstant: 24,
          extraOperands: FRIENDLY_HARD_VALUES,
        }),
        createBeginnerBandRule("fechamento final forte", 50, 120, 2, 3, {
          allowEquations: true,
          equationForms: ["power-equals", "power-plus-constant", "power-known-plus-square"],
          maxConstant: 28,
          extraOperands: [...FRIENDLY_HARD_VALUES, 150, 200],
        }),
      ],
    },
    radiciacao: {
      regular: [
        createBeginnerBandRule("raizes amplas", 10, 30, 0, 1),
        createBeginnerBandRule("raizes em pares", 20, 60, 1, 2),
        createBeginnerBandRule("raizes de treino", 40, 100, 2, 3),
      ],
      boss: [
        createBeginnerBandRule("raiz de treino", 10, 30, 0, 1, {
          allowEquations: true,
          equationForms: ["root-equals", "root-plus-constant"],
          maxConstant: 8,
        }),
        createBeginnerBandRule("raiz forte", 20, 60, 1, 2, {
          allowEquations: true,
          equationForms: ["root-equals", "root-plus-constant", "root-known-plus-root"],
          maxConstant: 10,
        }),
        createBeginnerBandRule("raiz de chefe", 40, 100, 2, 3, {
          allowEquations: true,
          equationForms: ["root-equals", "root-plus-constant", "root-known-plus-root"],
          maxConstant: 12,
        }),
      ],
      finalBoss: [
        createBeginnerBandRule("revisao de raizes", 20, 50, 1, 2, {
          allowEquations: true,
          equationForms: ["root-equals", "root-plus-constant", "root-known-plus-root"],
          maxConstant: 10,
        }),
        createBeginnerBandRule("revisao final forte", 40, 100, 2, 3, {
          allowEquations: true,
          equationForms: ["root-equals", "root-plus-constant", "root-known-plus-root"],
          maxConstant: 12,
        }),
        createBeginnerBandRule("fechamento final forte", 50, 120, 2, 3, {
          allowEquations: true,
          equationForms: ["root-equals", "root-plus-constant", "root-known-plus-root"],
          maxConstant: 14,
        }),
      ],
    },
    combinada: {
      regular: [
        createBeginnerBandRule("mix de treino", 10, 20, 1, 2),
        createBeginnerBandRule("mix amplo", 20, 50, 2, 3),
        createBeginnerBandRule("mix forte", 40, 100, 2, 3, { extraOperands: FRIENDLY_HARD_VALUES }),
      ],
      boss: [
        createBeginnerBandRule("mix de chefe", 10, 30, 1, 2),
        createBeginnerBandRule("mix forte", 20, 60, 2, 3),
        createBeginnerBandRule("mix denso", 40, 100, 2, 3, { extraOperands: FRIENDLY_HARD_VALUES }),
      ],
      finalBoss: [
        createBeginnerBandRule("mix final forte", 20, 40, 2, 3),
        createBeginnerBandRule("mix final amplo", 40, 100, 2, 3, { extraOperands: FRIENDLY_HARD_VALUES }),
        createBeginnerBandRule("mix final reforcado", 50, 120, 2, 3, { extraOperands: [150, 200] }),
      ],
    },
  },
  impossivel: {
    potenciacao: {
      regular: [
        createBeginnerBandRule("sandbox 1", 10, 40, 1, 2),
        createBeginnerBandRule("sandbox 2", 20, 80, 2, 3),
        createBeginnerBandRule("sandbox 3", 40, 120, 2, 3, {
          extraOperands: [...FRIENDLY_HARD_VALUES, ...FRIENDLY_LARGE_VALUES],
        }),
      ],
      boss: [
        createBeginnerBandRule("boss sandbox 1", 10, 40, 1, 2, {
          allowEquations: true,
          equationForms: ["power-equals", "power-plus-constant", "power-known-plus-square"],
          maxConstant: 18,
        }),
        createBeginnerBandRule("boss sandbox 2", 20, 80, 2, 3, {
          allowEquations: true,
          equationForms: ["power-equals", "power-plus-constant", "power-known-plus-square"],
          maxConstant: 24,
        }),
        createBeginnerBandRule("boss sandbox 3", 40, 150, 2, 3, {
          allowEquations: true,
          equationForms: ["power-equals", "power-plus-constant", "power-known-plus-square"],
          maxConstant: 30,
          extraOperands: [...FRIENDLY_HARD_VALUES, ...FRIENDLY_LARGE_VALUES],
        }),
      ],
      finalBoss: [
        createBeginnerBandRule("final sandbox 1", 20, 60, 2, 3, {
          allowEquations: true,
          equationForms: ["power-equals", "power-plus-constant", "power-known-plus-square"],
          maxConstant: 20,
        }),
        createBeginnerBandRule("final sandbox 2", 40, 120, 2, 3, {
          allowEquations: true,
          equationForms: ["power-equals", "power-plus-constant", "power-known-plus-square"],
          maxConstant: 28,
          extraOperands: FRIENDLY_HARD_VALUES,
        }),
        createBeginnerBandRule("final sandbox 3", 50, 150, 3, 4, {
          allowEquations: true,
          equationForms: ["power-equals", "power-plus-constant", "power-known-plus-square"],
          maxConstant: 30,
          extraOperands: [...FRIENDLY_HARD_VALUES, ...FRIENDLY_LARGE_VALUES],
        }),
      ],
    },
    radiciacao: {
      regular: [
        createBeginnerBandRule("sandbox raiz 1", 10, 40, 1, 2),
        createBeginnerBandRule("sandbox raiz 2", 20, 80, 2, 3),
        createBeginnerBandRule("sandbox raiz 3", 40, 120, 2, 3),
      ],
      boss: [
        createBeginnerBandRule("boss raiz 1", 10, 40, 1, 2, {
          allowEquations: true,
          equationForms: ["root-equals", "root-plus-constant", "root-known-plus-root"],
          maxConstant: 10,
        }),
        createBeginnerBandRule("boss raiz 2", 20, 80, 2, 3, {
          allowEquations: true,
          equationForms: ["root-equals", "root-plus-constant", "root-known-plus-root"],
          maxConstant: 14,
        }),
        createBeginnerBandRule("boss raiz 3", 40, 150, 2, 3, {
          allowEquations: true,
          equationForms: ["root-equals", "root-plus-constant", "root-known-plus-root"],
          maxConstant: 18,
        }),
      ],
      finalBoss: [
        createBeginnerBandRule("final raiz 1", 20, 60, 2, 3, {
          allowEquations: true,
          equationForms: ["root-equals", "root-plus-constant", "root-known-plus-root"],
          maxConstant: 12,
        }),
        createBeginnerBandRule("final raiz 2", 40, 120, 2, 3, {
          allowEquations: true,
          equationForms: ["root-equals", "root-plus-constant", "root-known-plus-root"],
          maxConstant: 16,
        }),
        createBeginnerBandRule("final raiz 3", 50, 150, 3, 4, {
          allowEquations: true,
          equationForms: ["root-equals", "root-plus-constant", "root-known-plus-root"],
          maxConstant: 20,
        }),
      ],
    },
    combinada: {
      regular: [
        createBeginnerBandRule("infinito guiado", 10, 30, 2, 3),
        createBeginnerBandRule("infinito amplo", 20, 70, 2, 3),
        createBeginnerBandRule("infinito denso", 40, 120, 3, 4, {
          extraOperands: [...FRIENDLY_HARD_VALUES, ...FRIENDLY_LARGE_VALUES],
        }),
      ],
      boss: [
        createBeginnerBandRule("boss infinito 1", 10, 40, 2, 3),
        createBeginnerBandRule("boss infinito 2", 20, 80, 2, 3),
        createBeginnerBandRule("boss infinito 3", 40, 140, 3, 4, {
          extraOperands: [...FRIENDLY_HARD_VALUES, ...FRIENDLY_LARGE_VALUES],
        }),
      ],
      finalBoss: [
        createBeginnerBandRule("final infinito 1", 20, 50, 2, 3),
        createBeginnerBandRule("final infinito 2", 40, 100, 3, 4, { extraOperands: FRIENDLY_HARD_VALUES }),
        createBeginnerBandRule("final infinito 3", 50, 150, 3, 4, {
          extraOperands: [...FRIENDLY_HARD_VALUES, ...FRIENDLY_LARGE_VALUES],
        }),
      ],
    },
  },
};

function superscript(n: number): string {
  const map: Record<string, string> = {
    "0": "⁰",
    "1": "¹",
    "2": "²",
    "3": "³",
    "4": "⁴",
    "5": "⁵",
    "6": "⁶",
    "7": "⁷",
    "8": "⁸",
    "9": "⁹",
  };

  return String(n)
    .split("")
    .map((char) => map[char] || char)
    .join("");
}

function shuffle<T>(items: readonly T[]): T[] {
  const copy = [...items];

  for (let index = copy.length - 1; index > 0; index -= 1) {
    const targetIndex = Math.floor(Math.random() * (index + 1));
    [copy[index], copy[targetIndex]] = [copy[targetIndex], copy[index]];
  }

  return copy;
}

function buildPowerQuestions(
  prefix: string,
  pairs: readonly (readonly [number, number])[],
): MathQuestion[] {
  return pairs.map(([base, exponent]) => ({
    id: `${prefix}-${base}-${exponent}`,
    question: `${base}${superscript(exponent)}`,
    answer: Math.pow(base, exponent),
    type: "potenciacao",
  }));
}

function buildRootQuestions(prefix: string, values: readonly number[]): MathQuestion[] {
  return values.map((value) => ({
    id: `${prefix}-${value}`,
    question: `√${value}`,
    answer: Math.sqrt(value),
    type: "radiciacao",
  }));
}

function buildExpressionQuestions(
  prefix: string,
  type: QuestionTopic,
  entries: readonly { question: string; answer: number }[],
): MathQuestion[] {
  return entries.map((entry, index) => ({
    id: `${prefix}-${index}`,
    question: entry.question,
    answer: entry.answer,
    type,
  }));
}

function normalizeQuestionText(question: string): string {
  let normalized = "";
  let inSuperscript = false;

  for (const char of question) {
    if (SUPERSCRIPT_DIGITS[char]) {
      if (!inSuperscript) {
        normalized += "^";
        inSuperscript = true;
      }

      normalized += SUPERSCRIPT_DIGITS[char];
      continue;
    }

    inSuperscript = false;

    if (char === "√") {
      normalized += "sqrt";
    } else if (char === "×") {
      normalized += "*";
    } else if (char === "÷") {
      normalized += "/";
    } else if (char === "−" || char === "–" || char === "—") {
      normalized += "-";
    } else if (char !== " ") {
      normalized += char;
    }
  }

  return normalized;
}

function getPowerPairs(): readonly (readonly [number, number])[] {
  return [
    [2, 2],
    [3, 2],
    [4, 2],
    [5, 2],
    [6, 2],
    [7, 2],
    [8, 2],
    [9, 2],
    [10, 2],
    [11, 2],
    [12, 2],
    [2, 3],
    [3, 3],
    [4, 3],
    [5, 3],
    [6, 3],
  ];
}

const powerBanks: Record<QuestionTier, MathQuestion[]> = {
  basic: buildPowerQuestions("pow-basic", getPowerPairs()),
  standard: buildExpressionQuestions("pow-standard", "potenciacao", [
    { question: "2² + 3²", answer: 13 },
    { question: "2³ + 3²", answer: 17 },
    { question: "4² + 2³", answer: 24 },
    { question: "5² − 3²", answer: 16 },
    { question: "2⁴ + 3²", answer: 25 },
    { question: "3³ − 2²", answer: 23 },
    { question: "2³ + 4²", answer: 24 },
    { question: "3² + 5²", answer: 34 },
    { question: "6² − 2³", answer: 28 },
    { question: "7² − 4²", answer: 33 },
    { question: "(2²) + (4²)", answer: 20 },
    { question: "3⁴ − 2²", answer: 77 },
    { question: "2⁵ − 3²", answer: 23 },
    { question: "4² + 5²", answer: 41 },
    { question: "8² − 3²", answer: 55 },
    { question: "(3² + 2³) + 4", answer: 21 },
  ]),
  advanced: buildExpressionQuestions("pow-advanced", "potenciacao", [
    { question: "(2³ + 3²) − 5", answer: 12 },
    { question: "2⁴ − 3² + 4", answer: 11 },
    { question: "(3² + 4²) − 2³", answer: 17 },
    { question: "2⁵ − 4²", answer: 16 },
    { question: "(2³ + 5²) − 3²", answer: 24 },
    { question: "3³ + 2⁴ − 5", answer: 38 },
    { question: "(4² + 2³) − 3²", answer: 15 },
    { question: "5² + 2³ − 4²", answer: 17 },
    { question: "3⁴ − 2³ + 1", answer: 74 },
    { question: "(2⁴ + 3²) + 5", answer: 30 },
    { question: "6² − 2⁴", answer: 20 },
    { question: "(7² − 3²) + 2²", answer: 44 },
    { question: "4³ − 5² + 2³", answer: 47 },
    { question: "(2⁴ + 4²) − 3²", answer: 23 },
    { question: "3³ + 5² − 4²", answer: 36 },
    { question: "(2³ + 3³) − 4²", answer: 19 },
  ]),
  master: buildExpressionQuestions("pow-master", "potenciacao", [
    { question: "(2³)²", answer: 64 },
    { question: "2² × 2³", answer: 32 },
    { question: "3² × 3²", answer: 81 },
    { question: "(2⁴ + 3²) ÷ 5", answer: 5 },
    { question: "(3³ − 2²) + 2³", answer: 31 },
    { question: "(4² + 2⁵) ÷ 6", answer: 8 },
    { question: "(2³ + 3²) × 2", answer: 34 },
    { question: "5² + 2⁴ − 3²", answer: 32 },
    { question: "(2⁵ − 2³) ÷ 3", answer: 8 },
    { question: "(3² + 4²) × 2", answer: 50 },
    { question: "(2³ + 5²) ÷ 3", answer: 11 },
    { question: "(3⁴ − 2²) ÷ 5", answer: 15 },
    { question: "(2⁴ + 2³) × 2", answer: 48 },
    { question: "(4² + 3²) ÷ 5", answer: 5 },
  ]),
};

const rootBanks: Record<QuestionTier, MathQuestion[]> = {
  basic: buildRootQuestions("root-basic", [4, 9, 16, 25, 36, 49, 64, 81, 100, 121, 144]),
  standard: buildExpressionQuestions("root-standard", "radiciacao", [
    { question: "√64 + 2", answer: 10 },
    { question: "√81 − 3", answer: 6 },
    { question: "√100 + 5", answer: 15 },
    { question: "√121 − 4", answer: 7 },
    { question: "√144 ÷ 2", answer: 6 },
    { question: "√169 − 5", answer: 8 },
    { question: "√196 ÷ 7", answer: 2 },
    { question: "√225 + 3", answer: 18 },
    { question: "√256 ÷ 4", answer: 4 },
    { question: "√289 − 8", answer: 9 },
    { question: "√324 ÷ 6", answer: 3 },
    { question: "√361 − 10", answer: 9 },
  ]),
  advanced: buildExpressionQuestions("root-advanced", "radiciacao", [
    { question: "√144 ÷ 2 + 3²", answer: 15 },
    { question: "√196 − √49", answer: 7 },
    { question: "√225 + √25", answer: 20 },
    { question: "√256 ÷ 4 + 5", answer: 9 },
    { question: "√324 − 2²", answer: 14 },
    { question: "(√169 + 3) − 4", answer: 12 },
    { question: "√400 ÷ 5 + 2", answer: 6 },
    { question: "√441 − 3²", answer: 12 },
    { question: "(√484 + √16) ÷ 2", answer: 13 },
    { question: "√529 − 8", answer: 15 },
    { question: "√576 ÷ 6 + 1", answer: 5 },
    { question: "√625 − √25", answer: 20 },
  ]),
  master: buildExpressionQuestions("root-master", "radiciacao", [
    { question: "(√144 + √81) ÷ 3", answer: 7 },
    { question: "√196 + √64 − 10", answer: 12 },
    { question: "(√225 − √25) ÷ 2", answer: 5 },
    { question: "√256 + 2² − 10", answer: 10 },
    { question: "(√324 ÷ 3) + √16", answer: 10 },
    { question: "√400 − √100 + 3", answer: 13 },
    { question: "(√441 + √49) ÷ 4", answer: 7 },
    { question: "√484 − 2 × √25", answer: 12 },
    { question: "(√625 ÷ 5) + √36", answer: 11 },
    { question: "√784 − √144", answer: 16 },
    { question: "(√900 + √100) ÷ 4", answer: 10 },
    { question: "√676 − √36 + 2", answer: 22 },
  ]),
};

const combinedBanks: Record<QuestionTier, MathQuestion[]> = {
  basic: buildExpressionQuestions("mix-basic", "combinada", [
    { question: "2² + √9", answer: 7 },
    { question: "3² + √16", answer: 13 },
    { question: "4² − √9", answer: 13 },
    { question: "2³ + √4", answer: 10 },
    { question: "5² − √16", answer: 21 },
    { question: "3² + √25", answer: 14 },
    { question: "2² + √36", answer: 10 },
    { question: "4² + √1", answer: 17 },
    { question: "6² − √25", answer: 31 },
    { question: "2³ + √49", answer: 15 },
    { question: "3² + √64", answer: 17 },
    { question: "5² + √9", answer: 28 },
    { question: "4² − √16", answer: 12 },
    { question: "2² + √25", answer: 9 },
    { question: "3³ − √9", answer: 24 },
    { question: "4² + √36", answer: 22 },
  ]),
  standard: buildExpressionQuestions("mix-standard", "combinada", [
    { question: "2³ + √49", answer: 15 },
    { question: "3² + 2³", answer: 17 },
    { question: "√64 − 2²", answer: 4 },
    { question: "(2²) + (3²)", answer: 13 },
    { question: "√81 ÷ 3", answer: 3 },
    { question: "2³ + 3² − √16", answer: 13 },
    { question: "4² + √25 − 3", answer: 18 },
    { question: "5² − √9 + 2²", answer: 26 },
    { question: "2⁴ + √16", answer: 20 },
    { question: "3³ − √25", answer: 22 },
    { question: "√100 + 2³", answer: 18 },
    { question: "6² − √36 + 2", answer: 32 },
    { question: "4² + 2³ − √9", answer: 21 },
    { question: "√64 + 3² − 5", answer: 12 },
    { question: "2⁴ − √25 + 3", answer: 14 },
    { question: "3² + √49 + 2", answer: 18 },
  ]),
  advanced: buildExpressionQuestions("mix-advanced", "combinada", [
    { question: "(2³ + 3²) − √25", answer: 12 },
    { question: "√144 ÷ 2 + 3²", answer: 15 },
    { question: "2⁴ − √36 + 3²", answer: 19 },
    { question: "√81 + 2³ − 5", answer: 12 },
    { question: "3³ − √49 + 2²", answer: 24 },
    { question: "(4² + √64) − 3²", answer: 15 },
    { question: "2³ + 3² + √16", answer: 21 },
    { question: "5² − 2³ + √49", answer: 24 },
    { question: "√196 ÷ 2 + 2²", answer: 18 },
    { question: "3² + 2⁴ − √25", answer: 20 },
    { question: "(√121 + 2³) − 4", answer: 15 },
    { question: "4² + √49 + 2²", answer: 27 },
    { question: "(2⁴ + √36) − 3²", answer: 13 },
    { question: "√225 − 2³ + 3²", answer: 16 },
    { question: "3³ + √64 − 2²", answer: 31 },
    { question: "(5² + √9) − 2⁴", answer: 12 },
  ]),
  master: buildExpressionQuestions("mix-master", "combinada", [
    { question: "(2⁴ + √144) − 3²", answer: 19 },
    { question: "(3² + 2³ + √25) × 2", answer: 44 },
    { question: "√256 ÷ 4 + 2³", answer: 12 },
    { question: "(2³ + 3²) + √64 − 5", answer: 20 },
    { question: "5² + √49 − 2⁴", answer: 16 },
    { question: "(√144 + 2²) ÷ 4", answer: 4 },
    { question: "3⁴ − √49 + 2²", answer: 78 },
    { question: "(2⁵ + √49) − 3²", answer: 30 },
    { question: "√324 ÷ 3 + 2⁴", answer: 22 },
    { question: "(4² + √81) + 2³", answer: 33 },
    { question: "(3² + √49) × 2", answer: 32 },
    { question: "(2⁴ + √64) ÷ 3", answer: 8 },
    { question: "√400 − 2³ + 3²", answer: 21 },
    { question: "(2³ + 4² + √25) − 6", answer: 23 },
  ]),
};

const QUESTION_BANK: Record<QuestionTopic, Record<QuestionTier, MathQuestion[]>> = {
  potenciacao: powerBanks,
  radiciacao: rootBanks,
  combinada: combinedBanks,
};

const PERFECT_SQUARES = Array.from({ length: 500 }, (_, index) => {
  const root = index;
  return {
    root,
    value: root * root,
  };
});

type ExpressionTerm = {
  text: string;
  value: number;
};

function randomItem<T>(items: readonly T[]): T {
  return items[Math.floor(Math.random() * items.length)];
}

function randomInt(min: number, max: number): number {
  return min + Math.floor(Math.random() * (max - min + 1));
}

function createPowerTerm(bandConfig: ComplexityBandConfig): ExpressionTerm | null {
  const maxBase = Math.max(2, Math.min(12, bandConfig.maxBase));
  const maxExponent = Math.max(2, Math.min(6, bandConfig.maxExponent));

  for (let attempt = 0; attempt < 24; attempt += 1) {
    const base = randomInt(2, maxBase);
    const exponent = randomInt(2, maxExponent);
    const value = Math.pow(base, exponent);

    if (value <= bandConfig.maxAnswerAbs) {
      return {
        text: `${base}${superscript(exponent)}`,
        value,
      };
    }
  }

  return null;
}

function createRootTerm(bandConfig: ComplexityBandConfig): ExpressionTerm | null {
  const candidates = PERFECT_SQUARES.filter((entry) => entry.value <= bandConfig.maxRootValue);

  if (candidates.length === 0) {
    return null;
  }

  const selected = randomItem(candidates);

  return {
    text: `√${selected.value}`,
    value: selected.root,
  };
}

function createConstant(maxValue: number): ExpressionTerm {
  const value = randomInt(1, Math.max(1, maxValue));

  return {
    text: String(value),
    value,
  };
}

function createBandConstant(
  bandConfig: ComplexityBandConfig,
  preferredMax: number,
): ExpressionTerm {
  return createConstant(Math.min(bandConfig.maxConstant, preferredMax));
}

function getPolicyBand<T>(bands: readonly T[], band: number): T {
  const clampedIndex = Math.min(Math.max(band, 1), bands.length) - 1;
  return bands[clampedIndex]!;
}

function createSquareTerm(base: number): ExpressionTerm {
  return {
    text: `${base}${superscript(2)}`,
    value: Math.pow(base, 2),
  };
}

function createDifficultyPowerOperandTerm(
  base: number,
  difficulty: Difficulty,
): ExpressionTerm {
  const exponent = difficulty === "medio" ? 3 : 2;

  return {
    text: `${base}${superscript(exponent)}`,
    value: Math.pow(base, exponent),
  };
}

function createMediumDirectPowerTerms(base: number, maxAnswerAbs: number): ExpressionTerm[] {
  return [3, 4]
    .map((exponent) => ({
      text: `${base}${superscript(exponent)}`,
      value: Math.pow(base, exponent),
    }))
    .filter((term) => term.value <= maxAnswerAbs);
}

function createRootOperandTerm(operand: number): ExpressionTerm {
  return {
    text: `√${operand * operand}`,
    value: operand,
  };
}

function addQuestionToPool(pool: Map<string, MathQuestion>, phase: Phase, question: string, answer: number): void {
  if (answer < 0) {
    return;
  }

  const key = question.trim();

  if (!pool.has(key)) {
    pool.set(key, createDynamicQuestion(phase, question, answer));
  }
}

function shouldAllowEquations(
  difficulty: Difficulty,
  context: QuestionSelectionContext,
): boolean {
  if (difficulty === "facil" || difficulty === "medio") {
    return false;
  }

  return context.isBoss || context.isFinalBoss;
}

function getBeginnerBandRule(
  difficulty: Difficulty,
  phase: Phase,
  band: number,
  context: QuestionSelectionContext,
): BeginnerBandRule {
  const topic = PHASE_CONFIGS[phase].questionType;
  const topicRules = BEGINNER_QUESTION_RULES[difficulty][topic];
  const ruleSet = context.isFinalBoss
    ? topicRules.finalBoss
    : context.isBoss
      ? topicRules.boss
      : topicRules.regular;

  return getPolicyBand(ruleSet, band);
}

function getInfiniteBandRule(level: number, topic: QuestionTopic): BeginnerBandRule {
  if (level <= 3) {
    if (topic === "combinada") {
      return createBeginnerBandRule("infinito-facil-0-10", 0, 10, 0, 1);
    }

    return createBeginnerBandRule("infinito-facil-0-10", 0, 10, 0, 1);
  }

  if (level <= 6) {
    if (topic === "combinada") {
      return createBeginnerBandRule("infinito-facil-0-15", 0, 15, 1, 2);
    }

    return createBeginnerBandRule("infinito-facil-0-15", 0, 15, 0, 1);
  }

  if (level <= 10) {
    if (topic === "combinada") {
      return createBeginnerBandRule("infinito-medio-5-12", 5, 12, 1, 2);
    }

    return createBeginnerBandRule("infinito-medio-5-12", 5, 12, 0, 1);
  }

  if (level <= 15) {
    if (topic === "combinada") {
      return createBeginnerBandRule("infinito-medio-5-15", 5, 15, 1, 2);
    }

    return createBeginnerBandRule("infinito-medio-5-15", 5, 15, 0, 1);
  }

  if (topic === "combinada") {
    return createBeginnerBandRule("infinito-dificil-leve", 10, 25, 2, 3, {
      extraOperands: FRIENDLY_HARD_VALUES,
    });
  }

  return createBeginnerBandRule("infinito-dificil-leve", 10, 25, 1, 2, {
    extraOperands: FRIENDLY_HARD_VALUES,
  });
}

function getOperandValues(rule: BeginnerBandRule): number[] {
  const values = new Set<number>();

  for (let value = Math.max(0, rule.minOperand); value <= rule.maxOperand; value += 1) {
    values.add(value);
  }

  for (const extraValue of rule.extraOperands) {
    if (extraValue >= 0) {
      values.add(extraValue);
    }
  }

  return [...values].sort((left, right) => left - right);
}

function getExpressionOperands(values: readonly number[]): number[] {
  const filtered = values.filter(
    (value, index) =>
      value <= 15 ||
      value % 5 === 0 ||
      FRIENDLY_HARD_VALUES.includes(value as (typeof FRIENDLY_HARD_VALUES)[number]) ||
      index % 3 === 0,
  );

  return filtered.length > 0 ? filtered : [...values];
}

function isDirectOnlyContext(
  difficulty: Difficulty,
  phase: Phase,
): boolean {
  const topic = PHASE_CONFIGS[phase].questionType;

  if (difficulty === "facil" && (topic === "potenciacao" || topic === "radiciacao")) {
    return true;
  }

  if (difficulty === "medio" && topic === "potenciacao") {
    return true;
  }

  return false;
}

function buildPotentiationQuestionPool(
  rule: BeginnerBandRule,
  phase: Phase,
  difficulty: Difficulty,
  maxAnswerAbs: number,
  context: QuestionSelectionContext,
): MathQuestion[] {
  const pool = new Map<string, MathQuestion>();
  const operands = getOperandValues(rule);
  const expressionOperands = getExpressionOperands(operands);
  const directOnly = isDirectOnlyContext(difficulty, phase);

  for (const operand of operands) {
    if (difficulty === "medio") {
      for (const term of createMediumDirectPowerTerms(operand, maxAnswerAbs)) {
        addQuestionToPool(pool, phase, term.text, term.value);
      }
      continue;
    }

    const term = createDifficultyPowerOperandTerm(operand, difficulty);
    addQuestionToPool(pool, phase, term.text, term.value);
  }

  if (!directOnly && rule.maxOperations >= 1) {
    for (const leftOperand of expressionOperands) {
      for (const rightOperand of expressionOperands.filter((value) => value <= leftOperand)) {
        const left = createDifficultyPowerOperandTerm(leftOperand, difficulty);
        const right = createDifficultyPowerOperandTerm(rightOperand, difficulty);

        addQuestionToPool(pool, phase, `${left.text} + ${right.text}`, left.value + right.value);

        if (leftOperand > rightOperand) {
          addQuestionToPool(pool, phase, `${left.text} - ${right.text}`, left.value - right.value);
        }
      }
    }
  }

  if (!directOnly && difficulty !== "facil" && difficulty !== "medio" && rule.maxOperations >= 2) {
    for (const firstOperand of expressionOperands) {
      for (const secondOperand of expressionOperands.filter((value) => value <= firstOperand)) {
        for (const thirdOperand of expressionOperands.filter((value) => value < secondOperand)) {
          const first = createDifficultyPowerOperandTerm(firstOperand, difficulty);
          const second = createDifficultyPowerOperandTerm(secondOperand, difficulty);
          const third = createDifficultyPowerOperandTerm(thirdOperand, difficulty);
          addQuestionToPool(
            pool,
            phase,
            `${first.text} + ${second.text} - ${third.text}`,
            first.value + second.value - third.value,
          );
        }
      }
    }
  }

  if (shouldAllowEquations(difficulty, context) && rule.allowEquations) {
    for (const operand of operands.filter((value) => value >= 2)) {
      const square = createSquareTerm(operand);

      if (rule.equationForms.includes("power-equals")) {
        addQuestionToPool(pool, phase, `x${superscript(2)} = ${square.value}`, operand);
      }

      if (rule.equationForms.includes("power-plus-constant")) {
        for (let constant = 1; constant <= Math.max(1, rule.maxConstant); constant += 1) {
          addQuestionToPool(
            pool,
            phase,
            `x${superscript(2)} + ${constant} = ${square.value + constant}`,
            operand,
          );
        }
      }

      if (rule.equationForms.includes("power-known-plus-square")) {
        for (const knownOperand of operands.filter(
          (value) => value >= 1 && value <= Math.max(1, Math.min(rule.maxOperand, 12)),
        )) {
          const knownSquare = createSquareTerm(knownOperand);
          addQuestionToPool(
            pool,
            phase,
            `${knownSquare.text} + x${superscript(2)} = ${knownSquare.value + square.value}`,
            operand,
          );
        }
      }
    }
  }

  return [...pool.values()];
}

function buildRadicationQuestionPool(
  rule: BeginnerBandRule,
  phase: Phase,
  difficulty: Difficulty,
  context: QuestionSelectionContext,
): MathQuestion[] {
  const pool = new Map<string, MathQuestion>();
  const operands = getOperandValues(rule);
  const expressionOperands = getExpressionOperands(operands);
  const directOnly = isDirectOnlyContext(difficulty, phase);

  for (const operand of operands) {
    const term = createRootOperandTerm(operand);
    addQuestionToPool(pool, phase, term.text, term.value);
  }

  if (!directOnly && rule.maxOperations >= 1) {
    for (const leftOperand of expressionOperands) {
      for (const rightOperand of expressionOperands.filter((value) => value <= leftOperand)) {
        const left = createRootOperandTerm(leftOperand);
        const right = createRootOperandTerm(rightOperand);

        addQuestionToPool(pool, phase, `${left.text} + ${right.text}`, left.value + right.value);

        if (leftOperand > rightOperand) {
          addQuestionToPool(pool, phase, `${left.text} - ${right.text}`, left.value - right.value);
        }
      }
    }
  }

  if (!directOnly && difficulty !== "facil" && difficulty !== "medio" && rule.maxOperations >= 2) {
    for (const firstOperand of expressionOperands) {
      for (const secondOperand of expressionOperands.filter((value) => value <= firstOperand)) {
        for (const thirdOperand of expressionOperands.filter((value) => value < secondOperand)) {
          const first = createRootOperandTerm(firstOperand);
          const second = createRootOperandTerm(secondOperand);
          const third = createRootOperandTerm(thirdOperand);
          addQuestionToPool(
            pool,
            phase,
            `${first.text} + ${second.text} - ${third.text}`,
            first.value + second.value - third.value,
          );
        }
      }
    }
  }

  if (shouldAllowEquations(difficulty, context) && rule.allowEquations) {
    for (const operand of operands.filter((value) => value >= 2)) {
      if (rule.equationForms.includes("root-equals")) {
        addQuestionToPool(pool, phase, `√x = ${operand}`, operand * operand);
      }

      if (rule.equationForms.includes("root-plus-constant")) {
        for (let constant = 1; constant <= Math.max(1, rule.maxConstant); constant += 1) {
          addQuestionToPool(
            pool,
            phase,
            `√x + ${constant} = ${operand + constant}`,
            operand * operand,
          );
        }
      }

      if (rule.equationForms.includes("root-known-plus-root")) {
        for (const knownOperand of operands.filter(
          (value) => value >= 1 && value <= Math.max(1, Math.min(rule.maxOperand, 12)),
        )) {
          const known = createRootOperandTerm(knownOperand);
          addQuestionToPool(
            pool,
            phase,
            `√x + ${known.text} = ${operand + known.value}`,
            operand * operand,
          );
        }
      }
    }
  }

  return [...pool.values()];
}

function buildCombinedQuestionPool(
  rule: BeginnerBandRule,
  phase: Phase,
  difficulty: Difficulty,
): MathQuestion[] {
  const pool = new Map<string, MathQuestion>();
  const operands = getOperandValues(rule);
  const expressionOperands = getExpressionOperands(operands);

  for (const powerOperand of expressionOperands) {
    for (const rootOperand of expressionOperands) {
      const power = createDifficultyPowerOperandTerm(powerOperand, difficulty);
      const root = createRootOperandTerm(rootOperand);

      addQuestionToPool(pool, phase, `${power.text} + ${root.text}`, power.value + root.value);

      if (power.value > root.value) {
        addQuestionToPool(pool, phase, `${power.text} - ${root.text}`, power.value - root.value);
      }

      if (root.value > power.value) {
        addQuestionToPool(pool, phase, `${root.text} - ${power.text}`, root.value - power.value);
      }
    }
  }

  if (rule.maxOperations >= 2) {
    for (const firstOperand of expressionOperands) {
      for (const secondOperand of expressionOperands.filter((value) => value <= firstOperand)) {
        for (const thirdOperand of expressionOperands.filter((value) => value < secondOperand)) {
          const power = createDifficultyPowerOperandTerm(firstOperand, difficulty);
          const root = createRootOperandTerm(secondOperand);
          const tail = createDifficultyPowerOperandTerm(thirdOperand, difficulty);
          addQuestionToPool(
            pool,
            phase,
            `${power.text} + ${root.text} - ${tail.text}`,
            power.value + root.value - tail.value,
          );
        }
      }
    }
  }

  if (rule.maxOperations >= 3) {
    for (const firstOperand of expressionOperands) {
      for (const secondOperand of expressionOperands.filter((value) => value <= firstOperand)) {
        for (const thirdOperand of expressionOperands.filter((value) => value <= secondOperand)) {
          const power = createDifficultyPowerOperandTerm(firstOperand, difficulty);
          const root = createRootOperandTerm(secondOperand);
          const tail = createRootOperandTerm(thirdOperand);
          addQuestionToPool(
            pool,
            phase,
            `${power.text} + ${root.text} + ${tail.text}`,
            power.value + root.value + tail.value,
          );
        }
      }
    }
  }

  return [...pool.values()];
}

function buildRuleBasedQuestionPool(
  phase: Phase,
  difficulty: Difficulty,
  band: number,
  context: QuestionSelectionContext,
): MathQuestion[] {
  const rule = getBeginnerBandRule(difficulty, phase, band, context);
  const topic = PHASE_CONFIGS[phase].questionType;
  const bandConfig = getComplexityBandConfig(difficulty, band);

  if (topic === "potenciacao") {
    return buildPotentiationQuestionPool(rule, phase, difficulty, bandConfig.maxAnswerAbs, context);
  }

  if (topic === "radiciacao") {
    return buildRadicationQuestionPool(rule, phase, difficulty, context);
  }

  return buildCombinedQuestionPool(rule, phase, difficulty);
}

function buildInfiniteQuestionPool(phase: Phase, level: number): MathQuestion[] {
  const topic = PHASE_CONFIGS[phase].questionType;
  const rule = getInfiniteBandRule(level, topic);
  const bandConfig = getEndlessComplexityBandConfig(level);

  if (topic === "potenciacao") {
    return buildPotentiationQuestionPool(rule, phase, "impossivel", bandConfig.maxAnswerAbs, {
      battleStage: "apprentice",
      isBoss: false,
      isFinalBoss: false,
    });
  }

  if (topic === "radiciacao") {
    return buildRadicationQuestionPool(rule, phase, "impossivel", {
      battleStage: "apprentice",
      isBoss: false,
      isFinalBoss: false,
    });
  }

  return buildCombinedQuestionPool(rule, phase, "impossivel");
}

function createDynamicQuestion(
  phase: Phase,
  question: string,
  answer: number,
): MathQuestion {
  const type = PHASE_CONFIGS[phase].questionType;
  const slug = question.replace(/\s+/g, "").replace(/[^\w√⁰¹²³⁴⁵⁶⁷⁸⁹()+\-×÷]/g, "");

  return {
    id: `dynamic-${phase}-${slug}`,
    question,
    answer,
    type,
  };
}

function buildQuestionProfile(question: MathQuestion): QuestionProfile {
  const normalizedQuestion = normalizeQuestionText(question.question);
  const simplePowerMatches = [...normalizedQuestion.matchAll(/(\d+)\^(\d+)/g)];
  const nestedExponentMatches = [...normalizedQuestion.matchAll(/\)\^(\d+)/g)];
  const rootMatches = [...normalizedQuestion.matchAll(/sqrt(\d+)/g)];
  const operationCount = (normalizedQuestion.match(/[+\-*/]/g) ?? []).length;
  const maxExponent = Math.max(
    0,
    ...simplePowerMatches.map((match) => Number(match[2])),
    ...nestedExponentMatches.map((match) => Number(match[1])),
  );
  const maxBase = Math.max(0, ...simplePowerMatches.map((match) => Number(match[1])));
  const maxRootValue = Math.max(0, ...rootMatches.map((match) => Number(match[1])));
  const hasMultiplication = normalizedQuestion.includes("*");
  const hasDivision = normalizedQuestion.includes("/");
  const hasParentheses = normalizedQuestion.includes("(") || normalizedQuestion.includes(")");
  const containsPower = maxExponent > 0;
  const containsRoot = maxRootValue > 0;

  return {
    operationCount,
    termCount: operationCount === 0 ? 1 : operationCount + 1,
    maxExponent,
    maxBase,
    maxRootValue,
    hasParentheses,
    hasMultiplication,
    hasDivision,
    containsBothTopics: containsPower && containsRoot,
    answerAbs: Math.abs(question.answer),
  };
}

function matchesComplexityBand(
  question: MathQuestion,
  phase: Phase,
  bandConfig: ComplexityBandConfig,
): boolean {
  const profile = buildQuestionProfile(question);
  const phaseTopic = PHASE_CONFIGS[phase].questionType;

  if (!bandConfig.tiers.some((tier) => QUESTION_BANK[phaseTopic][tier].some((entry) => entry.id === question.id))) {
    return false;
  }

  if (profile.maxExponent > bandConfig.maxExponent) {
    return false;
  }

  if (profile.maxBase > bandConfig.maxBase) {
    return false;
  }

  if (profile.maxRootValue > bandConfig.maxRootValue) {
    return false;
  }

  if (profile.operationCount > bandConfig.maxOperations) {
    return false;
  }

  if (profile.termCount > bandConfig.maxTerms) {
    return false;
  }

  if (profile.answerAbs > bandConfig.maxAnswerAbs || question.answer < 0) {
    return false;
  }

  if (profile.hasParentheses && !bandConfig.allowParentheses) {
    return false;
  }

  if (profile.hasMultiplication && !bandConfig.allowMultiplication) {
    return false;
  }

  if (profile.hasDivision && !bandConfig.allowDivision) {
    return false;
  }

  if (phaseTopic === "combinada" && !bandConfig.allowMixedTopics) {
    return false;
  }

  if (phaseTopic === "combinada" && !profile.containsBothTopics) {
    return false;
  }

  return true;
}

function tryDynamicPowerQuestion(bandConfig: ComplexityBandConfig): { question: string; answer: number } | null {
  const templates: Array<() => { question: string; answer: number } | null> = [
    () => {
      const power = createPowerTerm(bandConfig);
      return power ? { question: power.text, answer: power.value } : null;
    },
    () => {
      const left = createPowerTerm(bandConfig);
      const right = createPowerTerm(bandConfig);

      if (!left || !right || bandConfig.maxOperations < 1 || bandConfig.maxTerms < 2) {
        return null;
      }

      if (left.value + right.value <= bandConfig.maxAnswerAbs) {
        return { question: `${left.text} + ${right.text}`, answer: left.value + right.value };
      }

      if (left.value > right.value) {
        return { question: `${left.text} − ${right.text}`, answer: left.value - right.value };
      }

      return null;
    },
  ];

  return randomItem(templates)();
}

function tryDynamicRootQuestion(bandConfig: ComplexityBandConfig): { question: string; answer: number } | null {
  const templates: Array<() => { question: string; answer: number } | null> = [
    () => {
      const root = createRootTerm(bandConfig);
      return root ? { question: root.text, answer: root.value } : null;
    },
    () => {
      const root = createRootTerm(bandConfig);
      const constant = createBandConstant(bandConfig, 10);

      if (!root || bandConfig.maxOperations < 1 || bandConfig.maxTerms < 2) {
        return null;
      }

      if (root.value + constant.value <= bandConfig.maxAnswerAbs) {
        return { question: `${root.text} + ${constant.text}`, answer: root.value + constant.value };
      }

      if (root.value > constant.value) {
        return { question: `${root.text} − ${constant.text}`, answer: root.value - constant.value };
      }

      return null;
    },
  ];

  return randomItem(templates)();
}

function tryDynamicMixedQuestion(bandConfig: ComplexityBandConfig): { question: string; answer: number } | null {
  const templates: Array<() => { question: string; answer: number } | null> = [
    () => {
      const power = createPowerTerm(bandConfig);
      const root = createRootTerm(bandConfig);

      if (!power || !root || bandConfig.maxOperations < 1 || bandConfig.maxTerms < 2) {
        return null;
      }

      if (power.value + root.value <= bandConfig.maxAnswerAbs) {
        return { question: `${power.text} + ${root.text}`, answer: power.value + root.value };
      }

      if (power.value > root.value) {
        return { question: `${power.text} − ${root.text}`, answer: power.value - root.value };
      }

      return null;
    },
  ];

  return randomItem(templates)();
}

function generateDynamicQuestionForBand(
  phase: Phase,
  bandConfig: ComplexityBandConfig,
  usedQuestions: ReadonlySet<string>,
  allowReuse = false,
): MathQuestion | null {
  const questionType = PHASE_CONFIGS[phase].questionType;

  for (let attempt = 0; attempt < 120; attempt += 1) {
    const candidate =
      questionType === "potenciacao"
        ? tryDynamicPowerQuestion(bandConfig)
        : questionType === "radiciacao"
          ? tryDynamicRootQuestion(bandConfig)
          : tryDynamicMixedQuestion(bandConfig);

    if (!candidate) {
      continue;
    }

    const question = createDynamicQuestion(phase, candidate.question, candidate.answer);

    if (!allowReuse && usedQuestions.has(getQuestionKey(question))) {
      continue;
    }

    if (matchesComplexityBand(question, phase, bandConfig)) {
      return question;
    }
  }

  return null;
}

function getBandSearchOrder(difficulty: Difficulty, activeBand: number): number[] {
  const maxBand = getDifficultyModeConfig(difficulty).maxBand;
  const order: number[] = [];

  for (let offset = 0; offset < maxBand; offset += 1) {
    const lower = activeBand - offset;
    const higher = activeBand + offset;

    if (lower >= 1 && !order.includes(lower)) {
      order.push(lower);
    }

    if (higher <= maxBand && !order.includes(higher)) {
      order.push(higher);
    }
  }

  return order;
}

function getModeTierPool(phase: Phase, difficulty: Difficulty, searchOrder: readonly number[]): MathQuestion[] {
  const questionType = PHASE_CONFIGS[phase].questionType;
  const seen = new Set<string>();
  const pool: MathQuestion[] = [];

  for (const bandIndex of searchOrder) {
    const bandConfig = getComplexityBandConfig(difficulty, bandIndex);

    for (const tier of bandConfig.tiers) {
      for (const question of QUESTION_BANK[questionType][tier]) {
        if (seen.has(question.id)) {
          continue;
        }

        seen.add(question.id);
        pool.push(question);
      }
    }
  }

  return pool;
}

export function getQuestionKey(question: MathQuestion): string {
  return question.question.trim();
}

function getQuestionValues(question: MathQuestion): number[] {
  const normalized = normalizeQuestionText(question.question);
  return [...normalized.matchAll(/\d+/g)].map((match) => Number(match[0]));
}

function createQuestionSourceKey(
  phase: Phase,
  difficulty: Difficulty,
  band: number,
  context: QuestionSelectionContext,
): string {
  return `phase:${phase}|difficulty:${difficulty}|band:${band}|stage:${context.battleStage}|boss:${context.isBoss}|final:${context.isFinalBoss}`;
}

export function createQuestionCycleKey(
  phase: Phase,
  difficulty: Difficulty,
  band: number,
  context: QuestionSelectionContext,
): string {
  if (difficulty === "medio") {
    return `phase:${phase}|difficulty:${difficulty}`;
  }

  return createQuestionSourceKey(phase, difficulty, band, context);
}

function createEndlessQuestionSourceKey(phase: Phase, level: number): string {
  return `endless|phase:${phase}|level:${level}`;
}

function getCachedQuestionPool(sourceKey: string, builder: () => MathQuestion[]): readonly MathQuestion[] {
  const cachedPool = QUESTION_POOL_CACHE.get(sourceKey);

  if (cachedPool) {
    return cachedPool;
  }

  const pool = builder();
  QUESTION_POOL_CACHE.set(sourceKey, pool);
  return pool;
}

export function createQuestionCycleState(): QuestionCycleState {
  return {
    cycleKey: null,
    usedKeys: [],
    lastQuestionKey: null,
    recentValues: [],
    cycleCount: 0,
  };
}

function drawQuestionFromPool(
  pool: readonly MathQuestion[],
  cycleKey: string,
  state: QuestionCycleState,
): QuestionDrawResult {
  const activeState =
    state.cycleKey === cycleKey
      ? state
      : {
          cycleKey,
          usedKeys: [],
          lastQuestionKey: null,
          recentValues: [],
          cycleCount: 0,
        };

  const usedKeys = new Set(activeState.usedKeys);
  let available = pool.filter((question) => !usedKeys.has(getQuestionKey(question)));
  let cycleCount = activeState.cycleCount;

  if (available.length === 0) {
    usedKeys.clear();
    cycleCount += 1;
    available = pool.filter((question) => getQuestionKey(question) !== activeState.lastQuestionKey);

    if (available.length === 0) {
      available = [...pool];
    }
  }

  const freshnessPool = available.filter((question) => {
    const values = getQuestionValues(question);
    return values.every((value) => !activeState.recentValues.includes(value));
  });

  const nonConsecutivePool = freshnessPool.filter(
    (question) => getQuestionKey(question) !== activeState.lastQuestionKey,
  );

  const selectionPool =
    nonConsecutivePool.length > 0
      ? nonConsecutivePool
      : freshnessPool.length > 0
        ? freshnessPool
        : available;

  const [selectedQuestion] = shuffle(selectionPool);

  if (!selectedQuestion) {
    return {
      question: null,
      state: activeState,
    };
  }

  const questionKey = getQuestionKey(selectedQuestion);
  usedKeys.add(questionKey);

  return {
    question: selectedQuestion,
    state: {
      cycleKey,
      usedKeys: [...usedKeys],
      lastQuestionKey: questionKey,
      recentValues: getQuestionValues(selectedQuestion),
      cycleCount,
    },
  };
}

export function drawNextQuestionForPhase(
  phase: Phase,
  difficulty: Difficulty,
  band: number,
  context: QuestionSelectionContext,
  state: QuestionCycleState,
): QuestionDrawResult {
  const sourceKey = createQuestionSourceKey(phase, difficulty, band, context);
  const cycleKey = createQuestionCycleKey(phase, difficulty, band, context);
  const rulePool = getCachedQuestionPool(sourceKey, () =>
    buildRuleBasedQuestionPool(phase, difficulty, band, context),
  );

  if (rulePool.length > 0) {
    return drawQuestionFromPool(rulePool, cycleKey, state);
  }

  const legacyPool = getQuestionsForPhase(phase, difficulty, band, new Set<string>(), context);
  return drawQuestionFromPool(legacyPool, cycleKey, state);
}

export function drawNextQuestionForEndlessPhase(
  phase: Phase,
  level: number,
  state: QuestionCycleState,
): QuestionDrawResult {
  const sourceKey = createEndlessQuestionSourceKey(phase, level);
  const infinitePool = getCachedQuestionPool(sourceKey, () => buildInfiniteQuestionPool(phase, level));

  if (infinitePool.length > 0) {
    return drawQuestionFromPool(infinitePool, sourceKey, state);
  }

  const legacyPool = getQuestionsForEndlessPhase(phase, level, new Set<string>());
  return drawQuestionFromPool(legacyPool, sourceKey, state);
}

export function getQuestionsForPhase(
  phase: Phase,
  difficulty: Difficulty,
  band: number,
  usedQuestions: ReadonlySet<string> = new Set<string>(),
  context: QuestionSelectionContext = DEFAULT_QUESTION_SELECTION_CONTEXT,
): MathQuestion[] {
  const rulePool = buildRuleBasedQuestionPool(phase, difficulty, band, context);
  const unusedRulePool = rulePool.filter((question) => !usedQuestions.has(getQuestionKey(question)));

  if (unusedRulePool.length > 0) {
    return shuffle(unusedRulePool);
  }

  if (rulePool.length > 0) {
    return shuffle(rulePool);
  }

  const searchOrder = getBandSearchOrder(difficulty, band);
  const fallbackPool = getModeTierPool(phase, difficulty, searchOrder).filter(
    (question) => !usedQuestions.has(getQuestionKey(question)),
  );

  return shuffle(fallbackPool);
}

export function getQuestionsForEndlessPhase(
  phase: Phase,
  level: number,
  usedQuestions: ReadonlySet<string> = new Set<string>(),
): MathQuestion[] {
  const infinitePool = buildInfiniteQuestionPool(phase, level);
  const unusedInfinitePool = infinitePool.filter((question) => !usedQuestions.has(getQuestionKey(question)));

  if (unusedInfinitePool.length > 0) {
    return shuffle(unusedInfinitePool);
  }

  if (infinitePool.length > 0) {
    return shuffle(infinitePool);
  }

  const questionType = PHASE_CONFIGS[phase].questionType;
  const bandConfig = getEndlessComplexityBandConfig(level);
  const endlessPool = bandConfig.tiers
    .flatMap((tier) => QUESTION_BANK[questionType][tier])
    .filter((question) => matchesComplexityBand(question, phase, bandConfig))
    .filter((question) => !usedQuestions.has(getQuestionKey(question)));

  return shuffle(endlessPool);
}

export function getBandLabel(difficulty: Difficulty, band: number): string {
  return getComplexityBandConfig(difficulty, band).label;
}

export function getBandCount(difficulty: Difficulty): number {
  return COMPLEXITY_BANDS[difficulty].length;
}
