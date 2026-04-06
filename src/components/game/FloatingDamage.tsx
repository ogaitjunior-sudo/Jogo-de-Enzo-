import { FloatingNumber } from "./floatingNumbers";

interface Props {
  numbers: FloatingNumber[];
}

export default function FloatingDamage({ numbers }: Props) {
  return (
    <div className="pointer-events-none fixed inset-0 z-50 overflow-hidden">
      {numbers.map((number) => (
        <div
          key={number.id}
          className={`absolute animate-float-damage font-display font-black text-2xl md:text-3xl ${
            number.type === "critical"
              ? "text-energy-gold text-4xl md:text-5xl"
              : number.type === "combo"
                ? "text-energy-purple text-3xl md:text-4xl"
                : "text-destructive"
          }`}
          style={{ left: `${number.x}%`, top: `${number.y}%` }}
        >
          {number.value}
        </div>
      ))}
    </div>
  );
}
