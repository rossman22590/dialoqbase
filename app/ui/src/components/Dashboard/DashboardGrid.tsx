import { useQuery } from "@tanstack/react-query";
import { Link, useNavigate } from "react-router-dom";
import api from "../../services/api";
import {
  EllipsisHorizontalIcon,
  ExclamationTriangleIcon,
  MagnifyingGlassIcon,
  PlusIcon,
  SparklesIcon,
} from "@heroicons/react/24/outline";
import { useEffect, useMemo, useState } from "react";
import { Dropdown } from "antd";
import dayjs from "dayjs";
import { EmptyState, Skeleton } from "../ui";
import { BotAvatarTile } from "../../Layout/BotLayout";

type View = "grid" | "list";
type Sort = "active" | "created" | "name";

const VIEW_KEY = "botcraft_dashboard_view";

const SOURCE_LABELS: Record<string, string> = {
  website: "Website",
  text: "Text",
  pdf: "PDF",
  docx: "Word",
  csv: "CSV",
  txt: "Text file",
  crawl: "Crawl",
  github: "GitHub",
  youtube: "YouTube",
  mp3: "Audio",
  mp4: "Video",
  rest: "REST API",
  sitemap: "Sitemap",
  zip: "Zip",
  json: "JSON",
};

const cleanModel = (model?: string) =>
  (model || "")
    .replace("-dbase", "")
    .replace(/_dialoqbase_[0-9]+$/, "")
    .replace(/^[^/]+\//, "");

// `/bot` returns one entry per distinct source type, so this lists the kinds
// of sources a bot has rather than a count of them.
const sourcesLine = (bot: any) => {
  const types: string[] = Array.from(
    new Set((bot.source || []).map((s: any) => String(s.type)))
  );
  if (types.length === 0) return "No sources yet";
  return `Sources: ${types
    .map((t) => SOURCE_LABELS[t] || t.charAt(0).toUpperCase() + t.slice(1))
    .join(", ")}`;
};

const createdLine = (bot: any) =>
  bot.createdAt ? `Created ${dayjs(bot.createdAt).format("MMM D, YYYY")}` : "";

// "214 chats this week" (web, playground and WhatsApp conversations).
const chatsLine = (bot: any) => {
  if (typeof bot.chats_7d !== "number") return "";
  if (bot.chats_7d === 0) return "No chats this week";
  return `${bot.chats_7d.toLocaleString()} ${
    bot.chats_7d === 1 ? "chat" : "chats"
  } this week`;
};

const ago = (date: string) => {
  const mins = Math.max(0, Math.round((Date.now() - new Date(date).getTime()) / 60000));
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.round(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.round(hours / 24);
  if (days === 1) return "yesterday";
  if (days < 7) return `${days} days ago`;
  if (days < 30) return `${Math.round(days / 7)} weeks ago`;
  return dayjs(date).format("MMM D");
};

// "Active 2h ago", falling back to the creation date for unused bots.
const activeLine = (bot: any) =>
  bot.last_active_at ? `Active ${ago(bot.last_active_at)}` : createdLine(bot);

const BotActions = ({ bot }: { bot: any }) => {
  const navigate = useNavigate();
  const items = [
    { key: "", label: "Open playground" },
    { key: "/data-sources", label: "Data sources" },
    { key: "/settings", label: "Settings" },
    { key: "/embed", label: "Embed" },
    { key: "/integrations", label: "Integrations" },
    { key: "/usage", label: "Usage" },
  ];
  return (
    <Dropdown
      trigger={["click"]}
      placement="bottomRight"
      menu={{
        items,
        onClick: ({ key }) => navigate(`/bot/${bot.id}${key}`),
      }}
    >
      <button
        type="button"
        aria-label={`Actions for ${bot.name}`}
        className="ui-btn-ghost relative z-10 h-8 w-8 shrink-0 px-0"
      >
        <EllipsisHorizontalIcon aria-hidden="true" />
      </button>
    </Dropdown>
  );
};

// Stretched link: the whole card is clickable, the actions button stays on top.
const botLinkClass =
  "text-fg no-underline after:absolute after:inset-0 after:rounded-xl after:content-[''] hover:text-fg focus:outline-none focus-visible:after:ring-2 focus-visible:after:ring-indigo-500";

const BotCard = ({ bot }: { bot: any }) => (
  <article className="relative flex min-w-0 flex-col rounded-xl border border-line bg-surface transition-colors hover:border-line-strong">
    <div className="flex items-start gap-3 pb-3 pl-4 pr-3 pt-4">
      <BotAvatarTile name={bot.name} id={bot.id} size={36} />
      <div className="min-w-0 flex-1">
        <h3 className="truncate text-[15px] font-semibold">
          <Link to={`/bot/${bot.id}`} className={botLinkClass}>
            {bot.name}
          </Link>
        </h3>
        <p className="mt-0.5 truncate text-xs text-fg-subtle">
          {cleanModel(bot.model)}
        </p>
      </div>
      <BotActions bot={bot} />
    </div>
    <p className="px-4 pb-3 text-[13px] text-fg-muted">{sourcesLine(bot)}</p>
    <div className="mt-auto flex justify-between gap-2 border-t border-line px-4 py-2.5 text-xs text-fg-subtle">
      <span>{chatsLine(bot)}</span>
      <span>{activeLine(bot)}</span>
    </div>
  </article>
);

const BotRow = ({ bot }: { bot: any }) => (
  <li className="relative flex items-center gap-3 py-3 pl-4 pr-3 transition-colors hover:bg-surface-2/60">
    <BotAvatarTile name={bot.name} id={bot.id} size={32} />
    <div className="min-w-0 flex-1">
      <h3 className="truncate text-sm font-semibold">
        <Link to={`/bot/${bot.id}`} className={botLinkClass}>
          {bot.name}
        </Link>
      </h3>
      <p className="mt-0.5 truncate text-xs text-fg-subtle">
        {cleanModel(bot.model)}
      </p>
    </div>
    <p className="hidden w-64 truncate text-[13px] text-fg-muted md:block">
      {sourcesLine(bot)}
    </p>
    <p className="hidden w-36 text-right text-xs text-fg-subtle lg:block">
      {chatsLine(bot)}
    </p>
    <p className="hidden w-36 text-right text-xs text-fg-subtle sm:block">
      {activeLine(bot)}
    </p>
    <BotActions bot={bot} />
  </li>
);

const gridClass =
  "grid gap-4 [grid-template-columns:repeat(auto-fill,minmax(min(300px,100%),1fr))]";

export const DashboardGrid = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [sort, setSort] = useState<Sort>("active");
  const [view, setView] = useState<View>(() => {
    try {
      return localStorage.getItem(VIEW_KEY) === "list" ? "list" : "grid";
    } catch {
      return "grid";
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(VIEW_KEY, view);
    } catch {
      // Storage may be unavailable; the view still works for this visit.
    }
  }, [view]);

  const { data, status } = useQuery(["getAllBots"], async () => {
    const response = await api.get("/bot");
    return response.data;
  });

  const filteredData = useMemo(() => {
    if (!data) return [];
    const matches = data.filter((bot: any) =>
      bot.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
    // The API already returns newest first.
    if (sort === "active") {
      const t = (b: any) =>
        b.last_active_at ? new Date(b.last_active_at).getTime() : 0;
      return [...matches].sort((a: any, b: any) => t(b) - t(a));
    }
    if (sort === "name") {
      return [...matches].sort((a: any, b: any) =>
        String(a.name).localeCompare(String(b.name))
      );
    }
    return matches;
  }, [data, searchQuery, sort]);

  return (
    <div className="flex flex-col gap-6">
      {status === "success" && data.length > 0 && (
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative min-w-0 max-w-[360px] flex-[1_1_240px]">
            <MagnifyingGlassIcon
              className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-fg-subtle"
              aria-hidden="true"
            />
            <input
              type="search"
              placeholder="Search bots"
              autoComplete="off"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              aria-label="Search bots"
              className="ui-input border-line pl-9"
            />
          </div>
          <span className="hidden flex-1 sm:block" />
          <div className="flex items-center gap-3">
            <label htmlFor="bot-sort" className="text-[13px] text-fg-muted">
              Sort
            </label>
            <select
              id="bot-sort"
              value={sort}
              onChange={(e) => setSort(e.target.value as Sort)}
              className="ui-input h-9 w-auto border-line py-0 pl-2.5 pr-8 text-[13px]"
            >
              <option value="active">Last active</option>
              <option value="created">Created</option>
              <option value="name">Name</option>
            </select>
            <div
              role="group"
              aria-label="View"
              className="flex rounded-lg border border-line bg-surface p-0.5"
            >
              {(
                [
                  {
                    value: "grid",
                    label: "Grid view",
                    icon: (
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <rect x="3" y="3" width="7" height="7" />
                        <rect x="14" y="3" width="7" height="7" />
                        <rect x="3" y="14" width="7" height="7" />
                        <rect x="14" y="14" width="7" height="7" />
                      </svg>
                    ),
                  },
                  {
                    value: "list",
                    label: "List view",
                    icon: (
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                        <path d="M4 6h16M4 12h16M4 18h16" />
                      </svg>
                    ),
                  },
                ] as const
              ).map((option) => (
                <button
                  key={option.value}
                  type="button"
                  aria-pressed={view === option.value}
                  aria-label={option.label}
                  title={option.label}
                  onClick={() => setView(option.value)}
                  className={`flex h-[30px] w-8 items-center justify-center rounded-md transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 ${
                    view === option.value
                      ? "bg-surface-2 text-fg"
                      : "text-fg-subtle hover:text-fg"
                  }`}
                >
                  <span aria-hidden="true">{option.icon}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {status === "loading" && (
        <div className={gridClass} role="status" aria-busy="true">
          <span className="sr-only">Loading bots</span>
          {[1, 2, 3, 4, 5, 6].map((item) => (
            <div className="ui-card flex flex-col" key={item}>
              <div className="flex items-start gap-3 p-4 pb-3">
                <Skeleton className="h-9 w-9 rounded-[9px]" />
                <div className="flex-1 space-y-2 pt-0.5">
                  <Skeleton className="h-4 w-2/3" />
                  <Skeleton className="h-3 w-24" />
                </div>
              </div>
              <div className="px-4 pb-3">
                <Skeleton className="h-3.5 w-1/2" />
              </div>
              <div className="border-t border-line px-4 py-2.5">
                <Skeleton className="h-3 w-28" />
              </div>
            </div>
          ))}
        </div>
      )}

      {status === "success" && data.length === 0 && (
        <div className="ui-card">
          <EmptyState
            className="py-16"
            icon={<SparklesIcon />}
            title="Create your first bot"
            description="Point a bot at a website, documents or an API and it will answer questions using that knowledge."
            action={
              <Link to="/new" className="ui-btn-primary h-10 px-4">
                <PlusIcon aria-hidden="true" />
                New bot
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
          ) : view === "list" ? (
            <ul className="ui-card divide-y divide-line overflow-hidden">
              {filteredData.map((bot: any) => (
                <BotRow bot={bot} key={bot.id} />
              ))}
            </ul>
          ) : (
            <div className={gridClass}>
              {filteredData.map((bot: any) => (
                <BotCard bot={bot} key={bot.id} />
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
