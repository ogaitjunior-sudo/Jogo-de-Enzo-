import {
  AdaptiveBandResult,
  BattleStage,
  ComplexityBandConfig,
  Difficulty,
  DifficultyConfig,
  DifficultyModeConfig,
  DifficultyRuleSet,
  Phase,
  PhaseConfig,
  ScoreGainInput,
} from "./types";

export const COMMON_ENEMY_HP = 1000;
export const BOSS_ENEMY_HP = 3000;
export const ADAPTIVE_PROGRESS_THRESHOLD = 100;

export const PHASE_CONFIGS: Record<Phase, PhaseConfig> = {
  1: {
    phase: 1,
    label: "Potenciacao",
    academyTitle: "Ala das Potencias",
    description: "Aprenda a dominar expoentes antes de encarar o primeiro guardiao.",
    questionType: "potenciacao",
    bossBaseHp: BOSS_ENEMY_HP,
    apprentices: [
      { name: "Aluno Curioso", title: "Aprendiz de Potencias", baseHp: COMMON_ENEMY_HP, emoji: "📖" },
      { name: "Monitor de Sala", title: "Guardiao dos Numeros", baseHp: COMMON_ENEMY_HP, emoji: "📝" },
      { name: "Nerd da Turma", title: "Mestre dos Expoentes", baseHp: COMMON_ENEMY_HP, emoji: "🤓" },
    ],
    transitionLine: "Os radicais tomam o laboratorio central da academia.",
    bossRevealLine: "Newton vigia a passagem e cobra fundamento em cada golpe.",
  },
  2: {
    phase: 2,
    label: "Radiciacao",
    academyTitle: "Laboratorio dos Radicais",
    description: "Raizes exatas entram em cena com mais pressao e menos tempo de resposta.",
    questionType: "radiciacao",
    bossBaseHp: BOSS_ENEMY_HP,
    apprentices: [
      { name: "Calculadora Humana", title: "Aprendiz de Raizes", baseHp: COMMON_ENEMY_HP, emoji: "🔢" },
      { name: "Estagiario de Lab", title: "Analista de Radicais", baseHp: COMMON_ENEMY_HP, emoji: "🔬" },
      { name: "Genio Junior", title: "Quase um Einstein", baseHp: COMMON_ENEMY_HP, emoji: "💡" },
    ],
    transitionLine: "A sala final abre e mistura todo o conteudo da academia.",
    bossRevealLine: "Einstein acelera a batalha e pune cada hesitacao.",
  },
  3: {
    phase: 3,
    label: "Combinadas",
    academyTitle: "Arena Final",
    description: "Potencias e raizes aparecem juntas. Aqui a leitura rapida faz diferenca.",
    questionType: "combinada",
    bossBaseHp: BOSS_ENEMY_HP,
    apprentices: [
      { name: "Assistente da Prof", title: "Braco Direito", baseHp: COMMON_ENEMY_HP, emoji: "✏️" },
      { name: "Representante", title: "Lider de Classe", baseHp: COMMON_ENEMY_HP, emoji: "🎖️" },
      { name: "Vice-Diretora", title: "Guardia da Academia", baseHp: COMMON_ENEMY_HP, emoji: "🏫" },
    ],
    transitionLine: "A mestra final espera no centro da arena.",
    bossRevealLine: "Marcela transforma o conteudo inteiro em prova final.",
  },
};

