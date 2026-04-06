import anaImg from "@/assets/ana.png";
import aylaImg from "@/assets/ayla.png";
import einsteinImg from "@/assets/einstein.png";
import elisaImg from "@/assets/elisa.png";
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
    title: "Guardia dos Fundamentos",
    description: "Mantem a leitura clara e segura nas contas de base da academia.",
    specialty: "Precisao em potencias e respostas consistentes",
    image: anaImg,
  },
  ayla: {
    id: "ayla",
    name: "Ayla",
    title: "Rastreadora de Raizes",
    description: "Leitura limpa e respostas seguras em desafios de radiciacao e combinacoes.",
    specialty: "Raizes exatas e controle de ritmo",
    image: aylaImg,
  },
  elisa: {
    id: "elisa",
    name: "Elisa",
    title: "Exploradora de Pistas",
    description: "Avanca com leitura direta e boa presenca nas rodadas iniciais da academia.",
    specialty: "Respostas firmes e ritmo estavel",
    image: elisaImg,
  },
  elisabeth: {
    id: "elisabeth",
    name: "Elisabeth",
    title: "Lider da Academia",
    description: "Equilibrada para encarar as fases finais, com foco em clareza sob pressao.",
    specialty: "Combina potencia, raiz e consistencia",
    image: elisabethImg,
  },
  enzo: {
    id: "enzo",
    name: "Enzo Reis",
    title: "Especialista em Potenciacao",
    description: "Joga melhor quando a conta cresce rapido e o ritmo exige leitura objetiva.",
    specialty: "Expoentes e sequencias de impacto",
    image: enzoImg,
  },
  mariaHeloisa: {
    id: "mariaHeloisa",
    name: "Maria Eloisa",
    title: "Estrategista dos Radicais",
    description: "Avanca bem em radiciacao e sustenta o ritmo nas expressoes combinadas.",
    specialty: "Raizes exatas e leitura organizada",
    image: mariaHeloisaImg,
  },
  pauloHenrique: {
    id: "pauloHenrique",
    name: "Paulo Henrique",
    title: "Guardiao da Sequencia",
    description: "Segura o ritmo das rodadas longas e mantem as respostas organizadas.",
    specialty: "Constancia e leitura disciplinada",
    image: pauloHenriqueImg,
  },
  valentina: {
    id: "valentina",
    name: "Valentina",
    title: "Capita da Arena",
    description: "Entra com postura ofensiva e boa leitura para fases mais longas.",
    specialty: "Combinacoes rapidas com foco e controle",
    image: valentinaImg,
  },
};

export const CHARACTER_ORDER: Character[] = [
  "ana",
  "ayla",
  "elisa",
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
    title: "Sentinela das Potencias",
    challengeLabel: "Fundamentos de Potenciacao",
    threat: "Defende a entrada da academia com contas diretas e sem espaco para improviso.",
    image: newtonImg,
    introVideo: getBossVideoPath("newton-boss-pixverse.mp4"),
    defeatVideo: getBossVideoPath("newton-boss-defeat.mp4"),
    emoji: "🍎",
  },
  2: {
    phase: 2,
    name: "Albert Einstein",
    title: "Arquiteto dos Radicais",
    challengeLabel: "Pressao em Radiciacao",
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
    challengeLabel: "Combos e Calculo Completo",
    threat: "Mistura conteudos e transforma cada questao em uma prova de leitura e precisao.",
    image: marcelaImg,
    introVideo: getBossVideoPath("marcela-boss.mp4"),
    defeatVideo: getBossVideoPath("marcela-boss-defeat.mp4"),
    emoji: "📐",
  },
};

export const BOSS_LIST: BossProfile[] = [BOSS_ROSTER[1], BOSS_ROSTER[2], BOSS_ROSTER[3]];

export function getCharacterName(character: Character): string {
  return CHARACTER_ROSTER[character].name;
}
