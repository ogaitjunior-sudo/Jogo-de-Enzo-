import { fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import CharacterSelect from "@/components/game/CharacterSelect";
import {
  ELISABETH_SELECTION_VIDEO_PATH,
  ISABELLA_SELECTION_VIDEO_PATH,
} from "@/game/champion-selection";

const { playClickMock } = vi.hoisted(() => ({
  playClickMock: vi.fn(),
}));

vi.mock("@/game/sounds", () => ({
  playClick: playClickMock,
}));

describe("CharacterSelect", () => {
  beforeEach(() => {
    vi.spyOn(HTMLMediaElement.prototype, "play").mockResolvedValue(undefined);
    vi.spyOn(HTMLMediaElement.prototype, "pause").mockImplementation(() => {});
  });

  afterEach(() => {
    vi.clearAllMocks();
    vi.restoreAllMocks();
  });

  it("opens Elisabeth's champion-select video and advances after skip", async () => {
    const onSelect = vi.fn();

    render(<CharacterSelect onSelect={onSelect} onBack={vi.fn()} />);

    fireEvent.click(screen.getByRole("button", { name: "Selecionar Elisabeth" }));
    fireEvent.click(screen.getByRole("button", { name: "Escolher Elisabeth" }));

    const dialog = await screen.findByRole("dialog", {
      name: "Vídeo de seleção de Elisabeth",
    });
    expect(dialog).toBeInTheDocument();

    const selectionVideo = screen.getByLabelText(
      "Animação de seleção de Elisabeth",
    ) as HTMLVideoElement;
    expect(selectionVideo).toHaveAttribute("src", ELISABETH_SELECTION_VIDEO_PATH);

    fireEvent.click(screen.getByRole("button", { name: "Pular" }));

    expect(onSelect).toHaveBeenCalledTimes(1);
    expect(onSelect).toHaveBeenCalledWith("elisabeth");
  });

  it("shows an error state if Elisabeth's selection video cannot be loaded", async () => {
    const onSelect = vi.fn();

    render(<CharacterSelect onSelect={onSelect} onBack={vi.fn()} />);

    fireEvent.click(screen.getByRole("button", { name: "Selecionar Elisabeth" }));
    fireEvent.click(screen.getByRole("button", { name: "Escolher Elisabeth" }));

    const selectionVideo = (await screen.findByLabelText(
      "Animação de seleção de Elisabeth",
    )) as HTMLVideoElement;

    fireEvent.error(selectionVideo);

    expect(await screen.findByText("Vídeo indisponível")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Continuar" }));

    expect(onSelect).toHaveBeenCalledTimes(1);
    expect(onSelect).toHaveBeenCalledWith("elisabeth");
  });

  it("opens Isabella's champion-select video and advances after skip", async () => {
    const onSelect = vi.fn();

    render(<CharacterSelect onSelect={onSelect} onBack={vi.fn()} />);

    fireEvent.click(screen.getByRole("button", { name: "Selecionar Isabella" }));
    fireEvent.click(screen.getByRole("button", { name: "Escolher Isabella" }));

    const dialog = await screen.findByRole("dialog", {
      name: "Vídeo de seleção de Isabella",
    });
    expect(dialog).toBeInTheDocument();

    const selectionVideo = screen.getByLabelText(
      "Animação de seleção de Isabella",
    ) as HTMLVideoElement;
    expect(selectionVideo).toHaveAttribute("src", ISABELLA_SELECTION_VIDEO_PATH);

    fireEvent.click(screen.getByRole("button", { name: "Pular" }));

    expect(onSelect).toHaveBeenCalledTimes(1);
    expect(onSelect).toHaveBeenCalledWith("isabella");
  });
});