const DIFFICULTY_RULE_SETS: Record<Difficulty, DifficultyRuleSet> = {
  facil: {
    config: {
      label: "Facil",
      shortLabel: "Passo a passo",
      description: "Numeros pequenos, leitura direta e ritmo sem pressa para construir confianca.",
      playerHp: 240,
      damageToEnemy: 255,
      damageToPlayer: 6,
      timeLimit: null,
      questionTier: "basic",
      scoreMultiplier: 1,
    },
    adaptive: {
      initialBand: 1,
      maxBand: 3,
      correctGain: 2,
      comboGain: 3,
      wrongPenalty: 1,
      comboThreshold: 4,
    },
    bands: [
      {
        id: "easy_1",
        label: "Direto",
        tiers: ["basic"],
        maxExponent: 2,
        maxBase: 5,
        maxRootValue: 36,
        maxConstant: 4,
        maxOperations: 0,
        maxTerms: 1,
        maxAnswerAbs: 25,
        allowMixedTopics: true,
        allowParentheses: false,
        allowMultiplication: false,
        allowDivision: false,
      },
      {
        id: "easy_2",
        label: "Pratica curta",
        tiers: ["basic"],
        maxExponent: 3,
        maxBase: 6,
        maxRootValue: 49,
        maxConstant: 6,
        maxOperations: 1,
        maxTerms: 2,
        maxAnswerAbs: 40,
        allowMixedTopics: true,
        allowParentheses: false,
        allowMultiplication: false,
        allowDivision: false,
      },
      {
        id: "easy_3",
        label: "Leitura leve",
        tiers: ["basic", "standard"],
        maxExponent: 3,
        maxBase: 6,
        maxRootValue: 64,
        maxConstant: 7,
        maxOperations: 1,
        maxTerms: 2,
        maxAnswerAbs: 60,
        allowMixedTopics: true,
        allowParentheses: false,
        allowMultiplication: false,
        allowDivision: false,
      },
    ],
  },
  medio: {
    config: {
      label: "Medio",
      shortLabel: "Ritmo escolar",
      description: "Numeros pequenos a moderados, duas etapas ocasionais e pressao moderada.",
      playerHp: 200,
      damageToEnemy: 225,
      damageToPlayer: 10,
      timeLimit: 42,
      questionTier: "basic",
      scoreMultiplier: 1.1,
    },
    adaptive: {
      initialBand: 1,
      maxBand: 3,
      correctGain: 4,
      comboGain: 5,
      wrongPenalty: 2,
      comboThreshold: 3,
    },
    bands: [
      {
        id: "medium_1",
        label: "Base guiada",
        tiers: ["basic", "standard"],
        maxExponent: 3,
        maxBase: 7,
        maxRootValue: 64,
        maxConstant: 8,
        maxOperations: 1,
        maxTerms: 2,
        maxAnswerAbs: 70,
        allowMixedTopics: true,
        allowParentheses: false,
        allowMultiplication: false,
        allowDivision: false,
      },
      {
        id: "medium_2",
        label: "Dois passos",
        tiers: ["basic", "standard"],
        maxExponent: 4,
        maxBase: 9,
        maxRootValue: 100,
        maxConstant: 10,
        maxOperations: 2,
        maxTerms: 3,
        maxAnswerAbs: 110,
        allowMixedTopics: true,
        allowParentheses: false,
        allowMultiplication: false,
        allowDivision: false,
      },
      {
        id: "medium_3",
        label: "Combinacao leve",
        tiers: ["standard", "advanced"],
        maxExponent: 4,
        maxBase: 9,
        maxRootValue: 144,
        maxConstant: 10,
        maxOperations: 2,
        maxTerms: 3,
        maxAnswerAbs: 140,
        allowMixedTopics: true,
        allowParentheses: true,
        allowMultiplication: false,
        allowDivision: true,
      },
    ],
  },
  dificil: {
    config: {
      label: "Dificil",
      shortLabel: "Desafio forte",
      description: "Mais etapas, mais mistura e menos margem para erro em um ritmo apertado.",
      playerHp: 155,
      damageToEnemy: 195,
      damageToPlayer: 15,
      timeLimit: 28,
      questionTier: "standard",
      scoreMultiplier: 1.35,
    },
    adaptive: {
      initialBand: 1,
      maxBand: 4,
      correctGain: 8,
      comboGain: 12,
      wrongPenalty: 4,
      comboThreshold: 3,
    },
    bands: [
      {
        id: "hard_1",
        label: "Atencao",
        tiers: ["standard", "advanced"],
        maxExponent: 4,
        maxBase: 10,
        maxRootValue: 144,
        maxConstant: 12,
        maxOperations: 2,
        maxTerms: 3,
        maxAnswerAbs: 170,
        allowMixedTopics: true,
        allowParentheses: true,
        allowMultiplication: false,
        allowDivision: true,
      },
      {
        id: "hard_2",
        label: "Sequencia",
        tiers: ["standard", "advanced"],
        maxExponent: 4,
        maxBase: 10,
        maxRootValue: 225,
        maxConstant: 12,
        maxOperations: 3,
        maxTerms: 4,
        maxAnswerAbs: 220,
        allowMixedTopics: true,
        allowParentheses: true,
        allowMultiplication: false,
        allowDivision: true,
      },
      {
        id: "hard_3",
        label: "Mistura forte",
        tiers: ["advanced", "master"],
        maxExponent: 5,
        maxBase: 12,
        maxRootValue: 400,
        maxConstant: 14,
        maxOperations: 3,
        maxTerms: 4,
        maxAnswerAbs: 300,
        allowMixedTopics: true,
        allowParentheses: true,
        allowMultiplication: true,
        allowDivision: true,
      },
      {
        id: "hard_4",
        label: "Prova final",
        tiers: ["advanced", "master"],
        maxExponent: 5,
        maxBase: 12,
        maxRootValue: 625,
        maxConstant: 16,
        maxOperations: 4,
        maxTerms: 5,
        maxAnswerAbs: 420,
        allowMixedTopics: true,
        allowParentheses: true,
        allowMultiplication: true,
        allowDivision: true,
      },
    ],
  },
  impossivel: {
    config: {
      label: "Impossivel",
      shortLabel: "Arena extrema",
      description: "Alta pressao, mistura constante e pouca margem para hesitar.",
      playerHp: 120,
      damageToEnemy: 175,
      damageToPlayer: 20,
      timeLimit: 18,
      questionTier: "advanced",
      scoreMultiplier: 1.7,
    },
    adaptive: {
      initialBand: 1,
      maxBand: 5,
      correctGain: 10,
      comboGain: 15,
      wrongPenalty: 5,
      comboThreshold: 2,
    },
    bands: [
      {
        id: "impossible_1",
        label: "Choque inicial",
        tiers: ["advanced", "master"],
        maxExponent: 5,
        maxBase: 10,
        maxRootValue: 400,
        maxConstant: 14,
        maxOperations: 3,
        maxTerms: 4,
        maxAnswerAbs: 320,
        allowMixedTopics: true,
        allowParentheses: true,
        allowMultiplication: true,
        allowDivision: true,
      },
      {
        id: "impossible_2",
        label: "Alta pressao",
        tiers: ["advanced", "master"],
        maxExponent: 5,
        maxBase: 12,
        maxRootValue: 625,
        maxConstant: 16,
        maxOperations: 4,
        maxTerms: 4,
        maxAnswerAbs: 420,
        allowMixedTopics: true,
        allowParentheses: true,
        allowMultiplication: true,
        allowDivision: true,
      },
      {
        id: "impossible_3",
        label: "Mistura total",
        tiers: ["advanced", "master"],
        maxExponent: 6,
        maxBase: 12,
        maxRootValue: 784,
        maxConstant: 18,
        maxOperations: 4,
        maxTerms: 5,
        maxAnswerAbs: 520,
        allowMixedTopics: true,
        allowParentheses: true,
        allowMultiplication: true,
        allowDivision: true,
      },
      {
        id: "impossible_4",
        label: "Densidade maxima",
        tiers: ["master"],
        maxExponent: 6,
        maxBase: 12,
        maxRootValue: 900,
        maxConstant: 20,
        maxOperations: 5,
        maxTerms: 5,
        maxAnswerAbs: 650,
        allowMixedTopics: true,
        allowParentheses: true,
        allowMultiplication: true,
        allowDivision: true,
      },
      {
        id: "impossible_5",
        label: "Lendario escolar",
        tiers: ["master"],
        maxExponent: 6,
        maxBase: 12,
        maxRootValue: 900,
        maxConstant: 24,
        maxOperations: 5,
        maxTerms: 6,
        maxAnswerAbs: 800,
        allowMixedTopics: true,
        allowParentheses: true,
        allowMultiplication: true,
        allowDivision: true,
      },
    ],
  },
};

