import { useState } from "react";
import { sourceName } from "../Playground/useCurrentBot";

export interface SearchResultProps {
  index: number;
  context: string;
  source: string;
  score: number;
}

export function SearchResult({
  index,
  context,
  source,
  score,
}: SearchResultProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const maxLength = 300;

  const toggleReadMore = () => {
    setIsExpanded(!isExpanded);
  };

  const truncatedContext = isExpanded ? context : context.slice(0, maxLength);
  const name = sourceName({ metadata: { source } });
  const isUrl = /^https?:\/\//i.test(source || "");

  return (
    <li className="flex min-w-0 flex-col gap-1">
      <span className="text-xs tabular-nums text-fg-subtle">
        {index}
        {Number.isFinite(score) && ` · ${score}% match`}
      </span>
      {isUrl ? (
        <a
          href={source}
          target="_blank"
          rel="noreferrer"
          title={source}
          className="truncate text-base font-medium text-indigo-700 hover:text-indigo-800 dark:text-indigo-300 dark:hover:text-indigo-200"
        >
          {name}
        </a>
      ) : (
        <span
          title={source}
          className="truncate text-base font-medium text-fg"
        >
          {name}
        </span>
      )}
      <p className="m-0 break-words text-sm leading-[1.55] text-fg-muted">
        {truncatedContext}
        {context.length > maxLength && (
          <>
            {!isExpanded && "…"}
            <button
              type="button"
              onClick={toggleReadMore}
              className="ml-1.5 font-medium text-indigo-700 hover:underline focus:outline-none focus-visible:underline dark:text-indigo-300"
            >
              {isExpanded ? "Read less" : "Read more"}
            </button>
          </>
        )}
      </p>
    </li>
  );
}

export function SkeletonSearchResult() {
  return (
    <div className="flex flex-col gap-2" aria-hidden="true">
      <div className="skeleton h-3 w-24 rounded" />
      <div className="skeleton h-4 w-1/3 rounded" />
      <div className="skeleton h-3.5 w-full rounded" />
      <div className="skeleton h-3.5 w-2/3 rounded" />
    </div>
  );
}

export const NoResult = () => (
  <div className="rounded-xl border border-dashed border-line-strong px-6 py-10 text-center">
    <p className="m-0 text-sm font-medium text-fg">No results found</p>
    <p className="m-0 mt-1 text-xs text-fg-subtle">
      Try different words, or check that the bot has sources.
    </p>
  </div>
);
