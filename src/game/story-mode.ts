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
  { id: "prologue", label: "Prólogo" },
  { id: "newton", label: "Fase 1 - Newton" },
  { id: "einstein", label: "Fase 2 - Einstein" },
  { id: "marcela", label: "Fase 3 - Marcela" },
  { id: "ending", label: "Resgate final" },
];

export const STORY_ROLES: readonly StoryRole[] = [
  {
    id: "strategist",
    name: "Estrategista",
    title: "Lê o caos antes que o caos leia o grupo.",
    specialty: "Padrões, pistas e escolhas de alto risco.",
    aura: "Vê conexões escondidas nos símbolos da relíquia.",
    insightBonus: 2,
    resolveBonus: 0,
  },
  {
    id: "calculator",
    name: "Calculadora Humana",
    title: "Transforma pressão em conta limpa.",
    specialty: "Resolve operações no ritmo do perigo.",
    aura: "Mantém o time firme quando os números aceleram.",
    insightBonus: 1,
    resolveBonus: 1,
  },
  {
    id: "sprinter",
    name: "Pensador Rápido",
    title: "Decide antes que o corredor feche.",
    specialty: "Resposta rápida sob urgência total.",
    aura: "Rompe a hesitação quando segundos decidem destinos.",
    insightBonus: 0,
    resolveBonus: 2,
  },
  {
    id: "analyst",
    name: "Mestre dos Problemas",
    title: "Enxerga a falha que ninguém viu.",
    specialty: "Analisa erros e corrige o rumo da equipe.",
    aura: "Consegue desmontar armadilhas pela lógica.",
    insightBonus: 2,
    resolveBonus: 0,
  },
  {
    id: "leader",
    name: "Líder",
    title: "Segura a equipe quando o medo tenta vencer.",
    specialty: "Motivação, ritmo e voz de comando.",
    aura: "Transforma nervosismo em coragem coletiva.",
    insightBonus: 0,
    resolveBonus: 2,
  },
];

