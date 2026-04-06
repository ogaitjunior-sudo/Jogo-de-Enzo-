import { useCallback, useEffect, useRef, useState } from "react";

import { playClick } from "@/game/sounds";

const INTRO_VIDEO_SRC = "/videos/intro-game-final.mp4";
const INTRO_HOME_IMAGE_SRC = "/title-home-final.png";
const INTRO_TRANSITION_MS = 1400;
const ACTION_REVEAL_DELAY_MS = 360;
const HOME_LAYER_TRANSITION_STYLE = {
  transitionDuration: "1600ms",
  transitionTimingFunction: "cubic-bezier(0.22, 1, 0.36, 1)",
} as const;
const VIDEO_LAYER_TRANSITION_STYLE = {
  transitionDuration: `${INTRO_TRANSITION_MS}ms`,
  transitionTimingFunction: "cubic-bezier(0.22, 1, 0.36, 1)",
} as const;

type IntroPhase = "video" | "home";

interface TitleScreenProps {
  onStart: () => void;
  onRanking: () => void;
  onStory: () => void;
  onIntroComplete?: () => void;
  shouldPlayIntro?: boolean;
}

interface MenuButtonProps {
  label: string;
  onClick: () => void;
  variant?: "primary" | "secondary";
}

function MenuButton({ label, onClick, variant = "primary" }: MenuButtonProps) {
  const isPrimary = variant === "primary";

  return (
    <button
      type="button"
      onClick={onClick}
      className={[
        "group relative inline-flex w-full items-center justify-center overflow-hidden rounded-[1.3rem] border px-4 py-3",
        "outline-none transition-[transform,border-color,background-color,box-shadow,filter] duration-300",
        "hover:-translate-y-0.5 focus-visible:-translate-y-0.5 active:translate-y-[1px]",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#82c9ff]/45 focus-visible:ring-offset-2 focus-visible:ring-offset-[#071127]",
        isPrimary
          ? [
              "min-h-[56px] border-[#69c7ff]/70",
              "bg-[linear-gradient(180deg,#fffbdc_0%,#ffe28b_18%,#ffc843_42%,#f88a1c_73%,#a5310c_100%)]",
              "shadow-[0_14px_32px_rgba(0,0,0,0.32),0_0_22px_rgba(64,182,255,0.24),0_0_24px_rgba(255,187,56,0.22),inset_0_1px_0_rgba(255,255,255,0.6)]",
              "hover:border-[#9cdcff] hover:shadow-[0_18px_40px_rgba(0,0,0,0.36),0_0_28px_rgba(61,183,255,0.3),0_0_32px_rgba(255,187,56,0.3),inset_0_1px_0_rgba(255,255,255,0.66)]",
            ].join(" ")
          : [
              "min-h-[48px] border-[#2b67ff]/50",
              "bg-[linear-gradient(180deg,rgba(20,55,145,0.98),rgba(9,31,93,0.98)_52%,rgba(3,13,43,1))]",
              "shadow-[0_14px_34px_rgba(0,0,0,0.28),0_0_20px_rgba(50,136,255,0.18),inset_0_1px_0_rgba(191,224,255,0.18)]",
              "hover:border-[#f6c35f]/56 hover:bg-[linear-gradient(180deg,rgba(28,66,164,1),rgba(11,35,101,1)_54%,rgba(4,14,45,1))] hover:shadow-[0_18px_42px_rgba(0,0,0,0.32),0_0_26px_rgba(57,150,255,0.28),0_0_14px_rgba(246,195,95,0.18),inset_0_1px_0_rgba(209,233,255,0.24)]",
            ].join(" "),
      ].join(" ")}
    >
      <span
        className="pointer-events-none absolute inset-0 opacity-80"
        style={{
          background: isPrimary
            ? "radial-gradient(circle at top, rgba(70, 191, 255, 0.36), transparent 32%), radial-gradient(circle at bottom, rgba(255, 193, 62, 0.24), transparent 44%)"
            : "radial-gradient(circle at top, rgba(79, 184, 255, 0.24), transparent 34%), radial-gradient(circle at bottom, rgba(255, 195, 79, 0.1), transparent 42%)",
        }}
      />
      <span
        className="pointer-events-none absolute inset-[1px] rounded-[1.15rem] border"
        style={{ borderColor: isPrimary ? "rgba(255, 243, 194, 0.88)" : "rgba(197, 229, 255, 0.2)" }}
      />
      <span
        className="pointer-events-none absolute inset-x-7 top-[7px] h-px"
        style={{
          background: isPrimary
            ? "linear-gradient(90deg, transparent, rgba(255, 251, 234, 1), rgba(88, 204, 255, 0.98), transparent)"
            : "linear-gradient(90deg, transparent, rgba(88, 199, 255, 0.98), rgba(255, 209, 108, 0.56), transparent)",
        }}
      />
      <span
        className="pointer-events-none absolute inset-x-8 bottom-[7px] h-px"
        style={{
          background: isPrimary
            ? "linear-gradient(90deg, transparent, rgba(255, 220, 126, 0.18), rgba(255, 170, 55, 0.34), transparent)"
            : "linear-gradient(90deg, transparent, rgba(86, 194, 255, 0.18), rgba(86, 194, 255, 0.46), transparent)",
        }}
      />
      {isPrimary && (
        <span className="pointer-events-none absolute inset-[3px] rounded-[1.1rem] bg-[linear-gradient(180deg,rgba(255,255,255,0.18),rgba(255,255,255,0.03)_28%,transparent_42%,rgba(123,54,11,0.14)_100%)]" />
      )}
      <span
        className="pointer-events-none absolute inset-x-10 top-1.5 h-4 rounded-full blur-md"
        style={{ background: isPrimary ? "rgba(255, 248, 221, 0.5)" : "rgba(92, 188, 255, 0.18)" }}
      />
      <span
        className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
        style={{
          background: isPrimary
            ? "radial-gradient(circle at 50% 18%, rgba(83, 201, 255, 0.26), transparent 34%), radial-gradient(circle at 50% 85%, rgba(255, 206, 91, 0.24), transparent 40%)"
            : "radial-gradient(circle at 50% 18%, rgba(86, 195, 255, 0.22), transparent 32%), radial-gradient(circle at 50% 82%, rgba(255, 202, 103, 0.14), transparent 36%)",
        }}
      />
      <span
        className={[
          "relative z-10 font-display uppercase tracking-[0.08em]",
          isPrimary ? "text-[0.98rem] font-black text-[#fff8e8] sm:text-[1.05rem]" : "text-[0.88rem] font-bold text-[#edf4ff] sm:text-[0.95rem]",
        ].join(" ")}
        style={{
          textShadow: isPrimary
            ? "0 2px 10px rgba(124, 48, 7, 0.5), 0 0 16px rgba(87, 199, 255, 0.16)"
            : "0 2px 10px rgba(0, 0, 0, 0.34), 0 0 16px rgba(88, 197, 255, 0.2)",
          WebkitTextStroke: isPrimary ? "0.35px rgba(144, 77, 6, 0.4)" : undefined,
        }}
      >
        {label}
      </span>
    </button>
  );
}

