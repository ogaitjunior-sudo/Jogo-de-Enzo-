import { describe, expect, it, vi } from "vitest";

import {
  CHAMPION_SELECTED_EVENT,
  emitChampionSelected,
  ENZO_SELECTION_VIDEO_PATH,
  MARIA_ELOISA_SELECTION_VIDEO_PATH,
  PAULO_HENRIQUE_SELECTION_VIDEO_PATH,
  VALENTINA_SELECTION_VIDEO_PATH,
  getChampionSelectionVideo,
} from "@/game/champion-selection";

describe("champion selection video flow", () => {
  it("returns selection video paths for champions with pick cinematics", () => {
    expect(getChampionSelectionVideo("enzo")).toBe(ENZO_SELECTION_VIDEO_PATH);
    expect(getChampionSelectionVideo("mariaHeloisa")).toBe(MARIA_ELOISA_SELECTION_VIDEO_PATH);
    expect(getChampionSelectionVideo("pauloHenrique")).toBe(PAULO_HENRIQUE_SELECTION_VIDEO_PATH);
    expect(getChampionSelectionVideo("valentina")).toBe(VALENTINA_SELECTION_VIDEO_PATH);
    expect(getChampionSelectionVideo("ana")).toBeNull();
  });

  it("dispatches the onChampionSelected event with the selected champion payload", () => {
    const listener = vi.fn();

    window.addEventListener(CHAMPION_SELECTED_EVENT, listener);
    emitChampionSelected("enzo");

    expect(listener).toHaveBeenCalledTimes(1);

    const event = listener.mock.calls[0][0] as CustomEvent;
    expect(event.detail).toEqual({
      character: "enzo",
      videoSrc: ENZO_SELECTION_VIDEO_PATH,
    });

    window.removeEventListener(CHAMPION_SELECTED_EVENT, listener);
  });

  it("dispatches Maria Eloisa's video path in the onChampionSelected payload", () => {
    const listener = vi.fn();

    window.addEventListener(CHAMPION_SELECTED_EVENT, listener);
    emitChampionSelected("mariaHeloisa");

    expect(listener).toHaveBeenCalledTimes(1);

    const event = listener.mock.calls[0][0] as CustomEvent;
    expect(event.detail).toEqual({
      character: "mariaHeloisa",
      videoSrc: MARIA_ELOISA_SELECTION_VIDEO_PATH,
    });

    window.removeEventListener(CHAMPION_SELECTED_EVENT, listener);
  });

  it("dispatches Valentina's video path in the onChampionSelected payload", () => {
    const listener = vi.fn();

    window.addEventListener(CHAMPION_SELECTED_EVENT, listener);
    emitChampionSelected("valentina");

    expect(listener).toHaveBeenCalledTimes(1);

    const event = listener.mock.calls[0][0] as CustomEvent;
    expect(event.detail).toEqual({
      character: "valentina",
      videoSrc: VALENTINA_SELECTION_VIDEO_PATH,
    });

    window.removeEventListener(CHAMPION_SELECTED_EVENT, listener);
  });

  it("dispatches Paulo Henrique's video path in the onChampionSelected payload", () => {
    const listener = vi.fn();

    window.addEventListener(CHAMPION_SELECTED_EVENT, listener);
    emitChampionSelected("pauloHenrique");

    expect(listener).toHaveBeenCalledTimes(1);

    const event = listener.mock.calls[0][0] as CustomEvent;
    expect(event.detail).toEqual({
      character: "pauloHenrique",
      videoSrc: PAULO_HENRIQUE_SELECTION_VIDEO_PATH,
    });

    window.removeEventListener(CHAMPION_SELECTED_EVENT, listener);
  });
});
