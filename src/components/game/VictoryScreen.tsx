import { useEffect, useRef, useState } from "react";
import { AlertTriangle, Home, RotateCcw, Trophy } from "lucide-react";

import {
  EXISTING_ENDING_VIDEO_PATH,
  FINAL_CHOICE_PROMPT,
  OPTIONAL_FINAL_VIDEO_PATH,
  SAVED_SCHOOL_MESSAGE,
  SAVED_SCHOOL_MESSAGE_BEAT_MS,
} from "@/game/endgame";
import { playVictory } from "@/game/sounds";

interface Props {
  score: number;
  onMenu: () => void;
  onRestartAtDifferentLevel: () => void;
}

type VictoryPhase =
  | "ending-video"
  | "saved-message"
  | "choice"
  | "bonus-video"
  | "post-final-video";

interface EndGameVideoStageProps {
  ariaLabel: string;
  eyebrow: string;
  title: string;
  description: string;
  helperText: string;
  videoSrc: string;
  onComplete: () => void;
  onPlaybackError: () => void;
  skipLabel?: string;
}

function EndGameVideoStage({
  ariaLabel,
  eyebrow,
  title,
  description,
  helperText,
  videoSrc,
  onComplete,
  onPlaybackError,
  skipLabel,
}: EndGameVideoStageProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [hasError, setHasError] = useState(false);
  const [mutedFallback, setMutedFallback] = useState(false);

  useEffect(() => {
    const videoElement = videoRef.current;

    if (!videoElement || !videoSrc) {
      setHasError(true);
      onPlaybackError();
      return;
    }

    let isCancelled = false;

    // Reuse the same autoplay fallback for every ending video stage.
    const startPlayback = async () => {
      try {
        videoElement.currentTime = 0;
        videoElement.muted = false;
        await videoElement.play();
      } catch {
        try {
          if (isCancelled) {
            return;
          }

          videoElement.muted = true;
          setMutedFallback(true);
          await videoElement.play();
        } catch {
          if (!isCancelled) {
            setHasError(true);
            onPlaybackError();
          }
        }
      }
    };

    void startPlayback();

    return () => {
      isCancelled = true;
      videoElement.pause();
    };
  }, [onPlaybackError, videoSrc]);

  if (hasError) {
    return (
      <div className="flex min-h-[380px] flex-col items-center justify-center rounded-[1.75rem] border border-red-300/18 bg-red-300/10 px-6 py-10 text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-red-300/14 text-red-100">
          <AlertTriangle className="h-7 w-7" />
        </div>
        <h2 className="mt-5 font-display text-3xl font-black text-white sm:text-4xl">
          Video indisponivel
        </h2>
        <p className="mt-4 max-w-2xl font-body text-sm leading-7 text-white/78 sm:text-base">
          O video nao foi carregado. O fluxo final continua normalmente para a aventura nao travar.
        </p>
        <button
          type="button"
          onClick={onComplete}
          className="mt-7 inline-flex min-h-[48px] items-center justify-center rounded-full bg-[linear-gradient(90deg,#f2c45a_0%,#d8992f_100%)] px-7 text-[15px] font-body font-bold text-[#131a41] transition-transform hover:-translate-y-0.5 hover:shadow-[0_16px_32px_rgba(242,196,90,0.22)]"
        >
          Continuar
        </button>
      </div>
    );
  }

  return (
    <div className="rounded-[1.75rem] border border-white/10 bg-black/60 p-3 sm:p-4">
      <div className="mb-4 text-center">
        <p className="text-[11px] font-body uppercase tracking-[0.34em] text-primary/80">{eyebrow}</p>
        <h2 className="mt-3 font-display text-3xl font-black text-white sm:text-4xl">{title}</h2>
        <p className="mx-auto mt-3 max-w-2xl font-body text-sm leading-7 text-white/76 sm:text-base">
          {description}
        </p>
      </div>

      <video
        ref={videoRef}
        src={videoSrc}
        autoPlay
        playsInline
        preload="auto"
        aria-label={ariaLabel}
        onEnded={onComplete}
        onError={() => {
          setHasError(true);
          onPlaybackError();
        }}
        className="h-full max-h-[72vh] w-full rounded-[1.25rem] bg-black object-contain"
      />

      <div className="mt-4 flex flex-col items-center justify-center gap-3 text-center">
        <p className="font-body text-sm text-white/72">{helperText}</p>
        {mutedFallback && (
          <p className="text-xs font-body uppercase tracking-[0.24em] text-primary/72">
            Autoplay fallback: o video foi iniciado sem audio.
          </p>
        )}

        {skipLabel && (
          <button
            type="button"
            onClick={onComplete}
            className="inline-flex min-h-[44px] items-center justify-center rounded-full border border-white/14 bg-white/6 px-6 text-sm font-body font-bold text-white transition-colors hover:bg-white/10"
          >
            {skipLabel}
          </button>
        )}
      </div>
    </div>
  );
}

