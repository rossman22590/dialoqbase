import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Button, Card, Modal, Space, Table, Tag, Tooltip, notification } from "antd";
import React from "react";
import api from "../../services/api";
import { errorMessage, formatDate } from "./shared";

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
    { title: "Job", dataIndex: "id", key: "id" },
    {
      title: "Sources",
      key: "sources",
      render: (_: any, job: QueueJob) => (
        <div className="space-y-1 text-xs">
          {job.sources.map((s, i) => (
            <div key={s.source_id || i}>
              <Tag>{s.type}</Tag>
              {s.bot_name || s.bot_id}
              {s.content && (
                <div className="max-w-md truncate text-gray-500" title={s.content}>
                  {s.content}
                </div>
              )}
            </div>
          ))}
        </div>
      ),
    },
    { title: "Attempts", dataIndex: "attempts", key: "attempts" },
    {
      title: "Created",
      dataIndex: "created_at",
      key: "created_at",
      render: (v: number) => formatDate(v),
    },
    {
      title: "Finished",
      dataIndex: "finished_at",
      key: "finished_at",
      render: (v: number) => formatDate(v),
    },
    {
      title: "Error",
      key: "error",
      render: (_: any, job: QueueJob) =>
        job.failed_reason ? (
          <Tooltip title={<pre className="whitespace-pre-wrap text-xs">{job.stacktrace[0] || job.failed_reason}</pre>}>
            <span className="text-red-600">{job.failed_reason.slice(0, 80)}</span>
          </Tooltip>
        ) : (
          "—"
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
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <h2 className="text-lg font-semibold dark:text-white">
            Queue: {info?.name || "vector"}{" "}
            {info?.is_paused ? <Tag color="orange">Paused</Tag> : <Tag color="green">Running</Tag>}
          </h2>
          <p className="text-xs text-gray-500">
            Data-source ingestion jobs. Refreshes every 5 seconds.
            {info?.workers !== null && info?.workers !== undefined && ` Workers connected: ${info.workers}.`}
          </p>
        </div>
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
      </div>

      <div className="grid grid-cols-2 gap-3 md:grid-cols-4 lg:grid-cols-7">
        {STATUSES.map((s) => (
          <Card
            key={s.key}
            size="small"
            hoverable
            onClick={() => {
              setPage(1);
              setStatus(s.key);
            }}
            style={status === s.key ? { borderColor: "#7c3aed" } : undefined}
          >
            <div className="text-xs text-gray-500">{s.label}</div>
            <div className="text-xl font-semibold">
              <Tag color={s.color}>{info?.counts?.[s.key] ?? "…"}</Tag>
            </div>
          </Card>
        ))}
      </div>

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
      />
    </div>
  );
};
