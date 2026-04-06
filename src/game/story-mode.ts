export type StoryRoleId = "strategist" | "calculator" | "sprinter" | "analyst" | "leader";
export type StorySceneId =
  | "prologue"
  | "role-select"
  | "newton-choice"
  | "newton-challenge"
  | "newton-aftermath"
  | "einstein-choice"
  | "einstein-challenge"
  | "einstein-aftermath"
  | "marcela-choice"
  | "marcela-challenge"
  | "final-choice"
  | "ending";
export type StoryChoiceKey = "prologue" | "newton" | "einstein" | "marcela" | "final";
export type StoryPhaseKey = "prologue" | "newton" | "einstein" | "marcela" | "ending";
export type StoryMathLevel = 0 | 1 | 2;
export type StoryChallengeId = "newton" | "einstein" | "marcela";

export interface StoryRole {
  id: StoryRoleId;
  name: string;
  title: string;
  specialty: string;
  aura: string;
  insightBonus: number;
  resolveBonus: number;
}

export interface StoryChoiceOption {
  id: string;
  label: string;
  description: string;
  nextSceneId: StorySceneId;
  insightDelta?: number;
  resolveDelta?: number;
}

export interface StoryChallengeVariant {
  prompt: string;
  answer: number;
  hint: string;
  explanation: string;
  successText: string;
  failureText: string;
}

export interface StoryProgress {
  sceneId: StorySceneId;
  roleId: StoryRoleId | null;
  insight: number;
  resolve: number;
  correctAnswers: number;
  wrongAnswers: number;
  mathLevel: StoryMathLevel;
  decisions: Record<StoryChoiceKey, string | null>;
}

interface StorySceneBase {
  id: StorySceneId;
  phase: StoryPhaseKey;
  chapterLabel: string;
  title: string;
  location: string;
  objective: string;
  urgency: string;
  quote?: string;
  getNarrative: (progress: StoryProgress) => string[];
}

export interface StoryChoiceScene extends StorySceneBase {
  kind: "choice";
  choiceKey: StoryChoiceKey;
  choices: readonly StoryChoiceOption[];
}

export interface StoryRoleScene extends StorySceneBase {
  kind: "role";
  nextSceneId: StorySceneId;
}

export interface StoryChallengeScene extends StorySceneBase {
  kind: "challenge";
  challengeId: StoryChallengeId;
  nextSceneId: StorySceneId;
}

export interface StoryMessageScene extends StorySceneBase {
  kind: "message";
  actionLabel: string;
  nextSceneId: StorySceneId;
}

export interface StoryEndingScene extends StorySceneBase {
  kind: "ending";
}

export type StoryScene =
  | StoryChoiceScene
  | StoryRoleScene
  | StoryChallengeScene
  | StoryMessageScene
  | StoryEndingScene;

export const STORY_PHASES: ReadonlyArray<{ id: StoryPhaseKey; label: string }> = [
  { id: "prologue", label: "Prologo" },
  { id: "newton", label: "Fase 1 - Newton" },
  { id: "einstein", label: "Fase 2 - Einstein" },
  { id: "marcela", label: "Fase 3 - Marcela" },
  { id: "ending", label: "Resgate final" },
];

export const STORY_ROLES: readonly StoryRole[] = [
  {
    id: "strategist",
    name: "Estrategista",
    title: "Le o caos antes que o caos leia o grupo.",
    specialty: "Padroes, pistas e escolhas de alto risco.",
    aura: "Ve conexoes escondidas nos simbolos da reliquia.",
    insightBonus: 2,
    resolveBonus: 0,
  },
  {
    id: "calculator",
    name: "Calculadora Humana",
    title: "Transforma pressao em conta limpa.",
    specialty: "Resolve operacoes no ritmo do perigo.",
    aura: "Manten o time firme quando os numeros aceleram.",
    insightBonus: 1,
    resolveBonus: 1,
  },
  {
    id: "sprinter",
    name: "Rapido Pensador",
    title: "Decide antes que o corredor feche.",
    specialty: "Resposta rapida sob urgencia total.",
    aura: "Rompe hesitacao quando segundos decidem destinos.",
    insightBonus: 0,
    resolveBonus: 2,
  },
  {
    id: "analyst",
    name: "Mestre dos Problemas",
    title: "Enxerga a falha que ninguem viu.",
    specialty: "Analisa erros e corrige o rumo da equipe.",
    aura: "Consegue desmontar armadilhas pela logica.",
    insightBonus: 2,
    resolveBonus: 0,
  },
  {
    id: "leader",
    name: "Lider",
    title: "Segura a equipe quando o medo tenta vencer.",
    specialty: "Motivacao, ritmo e voz de comando.",
    aura: "Transforma nervosismo em coragem coletiva.",
    insightBonus: 0,
    resolveBonus: 2,
  },
];

