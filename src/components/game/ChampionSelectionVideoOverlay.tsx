import { useEffect, useRef, useState } from "react";
import { AlertTriangle, SkipForward, X } from "lucide-react";

import { Button } from "@/components/ui/button";

interface Props {
  championName: string;
  isOpen: boolean;
  videoSrc: string | null;
  onComplete: () => void;
}

export default function ChampionSelectionVideoOverlay({
  championName,
  isOpen,
  videoSrc,
  onComplete,
}: Props) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [hasError, setHasError] = useState(false);
  const [mutedFallback, setMutedFallback] = useState(false);

  useEffect(() => {
    if (!isOpen) {
      setHasError(false);
      setMutedFallback(false);
      return;
    }

    const videoElement = videoRef.current;

    if (!videoElement || !videoSrc) {
      setHasError(true);
      return;
    }

    let isCancelled = false;

    const startPlayback = async () => {
      try {
        videoElement.currentTime = 0;
        videoElement.muted = false;
        await videoElement.play();
      } catch {
        // Retry muted playback if the browser blocks autoplay with audio.
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
          }
        }
      }
    };

    void startPlayback();

    return () => {
      isCancelled = true;
      videoElement.pause();
    };
  }, [isOpen, videoSrc]);

  if (!isOpen) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-[10000] flex items-center justify-center bg-[rgba(2,6,18,0.92)] px-4 py-6 backdrop-blur-md">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(100,148,255,0.18),transparent_32%),radial-gradient(circle_at_bottom,rgba(255,155,70,0.16),transparent_28%)]" />

      <div className="relative z-10 w-full max-w-[34rem] overflow-hidden rounded-[2rem] border border-white/10 bg-[linear-gradient(180deg,rgba(10,19,41,0.92),rgba(5,11,26,0.96))] shadow-[0_30px_100px_rgba(0,0,0,0.45)]">
        <button
          type="button"
          onClick={onComplete}
          aria-label="Close champion video"
          className="absolute right-4 top-4 z-20 flex h-11 w-11 items-center justify-center rounded-full border border-white/12 bg-slate-950/50 text-white/74 transition-colors hover:border-white/22 hover:text-white"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="border-b border-white/8 px-6 py-5 pr-20">
          <p className="text-[11px] font-body uppercase tracking-[0.32em] text-[#f3cc8c]/76">
            Champion selection
          </p>
          <h3 className="mt-2 font-display text-3xl font-black text-white md:text-4xl">
            {championName}
          </h3>
        </div>

        <div className="p-5 md:p-6">
          {hasError ? (
            <div className="flex min-h-[320px] flex-col items-center justify-center rounded-[1.6rem] border border-red-300/18 bg-red-300/10 px-6 py-10 text-center">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-red-300/14 text-red-100">
                <AlertTriangle className="h-6 w-6" />
              </div>
              <h4 className="mt-5 font-display text-2xl font-bold text-white">Video unavailable</h4>
              <p className="mt-3 max-w-xl font-body text-sm leading-7 text-white/72">
                The selection animation could not be loaded. The player can continue normally to the next screen.
              </p>
              <div className="mt-6 flex flex-wrap justify-center gap-3">
                <Button
                  type="button"
                  onClick={onComplete}
                  className="rounded-full bg-white text-slate-950 hover:bg-white/92"
                >
                  Continue
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={onComplete}
                  className="rounded-full border-white/14 bg-white/5 text-white hover:bg-white/10"
                >
                  Close
                </Button>
              </div>
            </div>
          ) : (
            <>
              <div className="mx-auto w-full max-w-[25rem] overflow-hidden rounded-[1.6rem] border border-white/10 bg-black shadow-[0_18px_50px_rgba(0,0,0,0.36)]">
                <video
                  ref={videoRef}
                  src={videoSrc ?? undefined}
                  autoPlay
                  playsInline
                  preload="auto"
                  onEnded={onComplete}
                  onError={() => setHasError(true)}
                  className="aspect-[9/16] max-h-[72vh] w-full bg-black object-cover object-center"
                />
              </div>

              <div className="mt-5 flex flex-col items-center gap-3 text-center">
                <div className="space-y-1">
                  <p className="text-sm font-body text-white/72">
                    The next screen opens automatically when the animation finishes.
                  </p>
                  {mutedFallback && (
                    <p className="text-xs font-body uppercase tracking-[0.22em] text-[#f3cc8c]/72">
                      Autoplay fallback: started muted for browser compatibility.
                    </p>
                  )}
                </div>

                <Button
                  type="button"
                  onClick={onComplete}
                  className="rounded-full border border-[#f3cc8c]/28 bg-[linear-gradient(180deg,rgba(21,32,74,0.96),rgba(10,18,42,0.98))] px-6 text-white shadow-[0_10px_24px_rgba(0,0,0,0.28)] hover:bg-[linear-gradient(180deg,rgba(26,40,91,0.98),rgba(11,20,47,0.98))]"
                >
                  <SkipForward className="h-4 w-4" />
                  Skip
                </Button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
