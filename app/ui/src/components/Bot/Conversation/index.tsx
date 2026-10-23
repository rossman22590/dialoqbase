import { ConversationsByType } from "../../../@types/conversation";
import React from "react";
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
  const [defaultIndex, setDefaultIndex] = React.useState<number | null>(null);

  React.useEffect(() => {
    if (data.length > 0) {
      setDefaultIndex(0);
    }
  }, [data]);

  return (
    <div className="relative md:ml-14">
      <div className="hidden md:block">
        <ConversationSidebar
          defaultIndex={defaultIndex}
          setDefaultIndex={setDefaultIndex}
          data={data}
          defaultChannel={type}
          onChannelChange={(value) => {
            setDefaultIndex(null);
            setType(value);
          }}
        />
      </div>
      <div className="flex min-h-[calc(100vh-3.5rem)] flex-col md:ml-[320px]">
        {defaultIndex !== null && (
          <ConversationInfo data={data[defaultIndex]} />
        )}
        {defaultIndex === null && (
          <div className="flex flex-1 items-center justify-center">
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
