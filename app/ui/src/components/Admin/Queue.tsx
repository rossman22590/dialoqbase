import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Modal, notification } from "antd";
import React from "react";
import api from "../../services/api";
import {
  Pager,
  TableCard,
  TableMessage,
  errorMessage,
  formatAgo,
  formatDate,
  smallBtn,
  smallDangerBtn,
} from "./shared";
import { Badge } from "../ui";

const STATUSES = [
  { key: "failed", label: "Failed" },
  { key: "active", label: "Running" },
  { key: "waiting", label: "Waiting" },
  { key: "delayed", label: "Delayed" },
  { key: "prioritized", label: "Prioritized" },
  { key: "paused", label: "Paused" },
  { key: "completed", label: "Done" },
];

type QueueInfo = {
  name: string;
  counts: Record<string, number>;
  is_paused: boolean;
  workers: number | null;
};

type QueueJob = {
  id: string;
  name: string;
  sources: {
    source_id?: string;
    type?: string;
    bot_id?: string;
    bot_name?: string;
    content?: string;
  }[];
  attempts: number;
  progress: any;
  failed_reason?: string;
  stacktrace: string[];
  created_at?: number;
  processed_at?: number;
  finished_at?: number;
};

export const AdminQueue = () => {
  const queryClient = useQueryClient();
  const [status, setStatus] = React.useState("failed");
  const [page, setPage] = React.useState(1);
  const [expanded, setExpanded] = React.useState<string | null>(null);

  const { data: info } = useQuery(
    ["adminQueue"],
    async () => {
      const response = await api.get("/admin/oversight/queue");
      return response.data as QueueInfo;
    },
    { refetchInterval: 5000 }
  );

  const { data: jobs, status: jobsStatus } = useQuery(
    ["adminQueueJobs", status, page],
    async () => {
      const response = await api.get(
        `/admin/oversight/queue/jobs?status=${status}&page=${page}&pageSize=25`
      );
      return response.data as { total: number; data: QueueJob[] };
    },
    { refetchInterval: 5000, keepPreviousData: true }
  );

  const action = useMutation(
    async ({ url, body }: { url: string; body: any }) => {
      const response = await api.post(url, body);
      return response.data;
    },
    {
      onSuccess: (data) => {
        notification.success({ message: data?.message || "Done" });
        queryClient.invalidateQueries(["adminQueue"]);
        queryClient.invalidateQueries(["adminQueueJobs"]);
      },
      onError: (e) => notification.error({ message: errorMessage(e) }),
    }
  );

  const jobAction = (job: QueueJob, act: "retry" | "remove") =>
    action.mutate({
      url: "/admin/oversight/queue/jobs/action",
      body: { job_id: job.id, action: act },
    });

  const current = STATUSES.find((s) => s.key === status);
  const rows = jobs?.data || [];
  const COLS = 6;
  const canClear = status === "completed" || status === "failed";

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-wrap items-center gap-3">
        <p className="m-0 min-w-0 flex-[1_1_320px] text-sm text-fg-muted">
          Data source jobs: reading files, crawling sites, fetching
          transcripts. Refreshes every 5 seconds.
          {info?.workers !== null &&
            info?.workers !== undefined &&
            ` ${info.workers} ${info.workers === 1 ? "worker" : "workers"} connected.`}
        </p>
        <div className="flex items-center gap-2">
          {info &&
            (info.is_paused ? (
              <Badge tone="warning">Queue paused</Badge>
            ) : (
              <Badge tone="success">Queue running</Badge>
            ))}
          <button
            type="button"
            className="ui-btn-secondary h-8 px-3 text-[13px] font-normal"
            disabled={!info}
            onClick={() =>
              action.mutate({
                url: "/admin/oversight/queue/action",
                body: { action: info?.is_paused ? "resume" : "pause" },
              })
            }
          >
            {info?.is_paused ? "Resume queue" : "Pause queue"}
          </button>
        </div>
      </div>

      <div
        role="tablist"
        aria-label="Job state"
        className="grid grid-cols-[repeat(auto-fit,minmax(130px,1fr))] gap-3"
      >
        {STATUSES.map((s) => {
          const selected = status === s.key;
          const danger = s.key === "failed";
          return (
            <button
              type="button"
              role="tab"
              key={s.key}
              aria-selected={selected}
              onClick={() => {
                setPage(1);
                setExpanded(null);
                setStatus(s.key);
              }}
              className={`flex flex-col items-start gap-1.5 rounded-xl bg-surface px-4 py-3.5 text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 ${
                selected
                  ? danger
                    ? "border-[1.5px] border-red-600 ring-[3px] ring-red-50 dark:border-red-400 dark:ring-red-500/10"
                    : "border-[1.5px] border-indigo-600 ring-[3px] ring-indigo-50 dark:border-indigo-400 dark:ring-indigo-500/10"
                  : "border border-line hover:border-line-strong"
              }`}
            >
              <span className="text-[13px] text-fg-muted">{s.label}</span>
              <span className="text-2xl font-semibold tabular-nums text-fg">
                {info?.counts?.[s.key] ?? "…"}
              </span>
            </button>
          );
        })}
      </div>

      <TableCard
        title={
          <>
            {current?.label || status}{" "}
            <span className="font-normal tabular-nums text-fg-subtle">
              {jobs?.total ?? 0}
            </span>
          </>
        }
        actions={
          canClear && (jobs?.total || 0) > 0 ? (
            <button
              type="button"
              className="ui-btn-danger-outline h-8 px-3 text-[13px] font-normal"
              onClick={() =>
                Modal.confirm({
                  title: `Remove all ${status} jobs?`,
                  okButtonProps: { danger: true },
                  onOk: () =>
                    action.mutate({
                      url: "/admin/oversight/queue/action",
                      body: { action: "clean", status },
                    }),
                })
              }
            >
              Clear {current?.label.toLowerCase() || status} jobs
            </button>
          ) : undefined
        }
      >
        <table className="ui-table min-w-[860px]">
          <thead>
            <tr>
              <th scope="col">Source</th>
              <th scope="col">Bot</th>
              <th scope="col">{status === "failed" ? "Error" : "Job"}</th>
              <th scope="col" className="!text-right">
                Attempts
              </th>
              <th scope="col">
                {status === "completed" || status === "failed"
                  ? "Finished"
                  : "Created"}
              </th>
              <th scope="col" className="!text-right">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {jobsStatus === "loading" && (
              <TableMessage colSpan={COLS}>Loading jobs…</TableMessage>
            )}
            {jobs && rows.length === 0 && (
              <TableMessage colSpan={COLS}>
                Nothing in this state right now.
              </TableMessage>
            )}
            {rows.map((job) => {
              const open = expanded === job.id;
              const when =
                status === "completed" || status === "failed"
                  ? job.finished_at
                  : job.created_at;
              const progress =
                typeof job.progress === "number" ? job.progress : null;
              return (
                <React.Fragment key={job.id}>
                  <tr>
                    <td className="max-w-[280px]">
                      {job.sources.length === 0 && (
                        <span className="text-fg-subtle">—</span>
                      )}
                      {job.sources.map((s, i) => (
                        <div key={s.source_id || i} className="min-w-0">
                          <div
                            className="truncate font-medium text-fg"
                            title={s.content}
                          >
                            {s.content || s.source_id || "Source"}
                          </div>
                          {s.type && (
                            <div className="text-fg-subtle">{s.type}</div>
                          )}
                        </div>
                      ))}
                    </td>
                    <td className="text-fg-muted">
                      {Array.from(
                        new Set(
                          job.sources.map((s) => s.bot_name || s.bot_id || "")
                        )
                      )
                        .filter(Boolean)
                        .join(", ") || "—"}
                    </td>
                    <td className="max-w-[320px]">
                      {job.failed_reason ? (
                        <code className="font-mono text-xs text-red-800 dark:text-red-300">
                          {job.failed_reason.slice(0, 120)}
                        </code>
                      ) : progress !== null && status === "active" ? (
                        <span className="flex items-center gap-2">
                          <span
                            role="progressbar"
                            aria-valuenow={progress}
                            aria-valuemin={0}
                            aria-valuemax={100}
                            aria-label="Job progress"
                            className="block h-1.5 w-40 overflow-hidden rounded-full bg-surface-2"
                          >
                            <span
                              className="block h-1.5 bg-indigo-600 dark:bg-indigo-400"
                              style={{
                                width: `${Math.max(0, Math.min(100, progress))}%`,
                              }}
                            />
                          </span>
                          <span className="tabular-nums text-fg-muted">
                            {progress}%
                          </span>
                        </span>
                      ) : (
                        <span className="font-mono text-xs text-fg-subtle">
                          {job.id}
                        </span>
                      )}
                    </td>
                    <td className="text-right tabular-nums">{job.attempts}</td>
                    <td
                      className="whitespace-nowrap text-fg-muted"
                      title={formatDate(when)}
                    >
                      {formatAgo(when)}
                    </td>
                    <td className="whitespace-nowrap text-right">
                      <div className="inline-flex gap-1.5">
                        {status === "failed" && (
                          <button
                            type="button"
                            className="ui-btn-primary h-[30px] px-2.5 text-xs"
                            onClick={() => jobAction(job, "retry")}
                          >
                            Retry
                          </button>
                        )}
                        <button
                          type="button"
                          aria-expanded={open}
                          className={smallBtn}
                          onClick={() => setExpanded(open ? null : job.id)}
                        >
                          {open ? "Hide" : "Details"}
                        </button>
                        <button
                          type="button"
                          className={smallDangerBtn}
                          onClick={() => jobAction(job, "remove")}
                        >
                          Remove
                        </button>
                      </div>
                    </td>
                  </tr>
                  {open && (
                    <tr>
                      <td colSpan={COLS} className="bg-app">
                        <dl className="mb-2 grid grid-cols-[auto_1fr] gap-x-4 gap-y-1 text-xs text-fg-muted">
                          <dt>Job</dt>
                          <dd className="font-mono">{job.id}</dd>
                          <dt>Created</dt>
                          <dd>{formatDate(job.created_at)}</dd>
                          <dt>Started</dt>
                          <dd>{formatDate(job.processed_at)}</dd>
                          <dt>Finished</dt>
                          <dd>{formatDate(job.finished_at)}</dd>
                        </dl>
                        {(job.stacktrace[0] || job.failed_reason) && (
                          <pre className="m-0 max-h-72 overflow-auto whitespace-pre-wrap rounded-lg border border-line bg-surface p-3 font-mono text-xs text-fg-muted">
                            {job.stacktrace[0] || job.failed_reason}
                          </pre>
                        )}
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              );
            })}
          </tbody>
        </table>
      </TableCard>

      <Pager
        page={page}
        pageSize={25}
        total={jobs?.total || 0}
        onChange={(p) => {
          setExpanded(null);
          setPage(p);
        }}
      />
    </div>
  );
};
