import alunoCuriosoImg from "@/assets/apprentices/aluno-curioso.png";
import assistenteDaProfImg from "@/assets/apprentices/assistente-da-prof.png";
import calculadoraHumanaImg from "@/assets/apprentices/calculadora-humana.png";
import estagiarioDeLabImg from "@/assets/apprentices/estagiario-de-lab.png";
import genioJuniorImg from "@/assets/apprentices/genio-junior.png";
import monitorDaSalaImg from "@/assets/apprentices/monitor-da-sala.png";
import nerdDaTurmaImg from "@/assets/apprentices/nerd-da-turma.png";
import representanteImg from "@/assets/apprentices/representante.png";
import viceDiretoraImg from "@/assets/apprentices/vice-diretora.png";

import { PHASE_CONFIGS } from "./progression";
import { BOSS_ROSTER } from "./roster";
import { Difficulty, Enemy, Phase } from "./types";

export type Apprentice = Enemy;

type ApprenticeAvatarConfig = {
  image: string;
  imagePosition: string;
  imageScale?: number;
};

const APPRENTICE_AVATAR_BY_NAME: Record<string, ApprenticeAvatarConfig> = {
  "Aluno Curioso": { image: alunoCuriosoImg, imagePosition: "center 24%", imageScale: 1.15 },
  "Monitor de Sala": { image: monitorDaSalaImg, imagePosition: "center 19%", imageScale: 1.11 },
  "Monitor da Sala": { image: monitorDaSalaImg, imagePosition: "center 19%", imageScale: 1.11 },
  "Nerd da Turma": { image: nerdDaTurmaImg, imagePosition: "center 20%", imageScale: 1.14 },
  "Calculadora Humana": { image: calculadoraHumanaImg, imagePosition: "center 21%", imageScale: 1.13 },
  "Estagiário de Lab": { image: estagiarioDeLabImg, imagePosition: "center 20%", imageScale: 1.12 },
  "Gênio Júnior": { image: genioJuniorImg, imagePosition: "center 18%", imageScale: 1.11 },
  "Assistente da Prof": { image: assistenteDaProfImg, imagePosition: "center 18%", imageScale: 1.1 },
  "Representante": { image: representanteImg, imagePosition: "center 19%", imageScale: 1.12 },
  "Vice-Diretora": { image: viceDiretoraImg, imagePosition: "center 17%", imageScale: 1.09 },
};

export function getApprenticesForPhase(phase: Phase, _difficulty: Difficulty): Apprentice[] {
  return PHASE_CONFIGS[phase].apprentices.map((apprentice) => {
    const avatarConfig = APPRENTICE_AVATAR_BY_NAME[apprentice.name];

    return {
      name: apprentice.name,
      title: apprentice.title,
      maxHp: apprentice.baseHp,
      hp: apprentice.baseHp,
      emoji: apprentice.emoji,
      image: avatarConfig?.image ?? apprentice.image,
      imagePosition: avatarConfig?.imagePosition ?? apprentice.imagePosition,
      imageScale: avatarConfig?.imageScale ?? apprentice.imageScale,
      phase,
    };
  });
}

export function getEnemyForPhase(phase: Phase, _difficulty: Difficulty): Enemy {
  const boss = BOSS_ROSTER[phase];
  const maxHp = PHASE_CONFIGS[phase].bossBaseHp;

  return {
    name: boss.name,
    title: boss.title,
    maxHp,
    hp: maxHp,
    emoji: boss.emoji,
    image: boss.image,
    imagePosition: "center 12%",
    phase,
  };
}