const STORY_CHALLENGES: Record<StoryChallengeId, readonly StoryChallengeVariant[]> = {
  newton: [
    {
      prompt: "Newton ergue tres aneis de energia e grava no ar: 2^3 + 4. Qual valor quebra o primeiro selo?",
      answer: 12,
      hint: "Resolva a potencia antes da soma.",
      explanation: "2^3 = 8. Depois, 8 + 4 = 12.",
      successText: "O primeiro selo estoura e o ginasio inteiro ecoa como metal rachando.",
      failureText: "Os aneis apertam a arena. Newton percebe a hesitacao e amplia a pressao.",
    },
    {
      prompt: "No centro da quadra, a formula pulsa: 3^2 + 2^3. Qual numero abre caminho ate Newton?",
      answer: 17,
      hint: "Calcule cada potencia e depois some os resultados.",
      explanation: "3^2 = 9 e 2^3 = 8. Somando, o corredor responde com 17.",
      successText: "As correntes numericas se alinham e a defesa de Newton perde rigidez.",
      failureText: "A blindagem cresce nas colunas e a quadra fica ainda mais instavel.",
    },
    {
      prompt: "A ultima muralha de Newton mostra: (2^4 - 3^2) + 5. Qual valor desmonta o golpe final?",
      answer: 12,
      hint: "Primeiro resolva as potencias, depois a subtracao, depois a soma final.",
      explanation: "2^4 = 16 e 3^2 = 9. 16 - 9 = 7. Com mais 5, o total e 12.",
      successText: "A muralha trinca inteira e Newton recua pela primeira vez desde que despertou.",
      failureText: "O solo vibra e os circulos de poder se fecham mais perto do Setimo A.",
    },
  ],
  einstein: [
    {
      prompt: "No labirinto, uma porta so abre com raiz de 81 - 4. Qual resultado acalma o espelho central?",
      answer: 5,
      hint: "Descubra a raiz quadrada antes de subtrair.",
      explanation: "A raiz de 81 e 9. Entao 9 - 4 = 5.",
      successText: "Os espelhos perdem simetria e o labirinto revela uma passagem estreita.",
      failureText: "As paredes se dobram de novo e Einstein muda a rota do grupo.",
    },
    {
      prompt: "Einstein cria duas saidas falsas. Ambas apontam para raiz de 64 + 6. Qual numero confirma a porta real?",
      answer: 14,
      hint: "A raiz de 64 vale 8.",
      explanation: "Raiz de 64 = 8. Somando 6, a chave correta fica em 14.",
      successText: "A porta verdadeira vibra em azul e os espelhos falsos se quebram ao redor.",
      failureText: "O corredor se repete e a equipe perde visao do teto por alguns instantes.",
    },
    {
      prompt: "No nucleo do labirinto, a conta final aparece: (3^2 + raiz de 36) x 2. Qual resposta desfaz a armadilha?",
      answer: 30,
      hint: "Resolva 3^2, some com a raiz de 36 e multiplique o resultado por 2.",
      explanation: "3^2 = 9 e raiz de 36 = 6. 9 + 6 = 15. 15 x 2 = 30.",
      successText: "O labirinto desaba em feixes de luz e Einstein fica sem rotas de fuga.",
      failureText: "O tempo parece dobrar ao redor do Setimo A e cada passo pesa mais.",
    },
  ],
  marcela: [
    {
      prompt: "A energia da reliquia cruza o peito de Marcela com raiz de 49 + 2^3. Qual valor corta a corrupcao?",
      answer: 15,
      hint: "Raiz de 49 vale 7 e 2^3 vale 8.",
      explanation: "7 + 8 = 15. A resposta combina equilibrio e impacto.",
      successText: "A luz dourada falha por um segundo. A voz da professora tenta voltar.",
      failureText: "A corrupcao aperta mais forte e a voz de Marcela some sob o ruino da reliquia.",
    },
    {
      prompt: "Para acorda-la, o Setimo A projeta: (2^3 + raiz de 16) x 2. Qual numero limpa a segunda camada?",
      answer: 24,
      hint: "2^3 = 8 e a raiz de 16 = 4.",
      explanation: "8 + 4 = 12. Multiplicando por 2, a onda correta e 24.",
      successText: "Os simbolos quebram um a um e Marcela reconhece a propria turma.",
      failureText: "A sala responde com um clarão e a reliquia tenta isolar o grupo.",
    },
    {
      prompt: "No confronto final, a reliquia acende: 3^2 + raiz de 81 + 2^4. Qual valor sela o caos?",
      answer: 34,
      hint: "Resolva cada bloco separadamente e some no final.",
      explanation: "3^2 = 9, raiz de 81 = 9 e 2^4 = 16. No total, 34.",
      successText: "A formula final explode em luz limpa. Marcela se liberta e o controle de Newton se desfaz.",
      failureText: "A escola treme inteira. Por um instante, parece que o CEAS vai ceder ao silencio.",
    },
  ],
};