export const DIFFICULTY_CONFIGS: Record<Difficulty, DifficultyConfig> = {
  facil: DIFFICULTY_RULE_SETS.facil.config,
  medio: DIFFICULTY_RULE_SETS.medio.config,
  dificil: DIFFICULTY_RULE_SETS.dificil.config,
  impossivel: DIFFICULTY_RULE_SETS.impossivel.config,
};

export const DIFFICULTY_MODE_CONFIGS: Record<Difficulty, DifficultyModeConfig> = {
  facil: DIFFICULTY_RULE_SETS.facil.adaptive,
  medio: DIFFICULTY_RULE_SETS.medio.adaptive,
  dificil: DIFFICULTY_RULE_SETS.dificil.adaptive,
  impossivel: DIFFICULTY_RULE_SETS.impossivel.adaptive,
};

export const COMPLEXITY_BANDS: Record<Difficulty, readonly ComplexityBandConfig[]> = {
  facil: DIFFICULTY_RULE_SETS.facil.bands,
  medio: DIFFICULTY_RULE_SETS.medio.bands,
  dificil: DIFFICULTY_RULE_SETS.dificil.bands,
  impossivel: DIFFICULTY_RULE_SETS.impossivel.bands,
};

export const ENDLESS_BATTLE_CONFIG: DifficultyConfig = {
  label: "Infinita",
  shortLabel: "Modo infinito adaptativo",
  description: "Depois de salvar a escola, a campanha vira um ciclo sem fim com adaptacao total.",
  playerHp: 170,
  damageToEnemy: 205,
  damageToPlayer: 12,
  timeLimit: 28,
  questionTier: "advanced",
  scoreMultiplier: 1.6,
};
export const ENDLESS_PROGRESS_ON_CORRECT = 15;
export const ENDLESS_PROGRESS_ON_WRONG = 1;

