import SelectionBackdrop from "@/components/game/SelectionBackdrop";
import { DIFFICULTY_CONFIGS, formatTimeLimit } from "@/game/progression";
import { playClick } from "@/game/sounds";
import { Difficulty } from "@/game/types";

interface Props {
  onSelect: (difficulty: Difficulty) => void;
  onBack: () => void;
}

const difficultyIcons: Record<Difficulty, string> = {
  facil: "🟢",
  medio: "🟡",
  dificil: "🔴",
  impossivel: "💀",
};

const difficultyOrder: Difficulty[] = ["facil", "medio", "dificil", "impossivel"];

export default function DifficultySelect({ onSelect, onBack }: Props) {
  return (
    <div className="relative h-[100svh] overflow-hidden bg-[linear-gradient(180deg,#223f86_0%,#151f45_45%,#0b1020_100%)] px-4 py-4 md:py-5">
      <SelectionBackdrop />

      <div className="relative z-10 mx-auto flex h-full max-w-5xl flex-col">
        <div className="shrink-0 pt-1 text-center">
          <p className="text-xs font-body uppercase tracking-[0.35em] text-primary/90 drop-shadow-[0_2px_12px_rgba(0,0,0,0.45)]">
            Ajuste da campanha
          </p>
          <h2 className="mt-2 font-display text-4xl font-black text-primary drop-shadow-[0_6px_24px_rgba(0,0,0,0.42)] md:text-5xl">
            Escolha a dificuldade
          </h2>
          <p className="mx-auto mt-3 max-w-2xl text-sm font-body leading-6 text-white/86 md:text-base">
            Facil continua facil ate o fim. Medio continua medio ate o fim. So dificil e
            impossivel aceleram mais forte quando o jogador domina o conteudo.
          </p>
        </div>

        <div className="flex flex-1 items-center">
          <div className="grid w-full gap-3 md:grid-cols-2">
            {difficultyOrder.map((difficulty) => {
              const config = DIFFICULTY_CONFIGS[difficulty];

              return (
                <button
                  key={difficulty}
                  type="button"
                  onClick={() => {
                    playClick();
                    onSelect(difficulty);
                  }}
                  className="rounded-[1.75rem] border border-white/14 bg-slate-950/62 p-4 text-left backdrop-blur-[4px] transition-all hover:-translate-y-1 hover:border-primary/45 hover:bg-slate-950/76 hover:shadow-[0_24px_80px_hsl(45_100%_55%/0.1)]"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-[10px] font-body uppercase tracking-[0.32em] text-primary/85">
                        {config.shortLabel}
                      </p>
                      <h3 className="mt-2 font-display text-2xl font-black text-white">
                        {config.label}
                      </h3>
                    </div>
                    <span className="text-3xl">{difficultyIcons[difficulty]}</span>
                  </div>

                  <p className="mt-3 text-sm font-body leading-6 text-white/84">
                    {config.description}
                  </p>

                  <div className="mt-4 grid gap-3 sm:grid-cols-2">
                    <div className="rounded-2xl border border-white/12 bg-white/6 px-4 py-3">
                      <p className="text-[10px] font-body uppercase tracking-[0.28em] text-primary/80">
                        Resistencia
                      </p>
                      <p className="mt-1.5 text-sm font-body text-white/88">
                        HP {config.playerHp} · dano recebido {config.damageToPlayer}
                      </p>
                    </div>
                    <div className="rounded-2xl border border-white/12 bg-white/6 px-4 py-3">
                      <p className="text-[10px] font-body uppercase tracking-[0.28em] text-primary/80">
                        Ritmo
                      </p>
                      <p className="mt-1.5 text-sm font-body text-white/88">
                        {formatTimeLimit(config.timeLimit)}
                      </p>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        <div className="mt-5 shrink-0 text-center">
          <button
            type="button"
            onClick={() => {
              playClick();
              onBack();
            }}
            className="text-sm font-body font-semibold text-white/78 transition-colors hover:text-white"
          >
            Voltar
          </button>
        </div>
      </div>
    </div>
  );
}
