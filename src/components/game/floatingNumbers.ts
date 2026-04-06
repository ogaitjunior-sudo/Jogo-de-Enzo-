export interface FloatingNumber {
  id: number;
  value: string;
  x: number;
  y: number;
  type: "damage" | "critical" | "combo";
}

let floatingId = 0;

export function createFloatingNumber(
  value: string,
  type: FloatingNumber["type"],
  x?: number,
  y?: number,
): FloatingNumber {
  floatingId += 1;

  return {
    id: floatingId,
    value,
    type,
    x: x ?? 40 + Math.random() * 20,
    y: y ?? 30 + Math.random() * 15,
  };
}
