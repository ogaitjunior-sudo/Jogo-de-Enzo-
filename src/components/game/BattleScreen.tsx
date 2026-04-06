import { FormEvent, ReactNode, useCallback, useEffect, useMemo, useRef, useState } from "react";

import { Apprentice, getApprenticesForPhase, getEnemyForPhase } from "@/game/enemies";
import {
  ENDLESS_PROGRESS_ON_CORRECT,
  ENDLESS_PROGRESS_ON_WRONG,
  PHASE_CONFIGS,
  applyAdaptiveBandChange,
  applyEndlessBandChange,
  formatTimeLimit,
  getAdaptiveDeltaOnCorrect,
  getAdaptivePenaltyOnWrong,
  getComboMultiplier,
  getDifficultyConfig,
  getDifficultyModeConfig,
  getEndlessBattleConfig,
  getPhaseConfig,
  getScoreGain,
  getStageLabel,
} from "@/game/progression";
import {
  createQuestionCycleState,
  drawNextQuestionForEndlessPhase,
  drawNextQuestionForPhase,
} from "@/game/questions";
import { BOSS_ROSTER, CHARACTER_ROSTER } from "@/game/roster";
import { playCorrect, playWrong } from "@/game/sounds";
import {
  BattleStage,
  Character,
  Difficulty,
  Enemy,
  MathQuestion,
  Phase,
  PlayerState,
  QuestionCycleState,
  QuestionSelectionContext,
} from "@/game/types";

import ComboMeter from "./ComboMeter";
import FloatingDamage from "./FloatingDamage";
import { FloatingNumber, createFloatingNumber } from "./floatingNumbers";
import HPBar from "./HPBar";

const attackMessages = {
  correct: [
    "Golpe de calculo limpo!",
    "Sequencia perfeita!",
    "Resposta precisa!",
    "Ataque exponencial!",
  ],
  wrong: [
    "A conta escapou!",
    "O chefe aproveitou o erro!",
    "Resposta fora do alvo!",
    "A academia puniu a hesitacao!",
  ],
  critical: ["Acerto critico!", "Resposta devastadora!", "Leitura perfeita!", "Impacto maximo!"],
} as const;

type FeedbackState = {
  type: "correct" | "wrong" | "critical";
  msg: string;
};

type PhaseTransition = "next-apprentice" | "boss-intro" | "boss-defeat" | "next-phase";
type CinematicStage = "idle" | "flash" | "fadeout" | "video" | "fadein";

type PendingBossDefeat =
  | {
      nextBand: number;
      nextProgress: number;
      nextPhase: Phase;
      nextEndlessMode: boolean;
      nextWave: number;
      flow: "next-phase";
    }
  | {
      finalScore: number;
      flow: "victory";
    };

const APPRENTICE_PORTRAIT_ZOOM_BONUS = 0.05;

interface Props {
  character: Character;
  difficulty: Difficulty;
  onVictory: (score: number) => void;
  onDefeat: (score: number) => void;
}

function getRandomMessage(messages: readonly string[]): string {
  return messages[Math.floor(Math.random() * messages.length)];
}

function applyEndlessHpScaling(baseHp: number, endlessWave: number, isBoss: boolean): number {
  if (endlessWave <= 0) {
    return baseHp;
  }

  return baseHp + endlessWave * (isBoss ? 450 : 140);
}

function getInfiniteLevel(endlessWave: number, activeBand: number): number {
  return endlessWave * 3 + activeBand;
}

interface CombatChipProps {
  children: ReactNode;
  tone?: "primary" | "neutral";
}

function CombatChip({ children, tone = "neutral" }: CombatChipProps) {
  const toneClass =
    tone === "primary"
      ? "border-primary/35 bg-primary/12 text-primary shadow-[0_0_18px_rgba(245,158,11,0.12)]"
      : "border-white/10 bg-slate-950/40 text-white/82";

  return (
    <span
      className={`inline-flex items-center rounded-full border px-3 py-1.5 text-[11px] font-body font-semibold tracking-[0.05em] backdrop-blur-sm ${toneClass}`}
    >
      {children}
    </span>
  );
}

const heroPortraitImageClassName =
  "h-[clamp(12.25rem,24vw,16rem)] w-[clamp(9.4rem,18vw,11.75rem)] overflow-hidden rounded-[1.28rem]";
const enemyPortraitImageClassName =
  "h-[clamp(11.2rem,21vw,14rem)] w-[clamp(8.55rem,16.5vw,10.35rem)] overflow-hidden rounded-[1.18rem]";
const heroPortraitFallbackClassName =
  "flex h-full w-full items-center justify-center bg-slate-900/82 text-[clamp(3.35rem,5.4vw,4.4rem)] shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]";
const enemyPortraitFallbackClassName =
  "flex h-full w-full items-center justify-center bg-slate-900/82 text-[clamp(3.1rem,5vw,4.2rem)] shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]";

interface BattleAvatarArtworkProps {
  src?: string;
  alt: string;
  fallback?: ReactNode;
  frameClassName: string;
  fallbackClassName: string;
  objectPosition?: string;
  imageScale?: number;
  tone?: "hero" | "enemy";
}

