export type Character =
  | "ana"
  | "ayla"
  | "elisabeth"
  | "enzo"
  | "mariaHeloisa"
  | "pauloHenrique"
  | "valentina";
export type Difficulty = "facil" | "medio" | "dificil" | "impossivel";
export type Phase = 1 | 2 | 3;
export type GameScreen =
  | "title"
  | "character-select"
  | "difficulty-select"
  | "ranking"
  | "story"
  | "battle"
  | "victory"
  | "defeat";
export type BattleStage = "apprentice" | "boss";
export type QuestionTopic = "potenciacao" | "radiciacao" | "combinada";
export type QuestionTier = "basic" | "standard" | "advanced" | "master";

export interface MathQuestion {
  id: string;
  question: string;
  answer: number;
  type: QuestionTopic;
}

export interface Enemy {
  name: string;
  title: string;
  maxHp: number;
  hp: number;
  emoji: string;
  image?: string;
  imagePosition?: string;
  imageScale?: number;
  phase: Phase;
}

export interface PlayerState {
  character: Character;
  maxHp: number;
  hp: number;
  score: number;
  phase: Phase;
  combo: number;
}

export interface RankingEntry {
  name: string;
  character: Character;
  score: number;
  difficulty: Difficulty;
  date: string;
}

export interface CharacterProfile {
  id: Character;
  name: string;
  title: string;
  description: string;
  specialty: string;
  image: string;
}

export interface BossProfile {
  phase: Phase;
  name: string;
  title: string;
  challengeLabel: string;
  threat: string;
  image: string;
  introVideo: string;
  defeatVideo?: string;
  emoji: string;
}

export interface ApprenticeProfile {
  name: string;
  title: string;
  baseHp: number;
  emoji: string;
  image?: string;
  imagePosition?: string;
  imageScale?: number;
}

export interface PhaseConfig {
  phase: Phase;
  label: string;
  academyTitle: string;
  description: string;
  questionType: QuestionTopic;
  bossBaseHp: number;
  apprentices: readonly ApprenticeProfile[];
  transitionLine: string;
  bossRevealLine: string;
}

export interface DifficultyConfig {
  label: string;
  shortLabel: string;
  description: string;
  playerHp: number;
  damageToEnemy: number;
  damageToPlayer: number;
  timeLimit: number | null;
  questionTier: QuestionTier;
  scoreMultiplier: number;
}

export interface DifficultyModeConfig {
  initialBand: number;
  maxBand: number;
  correctGain: number;
  comboGain: number;
  wrongPenalty: number;
  comboThreshold: number;
}

export interface ComplexityBandConfig {
  id: string;
  label: string;
  tiers: readonly QuestionTier[];
  maxExponent: number;
  maxBase: number;
  maxRootValue: number;
  maxConstant: number;
  maxOperations: number;
  maxTerms: number;
  maxAnswerAbs: number;
  allowMixedTopics: boolean;
  allowParentheses: boolean;
  allowMultiplication: boolean;
  allowDivision: boolean;
}

export interface DifficultyRuleSet {
  config: DifficultyConfig;
  adaptive: DifficultyModeConfig;
  bands: readonly ComplexityBandConfig[];
}

export interface QuestionSelectionContext {
  battleStage: BattleStage;
  isBoss: boolean;
  isFinalBoss: boolean;
}

export interface QuestionCycleState {
  sourceKey: string | null;
  usedKeys: readonly string[];
  lastQuestionKey: string | null;
  recentValues: readonly number[];
  cycleCount: number;
}

export interface QuestionDrawResult {
  question: MathQuestion | null;
  state: QuestionCycleState;
}

export interface AdaptiveBandResult {
  band: number;
  progress: number;
  changed: "up" | "down" | null;
}

export interface ScoreGainInput {
  phase: Phase;
  difficulty: Difficulty;
  battleStage: BattleStage;
  isCritical: boolean;
}