const STORY_SCENES: Record<StorySceneId, StoryScene> = {
  prologue: {
    id: "prologue",
    kind: "choice",
    phase: "prologue",
    chapterLabel: "MODO HISTORIA INICIADO...",
    title: "A Reliquia de CEAS",
    location: "Ala antiga do CEAS",
    objective: "Escolha como o Setimo A reage ao primeiro colapso da escola.",
    urgency: "Equacoes estao correndo pelas paredes e portas estao travando em toda a escola.",
    quote: "\"A matematica nao e abrigo. E poder absoluto.\" Isaac Newton",
    choiceKey: "prologue",
    choices: [
      {
        id: "library-first",
        label: "Correr para a ala antiga",
        description: "Investigar a reliquia antes que o caos se espalhe ainda mais.",
        nextSceneId: "role-select",
        insightDelta: 1,
      },
      {
        id: "protect-corridor",
        label: "Fechar o corredor central",
        description: "Segurar a passagem para proteger os alunos que ainda estao fugindo.",
        nextSceneId: "role-select",
        resolveDelta: 1,
      },
      {
        id: "call-the-class",
        label: "Reunir o Setimo A",
        description: "Trazer a turma inteira para agir como uma unica equipe.",
        nextSceneId: "role-select",
        insightDelta: 1,
        resolveDelta: 1,
      },
    ],
    getNarrative: () => [
      "No silencio do deposito antigo, a professora Marcela afasta uma estante e encontra uma reliquia marcada por potencias, raizes e orbitas numericas.",
      "Quando seus dedos tocam o metal, um clarao azul atravessa o CEAS. Equacoes surgem nas paredes, fechaduras giram sozinhas e vozes de alunos desaparecem corredor adentro.",
      "Da fenda de luz, Isaac Newton desperta como uma entidade de calculo absoluto. Logo depois, Albert Einstein nasce do reflexo das janelas quebradas e sorri como se cada segundo estivesse sob seu comando.",
      "Marcela tenta recuar, mas a reliquia envolve seus pulsos. Seus olhos brilham em dourado. A escola inteira mergulha no caos.",
    ],
  },
  "role-select": {
    id: "role-select",
    kind: "role",
    phase: "prologue",
    chapterLabel: "Convocacao do Setimo A",
    title: "Escolha seu papel na equipe",
    location: "Patio principal em emergencia",
    objective: "Defina qual voz do Setimo A vai conduzir a travessia.",
    urgency: "A turma precisa de uma funcao clara antes de entrar no rastro da reliquia.",
    nextSceneId: "newton-choice",
    getNarrative: () => [
      "O Setimo A se junta no patio enquanto o CEAS vibra como se a escola tivesse ganhado pulso proprio.",
      "Cada colega assume um papel. O grupo precisa de alguem para puxar a linha de frente, interpretar os sinais e nao ceder ao medo.",
      "Quem voce decide ser nessa historia?",
    ],
  },
  "newton-choice": {
    id: "newton-choice",
    kind: "choice",
    phase: "newton",
    chapterLabel: "Fase 1 - Desafio de Isaac Newton",
    title: "A quadra virou um anfiteatro de combate",
    location: "Ginasio principal",
    objective: "Escolha a abordagem antes do primeiro choque direto com Newton.",
    urgency: "Os aneis de energia estao comprimindo a quadra e o Setimo A precisa abrir espaco.",
    quote: "\"Se voces nao dominarem a conta, a conta dominara voces.\" Isaac Newton",
    choiceKey: "newton",
    choices: [
      {
        id: "read-runes",
        label: "Ler os aneis antes de atacar",
        description: "Mapear o padrao numerico da arena para encontrar a falha.",
        nextSceneId: "newton-challenge",
        insightDelta: 1,
      },
      {
        id: "break-forward",
        label: "Avancar e abrir passagem",
        description: "Pressionar Newton antes que a defesa dele feche completamente.",
        nextSceneId: "newton-challenge",
        resolveDelta: 1,
      },
      {
        id: "cover-the-team",
        label: "Cobrir a turma e ganhar tempo",
        description: "Segurar a linha de frente enquanto os colegas observam a formula do golpe.",
        nextSceneId: "newton-challenge",
        insightDelta: 1,
        resolveDelta: 1,
      },
    ],
    getNarrative: (progress) => [
      `Voce entra na quadra com o papel de ${getStoryRoleName(progress.roleId)} e sente o piso vibrar sob os pes.`,
      "Newton paira acima da cesta central, girando aneis de energia com simbolos de potencia em cada camada.",
      "A cada segundo, a pressao aumenta. O Setimo A percebe que esse nao e apenas um combate. E um teste de frieza.",
    ],
  },
  "newton-challenge": {
    id: "newton-challenge",
    kind: "challenge",
    phase: "newton",
    chapterLabel: "Confronto logico",
    title: "Quebre o primeiro selo de Newton",
    location: "Centro da quadra",
    objective: "Resolver a conta correta para romper a blindagem do primeiro chefao.",
    urgency: "Se a resposta atrasar, os aneis vao fechar completamente sobre a equipe.",
    challengeId: "newton",
    nextSceneId: "newton-aftermath",
    getNarrative: (progress) => [
      getRoleSceneLead(progress.roleId),
      "O Setimo A fixa os olhos na formula que surge no ar. O resultado certo precisa sair antes do proximo pulso da reliquia.",
    ],
  },
  "newton-aftermath": {
    id: "newton-aftermath",
    kind: "message",
    phase: "newton",
    chapterLabel: "A queda do primeiro tirano",
    title: "Newton recua, mas deixa uma sombra",
    location: "Arquibancada em ruinas",
    objective: "Seguir o rastro de energia deixado pelo proximo inimigo.",
    urgency: "Einstein esta puxando a escola para dentro de um labirinto de espelhos.",
    actionLabel: "Seguir Einstein",
    nextSceneId: "einstein-choice",
    quote: "\"Velocidade sem direcao e so outra forma de derrota.\" Albert Einstein",
    getNarrative: (progress) => [
      getNewtonAftermathLine(progress.decisions.newton),
      "Newton perde forma, mas antes de desaparecer empurra a energia da reliquia para os corredores do bloco central.",
      "Das janelas partidas, Einstein surge sorrindo. O proximo teste nao sera sobre forca. Sera sobre estrategia.",
    ],
  },
  "einstein-choice": {
    id: "einstein-choice",
    kind: "choice",
    phase: "einstein",
    chapterLabel: "Fase 2 - Labirinto de Albert Einstein",
    title: "O bloco central virou um quebra-cabeca vivo",
    location: "Corredores espelhados",
    objective: "Escolher como atravessar o labirinto antes que a equipe se separe.",
    urgency: "As paredes estao mudando de lugar e cada erro pode prender alguem para tras.",
    quote: "\"Quem controla o tempo de resposta controla a queda do adversario.\" Albert Einstein",
    choiceKey: "einstein",
    choices: [
      {
        id: "mark-the-floor",
        label: "Marcar o chao com padroes",
        description: "Criar referencias visuais para quebrar a ilusao do labirinto.",
        nextSceneId: "einstein-challenge",
        insightDelta: 1,
      },
      {
        id: "split-in-pairs",
        label: "Dividir a equipe em duplas",
        description: "Cobrir mais area sem perder o contato entre os colegas.",
        nextSceneId: "einstein-challenge",
        resolveDelta: 1,
      },
      {
        id: "bait-einstein",
        label: "Puxar Einstein para o centro",
        description: "Forcar o inimigo a mostrar a rota verdadeira por arrogancia.",
        nextSceneId: "einstein-challenge",
        insightDelta: 1,
        resolveDelta: 1,
      },
    ],
    getNarrative: (progress) => [
      "Os corredores do CEAS se dobram em angulos impossiveis. O teto reflete o chao. Portas aparecem onde antes havia janelas.",
      `${getStoryRoleName(progress.roleId)} respira fundo enquanto Einstein mexe no espaco como quem mexe em pecas de xadrez.`,
      "Cada passo errado arrasta a turma para um espelho diferente.",
    ],
  },
  "einstein-challenge": {
    id: "einstein-challenge",
    kind: "challenge",
    phase: "einstein",
    chapterLabel: "Logica sob manipulação",
    title: "Encontre a saida verdadeira",
    location: "Nucleo do labirinto",
    objective: "Resolver o calculo antes que o corredor se feche de novo.",
    urgency: "Einstein esta comprimindo o tempo ao redor da equipe.",
    challengeId: "einstein",
    nextSceneId: "einstein-aftermath",
    getNarrative: (progress) => [
      getRoleSceneLead(progress.roleId),
      "No vidro central, a conta aparece como se fosse o ultimo folego de uma porta prestes a sumir.",
    ],
  },
  "einstein-aftermath": {
    id: "einstein-aftermath",
    kind: "message",
    phase: "einstein",
    chapterLabel: "A estrategia quebra",
    title: "Einstein perde o controle do labirinto",
    location: "Acesso ao laboratorio principal",
    objective: "Entrar no laboratorio antes que Marcela se perca de vez para a reliquia.",
    urgency: "A presenca de Marcela esta cada vez mais distante e dolorosa.",
    actionLabel: "Correr para o laboratorio",
    nextSceneId: "marcela-choice",
    quote: "\"Nao deixem que ela me leve embora...\" voz abafada de Marcela",
    getNarrative: (progress) => [
      getEinsteinAftermathLine(progress.decisions.einstein),
      "Einstein tenta rir enquanto os espelhos caem como chuva de vidro e luz.",
      "Por tras do corredor final, a energia da reliquia pulsa com o nome de Marcela gravado em fogo dourado.",
    ],
  },
  "marcela-choice": {
    id: "marcela-choice",
    kind: "choice",
    phase: "marcela",
    chapterLabel: "Fase 3 - Confronto com Marcela",
    title: "A sala de ciencias virou um santuario corrompido",
    location: "Laboratorio principal",
    objective: "Decidir como se aproximar de Marcela sem quebrar o vinculo que ainda resta.",
    urgency: "A reliquia esta usando as memorias da professora contra a propria turma.",
    quote: "\"Se voces hesitarem, o CEAS vai esquecer o proprio nome.\" Marcela corrompida",
    choiceKey: "marcela",
    choices: [
      {
        id: "call-her-name",
        label: "Chamar Marcela pelo nome",
        description: "Usar a memoria afetiva da turma para atravessar a corrupcao.",
        nextSceneId: "marcela-challenge",
        resolveDelta: 1,
      },
      {
        id: "project-formula",
        label: "Projetar a sequencia certa",
        description: "Usar matematica limpa para ferir a reliquia sem atingir Marcela.",
        nextSceneId: "marcela-challenge",
        insightDelta: 1,
      },
      {
        id: "speak-as-team",
        label: "Falar como Setimo A",
        description: "Lembrar que a professora ensinou cada um deles a nao fugir da dificuldade.",
        nextSceneId: "marcela-challenge",
        insightDelta: 1,
        resolveDelta: 1,
      },
    ],
    getNarrative: (progress) => [
      "Tubos de ensaio flutuam no ar. O quadro espalha formulas sozinho. No centro da sala, Marcela luta para respirar sob a luz da reliquia.",
      `${getStoryRoleName(progress.roleId)} percebe que esse nao e um duelo comum. E um resgate.`,
      "A turma inteira espera seu comando.",
    ],
  },
  "marcela-challenge": {
    id: "marcela-challenge",
    kind: "challenge",
    phase: "marcela",
    chapterLabel: "Resgate emocional",
    title: "Resolva a formula que rompe a corrupcao",
    location: "Circulo da reliquia",
    objective: "Acertar a conta final para libertar Marcela e quebrar o dominio da reliquia.",
    urgency: "A escola inteira treme. Se esta resposta falhar, o CEAS pode apagar de vez.",
    challengeId: "marcela",
    nextSceneId: "final-choice",
    getNarrative: (progress) => [
      getRoleSceneLead(progress.roleId),
      "A formula final acende sobre o peito de Marcela. O numero certo precisa sair agora.",
    ],
  },
  "final-choice": {
    id: "final-choice",
    kind: "choice",
    phase: "ending",
    chapterLabel: "A ultima decisao",
    title: "Marcela voltou. Agora a reliquia precisa cair.",
    location: "Patio central em colapso",
    objective: "Escolher a forma final de selar a reliquia e salvar a escola.",
    urgency: "Newton tenta puxar a energia restante para uma ultima investida.",
    quote: "\"Nao vamos perder a escola. Nao hoje.\" Professora Marcela",
    choiceKey: "final",
    choices: [
      {
        id: "seal-with-formula",
        label: "Selar com a formula final",
        description: "Fechar a reliquia com precisao matematica e pulso firme.",
        nextSceneId: "ending",
        insightDelta: 1,
      },
      {
        id: "channel-the-class",
        label: "Canalizar a energia da turma",
        description: "Usar a unidade do Setimo A para esmagar a ultima resistencia.",
        nextSceneId: "ending",
        resolveDelta: 1,
      },
      {
        id: "face-newton",
        label: "Mandar Newton encarar a resposta do Setimo A",
        description: "Confrontar o vilao com a certeza coletiva da equipe.",
        nextSceneId: "ending",
        insightDelta: 1,
        resolveDelta: 1,
      },
    ],
    getNarrative: () => [
      "Marcela cai de joelhos, livre, e segura a reliquia com as duas maos enquanto o patio central abre rachaduras de luz.",
      "Newton tenta surgir uma ultima vez do interior do metal. A escola inteira observa em silencio tenso.",
      "O Setimo A precisa decidir como termina esta guerra.",
    ],
  },
  ending: {
    id: "ending",
    kind: "ending",
    phase: "ending",
    chapterLabel: "CEAS salvo",
    title: "A escola respira outra vez",
    location: "Patio central ao amanhecer",
    objective: "Rever o desfecho da campanha e preparar a proxima expansao do modo Historia.",
    urgency: "O eco da reliquia ainda existe. Outros capitulos poderao nascer daqui.",
    getNarrative: (progress) => getEndingNarrative(progress),
  },
};

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