export default function TitleScreen({
  onStart,
  onRanking,
  onStory,
  onIntroComplete,
  shouldPlayIntro = true,
}: TitleScreenProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const timeoutIdsRef = useRef<number[]>([]);
  const hasCompletedIntroRef = useRef(!shouldPlayIntro);
  const [introPhase, setIntroPhase] = useState<IntroPhase>(shouldPlayIntro ? "video" : "home");
  const [showVideoLayer, setShowVideoLayer] = useState(shouldPlayIntro);
  const [showActions, setShowActions] = useState(!shouldPlayIntro);

  const schedule = useCallback((callback: () => void, delay: number) => {
    const timeoutId = window.setTimeout(() => {
      timeoutIdsRef.current = timeoutIdsRef.current.filter((registeredId) => registeredId !== timeoutId);
      callback();
    }, delay);

    timeoutIdsRef.current.push(timeoutId);
  }, []);

  const finishIntro = useCallback(() => {
    if (hasCompletedIntroRef.current) {
      return;
    }

    hasCompletedIntroRef.current = true;
    onIntroComplete?.();
    setIntroPhase("home");
    schedule(() => setShowActions(true), ACTION_REVEAL_DELAY_MS);
    schedule(() => setShowVideoLayer(false), INTRO_TRANSITION_MS);
  }, [onIntroComplete, schedule]);

  useEffect(() => {
    const posterImage = new window.Image();
    posterImage.src = INTRO_HOME_IMAGE_SRC;
  }, []);

  useEffect(() => {
    return () => {
      timeoutIdsRef.current.forEach((timeoutId) => window.clearTimeout(timeoutId));
      timeoutIdsRef.current = [];
    };
  }, []);

  useEffect(() => {
    if (!showVideoLayer || introPhase !== "video" || !videoRef.current) {
      return;
    }

    const playback = videoRef.current.play();

    if (playback) {
      playback.catch(() => finishIntro());
    }
  }, [finishIntro, introPhase, showVideoLayer]);

  return (
    <section className="relative isolate min-h-[100svh] overflow-hidden bg-[#040814]">
      <h1 className="sr-only">Desafio dos Sabios</h1>

      <div className="absolute inset-0 overflow-hidden">
        <img
          src={INTRO_HOME_IMAGE_SRC}
          alt=""
          aria-hidden="true"
          className="h-full w-full scale-110 object-cover opacity-20 blur-3xl"
        />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(84,139,255,0.24),transparent_32%),radial-gradient(circle_at_bottom,rgba(255,153,65,0.2),transparent_26%)]" />
        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(5,10,24,0.16),rgba(4,8,20,0.74)_58%,rgba(2,4,12,0.94)_100%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_38%,rgba(2,5,12,0.56)_100%)]" />
      </div>

      <div className="relative z-10 flex min-h-[100svh] items-center justify-center px-4 py-4 sm:px-6">
        <div className="relative w-full max-w-[1500px]">
          <div className="relative flex min-h-[100svh] items-center justify-center">
            <div className="relative flex h-[calc(100svh-9.75rem)] w-full items-center justify-center sm:h-[calc(100svh-10.75rem)] md:h-[calc(100svh-12rem)]">
              <div
                className={`absolute inset-0 flex items-center justify-center transition-[opacity,transform,filter] ${
                  introPhase === "home" ? "opacity-100 scale-100 blur-0" : "opacity-0 scale-[1.015] blur-sm"
                }`}
                style={HOME_LAYER_TRANSITION_STYLE}
              >
                <img
                  src={INTRO_HOME_IMAGE_SRC}
                  alt="Turma do Desafio dos Sabios pronta para iniciar a aventura"
                  loading="eager"
                  fetchPriority="high"
                  decoding="async"
                  className="h-auto max-h-full w-full object-contain object-center drop-shadow-[0_30px_70px_rgba(0,0,0,0.46)]"
                />
              </div>

              {showVideoLayer && (
                <div
                  className={`absolute inset-0 flex items-center justify-center transition-[opacity,transform,filter] ${
                    introPhase === "home" ? "opacity-0 scale-[1.01] blur-[2px]" : "opacity-100 scale-100 blur-0"
                  }`}
                  style={VIDEO_LAYER_TRANSITION_STYLE}
                >
                  <video
                    ref={videoRef}
                    src={INTRO_VIDEO_SRC}
                    poster={INTRO_HOME_IMAGE_SRC}
                    autoPlay
                    muted
                    playsInline
                    preload="auto"
                    onEnded={finishIntro}
                    onError={finishIntro}
                    className="h-auto max-h-full w-full object-contain object-center drop-shadow-[0_34px_90px_rgba(0,0,0,0.5)]"
                  />
                  <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_42%,rgba(2,6,20,0.22)_100%)]" />
                </div>
              )}
            </div>

            <div
              className={`absolute inset-x-0 bottom-5 z-20 flex justify-center px-1 transition-[opacity,transform] duration-700 ease-out sm:bottom-7 ${
                showActions ? "translate-y-0 opacity-100" : "pointer-events-none translate-y-6 opacity-0"
              }`}
            >
              <div className="relative w-full max-w-[32rem]">
                <div className="pointer-events-none absolute inset-x-12 -top-3 h-10 bg-[radial-gradient(circle,rgba(58,173,255,0.44)_0%,rgba(58,173,255,0)_72%)] blur-2xl" />
                <div className="pointer-events-none absolute inset-x-20 bottom-0 h-10 bg-[radial-gradient(circle,rgba(255,190,70,0.18)_0%,rgba(255,190,70,0)_74%)] blur-2xl" />

                <div className="relative overflow-hidden rounded-[1.6rem] border border-[#2363ff]/45 bg-[linear-gradient(135deg,rgba(16,40,110,0.95),rgba(5,15,44,0.96))] p-[1px] shadow-[0_22px_56px_rgba(0,0,0,0.4),0_0_24px_rgba(46,143,255,0.18),0_0_14px_rgba(255,184,60,0.08)] backdrop-blur-2xl">
                  <div className="relative overflow-hidden rounded-[1.45rem] bg-[linear-gradient(180deg,rgba(16,39,102,0.78),rgba(8,19,57,0.94))] p-2.5 sm:p-3">
                    <span className="pointer-events-none absolute inset-x-0 top-0 h-px bg-[linear-gradient(90deg,transparent,rgba(78,195,255,1),rgba(255,210,96,0.98),rgba(71,187,255,0.92),transparent)]" />
                    <span className="pointer-events-none absolute inset-x-12 top-0 h-14 bg-[radial-gradient(circle_at_top,rgba(67,180,255,0.26),transparent_72%)]" />
                    <span className="pointer-events-none absolute inset-x-16 bottom-0 h-14 bg-[radial-gradient(circle_at_bottom,rgba(255,189,76,0.14),transparent_70%)]" />
                    <span className="pointer-events-none absolute left-3 top-3 h-4 w-8 border-l border-t border-[#63c1ff]/72" />
                    <span className="pointer-events-none absolute right-3 top-3 h-4 w-8 border-r border-t border-[#ffca63]/72" />
                    <span className="pointer-events-none absolute bottom-3 left-3 h-4 w-8 border-b border-l border-[#ffca63]/40" />
                    <span className="pointer-events-none absolute bottom-3 right-3 h-4 w-8 border-b border-r border-[#63c1ff]/40" />

                    <div className="relative mb-2.5 flex items-center gap-2 sm:mb-3">
                      <span className="h-px flex-1 bg-[linear-gradient(90deg,transparent,rgba(76,194,255,0.96))]" />
                      <div className="relative overflow-hidden rounded-full border border-[#2d6eff]/60 bg-[linear-gradient(180deg,rgba(20,49,124,0.96),rgba(9,25,64,0.98))] px-3.5 py-1 shadow-[0_0_20px_rgba(57,151,255,0.18)]">
                        <span className="pointer-events-none absolute inset-x-3 top-0 h-px bg-[linear-gradient(90deg,transparent,rgba(255,220,129,1),transparent)]" />
                        <p className="relative text-center text-[8px] font-body uppercase tracking-[0.32em] text-[#fff2c8] sm:text-[9px]">
                          Menu principal
                        </p>
                      </div>
                      <span className="h-px flex-1 bg-[linear-gradient(90deg,rgba(255,196,90,0.96),transparent)]" />
                    </div>

                    <div className="relative flex flex-col gap-2">
                      <MenuButton
                        label="Jogar"
                        onClick={() => {
                          playClick();
                          onStart();
                        }}
                      />

                      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                        <MenuButton
                          label="Rank"
                          variant="secondary"
                          onClick={() => {
                            playClick();
                            onRanking();
                          }}
                        />

                        <MenuButton
                          label={"Hist\u00F3ria"}
                          variant="secondary"
                          onClick={() => {
                            playClick();
                            onStory();
                          }}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