function BattleAvatarArtwork({
  src,
  alt,
  fallback,
  frameClassName,
  fallbackClassName,
  objectPosition = "center 14%",
  imageScale = 1,
  tone = "enemy",
}: BattleAvatarArtworkProps) {
  const glowClass = tone === "hero" ? "bg-emerald-200/16" : "bg-amber-200/12";

  return (
    <div className={`relative isolate ${frameClassName}`}>
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_14%,rgba(255,255,255,0.16),transparent_44%),linear-gradient(180deg,rgba(15,23,42,0.08)_0%,rgba(2,6,23,0.62)_100%)]" />
      <div
        className={`pointer-events-none absolute left-1/2 top-1 z-[1] h-[34%] w-[70%] -translate-x-1/2 rounded-full blur-3xl ${glowClass}`}
      />

      {src ? (
        <img
          src={src}
          alt={alt}
          className="relative z-[1] h-full w-full object-cover transition-transform duration-500 ease-out"
          style={{ objectPosition, transform: `scale(${imageScale})` }}
        />
      ) : (
        <div className={`relative z-[1] ${fallbackClassName}`}>{fallback}</div>
      )}

      <div className="pointer-events-none absolute inset-0 z-[2] bg-[linear-gradient(180deg,rgba(255,255,255,0.12)_0%,rgba(255,255,255,0.05)_14%,transparent_34%,rgba(2,6,23,0.18)_60%,rgba(2,6,23,0.62)_100%)]" />
      <div className="pointer-events-none absolute inset-x-0 bottom-0 z-[2] h-[42%] bg-gradient-to-t from-slate-950/72 via-slate-950/14 to-transparent" />
      <div className="pointer-events-none absolute inset-[1px] z-[3] rounded-[inherit] border border-white/8" />
    </div>
  );
}

interface BattleStatCardProps {
  label: string;
  value: ReactNode;
  tone?: "primary" | "score";
}

function BattleStatCard({ label, value, tone = "primary" }: BattleStatCardProps) {
  const toneClass =
    tone === "score"
      ? "before:bg-cyan-400/12"
      : "before:bg-primary/12";

  return (
    <div
      className={`relative min-w-0 overflow-hidden rounded-[1.2rem] border border-white/10 bg-[linear-gradient(180deg,rgba(12,17,32,0.92)_0%,rgba(18,24,42,0.82)_100%)] px-4 py-3 text-center shadow-[0_16px_36px_rgba(0,0,0,0.22)] before:absolute before:inset-x-5 before:top-0 before:h-14 before:rounded-full before:blur-2xl before:content-[''] ${toneClass}`}
    >
      <p className="relative text-[10px] font-body uppercase tracking-[0.24em] text-white/46">{label}</p>
      <p className="relative mt-2 truncate font-display text-[clamp(1.2rem,2.7vw,1.7rem)] font-black text-white">
        {value}
      </p>
    </div>
  );
}

interface BattlePortraitCardProps {
  badge: string;
  name?: string;
  title?: string;
  avatar: ReactNode;
  tone: "hero" | "enemy";
  animationClassName?: string;
  className?: string;
}

function BattlePortraitCard({
  badge,
  name,
  title,
  avatar,
  tone,
  animationClassName = "",
  className = "",
}: BattlePortraitCardProps) {
  const toneClass =
    tone === "hero"
      ? {
          surface:
            "border-emerald-400/20 bg-[linear-gradient(180deg,rgba(16,185,129,0.18)_0%,rgba(15,23,42,0.78)_100%)] shadow-[0_26px_56px_rgba(16,185,129,0.1)]",
          badge:
            "border-emerald-300/20 bg-emerald-400/10 text-emerald-100/95",
          frame:
            "border-emerald-300/25 bg-slate-950/72 p-3.5 shadow-[0_18px_40px_rgba(16,185,129,0.18)]",
          glow: "bg-emerald-300/16",
          shell:
            "min-h-[clamp(20rem,35vw,24rem)] px-4 py-4",
          title: "text-[clamp(1.2rem,2.35vw,1.6rem)]",
          body: "text-[0.92rem] text-white/80",
        }
      : {
          surface:
            "border-red-400/20 bg-[linear-gradient(180deg,rgba(239,68,68,0.18)_0%,rgba(15,23,42,0.78)_100%)] shadow-[0_24px_52px_rgba(239,68,68,0.1)]",
          badge:
            "border-red-300/20 bg-red-500/10 text-red-100/95",
          frame:
            "border-red-300/25 bg-slate-950/72 p-2.5 shadow-[0_18px_38px_rgba(239,68,68,0.18)]",
          glow: "bg-red-300/16",
          shell:
            "min-h-[clamp(18.5rem,32vw,22rem)] px-3.5 py-3.5",
          title: "text-[clamp(1.08rem,2vw,1.42rem)]",
          body: "text-[0.88rem] text-white/78",
        };

  return (
    <div
      className={`relative flex h-full w-full flex-col overflow-hidden rounded-[1.55rem] border text-center backdrop-blur-md ${toneClass.surface} ${toneClass.shell} ${animationClassName} ${className}`}
    >
      <div className="pointer-events-none absolute inset-[1px] rounded-[1.45rem] border border-white/6" />
      <div className={`absolute left-1/2 top-4 h-24 w-36 -translate-x-1/2 rounded-full blur-3xl ${toneClass.glow}`} />
      <div className="pointer-events-none absolute inset-x-3 top-[3.65rem] h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-black/18 to-transparent" />

      <div className="relative flex flex-col">
        <div
          className={`mx-auto inline-flex rounded-full border px-3 py-1 text-[10px] font-body font-bold uppercase tracking-[0.2em] ${toneClass.badge}`}
        >
          {badge}
        </div>
        <div className="relative mt-4 flex items-center justify-center">
          <div
            className={`relative mx-auto flex w-fit items-center justify-center rounded-[1.35rem] border ${toneClass.frame}`}
          >
            <div className="pointer-events-none absolute inset-[1px] rounded-[1.2rem] border border-white/8" />
            {avatar}
          </div>
        </div>
      </div>

      <div className="relative mt-3 px-1.5 pb-1">
        <h3 className={`font-display font-black leading-tight text-white ${toneClass.title}`}>
          {name}
        </h3>
        <p className={`mt-1 font-body leading-snug ${toneClass.body}`}>{title}</p>
      </div>
    </div>
  );
}

