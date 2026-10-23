import {
  DocumentTextIcon,
  GlobeAltIcon,
  TrashIcon,
  ArrowPathIcon,
  DocumentArrowUpIcon,
  VideoCameraIcon,
  PlayCircleIcon,
  PlusIcon,
  CircleStackIcon,
} from "@heroicons/react/24/outline";
import { Modal, Tooltip, notification } from "antd";
import { useQueryClient, useMutation } from "@tanstack/react-query";
import api from "../../../services/api";
import { useParams } from "react-router-dom";
import { NewDsForm } from "./NewDsForm";
import React from "react";
import { GithubIcon } from "../../Icons/GithubIcon";
import { YoutubeIcon } from "../../Icons/YoutubeIcon";
import { ApiIcon } from "../../Icons/ApiIcon";
import { Card, EmptyState, PageHeader } from "../../ui";

export const DsTable = ({
  data,
  searchNode
}: {
  data: {
    id: string;
    type: string;
    content: string;
    status: string;
  }[];
  searchNode: React.ReactNode;
}) => {
  // Presentation only: maps a source status to a badge tone.
  const statusTone = (status: string) => {
    switch (status.toLowerCase()) {
      case "finished":
        return "ui-badge-success";
      case "pending":
        return "ui-badge-brand";
      case "failed":
        return "ui-badge-danger";
      case "processing":
        return "ui-badge-warning";
      default:
        return "ui-badge-brand";
    }
  };

  const typeIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case "website":
        return <GlobeAltIcon className="h-4 w-4" />;
      case "pdf":
        return <DocumentArrowUpIcon className="h-4 w-4" />;
      case "text":
        return <DocumentTextIcon className="h-4 w-4" />;
      case "github":
        return <GithubIcon className="h-4 w-4" />;
      case "mp4":
        return <VideoCameraIcon className="h-4 w-4" />;
      case "mp3":
        return <PlayCircleIcon className="h-4 w-4" />;
      case "youtube":
        return <YoutubeIcon className="h-4 w-4" />;
      case "rest":
        return <ApiIcon className="h-4 w-4" />;
      default:
        return <DocumentTextIcon className="h-4 w-4" />;
    }
  };

  const [open, setOpen] = React.useState(false);

  const params = useParams<{ id: string }>();

  const client = useQueryClient();

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

  return (
    <div>
      <PageHeader
        title="Data sources"
        description="Everything your bot has learned from. Add websites, files and text, then re-fetch them as they change."
        actions={
          <button
            onClick={() => setOpen(true)}
            type="button"
            className="ui-btn-primary"
          >
            <PlusIcon />
            Add new source
          </button>
        }
      />

      <Card className="mt-8 overflow-hidden">
        <div className="flex flex-col gap-3 border-b border-line px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <div className="flex min-w-0 items-center gap-3">
            <div className="ui-icon-tile">
              <CircleStackIcon />
            </div>
            <div className="min-w-0">
              <h2 className="text-[15px] font-semibold tracking-tight text-fg">
                Sources
              </h2>
              <p className="text-xs text-fg-subtle">
                This list refreshes every two minutes
              </p>
            </div>
          </div>
          {searchNode}
        </div>

        {data.length === 0 && (
          <EmptyState
            icon={<CircleStackIcon />}
            title="No data sources found"
            description="Add a website, document or text so your bot has something to answer from."
            action={
              <button
                onClick={() => setOpen(true)}
                type="button"
                className="ui-btn-secondary"
              >
                <PlusIcon />
                Add new source
              </button>
            }
          />
        )}
        {data.length > 0 && (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-line">
              <thead className="bg-surface-2/60">
                <tr>
                  <th
                    scope="col"
                    className="py-2.5 pl-5 pr-3 text-left text-xs font-medium uppercase tracking-[0.06em] text-fg-subtle sm:pl-6"
                  >
                    Type
                  </th>
                  <th
                    scope="col"
                    className="px-3 py-2.5 text-left text-xs font-medium uppercase tracking-[0.06em] text-fg-subtle"
                  >
                    Content
                  </th>
                  <th
                    scope="col"
                    className="px-3 py-2.5 text-left text-xs font-medium uppercase tracking-[0.06em] text-fg-subtle"
                  >
                    Status
                  </th>
                  <th
                    scope="col"
                    className="relative py-2.5 pl-3 pr-5 text-right text-xs font-medium text-fg-subtle sm:pr-6"
                  >
                    <span className="sr-only">Re-fetch</span>

                    <span className="sr-only">Remove</span>
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {data.map((source) => (
                  <tr
                    key={source.id}
                    className="group transition-colors hover:bg-surface-2/60"
                  >
                    <td className="whitespace-nowrap py-3.5 pl-5 pr-3 text-sm sm:pl-6">
                      <div className="flex items-center gap-2.5">
                        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-line bg-surface-2 text-fg-muted">
                          {typeIcon(source.type)}
                        </span>
                        <span className="text-[13px] font-medium capitalize text-fg">
                          {source.type}
                        </span>
                      </div>
                    </td>
                    <td
                      className="whitespace-nowrap px-3 py-3.5 text-sm text-fg-muted"
                      title={source.content}
                    >
                      {source.content.length > 50
                        ? source.content.substring(0, 50) + "..."
                        : source.content}
                    </td>
                    <td className="whitespace-nowrap px-3 py-3.5 text-sm">
                      <span
                        className={`ui-badge ${statusTone(
                          source.status
                        )}`}
                      >
                        <span
                          aria-hidden="true"
                          className={`h-1.5 w-1.5 rounded-full bg-current ${
                            source.status.toLowerCase() === "processing" ||
                            source.status.toLowerCase() === "pending"
                              ? "animate-pulse"
                              : ""
                          }`}
                        />
                        <span className="capitalize">
                          {source.status.toLowerCase()}
                        </span>
                      </span>
                    </td>

                    <td className="relative whitespace-nowrap py-3.5 pl-3 pr-5 text-right text-sm sm:pr-6">
                      <div className="flex justify-end gap-1">
                        <Tooltip title="Re-fetch">
                          <button
                            type="button"
                            aria-label="Re-fetch data source"
                            onClick={() => {
                              const confirm = window.confirm(
                                "Are you sure you want to re-fetch this data source?"
                              );
                              if (confirm) {
                                refetchDS(source.id);
                              }
                            }}
                            className="flex h-8 w-8 items-center justify-center rounded-lg text-fg-subtle transition-colors hover:bg-surface-3 hover:text-fg focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
                          >
                            <ArrowPathIcon className="h-4 w-4" />
                          </button>
                        </Tooltip>
                        <Tooltip title="Delete">
                          <button
                            aria-label="Delete data source"
                            onClick={() => {
                              const confirm = window.confirm(
                                "Are you sure you want to delete this data source?"
                              );
                              if (confirm) {
                                deleteDs(source.id);
                              }
                            }}
                            type="button"
                            className="flex h-8 w-8 items-center justify-center rounded-lg text-fg-subtle transition-colors hover:bg-red-50 hover:text-red-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-red-500 dark:hover:bg-red-500/10 dark:hover:text-red-400"
                          >
                            <TrashIcon className="h-4 w-4" />
                          </button>
                        </Tooltip>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      <Modal
        title="Add new data source"
        open={open}
        onCancel={() => setOpen(false)}
        footer={null}
      >
        <NewDsForm onClose={() => setOpen(false)} />
      </Modal>
    </div>
  );
};
