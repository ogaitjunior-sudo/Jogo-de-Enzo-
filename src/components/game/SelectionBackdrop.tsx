export default function SelectionBackdrop() {
  return (
    <>
      <img
        src="/brain-battle-select.png"
        alt=""
        aria-hidden="true"
        loading="eager"
        fetchPriority="high"
        decoding="async"
        className="absolute inset-0 z-0 h-full w-full object-cover object-center opacity-[0.32]"
      />
      <div className="absolute inset-0 z-0 bg-[linear-gradient(180deg,rgba(16,31,82,0.82)_0%,rgba(16,25,56,0.9)_38%,rgba(10,14,28,0.96)_100%)]" />
      <div className="absolute inset-0 z-0 bg-[radial-gradient(circle_at_top,rgba(104,162,255,0.24),transparent_34%),radial-gradient(circle_at_bottom,rgba(255,138,54,0.12),transparent_30%)]" />
      <div className="absolute inset-x-0 top-0 z-0 h-52 bg-[linear-gradient(180deg,rgba(163,203,255,0.2)_0%,rgba(163,203,255,0)_100%)]" />
    </>
  );
}