export default function BattleScreen({ character, difficulty, onVictory, onDefeat }: Props) {
  const selectedDifficultyConfig = getDifficultyConfig(difficulty);
  const characterProfile = CHARACTER_ROSTER[character];
  const inputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const questionCycleRef = useRef<QuestionCycleState>(createQuestionCycleState());
  const pendingBossDefeatRef = useRef<PendingBossDefeat | null>(null);

  const [phase, setPhase] = useState<Phase>(1);
  const [battleStage, setBattleStage] = useState<BattleStage>("apprentice");
  const [apprenticeIndex, setApprenticeIndex] = useState(0);
  const [isEndlessMode, setIsEndlessMode] = useState(false);
  const [endlessWave, setEndlessWave] = useState(0);
  const [activeBand, setActiveBand] = useState(getDifficultyModeConfig(difficulty).initialBand);
  const [bandProgress, setBandProgress] = useState(0);
  const [apprentices, setApprentices] = useState<Apprentice[]>(() =>
    getApprenticesForPhase(1, difficulty),
  );
  const [player, setPlayer] = useState<PlayerState>({
    character,
    maxHp: selectedDifficultyConfig.playerHp,
    hp: selectedDifficultyConfig.playerHp,
    score: 0,
    phase: 1,
    combo: 0,
  });
  const [enemy, setEnemy] = useState<Enemy>(() => getEnemyForPhase(1, difficulty));
  const [questionStep, setQuestionStep] = useState(0);
  const [answer, setAnswer] = useState("");
  const [feedback, setFeedback] = useState<FeedbackState | null>(null);
  const [playerAnim, setPlayerAnim] = useState("");
  const [enemyAnim, setEnemyAnim] = useState("");
  const [screenShake, setScreenShake] = useState(false);
  const [timeLeft, setTimeLeft] = useState<number | null>(selectedDifficultyConfig.timeLimit);
  const [phaseTransition, setPhaseTransition] = useState<PhaseTransition | null>(null);
  const [floatingNumbers, setFloatingNumbers] = useState<FloatingNumber[]>([]);
  const [showIntro, setShowIntro] = useState(true);
  const [cinematicStage, setCinematicStage] = useState<CinematicStage>("idle");
  const battleConfig = isEndlessMode ? getEndlessBattleConfig(activeBand) : selectedDifficultyConfig;

  const buildQuestionSelectionContext = useCallback(
    (
      targetPhase: Phase,
      targetStage: BattleStage,
      endlessMode: boolean,
    ): QuestionSelectionContext => ({
      battleStage: targetStage,
      isBoss: targetStage === "boss",
      isFinalBoss: !endlessMode && targetStage === "boss" && targetPhase === 3,
    }),
    [],
  );


  const pullNextQuestion = useCallback(
    (
      targetPhase: Phase,
      band: number,
      endlessMode = isEndlessMode,
      modeDifficulty: Difficulty = difficulty,
      targetStage: BattleStage = battleStage,
      wave = endlessWave,
    ): MathQuestion | null => {
      const result = endlessMode
        ? drawNextQuestionForEndlessPhase(
            targetPhase,
            getInfiniteLevel(wave, band),
            questionCycleRef.current,
          )
        : drawNextQuestionForPhase(
            targetPhase,
            modeDifficulty,
            band,
            buildQuestionSelectionContext(targetPhase, targetStage, endlessMode),
            questionCycleRef.current,
          );

      questionCycleRef.current = result.state;
      return result.question;
    },
    [battleStage, buildQuestionSelectionContext, difficulty, endlessWave, isEndlessMode],
  );

  const [currentQuestion, setCurrentQuestion] = useState<MathQuestion | null>(() => {
    const result = drawNextQuestionForPhase(
      1,
      difficulty,
      getDifficultyModeConfig(difficulty).initialBand,
      {
        battleStage: "apprentice",
        isBoss: false,
        isFinalBoss: false,
      },
      questionCycleRef.current,
    );

    questionCycleRef.current = result.state;
    return result.question;
  });

  const currentPhaseConfig = getPhaseConfig(phase);
  const currentBossProfile = BOSS_ROSTER[phase];
  const currentApprentice = battleStage === "apprentice" ? apprentices[apprenticeIndex] : null;
  const currentTarget = battleStage === "apprentice" ? currentApprentice : enemy;
  const stageLabel = getStageLabel(battleStage, apprenticeIndex, apprentices.length);
  const getApprenticePortraitScale = (imageScale?: number) =>
    (imageScale ?? 1) + APPRENTICE_PORTRAIT_ZOOM_BONUS;
  const currentApprenticeAvatar = (
    <BattleAvatarArtwork
      src={currentApprentice?.image}
      alt={currentApprentice?.name ?? "Desafio"}
      fallback={currentApprentice?.emoji}
      frameClassName={enemyPortraitImageClassName}
      fallbackClassName={enemyPortraitFallbackClassName}
      objectPosition={currentApprentice?.imagePosition ?? "center 18%"}
      imageScale={getApprenticePortraitScale(currentApprentice?.imageScale)}
      tone="enemy"
    />
  );

  const createApprentices = useCallback(
    (targetPhase: Phase, endlessMode: boolean, wave: number) =>
      getApprenticesForPhase(targetPhase, difficulty).map((apprentice) => {
        const scaledHp = endlessMode
          ? applyEndlessHpScaling(apprentice.maxHp, wave, false)
          : apprentice.maxHp;

        return {
          ...apprentice,
          maxHp: scaledHp,
          hp: scaledHp,
        };
      }),
    [difficulty],
  );

  const createEnemy = useCallback(
    (targetPhase: Phase, endlessMode: boolean, wave: number) => {
      const nextEnemy = getEnemyForPhase(targetPhase, difficulty);
      const scaledHp = endlessMode
        ? applyEndlessHpScaling(nextEnemy.maxHp, wave, true)
        : nextEnemy.maxHp;

      return {
        ...nextEnemy,
        maxHp: scaledHp,
        hp: scaledHp,
      };
    },
    [difficulty],
  );

  const addFloating = useCallback(
    (value: string, type: FloatingNumber["type"], x?: number, y?: number) => {
      setFloatingNumbers((currentNumbers) => [...currentNumbers, createFloatingNumber(value, type, x, y)]);
    },
    [],
  );

  const clearBattleFeedback = useCallback(() => {
    setFeedback(null);
    setPlayerAnim("");
    setEnemyAnim("");
    setAnswer("");
  }, []);

  const advanceToNextQuestion = useCallback(
    (
      targetPhase: Phase,
      nextBand: number,
      endlessMode = isEndlessMode,
      modeDifficulty: Difficulty = difficulty,
      targetStage: BattleStage = battleStage,
      wave = endlessWave,
    ) => {
      setCurrentQuestion(
        pullNextQuestion(targetPhase, nextBand, endlessMode, modeDifficulty, targetStage, wave),
      );
      setQuestionStep((currentStep) => currentStep + 1);
    },
    [battleStage, difficulty, endlessWave, isEndlessMode, pullNextQuestion],
  );

  const moveToPhase = useCallback(
    (
      nextPhase: Phase,
      nextBand: number,
      nextProgress: number,
      nextEndlessMode: boolean,
      nextWave: number,
    ) => {
      const nextModeDifficulty = nextEndlessMode ? "impossivel" : difficulty;

      setPhase(nextPhase);
      setBattleStage("apprentice");
      setApprenticeIndex(0);
      setIsEndlessMode(nextEndlessMode);
      setEndlessWave(nextWave);
      setApprentices(createApprentices(nextPhase, nextEndlessMode, nextWave));
      setEnemy(createEnemy(nextPhase, nextEndlessMode, nextWave));
      setActiveBand(nextBand);
      setBandProgress(nextProgress);
      setCurrentQuestion(
        pullNextQuestion(
          nextPhase,
          nextBand,
          nextEndlessMode,
          nextModeDifficulty,
          "apprentice",
          nextWave,
        ),
      );
      setQuestionStep((currentStep) => currentStep + 1);
      setPlayer((currentPlayer) => ({ ...currentPlayer, phase: nextPhase, combo: 0 }));
      setTimeLeft((nextEndlessMode ? getEndlessBattleConfig(nextBand) : selectedDifficultyConfig).timeLimit);
    },
    [createApprentices, createEnemy, difficulty, pullNextQuestion, selectedDifficultyConfig],
  );

  const continueAfterBossDefeat = useCallback(
    (pendingBossDefeat: PendingBossDefeat) => {
      if (pendingBossDefeat.flow === "victory") {
        onVictory(pendingBossDefeat.finalScore);
        return;
      }

      setPhaseTransition("next-phase");
      window.setTimeout(() => {
        moveToPhase(
          pendingBossDefeat.nextPhase,
          pendingBossDefeat.nextBand,
          pendingBossDefeat.nextProgress,
          pendingBossDefeat.nextEndlessMode,
          pendingBossDefeat.nextWave,
        );
        setPhaseTransition(null);
      }, 2400);
    },
    [moveToPhase, onVictory],
  );

  const triggerScreenShake = useCallback(() => {
    setScreenShake(true);
    window.setTimeout(() => setScreenShake(false), 280);
  }, []);

  const handleWrong = useCallback(() => {
    const adaptation = isEndlessMode
      ? applyEndlessBandChange(activeBand, bandProgress, -ENDLESS_PROGRESS_ON_WRONG)
      : applyAdaptiveBandChange(
          difficulty,
          activeBand,
          bandProgress,
          -getAdaptivePenaltyOnWrong(difficulty),
        );
    const damageTaken = battleConfig.damageToPlayer;
    const remainingHp = Math.max(0, player.hp - damageTaken);

    playWrong();
    setFeedback({ type: "wrong", msg: getRandomMessage(attackMessages.wrong) });
    setPlayerAnim("animate-glitch");
    triggerScreenShake();
    addFloating(`-${damageTaken}`, "damage", 24, 42);

    setActiveBand(adaptation.band);
    setBandProgress(adaptation.progress);

    setPlayer((currentPlayer) => {
      const nextHp = Math.max(0, currentPlayer.hp - damageTaken);

      if (nextHp <= 0) {
        window.setTimeout(() => onDefeat(currentPlayer.score), 1400);
      }

      return {
        ...currentPlayer,
        hp: nextHp,
        combo: 0,
      };
    });

    if (remainingHp > 0) {
      window.setTimeout(() => {
        clearBattleFeedback();
        advanceToNextQuestion(
          phase,
          adaptation.band,
          isEndlessMode,
          difficulty,
          battleStage,
          endlessWave,
        );
      }, 1050);
    }
  }, [
    activeBand,
    addFloating,
    advanceToNextQuestion,
    bandProgress,
    battleConfig.damageToPlayer,
    battleStage,
    clearBattleFeedback,
    difficulty,
    endlessWave,
    isEndlessMode,
    onDefeat,
    phase,
    player.hp,
    triggerScreenShake,
  ]);

  useEffect(() => {
    const timer = window.setTimeout(() => setShowIntro(false), 2200);
    return () => window.clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (showIntro) {
      return;
    }

    setTimeLeft(battleConfig.timeLimit);
  }, [apprenticeIndex, battleStage, battleConfig.timeLimit, phase, questionStep, showIntro]);

  useEffect(() => {
    if (
      battleConfig.timeLimit === null ||
      feedback !== null ||
      phaseTransition !== null ||
      showIntro ||
      timeLeft === null
    ) {
      return;
    }

    if (timeLeft <= 0) {
      handleWrong();
      return;
    }

    const timer = window.setTimeout(() => {
      setTimeLeft((currentTime) => (currentTime === null ? null : currentTime - 1));
    }, 1000);

    return () => window.clearTimeout(timer);
  }, [battleConfig.timeLimit, feedback, handleWrong, phaseTransition, showIntro, timeLeft]);

  useEffect(() => {
    inputRef.current?.focus();
  }, [battleStage, questionStep, showIntro]);

  useEffect(() => {
    if (floatingNumbers.length === 0) {
      return;
    }

    const timer = window.setTimeout(() => setFloatingNumbers([]), 1500);
    return () => window.clearTimeout(timer);
  }, [floatingNumbers]);

  useEffect(() => {
    const originalBodyOverflow = document.body.style.overflow;
    const originalHtmlOverflow = document.documentElement.style.overflow;

    document.body.style.overflow = "hidden";
    document.documentElement.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = originalBodyOverflow;
      document.documentElement.style.overflow = originalHtmlOverflow;
    };
  }, []);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!currentQuestion || feedback) {
      return;
    }

    const numericAnswer = Number(answer);

    if (!Number.isFinite(numericAnswer) || numericAnswer !== currentQuestion.answer) {
      handleWrong();
      return;
    }

    playCorrect();

    const nextCombo = player.combo + 1;
    const adaptation = isEndlessMode
      ? applyEndlessBandChange(activeBand, bandProgress, ENDLESS_PROGRESS_ON_CORRECT)
      : applyAdaptiveBandChange(
          difficulty,
          activeBand,
          bandProgress,
          getAdaptiveDeltaOnCorrect(difficulty, nextCombo),
        );
    const totalDamage = Math.round(battleConfig.damageToEnemy * getComboMultiplier(nextCombo));
    const isCritical = nextCombo >= 5;
    const scoreGain = getScoreGain({
      phase,
      difficulty: isEndlessMode ? "impossivel" : difficulty,
      battleStage,
      isCritical,
    });
    const nextScore = player.score + scoreGain;

    setFeedback({
      type: isCritical ? "critical" : "correct",
      msg: getRandomMessage(isCritical ? attackMessages.critical : attackMessages.correct),
    });
    setPlayerAnim("animate-attack-right");
    setEnemyAnim("animate-damage-flash");
    triggerScreenShake();

    addFloating(`-${totalDamage}`, isCritical ? "critical" : "damage", 72, 36);

    if (nextCombo >= 2) {
      addFloating(`COMBO x${nextCombo}`, "combo", 48, 22);
    }

    setActiveBand(adaptation.band);
    setBandProgress(adaptation.progress);

    setPlayer((currentPlayer) => ({
      ...currentPlayer,
      combo: nextCombo,
      score: currentPlayer.score + scoreGain,
    }));

    if (battleStage === "apprentice" && currentApprentice) {
      const nextHp = Math.max(0, currentApprentice.hp - totalDamage);
      const updatedApprentices = apprentices.map((apprentice, index) =>
        index === apprenticeIndex ? { ...apprentice, hp: nextHp } : apprentice,
      );

      setApprentices(updatedApprentices);

      window.setTimeout(() => {
        clearBattleFeedback();

        if (nextHp <= 0) {
          if (apprenticeIndex < updatedApprentices.length - 1) {
            setPhaseTransition("next-apprentice");
            window.setTimeout(() => {
              setApprenticeIndex((currentIndex) => currentIndex + 1);
              advanceToNextQuestion(
                phase,
                adaptation.band,
                isEndlessMode,
                difficulty,
                "apprentice",
                endlessWave,
              );
              setPhaseTransition(null);
            }, 1350);
          } else {
            setPhaseTransition("boss-intro");
            setCinematicStage("flash");
            window.setTimeout(() => setCinematicStage("fadeout"), 350);
            window.setTimeout(() => setCinematicStage("video"), 1100);
          }
        } else {
          advanceToNextQuestion(
            phase,
            adaptation.band,
            isEndlessMode,
            difficulty,
            "apprentice",
            endlessWave,
          );
        }
      }, 850);

      return;
    }

    const nextEnemyHp = Math.max(0, enemy.hp - totalDamage);
    setEnemy((currentEnemy) => ({ ...currentEnemy, hp: nextEnemyHp }));

    window.setTimeout(() => {
      clearBattleFeedback();

      if (nextEnemyHp <= 0) {
        const shouldPlayBossDefeatVideo = Boolean(currentBossProfile.defeatVideo && !isEndlessMode);

        if (shouldPlayBossDefeatVideo) {
          pendingBossDefeatRef.current =
            phase === 3 && !isEndlessMode
              ? {
                  finalScore: nextScore,
                  flow: "victory",
                }
              : {
                  nextBand: adaptation.band,
                  nextProgress: adaptation.progress,
                  nextPhase: (phase === 3 ? 1 : phase + 1) as Phase,
                  nextEndlessMode: isEndlessMode,
                  nextWave: isEndlessMode && phase === 3 ? endlessWave + 1 : endlessWave,
                  flow: "next-phase",
                };

          setPhaseTransition("boss-defeat");
          setCinematicStage("flash");
          window.setTimeout(() => setCinematicStage("fadeout"), 350);
          window.setTimeout(() => setCinematicStage("video"), 1100);
        } else if (phase === 3 && !isEndlessMode) {
          window.setTimeout(() => onVictory(nextScore), 250);
        } else {
          setPhaseTransition("next-phase");
          window.setTimeout(() => {
            const nextPhase = phase === 3 ? 1 : ((phase + 1) as Phase);
            const nextWave = isEndlessMode && phase === 3 ? endlessWave + 1 : endlessWave;
            moveToPhase(nextPhase, adaptation.band, adaptation.progress, isEndlessMode, nextWave);
            setPhaseTransition(null);
          }, 2400);
        }
      } else {
        advanceToNextQuestion(
          phase,
          adaptation.band,
          isEndlessMode,
          difficulty,
          "boss",
          endlessWave,
        );
      }
    }, 850);
  };

  const phaseHeader = useMemo(() => {
    if (isEndlessMode) {
      return `${currentPhaseConfig.academyTitle} - ${battleConfig.label}`;
    }

    return `${currentPhaseConfig.academyTitle} - ${selectedDifficultyConfig.label}`;
  }, [battleConfig.label, currentPhaseConfig.academyTitle, isEndlessMode, selectedDifficultyConfig.label]);

  if (showIntro) {
    return (
      <div className="fixed inset-0 overflow-hidden bg-battle-arena flex items-center justify-center px-4">
        <div className="text-center animate-slide-up">
          <img
            src={characterProfile.image}
            alt={characterProfile.name}
            className="mx-auto mb-5 h-36 w-28 rounded-2xl object-cover object-top shadow-[0_0_35px_hsl(160_70%_45%/0.25)] md:h-44 md:w-32"
          />
          <p className="mb-3 text-xs font-body uppercase tracking-[0.35em] text-primary/75">
            {selectedDifficultyConfig.shortLabel}
          </p>
          <h2 className="mb-2 text-3xl font-display font-black text-primary md:text-4xl">
            {characterProfile.name}
          </h2>
          <p className="font-body text-sm text-muted-foreground md:text-base">
            {currentPhaseConfig.description}
          </p>
          <div className="mx-auto mt-5 h-px w-28 bg-gradient-to-r from-transparent via-primary/40 to-transparent" />
        </div>
      </div>
    );
  }

  if (phaseTransition === "next-apprentice") {
    const nextApprentice = apprentices[apprenticeIndex + 1];

    return (
      <div className="fixed inset-0 overflow-hidden bg-battle-arena flex items-center justify-center px-4">
        <div className="text-center animate-slide-up">
          <p className="mb-3 text-xs font-body uppercase tracking-[0.35em] text-primary/70">
            Proximo desafio
          </p>
          <div className="mb-4 flex justify-center">
            <div className="rounded-[1.25rem] border border-white/10 bg-slate-950/60 p-2 shadow-[0_18px_36px_rgba(0,0,0,0.22)]">
              <BattleAvatarArtwork
                src={nextApprentice?.image}
                alt={nextApprentice?.name ?? "Proximo desafio"}
                fallback={nextApprentice?.emoji}
                frameClassName={enemyPortraitImageClassName}
                fallbackClassName={enemyPortraitFallbackClassName}
                objectPosition={nextApprentice?.imagePosition ?? "center 18%"}
                imageScale={getApprenticePortraitScale(nextApprentice?.imageScale)}
                tone="enemy"
              />
            </div>
          </div>
          <h3 className="text-2xl font-display font-bold text-foreground">{nextApprentice?.name}</h3>
          <p className="mt-2 font-body text-sm text-muted-foreground">{nextApprentice?.title}</p>
        </div>
      </div>
    );
  }

  if (phaseTransition === "next-phase") {
    const previewPhase = phase === 3 ? 1 : ((phase + 1) as Phase);
    const nextPhase = PHASE_CONFIGS[previewPhase];

    return (
      <div className="fixed inset-0 overflow-hidden bg-battle-arena flex items-center justify-center px-4">
        <div className="max-w-md text-center animate-slide-up">
          <p className="mb-3 text-xs font-body uppercase tracking-[0.35em] text-primary/70">
            {isEndlessMode && phase === 3 ? "Novo ciclo infinito" : "Nova ala liberada"}
          </p>
          <h2 className="text-4xl font-display font-black text-primary md:text-5xl">
            Fase {nextPhase.phase}
          </h2>
          <p className="mt-3 text-lg font-body text-foreground">{nextPhase.academyTitle}</p>
          <p className="mt-2 font-body text-sm text-muted-foreground">{nextPhase.transitionLine}</p>
        </div>
      </div>
    );
  }

  if (phaseTransition === "boss-intro") {
    const handleVideoEnd = () => {
      setCinematicStage("fadein");
      window.setTimeout(() => {
        setBattleStage("boss");
        advanceToNextQuestion(
          phase,
          activeBand,
          isEndlessMode,
          difficulty,
          "boss",
          endlessWave,
        );
        setPhaseTransition(null);
        setCinematicStage("idle");
      }, 1100);
    };

    return (
      <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black">
        {cinematicStage === "flash" && (
          <div className="absolute inset-0 z-50 bg-white animate-[flash_0.35s_ease-out_forwards]" />
        )}

        {cinematicStage === "fadeout" && (
          <div className="absolute inset-0 z-40 bg-black animate-[fade-in_0.8s_ease-out_forwards]" />
        )}

        {(cinematicStage === "video" || cinematicStage === "fadein") && (
          <div
            className={`absolute inset-0 z-50 transition-opacity duration-1000 ${
              cinematicStage === "fadein" ? "opacity-0" : "opacity-100"
            }`}
          >
            <video
              ref={videoRef}
              src={currentBossProfile.introVideo}
              autoPlay
              playsInline
              onEnded={handleVideoEnd}
              className="h-full w-full bg-black object-contain object-center"
            />
          </div>
        )}

        {cinematicStage === "fadein" && (
          <div className="absolute inset-0 z-40 flex items-center justify-center bg-black px-4">
            <div className="max-w-md text-center animate-slide-up">
              <p className="mb-3 text-xs font-body uppercase tracking-[0.35em] text-primary/70">
                Chefe liberado
              </p>
              <h2 className="text-4xl font-display font-black text-destructive md:text-5xl">
                {currentBossProfile.name}
              </h2>
              <p className="mt-2 font-body text-base italic text-muted-foreground">
                {currentBossProfile.title}
              </p>
              <p className="mt-4 font-body text-sm text-foreground/80">
                {currentPhaseConfig.bossRevealLine}
              </p>
            </div>
          </div>
        )}
      </div>
    );
  }

  if (phaseTransition === "boss-defeat") {
    const finishBossDefeatVideo = () => {
      const pendingBossDefeat = pendingBossDefeatRef.current;
      pendingBossDefeatRef.current = null;
      setCinematicStage("fadein");
      window.setTimeout(() => {
        setCinematicStage("idle");

        if (pendingBossDefeat) {
          continueAfterBossDefeat(pendingBossDefeat);
          return;
        }

        setPhaseTransition(null);
      }, 850);
    };

    return (
      <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black">
        {cinematicStage === "flash" && (
          <div className="absolute inset-0 z-50 bg-white animate-[flash_0.35s_ease-out_forwards]" />
        )}

        {cinematicStage === "fadeout" && (
          <div className="absolute inset-0 z-40 bg-black animate-[fade-in_0.8s_ease-out_forwards]" />
        )}

        {(cinematicStage === "video" || cinematicStage === "fadein") && currentBossProfile.defeatVideo && (
          <div
            className={`absolute inset-0 z-50 transition-opacity duration-700 ${
              cinematicStage === "fadein" ? "opacity-0" : "opacity-100"
            }`}
          >
            <video
              ref={videoRef}
              src={currentBossProfile.defeatVideo}
              autoPlay
              playsInline
              onEnded={finishBossDefeatVideo}
              onError={finishBossDefeatVideo}
              className="h-full w-full bg-black object-contain object-center"
            />
          </div>
        )}
      </div>
    );
  }

  return (
    <div
      className={`fixed inset-0 overflow-hidden bg-battle-arena px-3 py-3 sm:px-4 sm:py-4 xl:px-5 xl:py-5 ${
        screenShake ? "animate-screen-shake" : ""
      }`}
    >
      <FloatingDamage numbers={floatingNumbers} />

      <div className="mx-auto grid h-full max-w-7xl min-h-0 grid-rows-[auto_auto_auto_minmax(0,1fr)_auto] gap-3 md:gap-4">
        <header className="rounded-[1.75rem] border border-white/10 bg-slate-950/48 px-4 py-2.5 text-center shadow-[0_18px_45px_rgba(0,0,0,0.22)] backdrop-blur-md">
          <p className="text-[11px] font-body uppercase tracking-[0.38em] text-primary/85">{phaseHeader}</p>
          <div className="mt-2 flex flex-wrap items-center justify-center gap-2">
            <CombatChip tone="primary">Fase {phase} - {currentPhaseConfig.label}</CombatChip>
            <CombatChip>{stageLabel}</CombatChip>
            <CombatChip>{formatTimeLimit(battleConfig.timeLimit)}</CombatChip>
          </div>
          <p className="mx-auto mt-2 max-w-3xl text-sm font-body text-white/74">
            {currentPhaseConfig.description}
          </p>
        </header>

        <div className="flex min-h-[36px] items-center justify-center">
          {player.combo >= 2 ? (
            <ComboMeter combo={player.combo} />
          ) : (
            <div className="rounded-full border border-white/8 bg-slate-950/30 px-4 py-1.5 text-[11px] font-body uppercase tracking-[0.22em] text-white/52 backdrop-blur-sm">
              Monte sequencias para ganhar ritmo
            </div>
          )}
        </div>

        <div className="grid items-center gap-2 lg:grid-cols-[minmax(0,1fr)_68px_minmax(0,1fr)]">
          <HPBar current={player.hp} max={player.maxHp} label={characterProfile.name} variant="player" />
          <div className="mx-auto inline-flex h-11 w-11 items-center justify-center rounded-full border border-primary/30 bg-slate-950/72 font-display text-xl font-black text-primary shadow-[0_0_24px_rgba(245,158,11,0.16)]">
            VS
          </div>
          <HPBar
            current={currentTarget?.hp ?? 0}
            max={currentTarget?.maxHp ?? 1}
            label={currentTarget?.name ?? "Alvo"}
            variant="enemy"
          />
        </div>

        <div className="min-h-[286px] overflow-hidden rounded-[1.7rem] border border-white/10 bg-[linear-gradient(180deg,rgba(15,20,42,0.78)_0%,rgba(22,24,49,0.92)_100%)] px-3 py-3 shadow-[0_24px_60px_rgba(0,0,0,0.24)] backdrop-blur-md md:min-h-[308px] md:px-4 md:py-4">
          <div className="grid h-full min-h-0 gap-3 md:gap-4 sm:grid-cols-2 xl:grid-cols-[minmax(15rem,1.16fr)_minmax(0,1.08fr)_minmax(13.2rem,1fr)]">
            <div className="order-2 xl:order-1">
              <BattlePortraitCard
                badge="Heroi"
                name={characterProfile.name}
                title={characterProfile.title}
                tone="hero"
                animationClassName={playerAnim}
                className="xl:mr-1"
                avatar={
                  <BattleAvatarArtwork
                    src={characterProfile.image}
                    alt={characterProfile.name}
                    fallback={characterProfile.name.slice(0, 1)}
                    frameClassName={heroPortraitImageClassName}
                    fallbackClassName={heroPortraitFallbackClassName}
                    objectPosition="center 14%"
                    tone="hero"
                  />
                }
              />
            </div>

            <div className="order-1 flex min-h-[clamp(16rem,28vw,18.75rem)] flex-col items-center justify-center gap-3 rounded-[1.45rem] border border-white/10 bg-[radial-gradient(circle_at_top,rgba(255,185,66,0.12),transparent_42%),linear-gradient(180deg,rgba(9,14,28,0.88)_0%,rgba(17,22,38,0.82)_100%)] px-4 py-4 text-center shadow-[0_20px_50px_rgba(0,0,0,0.22)] sm:col-span-2 md:px-5 xl:order-2 xl:col-span-1">
              {feedback ? (
                <div
                  className={`animate-slide-up rounded-[1.2rem] border px-4 py-3 text-center shadow-[0_16px_36px_rgba(0,0,0,0.18)] ${
                    feedback.type === "critical"
                      ? "border-energy-gold/45 bg-energy-gold/16 text-energy-gold"
                      : feedback.type === "correct"
                        ? "border-accent/40 bg-accent/12 text-accent"
                        : "border-destructive/35 bg-destructive/12 text-destructive"
                  }`}
                >
                  <span
                    className={`block font-display font-black ${
                      feedback.type === "critical" ? "text-lg md:text-xl" : "text-sm md:text-lg"
                    }`}
                  >
                    {feedback.msg}
                  </span>
                </div>
              ) : (
                <div className="rounded-full border border-white/10 bg-slate-900/55 px-5 py-2 text-[10px] font-body uppercase tracking-[0.24em] text-white/65">
                  Resposta em campo
                </div>
              )}

              <div className="mx-auto grid w-full max-w-[34rem] grid-cols-2 gap-3">
                <BattleStatCard label="Modo" value={battleConfig.label} />
                <BattleStatCard label="Pontuacao" value={player.score} tone="score" />
              </div>

              <div className="rounded-full border border-white/10 bg-slate-900/62 px-4 py-1.5 text-[10px] font-body uppercase tracking-[0.24em] text-white/72">
                {battleConfig.timeLimit !== null ? `Cronometro ${timeLeft}s` : "Sem cronometro"}
              </div>
            </div>

            <div className="order-3 xl:order-3">
              <BattlePortraitCard
                badge={battleStage === "boss" ? "Chefe" : "Desafio"}
                name={currentTarget?.name}
                title={currentTarget?.title}
                tone="enemy"
                animationClassName={enemyAnim}
                className="xl:ml-1"
                avatar={
                  battleStage === "boss" ? (
                    <BattleAvatarArtwork
                      src={currentBossProfile.image}
                      alt={currentBossProfile.name}
                      fallback={currentBossProfile.emoji}
                      frameClassName={enemyPortraitImageClassName}
                      fallbackClassName={enemyPortraitFallbackClassName}
                      objectPosition={currentTarget?.imagePosition ?? "center 12%"}
                      imageScale={currentTarget?.imageScale ?? 1}
                      tone="enemy"
                    />
                  ) : (
                    currentApprenticeAvatar
                  )
                }
              />
            </div>
          </div>
        </div>

        <div className="mx-auto w-full max-w-[760px] rounded-[1.2rem] border border-white/10 bg-slate-950/84 px-4 py-3 shadow-[0_18px_42px_rgba(0,0,0,0.24)] backdrop-blur-xl md:px-5">
          <div className="flex items-center justify-center">
            <p className="text-center text-[10px] font-body uppercase tracking-[0.3em] text-primary/78">
              {currentBossProfile.challengeLabel}
            </p>
          </div>

          <div className="mt-3 flex min-h-[60px] items-center justify-center rounded-[1rem] border border-primary/18 bg-[radial-gradient(circle_at_top,rgba(255,185,66,0.14),transparent_45%),linear-gradient(180deg,rgba(24,24,40,0.86)_0%,rgba(17,17,33,0.92)_100%)] px-4 py-2 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]">
            <p className="text-center font-display text-[clamp(1.65rem,4.8vw,2.35rem)] font-black text-primary drop-shadow-[0_0_14px_rgba(245,158,11,0.16)]">
              {currentQuestion?.question ?? "Sem nova expressao disponivel"}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="mt-3 grid gap-2.5 sm:grid-cols-[minmax(0,1fr)_140px]">
            <input
              ref={inputRef}
              type="number"
              inputMode="numeric"
              value={answer}
              onChange={(event) => setAnswer(event.target.value)}
              placeholder="Digite a resposta"
              disabled={feedback !== null || currentQuestion === null}
              className="h-10 rounded-[0.95rem] border border-white/10 bg-white px-4 text-center text-base font-body font-semibold text-slate-950 caret-slate-950 outline-none transition-colors placeholder:text-slate-400 focus:border-primary/45 focus:bg-white"
            />
            <button
              type="submit"
              disabled={!answer || feedback !== null || currentQuestion === null}
              className="h-10 rounded-[0.95rem] border border-amber-200/20 bg-[linear-gradient(180deg,#facc49_0%,#f59e0b_26%,#ea580c_76%,#c2410c_100%)] px-4 font-display text-sm font-black text-white shadow-[0_12px_28px_rgba(234,88,12,0.24),inset_0_2px_0_rgba(255,255,255,0.25)] transition-all hover:-translate-y-0.5 hover:shadow-[0_16px_30px_rgba(234,88,12,0.32),inset_0_2px_0_rgba(255,255,255,0.32)] disabled:translate-y-0 disabled:opacity-40 disabled:shadow-none"
            >
              Responder
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
