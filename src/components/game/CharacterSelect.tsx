import ChampionSelectionVideoOverlay from "@/components/game/ChampionSelectionVideoOverlay";
import { playClick } from "@/game/sounds";
import {
  emitChampionSelected,
  getChampionSelectionVideo,
} from "@/game/champion-selection";
import { CHARACTER_ORDER, CHARACTER_ROSTER } from "@/game/roster";
import { Character } from "@/game/types";
import SelectionBackdrop from "@/components/game/SelectionBackdrop";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useState } from "react";

interface Props {
  onSelect: (character: Character) => void;
  onBack: () => void;
}

const characterOrder: Character[] = CHARACTER_ORDER;

function wrapCharacterIndex(index: number): number {
  const totalCharacters = characterOrder.length;
  return (index + totalCharacters) % totalCharacters;
}

export default function CharacterSelect({ onSelect, onBack }: Props) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [selectionVideo, setSelectionVideo] = useState<{
    character: Character;
    championName: string;
    videoSrc: string;
  } | null>(null);
  const activeCharacter = characterOrder[activeIndex];
  const activeProfile = CHARACTER_ROSTER[activeCharacter];

  const moveCarousel = (direction: -1 | 1) => {
    playClick();
    setActiveIndex((currentIndex) => wrapCharacterIndex(currentIndex + direction));
  };

  const proceedToNextScreen = (selectedCharacter: Character) => {
    setSelectionVideo(null);
    onSelect(selectedCharacter);
  };

  // Centralizes the champion-selected event so every selection entry point reuses the same behavior.
  const onChampionSelected = (selectedCharacter: Character) => {
    emitChampionSelected(selectedCharacter);

    const videoSrc = getChampionSelectionVideo(selectedCharacter);

    if (videoSrc) {
      setSelectionVideo({
        character: selectedCharacter,
        championName: CHARACTER_ROSTER[selectedCharacter].name,
        videoSrc,
      });
      return;
    }

    onSelect(selectedCharacter);
  };

  const selectCurrentCharacter = () => {
    playClick();
    onChampionSelected(activeProfile.id);
  };

  return (
    <div className="relative min-h-[100svh] overflow-x-hidden overflow-y-auto bg-[linear-gradient(180deg,#223f86_0%,#151f45_45%,#0b1020_100%)] px-4 py-4 md:py-5">
      <SelectionBackdrop />

      <div className="relative z-10 mx-auto flex min-h-[calc(100svh-2rem)] max-w-6xl flex-col md:min-h-[calc(100svh-2.5rem)]">
        <div className="shrink-0 pt-1 text-center">
          <p className="text-xs font-body uppercase tracking-[0.35em] text-primary/90 drop-shadow-[0_2px_12px_rgba(0,0,0,0.45)]">
            Escalacao da equipe
          </p>
          <h2 className="mt-2 font-display text-3xl font-black text-primary drop-shadow-[0_6px_24px_rgba(0,0,0,0.42)] sm:text-4xl md:text-5xl">
            Escolha seu heroi
          </h2>
          <p className="mx-auto mt-2 max-w-xl text-sm font-body leading-5 text-white/86 sm:mt-3 sm:max-w-2xl sm:text-base sm:leading-6">
            Navegue pelo elenco e escolha quem vai entrar na arena da academia.
          </p>
        </div>

        <div className="flex flex-1 items-start justify-center py-3 sm:items-center md:py-3">
          <div className="mx-auto flex w-full max-w-4xl items-center justify-center gap-2.5 md:gap-4">
            <button
              type="button"
              onClick={() => moveCarousel(-1)}
              aria-label="Heroi anterior"
              className="flex h-11 w-11 flex-none items-center justify-center rounded-full border-2 border-primary/55 bg-[radial-gradient(circle_at_30%_30%,rgba(255,236,173,0.22),rgba(255,236,173,0)_38%),linear-gradient(180deg,rgba(19,28,76,0.92)_0%,rgba(8,12,30,0.9)_100%)] text-primary shadow-[0_0_0_1px_rgba(255,208,92,0.18),0_10px_24px_rgba(0,0,0,0.32)] transition-all hover:-translate-y-0.5 hover:border-primary hover:shadow-[0_0_0_1px_rgba(255,208,92,0.3),0_0_18px_rgba(255,196,76,0.22),0_12px_28px_rgba(0,0,0,0.38)] md:h-12 md:w-12"
            >
              <ChevronLeft className="h-4.5 w-4.5 drop-shadow-[0_0_8px_rgba(255,203,92,0.24)] md:h-5 md:w-5" />
            </button>

            <div className="w-full max-w-[320px] sm:max-w-[330px] md:max-w-[400px] lg:max-w-[420px]">
              <div
                className="relative rounded-[1.65rem] border border-[#26327e] bg-[#fbfcff] px-3.5 pb-3.5 pt-3.5 shadow-[0_24px_56px_rgba(6,10,26,0.32)] sm:px-5 sm:pb-5 sm:pt-5 md:rounded-[2rem] md:px-6 md:pb-6 md:pt-5"
              >
                <div className="absolute inset-x-0 top-0 h-8 rounded-t-[1.65rem] bg-[linear-gradient(90deg,#111f8a_0%,#0d1770_100%)] md:h-9 md:rounded-t-[2rem]" />

                <div className="relative z-10">
                  <div className="mx-auto inline-flex min-h-6 items-center rounded-full bg-[#111f8a] px-3 py-1 text-[9px] font-body font-bold uppercase tracking-[0.18em] text-white md:min-h-7 md:px-4 md:text-[10px]">
                    Heroi {activeIndex + 1} de {characterOrder.length}
                  </div>

                  <div
                    className="mt-3 h-[220px] overflow-hidden rounded-[1.25rem] border border-[#d4dbff] bg-[linear-gradient(180deg,#eef2ff_0%,#dbe5ff_100%)] sm:mt-3.5 sm:h-[290px] md:mt-4 md:h-[340px] md:rounded-[1.65rem] lg:h-[380px]"
                  >
                    <img
                      src={activeProfile.image}
                      alt={activeProfile.name}
                      className="h-full w-full object-cover object-top"
                    />
                  </div>

                  <p className="mt-2.5 text-[9px] font-body uppercase tracking-[0.2em] text-[#4c5eb3] md:mt-4 md:text-[10px]">
                    {activeProfile.title}
                  </p>
                  <h3 className="mt-1 font-display text-[1.35rem] font-black leading-none text-[#101968] sm:text-[1.45rem] md:mt-1.5 md:text-[1.9rem]">
                    {activeProfile.name}
                  </h3>
                  <p className="mt-1.5 text-[11px] font-body leading-5 text-[#2f3f77] sm:mt-2 sm:text-[12px] md:mt-2.5 md:text-[14px] md:leading-6">
                    {activeProfile.description}
                  </p>

                  <div className="mt-2.5 rounded-[1.05rem] border border-[#d7ddfc] bg-white/95 px-3 py-2.5 md:mt-4 md:rounded-[1.2rem] md:px-4 md:py-3">
                    <p className="text-[8px] font-body uppercase tracking-[0.18em] text-[#5c6fc6] md:text-[9px]">
                      Especialidade
                    </p>
                    <p className="mt-1 text-[12px] font-body font-semibold leading-5 text-[#151f69] md:text-[14px] md:leading-6">
                      {activeProfile.specialty}
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={selectCurrentCharacter}
                    className="mt-3 inline-flex min-h-[44px] w-full items-center justify-center rounded-full bg-[linear-gradient(90deg,#111f8a_0%,#151d73_100%)] px-5 text-[14px] font-body font-bold text-white transition-all hover:-translate-y-0.5 hover:shadow-[0_8px_18px_rgba(17,31,138,0.22)] md:mt-5 md:min-h-[52px] md:text-[15px]"
                  >
                    {`Escolher ${activeProfile.name}`}
                  </button>
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={() => moveCarousel(1)}
              aria-label="Proximo heroi"
              className="flex h-11 w-11 flex-none items-center justify-center rounded-full border-2 border-primary/55 bg-[radial-gradient(circle_at_30%_30%,rgba(255,236,173,0.22),rgba(255,236,173,0)_38%),linear-gradient(180deg,rgba(19,28,76,0.92)_0%,rgba(8,12,30,0.9)_100%)] text-primary shadow-[0_0_0_1px_rgba(255,208,92,0.18),0_10px_24px_rgba(0,0,0,0.32)] transition-all hover:-translate-y-0.5 hover:border-primary hover:shadow-[0_0_0_1px_rgba(255,208,92,0.3),0_0_18px_rgba(255,196,76,0.22),0_12px_28px_rgba(0,0,0,0.38)] md:h-12 md:w-12"
            >
              <ChevronRight className="h-4.5 w-4.5 drop-shadow-[0_0_8px_rgba(255,203,92,0.24)] md:h-5 md:w-5" />
            </button>
          </div>
        </div>

        <div className="mt-2.5 flex shrink-0 items-center justify-center gap-2.5">
          {characterOrder.map((character, index) => {
            const isActive = index === activeIndex;

            return (
              <button
                key={character}
                type="button"
                onClick={() => {
                  playClick();
                  setActiveIndex(index);
                }}
                aria-label={`Selecionar ${CHARACTER_ROSTER[character].name}`}
                aria-pressed={isActive}
                className={[
                  "relative h-4 w-4 rounded-full border transition-all",
                  isActive
                    ? "scale-110 border-primary bg-primary shadow-[0_0_0_4px_rgba(255,200,64,0.16),0_0_16px_rgba(255,200,64,0.26)]"
                    : "border-white/28 bg-slate-950/55 hover:border-white/55 hover:bg-white/18",
                ].join(" ")}
              />
            );
          })}
        </div>

        <div className="mt-4 shrink-0 text-center">
          <button
            onClick={() => {
              playClick();
              onBack();
            }}
            className="text-sm font-body font-semibold text-white/78 transition-colors hover:text-white"
          >
            Voltar
          </button>
        </div>
      </div>

      <ChampionSelectionVideoOverlay
        championName={selectionVideo?.championName ?? ""}
        isOpen={Boolean(selectionVideo)}
        videoSrc={selectionVideo?.videoSrc ?? null}
        onComplete={() => {
          if (!selectionVideo) {
            return;
          }

          proceedToNextScreen(selectionVideo.character);
        }}
      />
    </div>
  );
}
