import { motion } from "framer-motion";
import { useState } from "react";
import { MagnifyingGlassIcon } from "@heroicons/react/24/outline";

export interface SearchResultProps {
  context: string;
  source: string;
  icon: React.ReactNode;
  score: number;
}

export function SearchResult({
  context,
  source,
  icon,
  score,
}: SearchResultProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const maxLength = 300;

  const toggleReadMore = () => {
    setIsExpanded(!isExpanded);
  };

  const truncatedContext = isExpanded ? context : context.slice(0, maxLength);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="overflow-hidden rounded-2xl border border-line bg-surface shadow-soft transition-all duration-200 hover:border-line-strong hover:shadow-raised"
    >
      <div className="px-5 pt-4">
        <div className="mb-2.5 flex min-w-0 items-center gap-2 text-xs font-medium text-fg-muted">
          <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-indigo-50 text-indigo-600 ring-1 ring-inset ring-indigo-100 dark:bg-indigo-500/10 dark:text-indigo-300 dark:ring-indigo-400/20 [&_svg]:h-3.5 [&_svg]:w-3.5">
            {icon}
          </span>
          <span className="truncate" title={source}>
            {source}
          </span>
        </div>
        <p className="mb-4 break-words text-sm leading-relaxed text-fg">
          {truncatedContext}
          {context.length > maxLength && (
            <>
              {!isExpanded && "..."}
              <button
                onClick={toggleReadMore}
                className="ml-2 font-medium text-indigo-600 hover:underline focus:outline-none focus-visible:underline dark:text-indigo-400"
              >
                {isExpanded ? "Read less" : "Read more"}
              </button>
            </>
          )}
        </p>
      </div>
      <div className="flex items-center justify-end gap-3 border-t border-line bg-surface-2/50 px-5 py-2.5">
        <span className="text-xs text-fg-subtle">Similarity</span>
        <span className="h-1.5 w-20 overflow-hidden rounded-full bg-surface-3">
          <span
            className="block h-full rounded-full bg-gradient-to-r from-indigo-400 to-indigo-600"
            style={{ width: `${Math.max(0, Math.min(100, score))}%` }}
          />
        </span>
        <span className="text-xs font-medium tabular-nums text-fg-muted">
          {`${score}%`}
        </span>
      </div>
    </motion.div>
  );
}
export function SkeletonSearchResult() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="rounded-2xl border border-line bg-surface p-5 shadow-soft"
    >
      <div className="mb-4 flex items-center">
        <div className="skeleton mr-2 h-6 w-6 rounded-md"></div>
        <div className="skeleton h-3 w-1/4 rounded"></div>
      </div>
      <div className="skeleton mb-2 h-3.5 w-full rounded"></div>
      <div className="skeleton mb-2 h-3.5 w-full rounded"></div>
      <div className="skeleton h-3.5 w-1/2 rounded"></div>
    </motion.div>
  );
}

export const NoResult = () => (
  <div className="flex flex-col items-center rounded-2xl border border-dashed border-line-strong px-6 py-14 text-center">
    <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-surface shadow-soft ring-1 ring-line">
      <MagnifyingGlassIcon className="h-5 w-5 text-fg-subtle" />
    </span>
    <p className="mt-3 text-sm font-medium text-fg">No results found</p>
    <p className="mt-1 text-xs text-fg-subtle">
      Try adjusting your search query
    </p>
  </div>
);