const STORY_CHALLENGES: Record<StoryChallengeId, readonly StoryChallengeVariant[]> = {
  newton: [
    {
      prompt: "Newton ergue três anéis de energia e grava no ar: 2^3 + 4. Qual valor quebra o primeiro selo?",
      answer: 12,
      hint: "Resolva a potência antes da soma.",
      explanation: "2^3 = 8. Depois, 8 + 4 = 12.",
      successText: "O primeiro selo estoura e o ginásio inteiro ecoa como metal rachando.",
      failureText: "Os anéis apertam a arena. Newton percebe a hesitação e amplia a pressão.",
    },
    {
      prompt: "No centro da quadra, a fórmula pulsa: 3^2 + 2^3. Qual número abre caminho até Newton?",
      answer: 17,
      hint: "Calcule cada potência e depois some os resultados.",
      explanation: "3^2 = 9 e 2^3 = 8. Somando, o corredor responde com 17.",
      successText: "As correntes numéricas se alinham e a defesa de Newton perde rigidez.",
      failureText: "A blindagem cresce nas colunas e a quadra fica ainda mais instável.",
    },
    {
      prompt: "A última muralha de Newton mostra: (2^4 - 3^2) + 5. Qual valor desmonta o golpe final?",
      answer: 12,
      hint: "Primeiro resolva as potências, depois a subtração e, por fim, a soma.",
      explanation: "2^4 = 16 e 3^2 = 9. 16 - 9 = 7. Com mais 5, o total é 12.",
      successText: "A muralha trinca inteira e Newton recua pela primeira vez desde que despertou.",
      failureText: "O solo vibra e os círculos de poder se fecham mais perto do Sétimo A.",
    },
  ],
  einstein: [
    {
      prompt: "No labirinto, uma porta só abre com raiz de 81 - 4. Qual resultado acalma o espelho central?",
      answer: 5,
      hint: "Descubra a raiz quadrada antes de subtrair.",
      explanation: "A raiz de 81 é 9. Então 9 - 4 = 5.",
      successText: "Os espelhos perdem simetria e o labirinto revela uma passagem estreita.",
      failureText: "As paredes se dobram de novo e Einstein muda a rota do grupo.",
    },
    {
      prompt: "Einstein cria duas saídas falsas. Ambas apontam para raiz de 64 + 6. Qual número confirma a porta real?",
      answer: 14,
      hint: "A raiz de 64 vale 8.",
      explanation: "Raiz de 64 = 8. Somando 6, a chave correta fica em 14.",
      successText: "A porta verdadeira vibra em azul e os espelhos falsos se quebram ao redor.",
      failureText: "O corredor se repete e a equipe perde visão do teto por alguns instantes.",
    },
    {
      prompt: "No núcleo do labirinto, a conta final aparece: (3^2 + raiz de 36) × 2. Qual resposta desfaz a armadilha?",
      answer: 30,
      hint: "Resolva 3^2, some com a raiz de 36 e multiplique o resultado por 2.",
      explanation: "3^2 = 9 e raiz de 36 = 6. 9 + 6 = 15. 15 × 2 = 30.",
      successText: "O labirinto desaba em feixes de luz e Einstein fica sem rotas de fuga.",
      failureText: "O tempo parece dobrar ao redor do Sétimo A e cada passo pesa mais.",
    },
  ],
  marcela: [
    {
      prompt: "A energia da relíquia cruza o peito de Marcela com raiz de 49 + 2^3. Qual valor corta a corrupção?",
      answer: 15,
      hint: "Raiz de 49 vale 7 e 2^3 vale 8.",
      explanation: "7 + 8 = 15. A resposta combina equilíbrio e impacto.",
      successText: "A luz dourada falha por um segundo. A voz da professora tenta voltar.",
      failureText: "A corrupção aperta mais forte e a voz de Marcela some sob o ruído da relíquia.",
    },
    {
      prompt: "Para acordá-la, o Sétimo A projeta: (2^3 + raiz de 16) × 2. Qual número limpa a segunda camada?",
      answer: 24,
      hint: "2^3 = 8 e a raiz de 16 = 4.",
      explanation: "8 + 4 = 12. Multiplicando por 2, a onda correta é 24.",
      successText: "Os símbolos quebram um a um e Marcela reconhece a própria turma.",
      failureText: "A sala responde com um clarão e a relíquia tenta isolar o grupo.",
    },
    {
      prompt: "No confronto final, a relíquia acende: 3^2 + raiz de 81 + 2^4. Qual valor sela o caos?",
      answer: 34,
      hint: "Resolva cada bloco separadamente e some no final.",
      explanation: "3^2 = 9, raiz de 81 = 9 e 2^4 = 16. No total, 34.",
      successText: "A fórmula final explode em luz limpa. Marcela se liberta e o controle de Newton se desfaz.",
      failureText: "A escola treme inteira. Por um instante, parece que o CEAS vai ceder ao silêncio.",
    },
  ],
};

