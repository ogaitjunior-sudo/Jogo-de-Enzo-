import anaImg from "@/assets/ana.png";
import aylaImg from "@/assets/ayla.png";
import einsteinImg from "@/assets/einstein.png";
import elisabethImg from "@/assets/elisabeth.png";
import enzoImg from "@/assets/enzo.png";
import marcelaImg from "@/assets/marcela.png";
import mariaHeloisaImg from "@/assets/maria-heloisa.png";
import newtonImg from "@/assets/newton.png";
import pauloHenriqueImg from "@/assets/paulo-henrique.png";
import valentinaImg from "@/assets/valentina.png";

import { BossProfile, Character, CharacterProfile, Phase } from "./types";

const BOSS_VIDEO_VERSION = "20260401";

function getBossVideoPath(fileName: string): string {
  return `/videos/${fileName}?v=${BOSS_VIDEO_VERSION}`;
}

export const CHARACTER_ROSTER: Record<Character, CharacterProfile> = {
  ana: {
    id: "ana",
    name: "Ana",
    title: "Guardiã dos Fundamentos",
    description: "Mantém a leitura clara e segura nas contas de base da academia.",
    specialty: "Precisão em potenciação e respostas consistentes",
    image: anaImg,
  },
  ayla: {
    id: "ayla",
    name: "Ayla",
    title: "Rastreadora de Raízes",
    description: "Leitura limpa e respostas seguras em desafios de radiciação e combinações.",
    specialty: "Raízes exatas e controle de ritmo",
    image: aylaImg,
  },
  elisabeth: {
    id: "elisabeth",
    name: "Elisabeth",
    title: "Líder da Academia",
    description: "Equilibrada para encarar as fases finais, com foco em clareza sob pressão.",
    specialty: "Combina potência, raiz e consistência",
    image: elisabethImg,
  },
  enzo: {
    id: "enzo",
    name: "Enzo Reis",
    title: "Especialista em Potenciação",
    description: "Joga melhor quando a conta cresce rápido e o ritmo exige leitura objetiva.",
    specialty: "Expoentes e sequências de impacto",
    image: enzoImg,
  },
  mariaHeloisa: {
    id: "mariaHeloisa",
    name: "Maria Eloísa",
    title: "Estrategista dos Radicais",
    description: "Avança bem em radiciação e sustenta o ritmo nas expressões combinadas.",
    specialty: "Raízes exatas e leitura organizada",
    image: mariaHeloisaImg,
  },
  pauloHenrique: {
    id: "pauloHenrique",
    name: "Paulo Henrique",
    title: "Guardião da Sequência",
    description: "Segura o ritmo das rodadas longas e mantém as respostas organizadas.",
    specialty: "Constância e leitura disciplinada",
    image: pauloHenriqueImg,
  },
  valentina: {
    id: "valentina",
    name: "Valentina",
    title: "Capitã da Arena",
    description: "Entra com postura ofensiva e boa leitura para fases mais longas.",
    specialty: "Combinações rápidas com foco e controle",
    image: valentinaImg,
  },
};

export const CHARACTER_ORDER: Character[] = [
  "ana",
  "ayla",
  "elisabeth",
  "enzo",
  "mariaHeloisa",
  "pauloHenrique",
  "valentina",
];

export const BOSS_ROSTER: Record<Phase, BossProfile> = {
  1: {
    phase: 1,
    name: "Isaac Newton",
    title: "Sentinela das Potências",
    challengeLabel: "Fundamentos de Potenciação",
    threat: "Defende a entrada da academia com contas diretas e sem espaço para improviso.",
    image: newtonImg,
    introVideo: getBossVideoPath("newton-boss-pixverse.mp4"),
    defeatVideo: getBossVideoPath("newton-boss-defeat.mp4"),
    emoji: "🍎",
  },
  2: {
    phase: 2,
    name: "Albert Einstein",
    title: "Arquiteto dos Radicais",
    challengeLabel: "Pressão em Radiciação",
    threat: "Acelera o ritmo e obriga respostas mais limpas em menos tempo.",
    image: einsteinImg,
    introVideo: getBossVideoPath("einstein-boss.mp4"),
    defeatVideo: getBossVideoPath("einstein-boss-defeat.mp4"),
    emoji: "⚡",
  },
  3: {
    phase: 3,
    name: "Professora Marcela",
    title: "Mestra da Arena Final",
    challengeLabel: "Combos e Cálculo Completo",
    threat: "Mistura conteúdos e transforma cada questão em uma prova de leitura e precisão.",
    image: marcelaImg,
    introVideo: getBossVideoPath("marcela-boss.mp4"),
    defeatVideo: getBossVideoPath("marcela-boss-defeat.mp4"),
    emoji: "📐",
  },
};

export const BOSS_LIST: BossProfile[] = [BOSS_ROSTER[1], BOSS_ROSTER[2], BOSS_ROSTER[3]];

export function getCharacterName(character: Character | string): string {
  return CHARACTER_ROSTER[character as Character]?.name ?? "Personagem removido";
}
