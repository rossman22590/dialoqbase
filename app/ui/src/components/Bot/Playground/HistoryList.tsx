import { useQuery } from "@tanstack/react-query";
import { PlaygroundHistoryCard } from "./HistoryCard";
import { useParams } from "react-router-dom";
import api from "../../../services/api";
import { BotPlaygroundHistory, PlaygroundHistory } from "./types";
import React from "react";
import { useMessage } from "../../../hooks/useMessage";
import { useStoreMessage } from "../../../store";
import dayjs from "dayjs";

export const fetchPlaygroundHistory = async (
  id: string,
  historyId?: string
) => {
  const url = historyId
    ? `bot/playground/${id}/history/${historyId}`
    : `bot/playground/${id}/history`;
  const response = await api.get(url);
  return response.data as BotPlaygroundHistory;
};

// Group chats under "Today", "Yesterday", ... using their creation date.
const groupByDate = (items: PlaygroundHistory[]) => {
  const today = dayjs().startOf("day");
  const label = (item: PlaygroundHistory) => {
    if (!item.createdAt) return "Recent";
    const d = dayjs(item.createdAt);
    if (!d.isValid()) return "Recent";
    if (!d.isBefore(today)) return "Today";
    if (!d.isBefore(today.subtract(1, "day"))) return "Yesterday";
    if (!d.isBefore(today.subtract(7, "day"))) return "Last 7 days";
    if (!d.isBefore(today.subtract(30, "day"))) return "Last 30 days";
    return "Older";
  };
  const groups: { label: string; items: PlaygroundHistory[] }[] = [];
  for (const item of items) {
    const l = label(item);
    const last = groups[groups.length - 1];
    if (last && last.label === l) last.items.push(item);
    else groups.push({ label: l, items: [item] });
  }
  return groups;
};

export const PlaygroundHistoryList = () => {
  const params = useParams<{ id: string; history_id?: string }>();
  const { setMessages, setHistory, setStreaming, setHistoryId, setIsLoading } =
    useMessage();

  const {
    setTextToSpeechEnabled,
    setDefaultWebTextToSpeechLanguageType,
    setDefualtTextSpeechSettings,
    setElevenLabsApiKeyPresent,
    setElevenLabsApiKeyValid,
    setVoices,
  } = useStoreMessage();

  const { data, status } = useQuery(
    ["getBotPlaygroundHistory", params.id, params.history_id],
    () => fetchPlaygroundHistory(params.id!, params.history_id),
    {
      keepPreviousData: true,
    }
  );

  React.useEffect(() => {
    if (status === "success" && data) {
      setTextToSpeechEnabled(data.text_to_speech_enabled);
      setElevenLabsApiKeyPresent(data.eleven_labs_api_key_present);
      setElevenLabsApiKeyValid(data.eleven_labs_api_key_valid);
      setVoices(data.voices);
      setDefaultWebTextToSpeechLanguageType(data.text_to_speech_type);
      setDefualtTextSpeechSettings(data.text_to_speech_settings);
      setStreaming(data.streaming);
      if (params.history_id) {
        setHistoryId(params.history_id);
        setMessages(data.messages);
        setHistory(
          data.messages.map((item) => {
            return {
              text: item.message,
              type: item.type,
            };
          })
        );
      }
      setIsLoading(false);
    }
  }, [status, data]);

  return (
    <div>
      {status === "success" && (
        <div>
          {data.history.length === 0 && (
            <div className="px-2 pt-6 text-center">
              <p className="text-[13px] font-medium text-fg">No chats yet</p>
              <p className="mt-1 text-xs leading-relaxed text-fg-subtle">
                Your playground chats will show up here.
              </p>
            </div>
          )}
          {groupByDate(data.history).map((group, groupIndex) => (
            <div key={`${group.label}-${groupIndex}`} className="flex flex-col gap-1">
              <p
                className={`ui-eyebrow mb-1 ${
                  groupIndex === 0 ? "mt-2" : "mt-3"
                }`}
              >
                {group.label}
              </p>
              {group.items.map((item, index) => (
                <PlaygroundHistoryCard key={item.id || index} item={item} />
              ))}
            </div>
          ))}
        </div>
      )}
      {status === "loading" && (
        <div className="flex flex-col gap-1.5 pt-2" aria-hidden="true">
          {[72, 56, 84, 64, 48, 76].map((width, index) => (
            <div key={index} className="flex h-9 items-center px-2">
              <div
                className="skeleton h-3 rounded"
                style={{ width: `${width}%` }}
              />
            </div>
          ))}
        </div>
      )}
      {status === "error" && (
        <div className="px-2 pt-6 text-center text-sm text-red-600 dark:text-red-400">
          Couldn't load chats
        </div>
      )}
    </div>
  );
};