const STORY_SCENES: Record<StorySceneId, StoryScene> = {
  prologue: {
    id: "prologue",
    kind: "choice",
    phase: "prologue",
    chapterLabel: "MODO HISTÓRIA INICIADO...",
    title: "A Relíquia do CEAS",
    location: "Ala antiga do CEAS",
    objective: "Escolha como o Sétimo A reage ao primeiro colapso da escola.",
    urgency: "Equações estão correndo pelas paredes e portas estão travando em toda a escola.",
    quote: "\"A matemática não é abrigo. É poder absoluto.\" Isaac Newton",
    choiceKey: "prologue",
    choices: [
      {
        id: "library-first",
        label: "Correr para a ala antiga",
        description: "Investigar a relíquia antes que o caos se espalhe ainda mais.",
        nextSceneId: "role-select",
        insightDelta: 1,
      },
      {
        id: "protect-corridor",
        label: "Fechar o corredor central",
        description: "Segurar a passagem para proteger os alunos que ainda estão fugindo.",
        nextSceneId: "role-select",
        resolveDelta: 1,
      },
      {
        id: "call-the-class",
        label: "Reunir o Sétimo A",
        description: "Trazer a turma inteira para agir como uma única equipe.",
        nextSceneId: "role-select",
        insightDelta: 1,
        resolveDelta: 1,
      },
    ],
    getNarrative: () => [
      "No silêncio do depósito antigo, a professora Marcela afasta uma estante e encontra uma relíquia marcada por potências, raízes e órbitas numéricas.",
      "Quando seus dedos tocam o metal, um clarão azul atravessa o CEAS. Equações surgem nas paredes, fechaduras giram sozinhas e vozes de alunos desaparecem corredor adentro.",
      "Da fenda de luz, Isaac Newton desperta como uma entidade de cálculo absoluto. Logo depois, Albert Einstein nasce do reflexo das janelas quebradas e sorri como se cada segundo estivesse sob seu comando.",
      "Marcela tenta recuar, mas a relíquia envolve seus pulsos. Seus olhos brilham em dourado. A escola inteira mergulha no caos.",
    ],
  },
  "role-select": {
    id: "role-select",
    kind: "role",
    phase: "prologue",
    chapterLabel: "Convocação do Sétimo A",
    title: "Escolha seu papel na equipe",
    location: "Pátio principal em emergência",
    objective: "Defina qual voz do Sétimo A vai conduzir a travessia.",
    urgency: "A turma precisa de uma função clara antes de entrar no rastro da relíquia.",
    nextSceneId: "newton-choice",
    getNarrative: () => [
      "O Sétimo A se junta no pátio enquanto o CEAS vibra como se a escola tivesse ganhado pulso próprio.",
      "Cada colega assume um papel. O grupo precisa de alguém para puxar a linha de frente, interpretar os sinais e não ceder ao medo.",
      "Quem você decide ser nesta história?",
    ],
  },
  "newton-choice": {
    id: "newton-choice",
    kind: "choice",
    phase: "newton",
    chapterLabel: "Fase 1 - Desafio de Isaac Newton",
    title: "A quadra virou um anfiteatro de combate",
    location: "Ginásio principal",
    objective: "Escolha a abordagem antes do primeiro choque direto com Newton.",
    urgency: "Os anéis de energia estão comprimindo a quadra e o Sétimo A precisa abrir espaço.",
    quote: "\"Se vocês não dominarem a conta, a conta dominará vocês.\" Isaac Newton",
    choiceKey: "newton",
    choices: [
      {
        id: "read-runes",
        label: "Ler os anéis antes de atacar",
        description: "Mapear o padrão numérico da arena para encontrar a falha.",
        nextSceneId: "newton-challenge",
        insightDelta: 1,
      },
      {
        id: "break-forward",
        label: "Avançar e abrir passagem",
        description: "Pressionar Newton antes que a defesa dele feche completamente.",
        nextSceneId: "newton-challenge",
        resolveDelta: 1,
      },
      {
        id: "cover-the-team",
        label: "Cobrir a turma e ganhar tempo",
        description: "Segurar a linha de frente enquanto os colegas observam a fórmula do golpe.",
        nextSceneId: "newton-challenge",
        insightDelta: 1,
        resolveDelta: 1,
      },
    ],
    getNarrative: (progress) => [
      `Você entra na quadra com o papel de ${getStoryRoleName(progress.roleId)} e sente o piso vibrar sob os pés.`,
      "Newton paira acima da cesta central, girando anéis de energia com símbolos de potência em cada camada.",
      "A cada segundo, a pressão aumenta. O Sétimo A percebe que esse não é apenas um combate. É um teste de frieza.",
    ],
  },
  "newton-challenge": {
    id: "newton-challenge",
    kind: "challenge",
    phase: "newton",
    chapterLabel: "Confronto lógico",
    title: "Quebre o primeiro selo de Newton",
    location: "Centro da quadra",
    objective: "Resolver a conta correta para romper a blindagem do primeiro chefe.",
    urgency: "Se a resposta atrasar, os anéis vão fechar completamente sobre a equipe.",
    challengeId: "newton",
    nextSceneId: "newton-aftermath",
    getNarrative: (progress) => [
      getRoleSceneLead(progress.roleId),
      "O Sétimo A fixa os olhos na fórmula que surge no ar. O resultado certo precisa sair antes do próximo pulso da relíquia.",
    ],
  },
  "newton-aftermath": {
    id: "newton-aftermath",
    kind: "message",
    phase: "newton",
    chapterLabel: "A queda do primeiro tirano",
    title: "Newton recua, mas deixa uma sombra",
    location: "Arquibancada em ruínas",
    objective: "Seguir o rastro de energia deixado pelo próximo inimigo.",
    urgency: "Einstein está puxando a escola para dentro de um labirinto de espelhos.",
    actionLabel: "Seguir Einstein",
    nextSceneId: "einstein-choice",
    quote: "\"Velocidade sem direção é só outra forma de derrota.\" Albert Einstein",
    getNarrative: (progress) => [
      getNewtonAftermathLine(progress.decisions.newton),
      "Newton perde forma, mas antes de desaparecer empurra a energia da relíquia para os corredores do bloco central.",
      "Das janelas partidas, Einstein surge sorrindo. O próximo teste não será sobre força. Será sobre estratégia.",
    ],
  },
  "einstein-choice": {
    id: "einstein-choice",
    kind: "choice",
    phase: "einstein",
    chapterLabel: "Fase 2 - Labirinto de Albert Einstein",
    title: "O bloco central virou um quebra-cabeça vivo",
    location: "Corredores espelhados",
    objective: "Escolher como atravessar o labirinto antes que a equipe se separe.",
    urgency: "As paredes estão mudando de lugar e cada erro pode prender alguém para trás.",
    quote: "\"Quem controla o tempo de resposta controla a queda do adversário.\" Albert Einstein",
    choiceKey: "einstein",
    choices: [
      {
        id: "mark-the-floor",
        label: "Marcar o chão com padrões",
        description: "Criar referências visuais para quebrar a ilusão do labirinto.",
        nextSceneId: "einstein-challenge",
        insightDelta: 1,
      },
      {
        id: "split-in-pairs",
        label: "Dividir a equipe em duplas",
        description: "Cobrir mais área sem perder o contato entre os colegas.",
        nextSceneId: "einstein-challenge",
        resolveDelta: 1,
      },
      {
        id: "bait-einstein",
        label: "Puxar Einstein para o centro",
        description: "Forçar o inimigo a mostrar a rota verdadeira por arrogância.",
        nextSceneId: "einstein-challenge",
        insightDelta: 1,
        resolveDelta: 1,
      },
    ],
    getNarrative: (progress) => [
      "Os corredores do CEAS se dobram em ângulos impossíveis. O teto reflete o chão. Portas aparecem onde antes havia janelas.",
      `${getStoryRoleName(progress.roleId)} respira fundo enquanto Einstein mexe no espaço como quem mexe em peças de xadrez.`,
      "Cada passo errado arrasta a turma para um espelho diferente.",
    ],
  },
  "einstein-challenge": {
    id: "einstein-challenge",
    kind: "challenge",
    phase: "einstein",
    chapterLabel: "Logica sob manipulação",
    title: "Encontre a saída verdadeira",
    location: "Núcleo do labirinto",
    objective: "Resolver o cálculo antes que o corredor se feche de novo.",
    urgency: "Einstein está comprimindo o tempo ao redor da equipe.",
    challengeId: "einstein",
    nextSceneId: "einstein-aftermath",
    getNarrative: (progress) => [
      getRoleSceneLead(progress.roleId),
      "No vidro central, a conta aparece como se fosse o último fôlego de uma porta prestes a sumir.",
    ],
  },
  "einstein-aftermath": {
    id: "einstein-aftermath",
    kind: "message",
    phase: "einstein",
    chapterLabel: "A estratégia quebra",
    title: "Einstein perde o controle do labirinto",
    location: "Acesso ao laboratório principal",
    objective: "Entrar no laboratório antes que Marcela se perca de vez para a relíquia.",
    urgency: "A presença de Marcela está cada vez mais distante e dolorosa.",
    actionLabel: "Correr para o laboratório",
    nextSceneId: "marcela-choice",
    quote: "\"Não deixem que ela me leve embora...\" voz abafada de Marcela",
    getNarrative: (progress) => [
      getEinsteinAftermathLine(progress.decisions.einstein),
      "Einstein tenta rir enquanto os espelhos caem como chuva de vidro e luz.",
      "Por trás do corredor final, a energia da relíquia pulsa com o nome de Marcela gravado em fogo dourado.",
    ],
  },
  "marcela-choice": {
    id: "marcela-choice",
    kind: "choice",
    phase: "marcela",
    chapterLabel: "Fase 3 - Confronto com Marcela",
    title: "A sala de ciências virou um santuário corrompido",
    location: "Laboratório principal",
    objective: "Decidir como se aproximar de Marcela sem quebrar o vínculo que ainda resta.",
    urgency: "A relíquia está usando as memórias da professora contra a própria turma.",
    quote: "\"Se vocês hesitarem, o CEAS vai esquecer o próprio nome.\" Marcela corrompida",
    choiceKey: "marcela",
    choices: [
      {
        id: "call-her-name",
        label: "Chamar Marcela pelo nome",
        description: "Usar a memória afetiva da turma para atravessar a corrupção.",
        nextSceneId: "marcela-challenge",
        resolveDelta: 1,
      },
      {
        id: "project-formula",
        label: "Projetar a sequência certa",
        description: "Usar matemática limpa para ferir a relíquia sem atingir Marcela.",
        nextSceneId: "marcela-challenge",
        insightDelta: 1,
      },
      {
        id: "speak-as-team",
        label: "Falar como o Sétimo A",
        description: "Lembrar que a professora ensinou cada um deles a não fugir da dificuldade.",
        nextSceneId: "marcela-challenge",
        insightDelta: 1,
        resolveDelta: 1,
      },
    ],
    getNarrative: (progress) => [
      "Tubos de ensaio flutuam no ar. O quadro espalha fórmulas sozinho. No centro da sala, Marcela luta para respirar sob a luz da relíquia.",
      `${getStoryRoleName(progress.roleId)} percebe que esse não é um duelo comum. É um resgate.`,
      "A turma inteira espera seu comando.",
    ],
  },
  "marcela-challenge": {
    id: "marcela-challenge",
    kind: "challenge",
    phase: "marcela",
    chapterLabel: "Resgate emocional",
    title: "Resolva a fórmula que rompe a corrupção",
    location: "Círculo da relíquia",
    objective: "Acertar a conta final para libertar Marcela e quebrar o domínio da relíquia.",
    urgency: "A escola inteira treme. Se esta resposta falhar, o CEAS pode apagar de vez.",
    challengeId: "marcela",
    nextSceneId: "final-choice",
    getNarrative: (progress) => [
      getRoleSceneLead(progress.roleId),
      "A fórmula final acende sobre o peito de Marcela. O número certo precisa sair agora.",
    ],
  },
  "final-choice": {
    id: "final-choice",
    kind: "choice",
    phase: "ending",
    chapterLabel: "A última decisão",
    title: "Marcela voltou. Agora a relíquia precisa cair.",
    location: "Pátio central em colapso",
    objective: "Escolher a forma final de selar a relíquia e salvar a escola.",
    urgency: "Newton tenta puxar a energia restante para uma última investida.",
    quote: "\"Não vamos perder a escola. Não hoje.\" Professora Marcela",
    choiceKey: "final",
    choices: [
      {
        id: "seal-with-formula",
        label: "Selar com a fórmula final",
        description: "Fechar a relíquia com precisão matemática e pulso firme.",
        nextSceneId: "ending",
        insightDelta: 1,
      },
      {
        id: "channel-the-class",
        label: "Canalizar a energia da turma",
        description: "Usar a unidade do Sétimo A para esmagar a última resistência.",
        nextSceneId: "ending",
        resolveDelta: 1,
      },
      {
        id: "face-newton",
        label: "Mandar Newton encarar a resposta do Sétimo A",
        description: "Confrontar o vilão com a certeza coletiva da equipe.",
        nextSceneId: "ending",
        insightDelta: 1,
        resolveDelta: 1,
      },
    ],
    getNarrative: () => [
      "Marcela cai de joelhos, livre, e segura a relíquia com as duas mãos enquanto o pátio central abre rachaduras de luz.",
      "Newton tenta surgir uma última vez do interior do metal. A escola inteira observa em silêncio tenso.",
      "O Sétimo A precisa decidir como termina esta guerra.",
    ],
  },
  ending: {
    id: "ending",
    kind: "ending",
    phase: "ending",
    chapterLabel: "CEAS salvo",
    title: "A escola respira outra vez",
    location: "Pátio central ao amanhecer",
    objective: "Rever o desfecho da campanha e preparar a próxima expansão do modo História.",
    urgency: "O eco da relíquia ainda existe. Outros capítulos poderão nascer daqui.",
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
    return "A equipe procura uma brecha enquanto a escola inteira parece respirar junto com a relíquia.";
  }

  return `${role.name} assume a ponta da formação. ${role.aura}`;
}

