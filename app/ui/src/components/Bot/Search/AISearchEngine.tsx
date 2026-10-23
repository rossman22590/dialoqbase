import { MagnifyingGlassIcon } from "@heroicons/react/24/outline";
import { motion } from "framer-motion";
import { NoResult, SearchResult, SkeletonSearchResult } from "./SearchResult";
import { ISearchResult } from "./types";

type Props = {
  onSubmit: (query: string) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  isLoading: boolean;
  data: ISearchResult;
};

export default function AISearchEngine({
  onSubmit,
  searchQuery,
  setSearchQuery,
  isLoading,
  data,
}: Props) {
  return (
    <div className="mt-8 min-h-screen">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          onSubmit(searchQuery);
        }}
        className="mb-8 flex items-center gap-2 rounded-2xl border border-line-strong bg-surface p-1.5 shadow-soft transition focus-within:border-indigo-500 focus-within:ring-4 focus-within:ring-indigo-500/10 dark:bg-canvas"
      >
        <MagnifyingGlassIcon
          aria-hidden="true"
          className="ml-2.5 h-5 w-5 shrink-0 text-fg-subtle"
        />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Enter your search query..."
          className="min-w-0 flex-grow border-0 bg-transparent px-1 py-2 text-[15px] text-fg outline-none ring-0 placeholder:text-fg-subtle focus:ring-0"
        />
        <button
          type="submit"
          aria-label="Search"
          className="ui-btn-primary shrink-0"
        >
          <MagnifyingGlassIcon className="h-4 w-4 sm:hidden" />
          <span className="hidden sm:inline">Search</span>
        </button>
      </form>

      {!isLoading && data.length > 0 && (
        <p className="mb-3 text-xs font-medium text-fg-subtle">
          {data.length} {data.length === 1 ? "result" : "results"}
        </p>
      )}

      <motion.div className="space-y-4">
        {isLoading && (
          <>
            <SkeletonSearchResult />
            <SkeletonSearchResult />
            <SkeletonSearchResult />
          </>
        )}
        {!isLoading && data.length === 0 && <NoResult />}
        {!isLoading &&
          data.length > 0 &&
          data.map((result, idx) => (
            <SearchResult
              key={idx}
              context={result?.result?.pageContent}
              source={result?.result?.source}
              icon={<MagnifyingGlassIcon className="size-4" />}
              score={+result?.score}
            />
          ))}
      </motion.div>
    </div>
  );
}
