import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Button, Modal, Space, Table, Tag, Tooltip, notification } from "antd";
import React from "react";
import api from "../../services/api";
import { QueueListIcon } from "@heroicons/react/24/outline";
import { SectionHeader, TableCard, errorMessage, formatDate } from "./shared";
import { Badge, EmptyState } from "../ui";

// Presentation only: maps each status colour below to a dot class.
const STATUS_DOT: Record<string, string> = {
  blue: "bg-sky-500",
  orange: "bg-amber-500",
  red: "bg-red-500",
  green: "bg-emerald-500",
  default: "bg-fg-subtle",
};

const STATUSES = [
  { key: "active", label: "Active", color: "blue" },
  { key: "waiting", label: "Waiting", color: "default" },
  { key: "delayed", label: "Delayed", color: "orange" },
  { key: "prioritized", label: "Prioritized", color: "default" },
  { key: "failed", label: "Failed", color: "red" },
  { key: "completed", label: "Completed", color: "green" },
  { key: "paused", label: "Paused", color: "default" },
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

  const { data: info } = useQuery(
    ["adminQueue"],
    async () => {
      const response = await api.get("/admin/oversight/queue");
      return response.data as QueueInfo;
    },
    { refetchInterval: 5000 }
  );

  const { data: jobs, isFetching } = useQuery(
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
    action.mutate({ url: "/admin/oversight/queue/jobs/action", body: { job_id: job.id, action: act } });

  const columns = [
    {
      title: "Job",
      dataIndex: "id",
      key: "id",
      render: (v: string) => <span className="font-mono text-xs text-fg">{v}</span>,
    },
    {
      title: "Sources",
      key: "sources",
      render: (_: any, job: QueueJob) => (
        <div className="space-y-1 text-xs">
          {job.sources.map((s, i) => (
            <div key={s.source_id || i}>
              <div className="flex items-center gap-1.5 text-fg">
                <Badge tone="neutral">{s.type}</Badge>
                {s.bot_name || s.bot_id}
              </div>
              {s.content && (
                <div className="mt-0.5 max-w-md truncate text-fg-subtle" title={s.content}>
                  {s.content}
                </div>
              )}
            </div>
          ))}
        </div>
      ),
    },
    {
      title: "Attempts",
      dataIndex: "attempts",
      key: "attempts",
      render: (v: number) => <span className="tabular-nums">{v}</span>,
    },
    {
      title: "Created",
      dataIndex: "created_at",
      key: "created_at",
      render: (v: number) => (
        <span className="whitespace-nowrap tabular-nums text-fg-muted">{formatDate(v)}</span>
      ),
    },
    {
      title: "Finished",
      dataIndex: "finished_at",
      key: "finished_at",
      render: (v: number) => (
        <span className="whitespace-nowrap tabular-nums text-fg-muted">{formatDate(v)}</span>
      ),
    },
    {
      title: "Error",
      key: "error",
      render: (_: any, job: QueueJob) =>
        job.failed_reason ? (
          <Tooltip title={<pre className="whitespace-pre-wrap text-xs">{job.stacktrace[0] || job.failed_reason}</pre>}>
            <span className="block max-w-xs cursor-help rounded-lg border border-red-200 bg-red-50 px-2 py-1 font-mono text-[11px] leading-relaxed text-red-700 dark:border-red-500/20 dark:bg-red-500/10 dark:text-red-300">
              {job.failed_reason.slice(0, 80)}
            </span>
          </Tooltip>
        ) : (
          <span className="text-fg-subtle">—</span>
        ),
    },
    {
      title: "",
      key: "actions",
      render: (_: any, job: QueueJob) => (
        <Space>
          {status === "failed" && (
            <Button size="small" onClick={() => jobAction(job, "retry")}>
              Retry
            </Button>
          )}
          <Button size="small" danger onClick={() => jobAction(job, "remove")}>
            Remove
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <div className="space-y-4 pt-2">
      <SectionHeader
        title={
          <>
            Queue: {info?.name || "vector"}{" "}
            {info?.is_paused ? (
              <Badge tone="warning">
                <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
                Paused
              </Badge>
            ) : (
              <Badge tone="success">
                <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-500" />
                Running
              </Badge>
            )}
          </>
        }
        description={
          <>
            Data-source ingestion jobs. Refreshes every 5 seconds.
            {info?.workers !== null && info?.workers !== undefined && ` Workers connected: ${info.workers}.`}
          </>
        }
        actions={
          <Space wrap>
            <Button
              onClick={() =>
                action.mutate({
                  url: "/admin/oversight/queue/action",
                  body: { action: info?.is_paused ? "resume" : "pause" },
                })
              }
            >
              {info?.is_paused ? "Resume queue" : "Pause queue"}
            </Button>
            {(status === "completed" || status === "failed") && (
              <Button
                danger
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
                Clear {status} jobs
              </Button>
            )}
          </Space>
        }
      />

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-7">
        {STATUSES.map((s) => (
          <button
            type="button"
            key={s.key}
            onClick={() => {
              setPage(1);
              setStatus(s.key);
            }}
            aria-pressed={status === s.key}
            className={`ui-card ui-card-hover p-4 text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 ${
              status === s.key
                ? "border-indigo-500 ring-1 ring-indigo-500/30 hover:border-indigo-500 dark:border-indigo-400"
                : ""
            }`}
          >
            <div className="flex items-center gap-1.5 text-xs font-medium text-fg-muted">
              <span className={`h-1.5 w-1.5 rounded-full ${STATUS_DOT[s.color] || STATUS_DOT.default}`} />
              {s.label}
            </div>
            <div className="mt-1.5 text-2xl font-semibold tabular-nums tracking-tight text-fg">
              {info?.counts?.[s.key] ?? "…"}
            </div>
          </button>
        ))}
      </div>

      <TableCard
        title={
          <span className="inline-flex items-center gap-2">
            {STATUSES.find((s) => s.key === status)?.label || status} jobs
            <Tag bordered={false} className="m-0">
              {jobs?.total ?? 0}
            </Tag>
          </span>
        }
      >
        <Table
          rowKey="id"
          size="small"
          loading={isFetching && !jobs}
          dataSource={jobs?.data || []}
          columns={columns as any}
          scroll={{ x: true }}
          pagination={{
            current: page,
            pageSize: 25,
            total: jobs?.total || 0,
            onChange: setPage,
          }}
          locale={{
            emptyText: (
              <EmptyState
                icon={<QueueListIcon />}
                title="No jobs here"
                description="Nothing in this state right now. The list refreshes every 5 seconds."
                className="py-10"
              />
            ),
          }}
        />
      </TableCard>
    </div>
  );
};