export function createInitialStoryProgress(): StoryProgress {
  return {
    sceneId: "prologue",
    roleId: null,
    insight: 1,
    resolve: 1,
    correctAnswers: 0,
    wrongAnswers: 0,
    mathLevel: 0,
    decisions: {
      prologue: null,
      newton: null,
      einstein: null,
      marcela: null,
      final: null,
    },
  };
}

export function getStoryScene(sceneId: StorySceneId): StoryScene {
  return STORY_SCENES[sceneId];
}

export function getStoryRole(roleId: StoryRoleId | null): StoryRole | null {
  if (!roleId) {
    return null;
  }

  return STORY_ROLES.find((role) => role.id === roleId) ?? null;
}

export function getStoryRoleName(roleId: StoryRoleId | null): string {
  return getStoryRole(roleId)?.name ?? "voz da linha de frente";
}

export function getStoryChallenge(challengeId: StoryChallengeId, level: StoryMathLevel): StoryChallengeVariant {
  return STORY_CHALLENGES[challengeId][level];
}

export function chooseStoryOption(progress: StoryProgress, optionId: string): StoryProgress {
  const scene = getStoryScene(progress.sceneId);

  if (scene.kind !== "choice") {
    return progress;
  }

  const selectedOption = scene.choices.find((option) => option.id === optionId);

  if (!selectedOption) {
    return progress;
  }

  return {
    ...progress,
    sceneId: selectedOption.nextSceneId,
    insight: clamp(progress.insight + (selectedOption.insightDelta ?? 0), 0, 8),
    resolve: clamp(progress.resolve + (selectedOption.resolveDelta ?? 0), 0, 8),
    decisions: {
      ...progress.decisions,
      [scene.choiceKey]: selectedOption.id,
    },
  };
}

