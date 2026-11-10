import { ArrowPathIcon, EllipsisHorizontalIcon } from "@heroicons/react/24/outline";
import { Dropdown, Tooltip, notification } from "antd";
import { useQueryClient, useMutation } from "@tanstack/react-query";
import api from "../../../services/api";
import { useParams } from "react-router-dom";
import { DsSourceKey, NewDsForm } from "./NewDsForm";
import React from "react";

type Source = {
  id: string;
  type: string;
  content: string;
  status: string;
  createdAt?: string;
  updatedAt?: string;
};

const FILE_TYPES = ["pdf", "docx", "csv", "txt", "mp3", "mp4", "zip", "json", "file"];

// Presentation only: a readable label for the stored source type.
const typeLabel = (type: string) => {
  const t = (type || "").toLowerCase();
  if (FILE_TYPES.includes(t)) return "File";
  switch (t) {
    case "website":
      return "Website";
    case "text":
      return "Text";
    case "rest":
      return "REST API";
    case "crawl":
      return "Crawl";
    case "sitemap":
      return "Sitemap";
    case "github":
      return "GitHub";
    case "youtube":
      return "YouTube";
    default:
      return type;
  }
};

// Presentation only: three states, as in the mock.
const statusInfo = (status: string) => {
  switch ((status || "").toLowerCase()) {
    case "finished":
      return { label: "Ready", tone: "ui-badge-success", key: "ready" as const };
    case "failed":
      return { label: "Failed", tone: "ui-badge-danger", key: "failed" as const };
    default:
      return {
        label: "Processing",
        tone: "ui-badge-brand",
        key: "processing" as const,
      };
  }
};

const relativeTime = (value?: string) => {
  if (!value) return "—";
  const date = new Date(value);
  if (isNaN(date.getTime())) return "—";
  const diff = Math.max(0, Date.now() - date.getTime()) / 1000;
  if (diff < 60) return "Just now";
  const mins = Math.floor(diff / 60);
  if (mins < 60) return `${mins} min ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours} hour${hours === 1 ? "" : "s"} ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days} day${days === 1 ? "" : "s"} ago`;
  const weeks = Math.floor(days / 7);
  if (days < 30) return `${weeks} week${weeks === 1 ? "" : "s"} ago`;
  return date.toLocaleDateString();
};

// Splits a URL into a short name and the full address underneath.
const sourceLines = (source: Source) => {
  const content = source.content || "";
  const t = (source.type || "").toLowerCase();
  if (["website", "rest", "crawl", "sitemap", "github", "youtube"].includes(t)) {
    try {
      const url = new URL(content);
      const path = url.pathname.replace(/\/$/, "");
      return { name: url.hostname + path, detail: content };
    } catch (e) {
      return { name: content, detail: "" };
    }
  }
  if (FILE_TYPES.includes(t)) {
    return { name: content, detail: t.toUpperCase() };
  }
  return { name: content, detail: "" };
};

// Source types the list can show, for "Not set up yet". Crawl and sitemap
// sources are not returned by the list endpoint, so they are left out.
const DETECTABLE_TABS: { key: DsSourceKey; label: string; match: (t: string) => boolean }[] = [
  { key: "website", label: "Website", match: (t) => t === "website" },
  { key: "file", label: "Files", match: (t) => FILE_TYPES.includes(t) },
  { key: "text", label: "Text", match: (t) => t === "text" },
  { key: "rest", label: "REST API", match: (t) => t === "rest" },
];

