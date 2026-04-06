const ENDGAME_VIDEO_VERSION = "20260406";

function getEndGameVideoPath(fileName: string): string {
  return `/videos/${fileName}?v=${ENDGAME_VIDEO_VERSION}`;
}

// Keep the endgame assets configurable in one place so swapping videos later is low-risk.
export const EXISTING_ENDING_VIDEO_PATH = getEndGameVideoPath("final-7ano-a.mp4");
export const OPTIONAL_FINAL_VIDEO_PATH = getEndGameVideoPath("final_professora_alunos.mp4");

export const SAVED_SCHOOL_MESSAGE = "Voc\u00EA salvou a escola.";
export const FINAL_CHOICE_PROMPT =
  "Voc\u00EA deseja ver o final ou deseja iniciar novamente a aventura em um outro n\u00EDvel?";
export const SAVED_SCHOOL_MESSAGE_BEAT_MS = 1400;
