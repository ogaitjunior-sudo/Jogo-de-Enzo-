import { playDefeat } from '@/game/sounds';
import { useEffect } from 'react';

interface Props {
  score: number;
  onMenu: () => void;
  onRetry: () => void;
}

export default function DefeatScreen({ score, onMenu, onRetry }: Props) {
  useEffect(() => { playDefeat(); }, []);

  return (
    <div className="min-h-screen bg-title-screen flex items-center justify-center px-4">
      <div className="text-center animate-slide-up">
        <div className="text-7xl mb-4">💀</div>
        <h1 className="text-4xl md:text-5xl font-display font-black text-destructive mb-4">
          DERROTA
        </h1>
        <p className="text-foreground font-body text-xl mb-2">
          A matemática precisa de você... Tente novamente!
        </p>
        <p className="text-muted-foreground font-body mb-8">
          Pontuação: <span className="text-primary font-bold text-2xl">{score}</span>
        </p>
        <div className="flex gap-4 justify-center">
          <button
            onClick={onRetry}
            className="px-8 py-3 rounded-xl bg-primary text-primary-foreground font-display font-bold text-lg hover:scale-105 transition-transform"
          >
            🔄 Tentar Novamente
          </button>
          <button
            onClick={onMenu}
            className="px-8 py-3 rounded-xl bg-muted text-foreground font-display font-bold text-lg hover:scale-105 transition-transform"
          >
            Menu
          </button>
        </div>
      </div>
    </div>
  );
}
