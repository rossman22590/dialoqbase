import { SparklesIcon } from "@heroicons/react/24/outline";

export const Cooking = () => {
  return (
    <div
      role="status"
      aria-live="polite"
      className="flex min-h-[70vh] flex-col items-center justify-center px-4 py-16 text-center"
    >
      <div className="animate-fade-up relative">
        <div
          aria-hidden="true"
          className="chat-hero-glow pointer-events-none absolute left-1/2 top-1/2 h-48 w-48 -translate-x-1/2 -translate-y-1/2"
        />
        <div className="relative flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 to-indigo-700 text-white shadow-brand ring-1 ring-inset ring-white/15">
          <span
            aria-hidden="true"
            className="absolute inset-0 animate-ping rounded-2xl bg-indigo-500/20 [animation-duration:2.4s] motion-reduce:hidden"
          />
          <SparklesIcon className="relative h-6 w-6" aria-hidden="true" />
        </div>
      </div>
      <p
        className="animate-fade-up mt-6 text-lg text-fg font-semibold tracking-tight"
        style={{ animationDelay: "60ms" }}
      >
        Bot is cooking...
      </p>
      <span
        className="animate-fade-up mt-1.5 max-w-xs text-sm leading-relaxed text-fg-muted"
        style={{ animationDelay: "120ms" }}
      >
        It may take some time. We're processing your data sources and this
        page will update when it's ready.
      </span>
      <div
        aria-hidden="true"
        className="animate-fade-up mt-6 h-1 w-48 overflow-hidden rounded-full bg-surface-3"
        style={{ animationDelay: "180ms" }}
      >
        <div className="h-full w-full animate-shimmer bg-gradient-to-r from-transparent via-indigo-500 to-transparent bg-[length:200%_100%] motion-reduce:animate-none" />
      </div>
    </div>
  );
};
