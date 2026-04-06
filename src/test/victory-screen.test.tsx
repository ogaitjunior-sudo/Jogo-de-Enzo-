import { act, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import VictoryScreen from "@/components/game/VictoryScreen";
import { SAVED_SCHOOL_MESSAGE_BEAT_MS } from "@/game/endgame";

const { playVictoryMock } = vi.hoisted(() => ({
  playVictoryMock: vi.fn(),
}));

vi.mock("@/game/sounds", () => ({
  playVictory: playVictoryMock,
}));

describe("VictoryScreen", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.spyOn(HTMLMediaElement.prototype, "play").mockResolvedValue(undefined);
    vi.spyOn(HTMLMediaElement.prototype, "pause").mockImplementation(() => {});
  });

  afterEach(() => {
    vi.clearAllMocks();
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  it("plays the existing ending video and then shows the saved-school choice flow", async () => {
    const onMenu = vi.fn();
    const onRestartAtDifferentLevel = vi.fn();

    render(
      <VictoryScreen
        score={1200}
        onMenu={onMenu}
        onRestartAtDifferentLevel={onRestartAtDifferentLevel}
      />,
    );

    expect(playVictoryMock).toHaveBeenCalledTimes(1);

    const existingEndingVideo = screen.getByLabelText("Vídeo final da campanha");
    expect(existingEndingVideo).toBeInTheDocument();

    act(() => {
      fireEvent.ended(existingEndingVideo);
    });

    expect(screen.getByRole("heading", { name: "Voc\u00EA salvou a escola." })).toBeInTheDocument();

    await act(async () => {
      vi.advanceTimersByTime(SAVED_SCHOOL_MESSAGE_BEAT_MS);
      await Promise.resolve();
    });

    expect(
      screen.getByText(
        "Voc\u00EA deseja ver o final ou iniciar novamente a aventura em outro n\u00EDvel?",
      ),
    ).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Iniciar novamente em outro n\u00EDvel" }));
    expect(onRestartAtDifferentLevel).toHaveBeenCalledTimes(1);
    expect(onMenu).not.toHaveBeenCalled();
  });

  it("opens the optional final video and shows the wrap-up actions afterwards", async () => {
    const onMenu = vi.fn();
    const onRestartAtDifferentLevel = vi.fn();

    render(
      <VictoryScreen
        score={900}
        onMenu={onMenu}
        onRestartAtDifferentLevel={onRestartAtDifferentLevel}
      />,
    );

    act(() => {
      fireEvent.ended(screen.getByLabelText("Vídeo final da campanha"));
    });

    await act(async () => {
      vi.advanceTimersByTime(SAVED_SCHOOL_MESSAGE_BEAT_MS);
      await Promise.resolve();
    });

    fireEvent.click(screen.getByRole("button", { name: "Ver o final" }));

    const bonusFinalVideo = screen.getByLabelText("Vídeo final com a professora e os alunos");
    expect(bonusFinalVideo).toBeInTheDocument();

    act(() => {
      fireEvent.ended(bonusFinalVideo);
    });

    expect(screen.getByRole("heading", { name: /final concluído/i })).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: /voltar ao menu/i }));
    expect(onMenu).toHaveBeenCalledTimes(1);
    expect(onRestartAtDifferentLevel).not.toHaveBeenCalled();
  });
});