export const ENDLESS_IMPOSSIBLE_CAP = COMPLEXITY_BANDS.impossivel.length;

export function getPhaseConfig(phase: Phase): PhaseConfig {
  return PHASE_CONFIGS[phase];
}

export function getDifficultyConfig(difficulty: Difficulty): DifficultyConfig {
  return DIFFICULTY_CONFIGS[difficulty];
}

export function getDifficultyModeConfig(difficulty: Difficulty): DifficultyModeConfig {
  return DIFFICULTY_MODE_CONFIGS[difficulty];
}

export function getDifficultyRuleSet(difficulty: Difficulty): DifficultyRuleSet {
  return DIFFICULTY_RULE_SETS[difficulty];
}

export function getComplexityBandConfig(difficulty: Difficulty, band: number): ComplexityBandConfig {
  const configs = COMPLEXITY_BANDS[difficulty];
  const clampedIndex = Math.min(Math.max(band, 1), configs.length) - 1;
  return configs[clampedIndex];
}

export function getEndlessComplexityBandConfig(level: number): ComplexityBandConfig {
  if (level <= ENDLESS_IMPOSSIBLE_CAP) {
    return getComplexityBandConfig("impossivel", level);
  }

  const base = getComplexityBandConfig("impossivel", ENDLESS_IMPOSSIBLE_CAP);
  const extraLevel = level - ENDLESS_IMPOSSIBLE_CAP;

  return {
    ...base,
    id: `infinite_${level}`,
    label: extraLevel === 1 ? "Dificuldade infinita" : `Infinito ${extraLevel}`,
    tiers: ["master"],
    maxExponent: Math.min(8, base.maxExponent + Math.ceil(extraLevel / 2)),
    maxBase: Math.min(14, base.maxBase + Math.ceil(extraLevel / 3)),
    maxRootValue: Math.min(1600, base.maxRootValue + extraLevel * 144),
    maxConstant: Math.min(28, base.maxConstant + extraLevel * 2),
    maxOperations: Math.min(6, base.maxOperations + Math.ceil(extraLevel / 2)),
    maxTerms: Math.min(6, base.maxTerms + Math.floor(extraLevel / 2)),
    maxAnswerAbs: Math.min(2000, base.maxAnswerAbs + extraLevel * 140),
    allowMixedTopics: true,
    allowParentheses: true,
    allowMultiplication: true,
    allowDivision: true,
  };
}

export function getAdaptiveDeltaOnCorrect(difficulty: Difficulty, combo: number): number {
  const config = getDifficultyModeConfig(difficulty);
  const comboBonus =
    combo >= config.comboThreshold && combo % config.comboThreshold === 0 ? config.comboGain : 0;

  return config.correctGain + comboBonus;
}

export function getAdaptivePenaltyOnWrong(difficulty: Difficulty): number {
  return getDifficultyModeConfig(difficulty).wrongPenalty;
}

