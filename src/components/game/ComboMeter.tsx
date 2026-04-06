interface Props {
  combo: number;
}

export default function ComboMeter({ combo }: Props) {
  if (combo < 2) {
    return null;
  }

  const toneClass =
    combo >= 5
      ? "border-energy-gold bg-energy-gold/20 text-energy-gold"
      : combo >= 3
        ? "border-energy-purple bg-energy-purple/20 text-energy-purple"
        : "border-accent bg-accent/20 text-accent";

  const label =
    combo >= 5 ? "Combo critico" : combo >= 3 ? "Combo em ritmo" : "Combo iniciado";

  return (
    <div className="flex justify-center">
      <div
        className={`inline-flex items-center gap-2 rounded-full border px-4 py-1.5 font-display text-sm font-bold shadow-[0_10px_28px_rgba(0,0,0,0.2)] backdrop-blur-sm ${toneClass}`}
      >
        <span>{"\u{1F525}"}</span>
        <span>
          {label} x{combo}
        </span>
      </div>
    </div>
  );
}
