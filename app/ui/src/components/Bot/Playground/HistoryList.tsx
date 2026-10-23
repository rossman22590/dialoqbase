import { useQuery } from "@tanstack/react-query";
import { PlaygroundHistoryCard } from "./HistoryCard";
import { useParams } from "react-router-dom";
import api from "../../../services/api";
import { BotPlaygroundHistory } from "./types";
import React from "react";
import { useMessage } from "../../../hooks/useMessage";
import { ChatBubbleLeftRightIcon } from "@heroicons/react/24/outline";
import { useStoreMessage } from "../../../store";
import { motion } from "framer-motion";

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
    async () => {
      const url = params.history_id
        ? `bot/playground/${params.id}/history/${params.history_id}`
        : `bot/playground/${params.id}/history`;
      const response = await api.get(url);
      return response.data as BotPlaygroundHistory;
    },
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
            <div className="flex flex-col items-center px-4 pt-12 text-center">
              <ChatBubbleLeftRightIcon className="h-8 w-8 text-gray-300 dark:text-gray-600" />
              <p className="mt-2 text-sm font-medium text-gray-500 dark:text-gray-400">
                No chats yet
              </p>
              <p className="mt-0.5 text-xs text-gray-400 dark:text-gray-500">
                Your playground conversations will show up here.
              </p>
            </div>
          )}
          <div className="flex flex-col gap-0.5">
            {data.history.map((item, index) => (
              <motion.div
                key={item.id || index}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2, delay: Math.min(index, 12) * 0.02 }}
              >
                <PlaygroundHistoryCard item={item} />
              </motion.div>
            ))}
          </div>
        </div>
      )}
      {status === "loading" && (
        <div className="flex flex-col gap-1.5 px-1 pt-1" aria-hidden="true">
          {[72, 56, 84, 64, 48, 76].map((width, index) => (
            <div key={index} className="flex h-9 items-center px-2">
              <div
                className="h-3 animate-pulse rounded bg-gray-200 dark:bg-white/10"
                style={{ width: `${width}%` }}
              />
            </div>
          ))}
        </div>
      )}
      {status === "error" && (
        <div className="px-3 pt-6 text-center text-sm text-red-500">
          Couldn't load chats
        </div>
      )}
    </div>
  );
};