export const DsTable = ({
  data,
  total,
  searchNode,
  paginationNode,
}: {
  data: Source[];
  total?: number;
  searchNode: React.ReactNode;
  paginationNode?: React.ReactNode;
}) => {
  const params = useParams<{ id: string }>();
  const client = useQueryClient();
  const [selectedTab, setSelectedTab] = React.useState<DsSourceKey>("website");
  const addRef = React.useRef<HTMLElement>(null);

  const { mutate: deleteDs } = useMutation(
    (id: string) => api.delete(`/bot/${params.id}/source/${id}`),
    {
      onSuccess: () => {
        client.invalidateQueries(["getBotDS", params.id]);
        notification.success({
          message: "Data source deleted successfully",
        });
      },
      onError: (err: any) => {
        notification.error({
          message:
            err?.response?.data?.message ||
            err?.response?.data?.error ||
            "Error while deleting data source",
        });
      },
    }
  );

  const { mutate: refetchDS } = useMutation(
    (id: string) => api.post(`/bot/${params.id}/source/${id}/refresh`),
    {
      onSuccess: () => {
        client.invalidateQueries(["getBotDS", params.id]);
        notification.success({
          message: "Data source updated successfully",
        });
      },
      onError: (err: any) => {
        notification.error({
          message:
            err?.response?.data?.message ||
            err?.response?.data?.error ||
            "Error while deleting data source",
        });
      },
    }
  );

  const typeCounts = React.useMemo(() => {
    const counts = new Map<string, number>();
    data.forEach((s) => {
      const label = typeLabel(s.type);
      counts.set(label, (counts.get(label) || 0) + 1);
    });
    return Array.from(counts.entries());
  }, [data]);

  const statusCounts = React.useMemo(() => {
    const counts = { ready: 0, processing: 0, failed: 0 };
    data.forEach((s) => {
      counts[statusInfo(s.status).key] += 1;
    });
    return counts;
  }, [data]);

  const failed = data.filter((s) => statusInfo(s.status).key === "failed");

  const notSetUp = DETECTABLE_TABS.filter(
    (tab) => !data.some((s) => tab.match((s.type || "").toLowerCase()))
  );

  const pickTab = (key: DsSourceKey) => {
    setSelectedTab(key);
    addRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const partial = typeof total === "number" && total > data.length;

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="m-0 text-2xl font-semibold tracking-tight text-fg">
          Data sources
        </h1>
        <p className="mt-1.5 text-sm text-fg-muted">
          What your bot answers from. Add websites, files and text, then sync
          them when they change.
        </p>
      </div>

      <div className="flex flex-wrap items-start gap-6">
        <div className="flex min-w-0 flex-[999_1_520px] flex-col gap-6">
          <section
            ref={addRef}
            aria-labelledby="add-source-h"
            className="ui-card scroll-mt-20"
          >
            <h2
              id="add-source-h"
              className="m-0 px-5 pt-4 text-[15px] font-semibold text-fg"
            >
              Add a source
            </h2>
            <NewDsForm selected={selectedTab} onSelect={setSelectedTab} />
          </section>

          <section aria-labelledby="sources-h" className="ui-card">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line px-5 py-3.5">
              <h2
                id="sources-h"
                className="m-0 text-[15px] font-semibold text-fg"
              >
                Sources{" "}
                <span className="font-normal text-fg-subtle">
                  {total ?? data.length}
                </span>
              </h2>
              {searchNode}
            </div>

            {data.length === 0 ? (
              <div className="px-5 py-12 text-center">
                <p className="m-0 text-sm font-medium text-fg">
                  No data sources found
                </p>
                <p className="mt-1 text-sm text-fg-muted">
                  Add a website, file or text above so your bot has something
                  to answer from.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="ui-table min-w-[640px]">
                  <thead>
                    <tr>
                      <th scope="col">Source</th>
                      <th scope="col">Type</th>
                      <th scope="col">Status</th>
                      <th scope="col">Last synced</th>
                      <th scope="col" className="!text-right">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.map((source) => {
                      const status = statusInfo(source.status);
                      const lines = sourceLines(source);
                      return (
                        <tr key={source.id}>
                          <td className="max-w-[320px]">
                            <div
                              className="truncate font-medium text-fg"
                              title={source.content}
                            >
                              {lines.name}
                            </div>
                            {lines.detail && (
                              <div className="truncate text-fg-subtle">
                                {lines.detail}
                              </div>
                            )}
                          </td>
                          <td className="text-fg-muted">
                            {typeLabel(source.type)}
                          </td>
                          <td>
                            <span className={`ui-badge ${status.tone}`}>
                              {status.label}
                            </span>
                          </td>
                          <td className="whitespace-nowrap text-fg-muted">
                            {status.key === "processing"
                              ? "Syncing now"
                              : status.key === "failed"
                              ? "—"
                              : relativeTime(
                                  source.updatedAt || source.createdAt
                                )}
                          </td>
                          <td className="whitespace-nowrap text-right">
                            <div className="flex justify-end">
                              <Tooltip title="Sync now">
                                <button
                                  type="button"
                                  aria-label="Sync now"
                                  onClick={() => {
                                    const confirm = window.confirm(
                                      "Are you sure you want to re-fetch this data source?"
                                    );
                                    if (confirm) {
                                      refetchDS(source.id);
                                    }
                                  }}
                                  className="flex h-8 w-8 items-center justify-center rounded-lg text-fg-muted hover:bg-surface-2 hover:text-fg focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
                                >
                                  <ArrowPathIcon className="h-4 w-4" />
                                </button>
                              </Tooltip>
                              <Dropdown
                                trigger={["click"]}
                                placement="bottomRight"
                                menu={{
                                  items: [
                                    {
                                      key: "delete",
                                      danger: true,
                                      label: "Delete source",
                                    },
                                  ],
                                  onClick: ({ key }) => {
                                    if (key !== "delete") return;
                                    const confirm = window.confirm(
                                      "Are you sure you want to delete this data source?"
                                    );
                                    if (confirm) {
                                      deleteDs(source.id);
                                    }
                                  },
                                }}
                              >
                                <button
                                  type="button"
                                  aria-label="More actions"
                                  className="flex h-8 w-8 items-center justify-center rounded-lg text-fg-muted hover:bg-surface-2 hover:text-fg focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
                                >
                                  <EllipsisHorizontalIcon className="h-4 w-4" />
                                </button>
                              </Dropdown>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
            {paginationNode && (
              <div className="flex justify-end border-t border-line px-5 py-3">
                {paginationNode}
              </div>
            )}
          </section>
        </div>

        <aside className="flex w-full max-w-[360px] flex-[1_1_280px] flex-col gap-4">
          <section
            aria-labelledby="ds-summary-h"
            className="ui-card flex flex-col gap-3 px-5 py-4"
          >
            <h2
              id="ds-summary-h"
              className="m-0 text-[15px] font-semibold text-fg"
            >
              Summary
            </h2>
            {typeCounts.length > 0 ? (
              <dl className="m-0 grid grid-cols-2 gap-x-3 gap-y-2.5 text-[13px]">
                {typeCounts.map(([label, count]) => (
                  <React.Fragment key={label}>
                    <dt className="text-fg-muted">{label}</dt>
                    <dd className="m-0 text-right font-medium tabular-nums text-fg">
                      {count}
                    </dd>
                  </React.Fragment>
                ))}
              </dl>
            ) : (
              <p className="m-0 text-[13px] text-fg-muted">No sources yet.</p>
            )}
            <div className="h-px bg-line" />
            <div className="flex flex-col gap-2 text-[13px] text-fg">
              <div className="flex items-center gap-2">
                <span
                  aria-hidden="true"
                  className="h-2 w-2 rounded-full bg-green-700 dark:bg-green-400"
                />
                {statusCounts.ready} ready
              </div>
              <div className="flex items-center gap-2">
                <span
                  aria-hidden="true"
                  className="h-2 w-2 rounded-full bg-indigo-600 dark:bg-indigo-400"
                />
                {statusCounts.processing} processing
              </div>
              <div className="flex items-center gap-2">
                <span
                  aria-hidden="true"
                  className="h-2 w-2 rounded-full bg-red-700 dark:bg-red-400"
                />
                {statusCounts.failed} failed
              </div>
            </div>
            {partial && (
              <p className="m-0 text-xs text-fg-subtle">
                Counts are for the sources on this page.
              </p>
            )}
          </section>

          {failed.length > 0 && (
            <section
              role="alert"
              className="flex flex-col gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-3.5 dark:border-red-500/25 dark:bg-red-500/10"
            >
              <p className="m-0 text-[13px] font-semibold text-red-800 dark:text-red-300">
                {failed.length === 1
                  ? "1 source couldn't be read"
                  : `${failed.length} sources couldn't be read`}
              </p>
              <p className="m-0 text-[13px] text-red-900 dark:text-red-200/80">
                {failed.length === 1
                  ? `${sourceLines(failed[0]).name} (${typeLabel(
                      failed[0].type
                    )}) failed to sync.`
                  : "These sources failed to sync."}{" "}
                Your bot won't use {failed.length === 1 ? "it" : "them"} until{" "}
                {failed.length === 1 ? "it syncs" : "they sync"}.
              </p>
              <button
                type="button"
                onClick={() => failed.forEach((s) => refetchDS(s.id))}
                className="ui-btn h-8 self-start border border-red-300 bg-surface px-3 text-[13px] text-red-800 hover:bg-red-50 dark:border-red-500/40 dark:text-red-300 dark:hover:bg-red-500/10"
              >
                Retry
              </button>
            </section>
          )}

          {notSetUp.length > 0 && (
            <section aria-labelledby="ds-more-h" className="ui-card">
              <h2
                id="ds-more-h"
                className="m-0 border-b border-line px-5 py-3.5 text-[15px] font-semibold text-fg"
              >
                Not set up yet
              </h2>
              {notSetUp.map((tab, i) => (
                <div
                  key={tab.key}
                  className={`flex items-center gap-2.5 px-5 py-2.5 text-[13px] text-fg ${
                    i > 0 ? "border-t border-line" : ""
                  }`}
                >
                  <span className="flex-1">{tab.label}</span>
                  <button
                    type="button"
                    onClick={() => pickTab(tab.key)}
                    className="ui-btn-secondary h-8 px-3 text-[13px] font-normal"
                  >
                    Add
                  </button>
                </div>
              ))}
            </section>
          )}
        </aside>
      </div>
    </div>
  );
};