export function applyAdaptiveBandChange(
  difficulty: Difficulty,
  currentBand: number,
  currentProgress: number,
  delta: number,
): AdaptiveBandResult {
  const modeConfig = getDifficultyModeConfig(difficulty);
  let nextBand = Math.min(Math.max(currentBand, 1), modeConfig.maxBand);
  let nextProgress = currentProgress + delta;
  let changed: AdaptiveBandResult["changed"] = null;

  while (nextProgress >= ADAPTIVE_PROGRESS_THRESHOLD && nextBand < modeConfig.maxBand) {
    nextProgress -= ADAPTIVE_PROGRESS_THRESHOLD;
    nextBand += 1;
    changed = "up";
  }

  if (nextBand === modeConfig.maxBand && nextProgress > ADAPTIVE_PROGRESS_THRESHOLD - 1) {
    nextProgress = ADAPTIVE_PROGRESS_THRESHOLD - 1;
  }

  while (nextProgress < 0 && nextBand > modeConfig.initialBand) {
    nextProgress += ADAPTIVE_PROGRESS_THRESHOLD;
    nextBand -= 1;
    changed = "down";
  }

  if (nextBand === modeConfig.initialBand && nextProgress < 0) {
    nextProgress = 0;
  }

  return {
    band: nextBand,
    progress: nextProgress,
    changed,
  };
}

export function applyEndlessBandChange(
  currentLevel: number,
  currentProgress: number,
  delta: number,
): AdaptiveBandResult {
  let nextLevel = Math.max(currentLevel, 1);
  let nextProgress = currentProgress + delta;
  let changed: AdaptiveBandResult["changed"] = null;

  while (nextProgress >= ADAPTIVE_PROGRESS_THRESHOLD) {
    nextProgress -= ADAPTIVE_PROGRESS_THRESHOLD;
    nextLevel += 1;
    changed = "up";
  }

  while (nextProgress < 0 && nextLevel > 1) {
    nextProgress += ADAPTIVE_PROGRESS_THRESHOLD;
    nextLevel -= 1;
    changed = "down";
  }

  if (nextLevel === 1 && nextProgress < 0) {
    nextProgress = 0;
  }

  return {
    band: nextLevel,
    progress: nextProgress,
    changed,
  };
}

export function getEndlessDifficultyLabel(level: number): string {
  return level > ENDLESS_IMPOSSIBLE_CAP ? "Infinita" : "Impossivel";
}

export function getEndlessBandLabel(level: number): string {
  return getEndlessComplexityBandConfig(level).label;
}

export function getEndlessBattleConfig(level: number): DifficultyConfig {
  const extraLevel = Math.max(0, level - ENDLESS_IMPOSSIBLE_CAP);

  return {
    ...ENDLESS_BATTLE_CONFIG,
    label: getEndlessDifficultyLabel(level),
    shortLabel: getEndlessBandLabel(level),
    damageToEnemy: Math.max(150, ENDLESS_BATTLE_CONFIG.damageToEnemy - extraLevel * 3),
    damageToPlayer: ENDLESS_BATTLE_CONFIG.damageToPlayer + Math.floor((level - 1) / 2),
    timeLimit: Math.max(10, (ENDLESS_BATTLE_CONFIG.timeLimit ?? 28) - Math.floor((level - 1) / 2)),
    scoreMultiplier: ENDLESS_BATTLE_CONFIG.scoreMultiplier + extraLevel * 0.12,
  };
}

export function getComboMultiplier(combo: number): number {
  if (combo >= 7) return 3;
  if (combo >= 5) return 2.4;
  if (combo >= 3) return 1.6;
  return 1;
}

export function getScoreGain({
  phase,
  difficulty,
  battleStage,
  isCritical,
}: ScoreGainInput): number {
  const phaseBase = 12 + (phase - 1) * 6;
  const stageBonus = battleStage === "boss" ? 8 : 0;
  const criticalMultiplier = isCritical ? 2 : 1;
  const difficultyMultiplier = DIFFICULTY_CONFIGS[difficulty].scoreMultiplier;

  return Math.round((phaseBase + stageBonus) * criticalMultiplier * difficultyMultiplier);
}

export function getStageLabel(
  battleStage: BattleStage,
  apprenticeIndex: number,
  totalApprentices: number,
): string {
  if (battleStage === "boss") {
    return "Chefe";
  }

  return `Prova ${apprenticeIndex + 1}/${totalApprentices}`;
}

export function formatTimeLimit(timeLimit: number | null): string {
  return timeLimit === null ? "Sem cronometro" : `${timeLimit}s por questao`;
}