function getNewtonAftermathLine(choiceId: string | null) {
  if (choiceId === "read-runes") {
    return "Você desmonta a blindagem de Newton ao ler o padrão escondido nos anéis antes do impacto.";
  }

  if (choiceId === "cover-the-team") {
    return "Enquanto o Sétimo A segurava a linha, a conta certa encontrou uma abertura no centro do caos.";
  }

  return "A investida do Sétimo A quebra a postura absoluta de Newton e prova que a equipe não vai recuar.";
}

function getEinsteinAftermathLine(choiceId: string | null) {
  if (choiceId === "mark-the-floor") {
    return "As marcas no chão cortam a ilusão e fazem o labirinto perder seu domínio perfeito.";
  }

  if (choiceId === "split-in-pairs") {
    return "As duplas seguram a formação e tiram Einstein da zona de conforto pela primeira vez.";
  }

  return "Ao provocar Einstein no momento certo, o Sétimo A força o vilão a mostrar a própria falha.";
}

function getEndingNarrative(progress: StoryProgress) {
  const role = getStoryRole(progress.roleId);
  const score = getStoryScore(progress);
  const finalDecision = progress.decisions.final;
  const closingMove =
    finalDecision === "seal-with-formula"
      ? "A fórmula final fecha a relíquia com a precisão de uma assinatura impossível de apagar."
      : finalDecision === "channel-the-class"
        ? "A voz coletiva do Sétimo A atravessa o pátio e transforma coragem em energia limpa."
        : "Newton encara a resposta unida da turma e percebe tarde demais que perdeu o controle do CEAS.";

  const performanceLine =
    score >= 12
      ? "A escola volta ao normal em meio a um amanhecer nítido, como se o CEAS tivesse acabado de respirar pela primeira vez em horas."
      : score >= 9
        ? "O caos some aos poucos, mas a escola permanece de pé e a turma sabe que venceu algo enorme."
        : "Mesmo exaustos, vocês seguram o suficiente para salvar a escola e manter a relíquia longe das sombras.";

  return [
    `${role?.name ?? "A equipe"} lidera o último passo ao lado de Marcela, agora livre da corrupção.`,
    closingMove,
    "Einstein se desfaz em luz quebrada. Newton tenta resistir por um último segundo, mas a relíquia racha do centro para fora e apaga sua presença.",
    performanceLine,
    "Marcela encara o Sétimo A com os olhos marejados e diz que a escola ainda vai precisar deles. O modo História agora está pronto para crescer em novos capítulos.",
  ];
}
