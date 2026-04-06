import { useCallback, useEffect, useRef, useState } from "react";

import PremiumMainMenu from "@/components/game/PremiumMainMenu";

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
      <h1 className="sr-only">Desafio dos Sábios</h1>

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
                  alt="Turma do Desafio dos Sábios pronta para iniciar a aventura"
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
              <PremiumMainMenu
                onStart={onStart}
                onRanking={onRanking}
                onStory={onStory}
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
