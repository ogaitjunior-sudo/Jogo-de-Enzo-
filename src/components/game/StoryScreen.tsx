import { FormEvent, useEffect, useRef, useState } from "react";
import {
  AlertTriangle,
  ArrowRight,
  BookOpen,
  Brain,
  Calculator,
  CheckCircle2,
  Crown,
  Home,
  RotateCcw,
  Search,
  Shield,
  Sparkles,
  Zap,
  type LucideIcon,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  STORY_PHASES,
  STORY_ROLES,
  chooseStoryOption,
  chooseStoryRole,
  completeStoryChallenge,
  continueStory,
  createInitialStoryProgress,
  getStoryChallenge,
  getStoryRole,
  getStoryScene,
  getStoryScore,
  type StoryMathLevel,
  type StoryProgress,
  type StoryRoleId,
} from "@/game/story-mode";
import { playClick, playCorrect, playVictory, playWrong } from "@/game/sounds";
import { cn } from "@/lib/utils";

const STORY_ART_SRC = "/title-home-final.png";

interface Props {
  onBack: () => void;
}

interface StoryResolution {
  tone: "success" | "error";
  title: string;
  body: string;
  hint?: string;
  nextProgress?: StoryProgress;
}

const roleIcons: Record<StoryRoleId, LucideIcon> = {
  strategist: Brain,
  calculator: Calculator,
  sprinter: Zap,
  analyst: Search,
  leader: Crown,
};

const phaseIcons: Record<(typeof STORY_PHASES)[number]["id"], LucideIcon> = {
  prologue: BookOpen,
  newton: Shield,
  einstein: Sparkles,
  marcela: Crown,
  ending: CheckCircle2,
};

