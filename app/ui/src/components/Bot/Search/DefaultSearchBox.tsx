import { MagnifyingGlassIcon } from "@heroicons/react/24/outline";

interface SearchBoxProps {
  onSubmit: (query: string) => void;
  placeholder?: string;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
}

export default function DefaultSearchBox({
  onSubmit,
  placeholder = "Find that TPS report, Bob's extension, or the elusive stapler...",
  searchQuery,
  setSearchQuery,
}: SearchBoxProps) {
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(searchQuery);
  };

  return (
    <div className="flex min-h-[55vh] items-center justify-center py-12">
      <div className="w-full max-w-3xl">
        <div className="mb-6 flex flex-col items-center text-center">
          <div className="relative mb-4">
            <div
              aria-hidden="true"
              className="chat-hero-glow pointer-events-none absolute left-1/2 top-1/2 h-32 w-32 -translate-x-1/2 -translate-y-1/2"
            />
            <div className="relative flex h-12 w-12 items-center justify-center rounded-2xl border border-line bg-surface text-indigo-600 shadow-raised dark:text-indigo-300">
              <MagnifyingGlassIcon className="h-6 w-6" />
            </div>
          </div>
          <h2 className="text-xl font-semibold tracking-tight text-fg">
            Search your knowledge base
          </h2>
          <p className="mt-1 text-sm text-fg-muted">
            Ask in plain language. Results are ranked by meaning, not keywords.
          </p>
        </div>
        <form
          onSubmit={handleSearch}
          className="relative rounded-2xl border border-line-strong bg-surface shadow-raised transition focus-within:border-indigo-500 focus-within:ring-4 focus-within:ring-indigo-500/10 dark:bg-canvas"
        >
          <textarea
            placeholder={placeholder}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="block w-full resize-none rounded-2xl border-0 bg-transparent py-4 pl-4 pr-16 text-[15px] leading-relaxed text-fg outline-none ring-0 placeholder:text-fg-subtle focus:ring-0"
            rows={3}
          />
          <button
            type="submit"
            className="absolute bottom-3 right-3 flex size-10 items-center justify-center rounded-xl bg-gradient-to-b from-indigo-500 to-indigo-600 text-white shadow-brand ring-1 ring-inset ring-white/10 transition-all duration-150 hover:brightness-110 active:scale-95 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 focus-visible:ring-offset-surface"
            aria-label="Search"
          >
            <MagnifyingGlassIcon className="size-5" />
          </button>{" "}
        </form>
      </div>
    </div>
  );
}
