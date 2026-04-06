interface HPBarProps {
  current: number;
  max: number;
  label: string;
  variant: 'player' | 'enemy';
}

export default function HPBar({ current, max, label, variant }: HPBarProps) {
  const pct = Math.max(0, (current / max) * 100);
  const barColor = variant === 'player' ? 'bg-hp-player' : 'bg-hp-enemy';
  const bgColor = variant === 'player' ? 'bg-hp-player/20' : 'bg-hp-enemy/20';
  const frameGlow =
    variant === "player"
      ? "shadow-[0_10px_24px_rgba(16,185,129,0.08)]"
      : "shadow-[0_10px_24px_rgba(239,68,68,0.08)]";

  return (
    <div className={`w-full rounded-2xl border border-white/10 bg-slate-950/55 px-3 py-2 backdrop-blur-sm ${frameGlow}`}>
      <div className="mb-1.5 flex items-center justify-between gap-3 text-[11px] font-body font-bold uppercase tracking-[0.18em]">
        <span className="text-white/92">{label}</span>
        <span className="text-white/88">{current}/{max} HP</span>
      </div>
      <div className={`h-3.5 overflow-hidden rounded-full border border-white/10 ${bgColor}`}>
        <div
          className={`h-full rounded-full ${barColor} shadow-[0_0_14px_rgba(255,255,255,0.08)] transition-all duration-500 ease-out`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}