export default function VictoryScreen({ score, onMenu, onRestartAtDifferentLevel }: Props) {
  const [phase, setPhase] = useState<VictoryPhase>("ending-video");
  const [hadEndingVideoError, setHadEndingVideoError] = useState(false);
  const [hadBonusVideoError, setHadBonusVideoError] = useState(false);

  useEffect(() => {
    playVictory();
  }, []);

  useEffect(() => {
    if (phase !== "saved-message") {
      return;
    }

    // Hold the rescue message briefly before revealing the final player choice.
    const timeoutId = window.setTimeout(() => setPhase("choice"), SAVED_SCHOOL_MESSAGE_BEAT_MS);

    return () => window.clearTimeout(timeoutId);
  }, [phase]);

  const beginChoiceSequence = () => {
    setPhase("saved-message");
  };

  return (
    <section className="relative min-h-[100svh] overflow-hidden bg-[radial-gradient(circle_at_top,rgba(255,211,92,0.18),transparent_28%),linear-gradient(180deg,#0c1535_0%,#121d46_48%,#090d1d_100%)] px-4 py-6">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom,rgba(88,129,255,0.18),transparent_35%)]" />

      <div className="relative z-10 mx-auto flex min-h-[calc(100svh-3rem)] max-w-5xl items-center justify-center">
        <div className="w-full overflow-hidden rounded-[2rem] border border-white/10 bg-[linear-gradient(180deg,rgba(13,24,56,0.9),rgba(7,12,28,0.96))] shadow-[0_30px_100px_rgba(0,0,0,0.42)]">
          <div className="border-b border-white/8 px-6 py-5 text-center sm:px-8">
            <p className="text-[11px] font-body uppercase tracking-[0.34em] text-primary/80">
              Encerramento da aventura
            </p>
            <h1 className="mt-3 font-display text-4xl font-black text-primary animate-victory-glow sm:text-5xl">
              VITORIA!
            </h1>
            <p className="mt-3 font-body text-base text-white/86 sm:text-lg">
              Voce derrotou o terceiro chefe e concluiu a campanha principal.
            </p>
            <p className="mt-2 font-body text-sm text-white/60 sm:text-base">
              Pontuacao final: <span className="font-bold text-primary">{score}</span>
            </p>
          </div>

          <div className="p-5 sm:p-6 md:p-8">
            {phase === "ending-video" && (
              <EndGameVideoStage
                ariaLabel="Video final da campanha"
                eyebrow="Video final ja implementado"
                title="Encerramento do CEAS"
                description="Apos a derrota do terceiro chefe, o video final principal da campanha e reproduzido automaticamente."
                helperText="Quando esse video terminar, a mensagem de escola salva aparece sozinha."
                videoSrc={EXISTING_ENDING_VIDEO_PATH}
                onComplete={beginChoiceSequence}
                onPlaybackError={() => setHadEndingVideoError(true)}
              />
            )}

            {phase === "saved-message" && (
              <div className="flex min-h-[380px] flex-col items-center justify-center rounded-[1.75rem] border border-primary/18 bg-[radial-gradient(circle_at_top,rgba(255,215,110,0.16),transparent_38%),linear-gradient(180deg,rgba(255,255,255,0.03),rgba(255,255,255,0.01))] px-6 py-10 text-center">
                <div className="flex h-20 w-20 items-center justify-center rounded-full border border-primary/28 bg-primary/10 text-primary shadow-[0_0_30px_rgba(255,208,92,0.18)]">
                  <Trophy className="h-9 w-9" />
                </div>
                <h2 className="mt-6 font-display text-3xl font-black text-white sm:text-4xl">
                  {SAVED_SCHOOL_MESSAGE}
                </h2>
              </div>
            )}

            {phase === "choice" && (
              <div className="flex min-h-[380px] flex-col items-center justify-center rounded-[1.75rem] border border-white/10 bg-[radial-gradient(circle_at_top,rgba(101,147,255,0.14),transparent_30%),linear-gradient(180deg,rgba(255,255,255,0.04),rgba(255,255,255,0.02))] px-6 py-10 text-center">
                {hadEndingVideoError && (
                  <div className="mb-5 flex items-center gap-2 rounded-full border border-red-300/16 bg-red-300/10 px-4 py-2 text-sm font-body text-red-100">
                    <AlertTriangle className="h-4 w-4" />
                    O video de encerramento nao foi carregado, mas a campanha continua normalmente.
                  </div>
                )}

                <h2 className="font-display text-3xl font-black text-white sm:text-4xl">
                  {SAVED_SCHOOL_MESSAGE}
                </h2>
                <p className="mt-4 max-w-3xl font-body text-sm leading-7 text-white/80 sm:text-base">
                  {FINAL_CHOICE_PROMPT}
                </p>

                <div className="mt-8 flex w-full max-w-xl flex-col gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      setHadBonusVideoError(false);
                      setPhase("bonus-video");
                    }}
                    className="inline-flex min-h-[52px] items-center justify-center rounded-full bg-[linear-gradient(90deg,#f2c45a_0%,#d8992f_100%)] px-8 text-[15px] font-body font-bold text-[#131a41] transition-transform hover:-translate-y-0.5 hover:shadow-[0_16px_32px_rgba(242,196,90,0.22)]"
                  >
                    Ver o final
                  </button>

                  <button
                    type="button"
                    onClick={onRestartAtDifferentLevel}
                    className="inline-flex min-h-[52px] items-center justify-center rounded-full border border-white/14 bg-[linear-gradient(180deg,rgba(21,32,74,0.96),rgba(10,18,42,0.98))] px-8 text-[15px] font-body font-bold text-white transition-transform hover:-translate-y-0.5 hover:shadow-[0_16px_32px_rgba(46,143,255,0.18)]"
                  >
                    {"Iniciar novamente em outro n\u00EDvel"}
                  </button>
                </div>
              </div>
            )}

            {phase === "bonus-video" && (
              <EndGameVideoStage
                ariaLabel="Video final com a professora e os alunos"
                eyebrow="Final alternativo configuravel"
                title="Final da professora e dos alunos"
                description="Este bloco usa um caminho configuravel para o video extra final, facilitando trocar o arquivo depois sem mexer no fluxo."
                helperText="Ao terminar, a aventura exibe as acoes finais para voltar ao menu ou recomecar em outro nivel."
                videoSrc={OPTIONAL_FINAL_VIDEO_PATH}
                onComplete={() => setPhase("post-final-video")}
                onPlaybackError={() => setHadBonusVideoError(true)}
                skipLabel="Pular final"
              />
            )}

            {phase === "post-final-video" && (
              <div className="flex min-h-[380px] flex-col items-center justify-center rounded-[1.75rem] border border-white/10 bg-[radial-gradient(circle_at_top,rgba(101,147,255,0.14),transparent_30%),linear-gradient(180deg,rgba(255,255,255,0.04),rgba(255,255,255,0.02))] px-6 py-10 text-center">
                {hadBonusVideoError && (
                  <div className="mb-5 flex items-center gap-2 rounded-full border border-red-300/16 bg-red-300/10 px-4 py-2 text-sm font-body text-red-100">
                    <AlertTriangle className="h-4 w-4" />
                    O final extra nao foi encontrado. Basta trocar o arquivo configurado para atualizar esse trecho.
                  </div>
                )}

                <h2 className="font-display text-3xl font-black text-white sm:text-4xl">
                  Final concluido
                </h2>
                <p className="mt-4 max-w-2xl font-body text-sm leading-7 text-white/76 sm:text-base">
                  A escola foi salva e o encerramento completo da campanha terminou.
                </p>

                <div className="mt-8 flex w-full max-w-xl flex-col gap-3 sm:flex-row sm:justify-center">
                  <button
                    type="button"
                    onClick={onMenu}
                    className="inline-flex min-h-[52px] items-center justify-center gap-2 rounded-full border border-white/14 bg-white/6 px-7 text-[15px] font-body font-bold text-white transition-colors hover:bg-white/10"
                  >
                    <Home className="h-4.5 w-4.5" />
                    Voltar ao menu
                  </button>

                  <button
                    type="button"
                    onClick={onRestartAtDifferentLevel}
                    className="inline-flex min-h-[52px] items-center justify-center gap-2 rounded-full bg-[linear-gradient(90deg,#f2c45a_0%,#d8992f_100%)] px-7 text-[15px] font-body font-bold text-[#131a41] transition-transform hover:-translate-y-0.5 hover:shadow-[0_16px_32px_rgba(242,196,90,0.22)]"
                  >
                    <RotateCcw className="h-4.5 w-4.5" />
                    {"Iniciar novamente em outro n\u00EDvel"}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
