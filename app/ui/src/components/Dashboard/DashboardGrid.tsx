import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import api from "../../services/api";
import {
  ChevronRightIcon,
  ExclamationTriangleIcon,
  MagnifyingGlassIcon,
  PlusIcon,
  SparklesIcon,
} from "@heroicons/react/24/outline";
import { sources } from "../../utils/sources";
import { useMemo, useState } from "react";
import { EmptyState, Skeleton } from "../ui";

export const DashboardGrid = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const { data, status } = useQuery(["getAllBots"], async () => {
    const response = await api.get("/bot");
    return response.data;
  });

  const filteredData = useMemo(() => {
    if (!data) return [];
    return data.filter((bot: any) =>
      bot.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [data, searchQuery]);

  return (
    <div className="mt-8">
      {status === "success" && data.length > 0 && (
        <div
          className="animate-fade-up mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"
          style={{ animationDelay: "60ms" }}
        >
          <div className="group relative w-full sm:max-w-sm">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5">
              <MagnifyingGlassIcon
                className="h-4 w-4 text-fg-subtle transition-colors group-focus-within:text-indigo-500"
                aria-hidden="true"
              />
            </div>
            <input
              type="text"
              placeholder="Search your bots..."
              autoComplete="off"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              aria-label="Search your bots"
              className="ui-input h-10 pl-10"
            />
          </div>
          <p className="text-xs tabular-nums text-fg-subtle">
            {searchQuery
              ? `${filteredData.length} of ${data.length} bots`
              : `${data.length} ${data.length === 1 ? "bot" : "bots"}`}
          </p>
        </div>
      )}

      {status === "loading" && (
        <div className="grid grid-cols-1 gap-4 sm:gap-5 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3, 4, 5, 6].map((item) => (
            <div
              className="ui-card animate-fade-in overflow-hidden"
              style={{ animationDelay: `${item * 50}ms` }}
              key={item}
            >
              <div className="flex items-center gap-3.5 p-5">
                <Skeleton className="h-10 w-10 rounded-xl" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-2/3" />
                  <Skeleton className="h-3.5 w-24 rounded-full" />
                </div>
              </div>
              <div className="flex gap-2 border-t border-line px-5 py-3.5">
                <Skeleton className="h-5 w-16 rounded-full" />
                <Skeleton className="h-5 w-12 rounded-full" />
              </div>
            </div>
          ))}
        </div>
      )}

      {status === "success" && data.length === 0 && (
        <div className="rounded-2xl border border-dashed border-line-strong bg-surface/60">
          <EmptyState
            className="py-16"
            icon={<SparklesIcon />}
            title="Create your first bot"
            description="Point a bot at a website, documents or an API and it will answer questions using that knowledge."
            action={
              <Link to="/new" className="ui-btn-primary">
                <PlusIcon aria-hidden="true" />
                Create new bot
              </Link>
            }
          />
        </div>
      )}

      {status === "success" && data.length > 0 && (
        <>
          {filteredData.length === 0 ? (
            <div className="ui-card">
              <EmptyState
                icon={<MagnifyingGlassIcon />}
                title="No bots match your search"
                description={`Nothing is named like "${searchQuery}". Try a different search term.`}
              />
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4 sm:gap-5 md:grid-cols-2 lg:grid-cols-3">
              {filteredData.map((bot: any, index: number) => (
                <Link
                  to={`/bot/${bot.id}`}
                  className="ui-card ui-card-hover animate-fade-up group flex min-w-0 flex-col overflow-hidden focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 focus-visible:ring-offset-app"
                  style={{ animationDelay: `${100 + Math.min(index, 12) * 40}ms` }}
                  key={bot.id}
                >
                  <div className="flex items-center gap-3.5 p-5">
                    <div
                      aria-hidden="true"
                      className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-indigo-700 text-[15px] font-semibold text-white shadow-brand ring-1 ring-inset ring-white/15"
                    >
                      {String(bot.name || "?").trim().charAt(0).toUpperCase() ||
                        "?"}
                    </div>
                    <div className="min-w-0 flex-1">
                      <h3 className="truncate text-[15px] font-semibold tracking-tight text-fg transition-colors group-hover:text-indigo-600 dark:group-hover:text-indigo-300">
                        {bot.name}
                      </h3>
                      <div className="mt-1 flex min-w-0">
                        <span className="ui-badge ui-badge-neutral max-w-full">
                          <span className="truncate">
                            {bot.model
                              .replace("-dbase", "")
                              .replace(/_dialoqbase_[0-9]+$/, "")}
                          </span>
                        </span>
                      </div>
                    </div>
                    <ChevronRightIcon
                      className="h-4 w-4 shrink-0 text-fg-subtle transition-all duration-200 ease-out group-hover:translate-x-0.5 group-hover:text-indigo-500"
                      aria-hidden="true"
                    />
                  </div>

                  <div className="mt-auto flex flex-wrap gap-1.5 border-t border-line bg-surface-2/40 px-5 py-3">
                    {bot.source.map((source: any, idx: number) => (
                      <span
                        title={`${source.type} source`}
                        key={idx}
                        className="inline-flex items-center gap-1.5 rounded-full border border-line bg-surface px-2 py-0.5 text-[11px] font-medium capitalize text-fg-muted [&_svg]:h-3 [&_svg]:w-3 [&_svg]:text-fg-subtle"
                      >
                        {sources[source.type as keyof typeof sources]}
                        {source.type}
                      </span>
                    ))}
                  </div>
                </Link>
              ))}
            </div>
          )}
        </>
      )}

      {status === "error" && (
        <div className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-red-700 dark:border-red-500/20 dark:bg-red-500/10 dark:text-red-300">
          <ExclamationTriangleIcon
            className="mt-0.5 h-5 w-5 shrink-0"
            aria-hidden="true"
          />
          <div>
            <h3 className="text-sm font-medium">
              Something went wrong while loading your bots
            </h3>
            <p className="mt-0.5 text-sm opacity-80">
              Please refresh the page or try again in a moment.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