export function chooseStoryRole(progress: StoryProgress, roleId: StoryRoleId): StoryProgress {
  const role = getStoryRole(roleId);
  const scene = getStoryScene(progress.sceneId);

  if (!role || scene.kind !== "role") {
    return progress;
  }

  return {
    ...progress,
    roleId: role.id,
    sceneId: scene.nextSceneId,
    insight: clamp(progress.insight + role.insightBonus, 0, 8),
    resolve: clamp(progress.resolve + role.resolveBonus, 0, 8),
  };
}

export function continueStory(progress: StoryProgress): StoryProgress {
  const scene = getStoryScene(progress.sceneId);

  if (scene.kind !== "message") {
    return progress;
  }

  return {
    ...progress,
    sceneId: scene.nextSceneId,
  };
}

export function completeStoryChallenge(
  progress: StoryProgress,
  challengeId: StoryChallengeId,
  isCorrect: boolean,
  nextSceneId: StorySceneId,
): StoryProgress {
  const nextMathLevel = isCorrect
    ? ((clamp(progress.mathLevel + 1, 0, 2) as StoryMathLevel))
    : ((clamp(progress.mathLevel - 1, 0, 2) as StoryMathLevel));

  return {
    ...progress,
    sceneId: isCorrect ? nextSceneId : progress.sceneId,
    correctAnswers: progress.correctAnswers + (isCorrect ? 1 : 0),
    wrongAnswers: progress.wrongAnswers + (isCorrect ? 0 : 1),
    mathLevel: nextMathLevel,
  };
}

