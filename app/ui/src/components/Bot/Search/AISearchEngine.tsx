import { NoResult, SearchResult, SkeletonSearchResult } from "./SearchResult";
import { ISearchResult } from "./types";

type Props = {
  isLoading: boolean;
  data: ISearchResult;
};

// Numbered result list shown once a search has run.
export default function AISearchEngine({ isLoading, data }: Props) {
  if (isLoading) {
    return (
      <div className="flex flex-col gap-[18px]" aria-busy="true">
        <SkeletonSearchResult />
        <SkeletonSearchResult />
        <SkeletonSearchResult />
      </div>
    );
  }

  if (data.length === 0) {
    return <NoResult />;
  }

  return (
    <div className="flex flex-col gap-3">
      <p className="m-0 text-xs text-fg-subtle">
        {data.length} {data.length === 1 ? "result" : "results"}
      </p>
      <ol className="m-0 flex list-none flex-col gap-[18px] p-0">
        {data.map((result, idx) => (
          <SearchResult
            key={idx}
            index={idx + 1}
            context={result?.result?.pageContent || ""}
            source={result?.result?.source}
            score={+result?.score}
          />
        ))}
      </ol>
    </div>
  );
}