function PhaseRail({ activePhase }: { activePhase: (typeof STORY_PHASES)[number]["id"] }) {
  const activeIndex = STORY_PHASES.findIndex((phase) => phase.id === activePhase);

  return (
    <div className="grid gap-2">
      {STORY_PHASES.map((phase, index) => {
        const Icon = phaseIcons[phase.id];
        const isCurrent = phase.id === activePhase;
        const isDone = index < activeIndex;

        return (
          <div
            key={phase.id}
            className={cn(
              "flex items-center gap-3 rounded-[1.35rem] border px-3 py-3 transition-colors",
              isCurrent
                ? "border-[#f0c47c]/45 bg-white/10"
                : isDone
                  ? "border-emerald-300/25 bg-emerald-300/10"
                  : "border-white/8 bg-white/[0.03]",
            )}
          >
            <div
              className={cn(
                "flex h-10 w-10 items-center justify-center rounded-full border",
                isCurrent
                  ? "border-[#f0c47c]/45 bg-[#f0c47c]/16 text-[#ffe0b2]"
                  : isDone
                    ? "border-emerald-300/30 bg-emerald-300/12 text-emerald-100"
                    : "border-white/10 bg-white/5 text-white/55",
              )}
            >
              <Icon className="h-4 w-4" />
            </div>

            <div>
              <p className="text-sm font-display font-bold text-white">{phase.label}</p>
              <p className="text-[11px] font-body uppercase tracking-[0.2em] text-white/52">
                {isCurrent ? "Agora" : isDone ? "Concluido" : "Aguardando"}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
}

function StoryStatCard({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-[1.25rem] border border-white/10 bg-white/[0.04] px-4 py-3">
      <p className="text-[10px] font-body uppercase tracking-[0.24em] text-white/48">{label}</p>
      <p className="mt-2 font-display text-2xl font-black text-white">{value}</p>
    </div>
  );
}

export default function StoryScreen({ onBack }: Props) {
  const [progress, setProgress] = useState(createInitialStoryProgress);
  const [challengeAnswer, setChallengeAnswer] = useState("");
  const [challengeLevel, setChallengeLevel] = useState<StoryMathLevel>(0);
  const [resolution, setResolution] = useState<StoryResolution | null>(null);
  const victoryPlayedRef = useRef(false);

  const scene = getStoryScene(progress.sceneId);
  const activeRole = getStoryRole(progress.roleId);
  const activeChallenge =
    scene.kind === "challenge" ? getStoryChallenge(scene.challengeId, challengeLevel) : null;

  useEffect(() => {
    const nextScene = getStoryScene(progress.sceneId);

    setChallengeAnswer("");
    setResolution(null);

    if (nextScene.kind === "challenge") {
      setChallengeLevel(progress.mathLevel);
    }
  }, [progress.sceneId]);

  useEffect(() => {
    if (scene.kind === "ending" && !victoryPlayedRef.current) {
      playVictory();
      victoryPlayedRef.current = true;
    }

    if (scene.kind !== "ending") {
      victoryPlayedRef.current = false;
    }
  }, [scene.kind]);

  const handleBack = () => {
    playClick();
    onBack();
  };

  const handleChoice = (choiceId: string) => {
    playClick();
    setProgress((currentProgress) => chooseStoryOption(currentProgress, choiceId));
  };

  const handleRole = (roleId: StoryRoleId) => {
    playClick();
    setProgress((currentProgress) => chooseStoryRole(currentProgress, roleId));
  };

  const handleContinueScene = () => {
    playClick();
    setProgress((currentProgress) => continueStory(currentProgress));
  };

  const handleRestart = () => {
    playClick();
    setProgress(createInitialStoryProgress());
    setChallengeAnswer("");
    setResolution(null);
    victoryPlayedRef.current = false;
  };

  const handleChallengeSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (scene.kind !== "challenge" || !activeChallenge) {
      return;
    }

    const sanitizedAnswer = Number(challengeAnswer.replace(",", ".").trim());

    if (Number.isNaN(sanitizedAnswer)) {
      setResolution({
        tone: "error",
        title: "Resposta incompleta",
        body: "Digite um numero valido para estabilizar a formula antes que a energia avance.",
      });
      return;
    }

    if (sanitizedAnswer === activeChallenge.answer) {
      const nextProgress = completeStoryChallenge(progress, scene.challengeId, true, scene.nextSceneId);

      playCorrect();
      setResolution({
        tone: "success",
        title: "Resposta confirmada",
        body: activeChallenge.successText,
        hint: activeChallenge.explanation,
        nextProgress,
      });
      return;
    }

    playWrong();
    setProgress((currentProgress) =>
      completeStoryChallenge(currentProgress, scene.challengeId, false, scene.nextSceneId),
    );
    setResolution({
      tone: "error",
      title: "O selo ainda resiste",
      body: activeChallenge.failureText,
      hint: activeChallenge.hint,
    });
    setChallengeAnswer("");
  };

  const handleChallengeContinue = () => {
    if (!resolution?.nextProgress) {
      return;
    }

    playClick();
    setProgress(resolution.nextProgress);
  };

  return (
    <section className="relative min-h-screen overflow-hidden bg-[#040814] px-4 py-8">
      <div className="absolute inset-0 overflow-hidden">
        <img
          src={STORY_ART_SRC}
          alt=""
          aria-hidden="true"
          className="h-full w-full scale-110 object-cover opacity-[0.18] blur-3xl"
        />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(94,142,255,0.16),transparent_34%),radial-gradient(circle_at_bottom,rgba(255,154,78,0.14),transparent_28%)]" />
        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(5,10,24,0.34),rgba(4,8,20,0.82)_54%,rgba(2,4,12,0.97)_100%)]" />
      </div>

      <div className="relative z-10 mx-auto flex min-h-[calc(100vh-4rem)] max-w-7xl flex-col justify-center">
        <div className="mb-5 flex flex-col gap-4 xl:flex-row">
          <div className="flex-1 rounded-[2.1rem] border border-white/10 bg-[linear-gradient(180deg,rgba(10,19,41,0.6),rgba(5,11,26,0.86))] p-6 shadow-[0_28px_80px_rgba(0,0,0,0.3)] backdrop-blur-xl md:p-7">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-[11px] font-body uppercase tracking-[0.32em] text-[#f3cc8c]/76">
                  {scene.chapterLabel}
                </p>
                <h2 className="mt-3 font-display text-3xl font-black text-white md:text-5xl">
                  {scene.title}
                </h2>
              </div>

              <Button
                type="button"
                variant="outline"
                onClick={handleBack}
                className="rounded-full border-white/14 bg-white/5 px-5 text-white/78 hover:bg-white/10 hover:text-white"
              >
                <Home className="h-4 w-4" />
                Menu
              </Button>
            </div>

            <div className="mt-5 flex flex-wrap gap-3">
              <div className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs font-body uppercase tracking-[0.24em] text-white/62">
                {scene.location}
              </div>
              <div className="rounded-full border border-[#f0c47c]/24 bg-[#f0c47c]/10 px-4 py-2 text-xs font-body uppercase tracking-[0.24em] text-[#ffe0b2]">
                {scene.objective}
              </div>
            </div>
          </div>

          <div className="grid gap-3 xl:w-[320px] xl:grid-cols-2">
            <StoryStatCard label="Insight" value={progress.insight} />
            <StoryStatCard label="Resolve" value={progress.resolve} />
            <StoryStatCard label="Acertos" value={progress.correctAnswers} />
            <StoryStatCard label="Risco" value={progress.wrongAnswers} />
          </div>
        </div>

        <div className="grid gap-6 xl:grid-cols-[1.45fr_0.95fr]">
          <div className="space-y-6">
            <div className="rounded-[2.1rem] border border-white/10 bg-[linear-gradient(180deg,rgba(10,19,41,0.52),rgba(5,11,26,0.84))] p-6 shadow-[0_28px_80px_rgba(0,0,0,0.3)] backdrop-blur-xl md:p-7">
              <div className="rounded-[1.45rem] border border-white/10 bg-white/[0.04] p-5">
                <p className="text-[11px] font-body uppercase tracking-[0.3em] text-[#f3cc8c]/72">
                  Tensao imediata
                </p>
                <p className="mt-3 text-base leading-7 text-white/82">{scene.urgency}</p>
              </div>

              <div className="mt-5 space-y-4">
                {scene.getNarrative(progress).map((paragraph, index) => (
                  <p key={`${scene.id}-${index}`} className="font-body text-base leading-8 text-white/78 md:text-[1.02rem]">
                    {paragraph}
                  </p>
                ))}
              </div>

              {scene.quote && (
                <div className="mt-6 rounded-[1.55rem] border border-[#f0c47c]/20 bg-[#f0c47c]/8 px-5 py-4">
                  <p className="font-body text-base italic leading-7 text-[#ffe5ba]">{scene.quote}</p>
                </div>
              )}
            </div>

            <div className="rounded-[2.1rem] border border-white/10 bg-[linear-gradient(180deg,rgba(10,19,41,0.54),rgba(5,11,26,0.86))] p-6 shadow-[0_28px_80px_rgba(0,0,0,0.32)] backdrop-blur-xl md:p-7">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-full border border-[#f0c47c]/28 bg-[#f0c47c]/12 text-[#ffe0b2]">
                  {scene.kind === "challenge" ? (
                    <Sparkles className="h-5 w-5" />
                  ) : scene.kind === "ending" ? (
                    <CheckCircle2 className="h-5 w-5" />
                  ) : (
                    <ArrowRight className="h-5 w-5" />
                  )}
                </div>
                <div>
                  <p className="text-[11px] font-body uppercase tracking-[0.26em] text-white/55">Acao atual</p>
                  <h3 className="font-display text-2xl font-bold text-white">
                    {scene.kind === "choice"
                      ? "Escolha o proximo passo"
                      : scene.kind === "role"
                        ? "Defina o papel do protagonista"
                        : scene.kind === "challenge"
                          ? "Resolva o desafio matematico"
                          : scene.kind === "message"
                            ? "Preparar a travessia"
                            : "Campanha concluida"}
                  </h3>
                </div>
              </div>

              {scene.kind === "choice" && (
                <div className="mt-6 grid gap-3">
                  {scene.choices.map((choice) => (
                    <button
                      key={choice.id}
                      type="button"
                      onClick={() => handleChoice(choice.id)}
                      className="group rounded-[1.55rem] border border-white/10 bg-white/[0.04] px-5 py-4 text-left transition-[transform,border-color,background-color,box-shadow] duration-200 hover:-translate-y-0.5 hover:border-[#f0c47c]/32 hover:bg-white/[0.07] hover:shadow-[0_18px_40px_rgba(0,0,0,0.2)]"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <h4 className="font-display text-xl font-bold text-white">{choice.label}</h4>
                          <p className="mt-2 font-body text-sm leading-6 text-white/68">{choice.description}</p>
                        </div>
                        <ArrowRight className="mt-1 h-5 w-5 text-white/34 transition-transform duration-200 group-hover:translate-x-0.5 group-hover:text-[#ffe0b2]" />
                      </div>
                    </button>
                  ))}
                </div>
              )}

              {scene.kind === "role" && (
                <div className="mt-6 grid gap-3 md:grid-cols-2">
                  {STORY_ROLES.map((role) => {
                    const Icon = roleIcons[role.id];

                    return (
                      <button
                        key={role.id}
                        type="button"
                        onClick={() => handleRole(role.id)}
                        className="group rounded-[1.55rem] border border-white/10 bg-white/[0.04] px-5 py-4 text-left transition-[transform,border-color,background-color,box-shadow] duration-200 hover:-translate-y-0.5 hover:border-[#f0c47c]/32 hover:bg-white/[0.07] hover:shadow-[0_18px_40px_rgba(0,0,0,0.2)]"
                      >
                        <div className="flex items-start gap-4">
                          <div className="flex h-11 w-11 items-center justify-center rounded-full border border-white/10 bg-white/5 text-[#ffe0b2]">
                            <Icon className="h-5 w-5" />
                          </div>

                          <div className="min-w-0">
                            <h4 className="font-display text-xl font-bold text-white">{role.name}</h4>
                            <p className="mt-1 text-sm font-body text-[#ffe0b2]/78">{role.title}</p>
                            <p className="mt-3 text-sm leading-6 text-white/68">{role.specialty}</p>
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}

              {scene.kind === "challenge" && activeChallenge && (
                <div className="mt-6 space-y-4">
                  <div className="rounded-[1.55rem] border border-[#f0c47c]/20 bg-[#f0c47c]/8 px-5 py-4">
                    <p className="text-[11px] font-body uppercase tracking-[0.24em] text-[#f3cc8c]/80">
                      Desafio matematico
                    </p>
                    <p className="mt-3 font-body text-base leading-7 text-white/84">{activeChallenge.prompt}</p>
                  </div>

                  <form className="grid gap-3 sm:grid-cols-[1fr_auto]" onSubmit={handleChallengeSubmit}>
                    <Input
                      type="text"
                      inputMode="numeric"
                      autoComplete="off"
                      value={challengeAnswer}
                      onChange={(event) => setChallengeAnswer(event.target.value)}
                      placeholder="Digite a resposta"
                      className="h-14 rounded-[1.2rem] border-white/12 bg-white/[0.05] px-4 text-base text-white placeholder:text-white/34"
                    />
                    <Button
                      type="submit"
                      className="h-14 rounded-[1.2rem] bg-[linear-gradient(180deg,#f6df9a_0%,#f3b257_35%,#d56d25_78%,#9b3d12_100%)] px-6 font-display text-base font-black uppercase tracking-[0.08em] text-[#fff8e8] hover:brightness-105"
                    >
                      Confirmar
                    </Button>
                  </form>

                  {resolution && (
                    <div
                      className={cn(
                        "rounded-[1.55rem] border px-5 py-4",
                        resolution.tone === "success"
                          ? "border-emerald-300/24 bg-emerald-300/12"
                          : "border-red-300/18 bg-red-300/10",
                      )}
                    >
                      <div className="flex items-start gap-3">
                        <div
                          className={cn(
                            "mt-0.5 flex h-9 w-9 items-center justify-center rounded-full",
                            resolution.tone === "success"
                              ? "bg-emerald-300/14 text-emerald-100"
                              : "bg-red-300/12 text-red-100",
                          )}
                        >
                          {resolution.tone === "success" ? (
                            <CheckCircle2 className="h-4 w-4" />
                          ) : (
                            <AlertTriangle className="h-4 w-4" />
                          )}
                        </div>

                        <div className="min-w-0 flex-1">
                          <h4 className="font-display text-xl font-bold text-white">{resolution.title}</h4>
                          <p className="mt-2 font-body text-sm leading-6 text-white/78">{resolution.body}</p>
                          {resolution.hint && (
                            <p className="mt-2 text-sm leading-6 text-white/64">{resolution.hint}</p>
                          )}

                          {resolution.nextProgress && (
                            <Button
                              type="button"
                              onClick={handleChallengeContinue}
                              className="mt-4 rounded-full bg-white text-slate-950 hover:bg-white/92"
                            >
                              Continuar
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {scene.kind === "message" && (
                <div className="mt-6 flex flex-wrap gap-3">
                  <Button
                    type="button"
                    onClick={handleContinueScene}
                    className="rounded-full bg-white text-slate-950 hover:bg-white/92"
                  >
                    {scene.actionLabel}
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </div>
              )}

              {scene.kind === "ending" && (
                <div className="mt-6 flex flex-wrap gap-3">
                  <Button
                    type="button"
                    onClick={handleRestart}
                    className="rounded-full bg-white text-slate-950 hover:bg-white/92"
                  >
                    <RotateCcw className="h-4 w-4" />
                    Reiniciar historia
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleBack}
                    className="rounded-full border-white/14 bg-white/5 text-white hover:bg-white/10"
                  >
                    <Home className="h-4 w-4" />
                    Voltar ao menu
                  </Button>
                </div>
              )}
            </div>
          </div>

          <div className="space-y-6">
            <div className="rounded-[2.1rem] border border-white/10 bg-[linear-gradient(180deg,rgba(10,19,41,0.48),rgba(5,11,26,0.84))] p-6 shadow-[0_28px_80px_rgba(0,0,0,0.3)] backdrop-blur-xl">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-full border border-[#f0c47c]/28 bg-[#f0c47c]/12 text-[#ffe0b2]">
                  {activeRole ? (
                    (() => {
                      const Icon = roleIcons[activeRole.id];
                      return <Icon className="h-5 w-5" />;
                    })()
                  ) : (
                    <BookOpen className="h-5 w-5" />
                  )}
                </div>
                <div>
                  <p className="text-[11px] font-body uppercase tracking-[0.24em] text-white/55">Protagonista</p>
                  <h3 className="font-display text-2xl font-bold text-white">
                    {activeRole?.name ?? "Aguardando escolha"}
                  </h3>
                </div>
              </div>

              <p className="mt-4 font-body text-sm leading-7 text-white/72">
                {activeRole
                  ? `${activeRole.specialty} ${activeRole.aura}`
                  : "Escolha um papel para definir quem conduz a narrativa do Setimo A."}
              </p>
            </div>

            <div className="rounded-[2.1rem] border border-white/10 bg-[linear-gradient(180deg,rgba(10,19,41,0.48),rgba(5,11,26,0.84))] p-6 shadow-[0_28px_80px_rgba(0,0,0,0.3)] backdrop-blur-xl">
              <p className="text-[11px] font-body uppercase tracking-[0.24em] text-white/55">Capitulos</p>
              <div className="mt-4">
                <PhaseRail activePhase={scene.phase} />
              </div>
            </div>

            <div className="rounded-[2.1rem] border border-white/10 bg-[linear-gradient(180deg,rgba(10,19,41,0.48),rgba(5,11,26,0.84))] p-6 shadow-[0_28px_80px_rgba(0,0,0,0.3)] backdrop-blur-xl">
              <p className="text-[11px] font-body uppercase tracking-[0.24em] text-white/55">Missao final</p>
              <div className="mt-4 grid gap-3">
                {[
                  "Libertar a professora Marcela",
                  "Derrotar Isaac Newton",
                  "Superar Albert Einstein",
                  "Salvar o CEAS antes do colapso",
                ].map((goal) => (
                  <div key={goal} className="rounded-[1.25rem] border border-white/10 bg-white/[0.04] px-4 py-3">
                    <p className="font-body text-sm leading-6 text-white/74">{goal}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-[2.1rem] border border-white/10 bg-[linear-gradient(180deg,rgba(10,19,41,0.48),rgba(5,11,26,0.84))] p-6 shadow-[0_28px_80px_rgba(0,0,0,0.3)] backdrop-blur-xl">
              <p className="text-[11px] font-body uppercase tracking-[0.24em] text-white/55">Leitura da campanha</p>
              <div className="mt-4 grid gap-3 sm:grid-cols-3 xl:grid-cols-1">
                <StoryStatCard label="Pontuacao narrativa" value={getStoryScore(progress)} />
                <StoryStatCard label="Dificuldade atual" value={challengeLevel + 1} />
                <StoryStatCard label="Turma escolhida" value={activeRole ? activeRole.name : "Pendente"} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
