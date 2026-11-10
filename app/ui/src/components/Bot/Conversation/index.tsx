import { ConversationsByType } from "../../../@types/conversation";
import React from "react";
import { useParams } from "react-router-dom";
import { ChatBubbleLeftRightIcon } from "@heroicons/react/24/outline";
import { ConversationSidebar } from "./ConversationSidebar";
import { ConversationInfo } from "./ConversationInfo";
import { EmptyState } from "../../ui";

export const ConversationBody = ({
  data,
  setType,
  type,
}: {
  data: ConversationsByType[];
  type: string;
  setType: React.Dispatch<React.SetStateAction<string>>;
}) => {
  const params = useParams<{ conversation_id?: string }>();
  const [selectedId, setSelectedId] = React.useState<string | null>(null);
  // Below lg only one column fits: the list, or the open transcript.
  const [mobileView, setMobileView] = React.useState<"list" | "transcript">(
    "list"
  );

  React.useEffect(() => {
    if (data.length > 0) {
      const fromRoute = data.find((c) => c.chat_id === params.conversation_id);
      setSelectedId((fromRoute || data[0]).chat_id);
    } else {
      setSelectedId(null);
    }
  }, [data]);

  const selected = data.find((c) => c.chat_id === selectedId);

  return (
    <div className="flex h-[calc(100dvh-3.5rem)] min-h-0 bg-canvas">
      <ConversationSidebar
        className={
          mobileView === "transcript" ? "hidden lg:flex" : "flex w-full"
        }
        selectedId={selectedId}
        onSelect={(chatId) => {
          setSelectedId(chatId);
          setMobileView("transcript");
        }}
        data={data}
        defaultChannel={type}
        onChannelChange={(value) => {
          setSelectedId(null);
          setMobileView("list");
          setType(value);
        }}
      />
      <div
        className={`min-w-0 flex-1 flex-col ${
          mobileView === "list" ? "hidden lg:flex" : "flex"
        }`}
      >
        {selected ? (
          <ConversationInfo
            data={selected}
            channel={type}
            onBack={() => setMobileView("list")}
          />
        ) : (
          <div className="flex flex-1 items-center justify-center p-6">
            <EmptyState
              icon={<ChatBubbleLeftRightIcon />}
              title={
                data.length === 0
                  ? "No conversations yet"
                  : "Select a conversation"
              }
              description={
                data.length === 0
                  ? "When people chat with your bot on this channel, their conversations will appear here."
                  : "Pick a conversation from the list to read the full transcript."
              }
            />
          </div>
        )}
      </div>
    </div>
  );
};
