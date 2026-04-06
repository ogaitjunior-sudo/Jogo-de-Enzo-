import { getRanking } from "@/game/ranking";
import { DIFFICULTY_CONFIGS } from "@/game/progression";
import { getCharacterName } from "@/game/roster";
import { playClick } from "@/game/sounds";

interface Props {
  onBack: () => void;
}

export default function RankingScreen({ onBack }: Props) {
  const ranking = getRanking();

  return (
    <div className="min-h-screen bg-title-screen px-4 py-8">
      <div className="mx-auto flex min-h-[calc(100vh-4rem)] max-w-4xl flex-col justify-center">
        <div className="mb-8 text-center">
          <p className="text-xs font-body uppercase tracking-[0.35em] text-primary/70">
            Hall da academia
          </p>
          <h2 className="mt-3 font-display text-4xl font-black text-primary md:text-5xl">
            Ranking
          </h2>
        </div>

        <div className="rounded-[2rem] border border-border/45 bg-card/60 p-5 md:p-6">
          {ranking.length === 0 ? (
            <p className="py-12 text-center text-base font-body text-muted-foreground">
              Nenhuma campanha registrada ainda.
            </p>
          ) : (
            <div className="space-y-3">
              {ranking.map((entry, index) => (
                <div
                  key={`${entry.name}-${entry.score}-${index}`}
                  className="grid gap-3 rounded-2xl border border-border/30 bg-background/18 p-4 md:grid-cols-[auto_1fr_auto]"
                >
                  <div className="flex h-11 w-11 items-center justify-center rounded-full bg-primary/12 font-display text-lg font-black text-primary">
                    {index === 0 ? "🥇" : index === 1 ? "🥈" : index === 2 ? "🥉" : index + 1}
                  </div>

                  <div>
                    <p className="font-display text-lg font-bold text-foreground">
                      {getCharacterName(entry.character)}
                    </p>
                    <p className="mt-1 text-sm font-body text-muted-foreground">
                      {DIFFICULTY_CONFIGS[entry.difficulty].label} · {entry.date}
                    </p>
                  </div>

                  <div className="text-left md:text-right">
                    <p className="text-[10px] font-body uppercase tracking-[0.28em] text-primary/65">
                      Pontos
                    </p>
                    <p className="mt-1 font-display text-2xl font-black text-primary">{entry.score}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="mt-8 text-center">
          <button
            onClick={() => {
              playClick();
              onBack();
            }}
            className="text-sm font-body font-semibold text-muted-foreground transition-colors hover:text-foreground"
          >
            ← Voltar
          </button>
        </div>
      </div>
    </div>
  );
}
