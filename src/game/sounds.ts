declare global {
  interface Window {
    webkitAudioContext?: typeof AudioContext;
  }
}

const AudioContextConstructor =
  typeof window !== "undefined" ? window.AudioContext ?? window.webkitAudioContext : undefined;

const audioCtx = AudioContextConstructor ? new AudioContextConstructor() : null;

function playTone(
  frequency: number,
  duration: number,
  type: OscillatorType = "square",
  volume = 0.15,
) {
  if (!audioCtx) {
    return;
  }

  const oscillator = audioCtx.createOscillator();
  const gainNode = audioCtx.createGain();

  oscillator.type = type;
  oscillator.frequency.value = frequency;
  gainNode.gain.value = volume;
  gainNode.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + duration);

  oscillator.connect(gainNode);
  gainNode.connect(audioCtx.destination);
  oscillator.start();
  oscillator.stop(audioCtx.currentTime + duration);
}

export function playCorrect() {
  playTone(523, 0.1, "square");
  window.setTimeout(() => playTone(659, 0.1, "square"), 100);
  window.setTimeout(() => playTone(784, 0.2, "square"), 200);
}

export function playWrong() {
  playTone(200, 0.3, "sawtooth", 0.1);
  window.setTimeout(() => playTone(150, 0.3, "sawtooth", 0.1), 150);
}

export function playVictory() {
  [523, 587, 659, 784, 880, 1047].forEach((frequency, index) => {
    window.setTimeout(() => playTone(frequency, 0.2, "square", 0.12), index * 120);
  });
}

export function playDefeat() {
  [400, 350, 300, 250, 200].forEach((frequency, index) => {
    window.setTimeout(() => playTone(frequency, 0.3, "sawtooth", 0.08), index * 200);
  });
}

export function playClick() {
  playTone(800, 0.05, "sine", 0.1);
}
