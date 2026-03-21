"use client";

interface PageShellProps {
  title?: string;
  children: React.ReactNode;
  actions?: React.ReactNode;
  /** When true, renders only the outer width-constrained container without a card wrapper.
   *  Useful for pages that need multiple cards or custom inner layouts. */
  bare?: boolean;
}

export default function PageShell({ title, children, actions, bare }: PageShellProps) {
  if (bare) {
    return (
      <div className="max-w-5xl mx-auto px-4 mt-8 animate-fade-in">
        {children}
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center animate-fade-in">
      <div className="w-full max-w-5xl px-4 mt-8">
        <div className="bg-surface-800 border border-white/[0.04] rounded-2xl p-5 md:p-8 shadow-card">
          {title && (
            <div className="flex items-center justify-between mb-6">
              <h1 className="font-display text-2xl font-bold tracking-tight">{title}</h1>
              {actions}
            </div>
          )}
          {children}
        </div>
      </div>
    </div>
  );
}
