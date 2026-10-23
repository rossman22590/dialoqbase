import { Link, useNavigate, useParams } from "react-router-dom";
import { useMessage } from "../../../hooks/useMessage";
import { PlaygroundHistory } from "./types";
import {
  EllipsisHorizontalIcon,
  PencilIcon,
  TrashIcon,
} from "@heroicons/react/24/outline";
import { Dropdown, notification } from "antd";
import api from "../../../services/api";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Spin } from "antd";
import React from "react";

export const PlaygroundHistoryCard = ({
  item,
}: {
  item: PlaygroundHistory;
}) => {
  const { historyId, setHistoryId, setMessages, setHistory } = useMessage();
  const params = useParams<{ id: string; history_id?: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [processingId, setProcessingId] = React.useState<string | null>(null);

  const onDelete = async () => {
    const url = `bot/playground/history/${item.id}`;
    const response = await api.delete(url);
    return response.data;
  };

  const onEdit = async (title: string) => {
    const url = `bot/playground/history/${item.id}`;
    const response = await api.put(url, { title });
    return response.data;
  };

  const { mutate: editHistory, isLoading: isEditing } = useMutation(onEdit, {
    onSuccess: () => {
      queryClient.invalidateQueries([
        "getBotPlaygroundHistory",
        params.id,
        params.history_id,
      ]);
    },
    onError: () => {
      notification.error({
        message: "Error",
        description: "Something went wrong",
      });
    },
  });

  const { mutate: deleteHistory, isLoading: isDeleting } = useMutation(
    onDelete,
    {
      onSuccess: () => {
        if (historyId === item.id) {
          setHistoryId(null);
          setMessages([]);
          setHistory([]);
          navigate(`/bot/${params.id}`);
        }
        queryClient.invalidateQueries([
          "getBotPlaygroundHistory",
          params.id,
          params.history_id,
        ]);
      },
      onError: () => {
        notification.error({
          message: "Error",
          description: "Something went wrong",
        });
      },
    }
  );

  const isActive = historyId === item.id;
  const isProcessing = (isDeleting || isEditing) && processingId === item.id;

  return (
    <div
      className={`group relative flex items-center rounded-lg text-sm transition-colors ${
        isActive
          ? "bg-surface font-medium text-fg shadow-soft ring-1 ring-line before:absolute before:inset-y-2 before:left-0 before:w-[3px] before:rounded-full before:bg-indigo-500"
          : "text-fg-muted hover:bg-surface-2 hover:text-fg"
      }`}
    >
      <Link
        to={`/bot/${params.id}/playground/${item.id}`}
        title={item.title}
        aria-current={isActive ? "page" : undefined}
        className="block min-w-0 flex-1 truncate rounded-lg py-2 pl-3 pr-9 text-[13px] text-inherit hover:text-inherit focus:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-indigo-500"
      >
        {item.title}
      </Link>
      <div className="absolute right-1 top-1/2 -translate-y-1/2">
        {isProcessing ? (
          <div className="flex h-7 w-7 items-center justify-center">
            <Spin size="small" />
          </div>
        ) : (
          <Dropdown
            trigger={["click"]}
            placement="bottomRight"
            menu={{
              items: [
                {
                  key: "1",
                  label: (
                    <button
                      className="flex items-center gap-2 w-full "
                      onClick={() => {
                        const newTitle = prompt("Enter new title", item.title);
                        if (newTitle) {
                          editHistory(newTitle);
                          setProcessingId(item.id);
                        }
                      }}
                    >
                      <PencilIcon className="w-3.5 h-3.5 text-fg-subtle" />
                      <span>Rename</span>
                    </button>
                  ),
                },
                {
                  key: "2",
                  label: (
                    <button
                      onClick={() => {
                        deleteHistory();
                        setProcessingId(item.id);
                      }}
                      className="flex items-center gap-2 w-full text-red-500"
                    >
                      <TrashIcon className="w-3.5 h-3.5 text-red-500 dark:text-red-400" />
                      <span>Delete</span>
                    </button>
                  ),
                },
              ],
            }}
          >
            <button
              type="button"
              aria-label={`Options for ${item.title}`}
              className={`flex h-7 w-7 items-center justify-center rounded-md text-fg-subtle transition hover:bg-surface-3 hover:text-fg focus:opacity-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 [@media(hover:none)]:opacity-100 ${
                isActive ? "opacity-100" : "opacity-0 group-hover:opacity-100"
              }`}
            >
              <EllipsisHorizontalIcon className="h-5 w-5" />
            </button>
          </Dropdown>
        )}
      </div>
    </div>
  );
};