export function getStoryScore(progress: StoryProgress) {
  return progress.insight + progress.resolve + progress.correctAnswers * 2 - progress.wrongAnswers;
}

function getRoleSceneLead(roleId: StoryRoleId | null) {
  const role = getStoryRole(roleId);

  if (!role) {
    return "A equipe procura uma brecha enquanto a escola inteira parece respirar junto com a reliquia.";
  }

  return `${role.name} assume a ponta da formacao. ${role.aura}`;
}

function getNewtonAftermathLine(choiceId: string | null) {
  if (choiceId === "read-runes") {
    return "Voce desmonta a blindagem de Newton ao ler o padrao escondido nos aneis antes do impacto.";
  }

  if (choiceId === "cover-the-team") {
    return "Enquanto o Setimo A segurava a linha, a conta certa encontrou uma abertura no centro do caos.";
  }

  return "A investida do Setimo A quebra a postura absoluta de Newton e prova que a equipe nao vai recuar.";
}

function getEinsteinAftermathLine(choiceId: string | null) {
  if (choiceId === "mark-the-floor") {
    return "As marcas no chao cortam a ilusao e fazem o labirinto perder seu dominio perfeito.";
  }

  if (choiceId === "split-in-pairs") {
    return "As duplas seguram a formacao e tiram Einstein da zona de conforto pela primeira vez.";
  }

  return "Ao provocar Einstein no momento certo, o Setimo A força o vilao a mostrar a propria falha.";
}

