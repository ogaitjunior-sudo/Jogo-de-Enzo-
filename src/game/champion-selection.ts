import { Character } from "./types";

export const CHAMPION_SELECTED_EVENT = "onChampionSelected";
const CHAMPION_SELECTION_VIDEO_PATHS: Partial<Record<Character, string>> = {
  ana: "/videos/ana.mp4",
  ayla: "/videos/ayla.mp4",
  elisabeth: "/videos/elisabeth.mp4",
  isabella: "/videos/isabella.mp4",
  enzo: "/videos/enzo_reis.mp4",
  mariaHeloisa: "/videos/maria_eloisa.mp4",
  pauloHenrique: "/videos/paulo_henrique.mp4",
  valentina: "/videos/valentina.mp4",
};

export const ANA_SELECTION_VIDEO_PATH = CHAMPION_SELECTION_VIDEO_PATHS.ana!;
export const AYLA_SELECTION_VIDEO_PATH = CHAMPION_SELECTION_VIDEO_PATHS.ayla!;
export const ELISABETH_SELECTION_VIDEO_PATH = CHAMPION_SELECTION_VIDEO_PATHS.elisabeth!;
export const ISABELLA_SELECTION_VIDEO_PATH = CHAMPION_SELECTION_VIDEO_PATHS.isabella!;
export const ENZO_SELECTION_VIDEO_PATH = CHAMPION_SELECTION_VIDEO_PATHS.enzo!;
export const MARIA_ELOISA_SELECTION_VIDEO_PATH = CHAMPION_SELECTION_VIDEO_PATHS.mariaHeloisa!;
export const PAULO_HENRIQUE_SELECTION_VIDEO_PATH = CHAMPION_SELECTION_VIDEO_PATHS.pauloHenrique!;
export const VALENTINA_SELECTION_VIDEO_PATH = CHAMPION_SELECTION_VIDEO_PATHS.valentina!;

export interface ChampionSelectedEventDetail {
  character: Character;
  videoSrc: string | null;
}

export function getChampionSelectionVideo(character: Character): string | null {
  // Keep every champion-selection cinematic in one place so UI flows stay easy to extend.
  return CHAMPION_SELECTION_VIDEO_PATHS[character] ?? null;
}

export function emitChampionSelected(character: Character) {
  if (typeof window === "undefined") {
    return;
  }

  const detail: ChampionSelectedEventDetail = {
    character,
    videoSrc: getChampionSelectionVideo(character),
  };

  window.dispatchEvent(new CustomEvent<ChampionSelectedEventDetail>(CHAMPION_SELECTED_EVENT, { detail }));
}
