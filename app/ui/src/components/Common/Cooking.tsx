export const Cooking = () => {
  return (
    <div
      role="status"
      aria-live="polite"
      className="flex min-h-[60vh] flex-col items-center justify-center px-4 py-16 text-center"
    >
      <span
        aria-hidden="true"
        className="flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-50 text-indigo-700 dark:bg-indigo-500/10 dark:text-indigo-300"
      >
        <span className="h-5 w-5 animate-spin rounded-full border-2 border-current border-t-transparent motion-reduce:animate-none" />
      </span>
      <p className="mt-5 text-base font-semibold text-fg">
        Your bot is reading its sources
      </p>
      <p className="mt-1.5 max-w-sm text-sm text-fg-muted">
        Small files take a few seconds; whole sites can take a few minutes.
        This page updates on its own when it's ready.
      </p>
    </div>
  );
};