function getEndingNarrative(progress: StoryProgress) {
  const role = getStoryRole(progress.roleId);
  const score = getStoryScore(progress);
  const finalDecision = progress.decisions.final;
  const closingMove =
    finalDecision === "seal-with-formula"
      ? "A formula final fecha a reliquia com a precisao de uma assinatura impossivel de apagar."
      : finalDecision === "channel-the-class"
        ? "A voz coletiva do Setimo A atravessa o patio e transforma coragem em energia limpa."
        : "Newton encara a resposta unida da turma e percebe tarde demais que perdeu o controle do CEAS.";

  const performanceLine =
    score >= 12
      ? "A escola volta ao normal em meio a um amanhecer nitido, como se o CEAS tivesse acabado de respirar pela primeira vez em horas."
      : score >= 9
        ? "O caos some aos poucos, mas a escola permanece de pe e a turma sabe que venceu algo enorme."
        : "Mesmo exaustos, voces seguram o suficiente para salvar a escola e manter a reliquia longe das sombras.";

  return [
    `${role?.name ?? "A equipe"} lidera o ultimo passo ao lado de Marcela, agora livre da corrupcao.`,
    closingMove,
    "Einstein se desfaz em luz quebrada. Newton tenta resistir por um ultimo segundo, mas a reliquia racha do centro para fora e apaga sua presenca.",
    performanceLine,
    "Marcela encara o Setimo A com os olhos marejados e diz que a escola ainda vai precisar deles. O modo Historia agora esta pronto para crescer em novos capitulos.",
  ];
}
