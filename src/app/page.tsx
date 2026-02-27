export default function Home() {
  return (
    <div className="flex min-h-[calc(100vh-3.5rem)] flex-col items-center justify-center px-6">
      <h1 className="font-display text-5xl tracking-tight md:text-7xl">
        Lady Bandit Studios
      </h1>
      <p className="mt-4 max-w-md text-center text-lg text-secondary">
        Design studio. Infinite canvas coming soon.
      </p>
      <div className="mt-12 flex flex-col items-center gap-8">
        <div className="flex flex-wrap justify-center gap-4">
          <Swatch label="Background" className="bg-background" />
          <Swatch label="Surface" className="bg-surface" />
          <Swatch label="Elevated" className="bg-elevated" />
          <Swatch label="Accent" className="bg-accent" />
        </div>
        <div className="flex flex-wrap justify-center gap-6 text-sm">
          <span className="text-foreground">Foreground</span>
          <span className="text-secondary">Secondary</span>
          <span className="text-muted">Muted</span>
          <span className="text-accent">Accent</span>
        </div>
        <p className="font-display text-2xl italic text-secondary">
          Instrument Serif Display
        </p>
        <p className="text-base text-secondary">DM Sans Body Text</p>
      </div>
    </div>
  );
}

function Swatch({
  label,
  className,
}: {
  label: string;
  className: string;
}) {
  return (
    <div className="flex flex-col items-center gap-2">
      <div
        className={`h-16 w-16 rounded-lg border border-border ${className}`}
      />
      <span className="text-xs text-muted">{label}</span>
    </div>
  );
}
