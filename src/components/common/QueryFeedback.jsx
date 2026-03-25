import { Loader2, RefreshCw, Inbox } from "lucide-react";

export function SectionSkeleton({ label = "Loading..." }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 gap-4">
      <Loader2 className="animate-spin text-gold" size={40} />
      <p className="text-text-muted font-body">{label}</p>
    </div>
  );
}

export function ErrorState({ message = "Failed to load data.", onRetry }) {
  return (
    <div className="text-center py-14 glass rounded-xl border border-red-500/20 bg-red-500/5">
      <p className="text-red-400 font-body mb-4">{message}</p>
      {onRetry ? (
        <button onClick={onRetry} className="btn-gold px-6 py-2 text-sm inline-flex items-center gap-2">
          <RefreshCw size={14} /> Retry
        </button>
      ) : null}
    </div>
  );
}

export function EmptyState({ title = "No data yet", description = "Nothing to show right now." }) {
  return (
    <div className="glass rounded-xl border border-border/10 py-14 px-6 text-center">
      <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-muted/30">
        <Inbox size={22} className="text-text-muted" />
      </div>
      <p className="text-foreground font-display font-semibold mb-1">{title}</p>
      <p className="text-text-muted font-body text-sm">{description}</p>
    </div>
  );
}
