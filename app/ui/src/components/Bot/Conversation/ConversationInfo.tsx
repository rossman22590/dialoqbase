import {
  ComputerDesktopIcon,
  UserIcon,
} from "@heroicons/react/24/outline";
import dayjs from "dayjs";
import { ConversationsByType } from "../../../@types/conversation";
import { getOSAndBrowser } from "../../../utils/useragent";
import { BotAvatar, PlaygroundMessage } from "../Playground/Message";

export const ConversationInfo = ({ data }: { data: ConversationsByType }) => {
  return (
    <div className="grow  flex flex-col md:translate-x-0 transition-transform duration-300 ease-in-out">
      <div className="sticky top-14 z-10 flex items-center gap-3 border-b border-line bg-app/85 px-4 py-3 backdrop-blur-xl sm:px-6">
        <div className="ui-icon-tile">
          <ComputerDesktopIcon />
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold tracking-tight text-fg">
            {data?.metdata?.user_agent
              ? getOSAndBrowser(data?.metdata?.user_agent)
              : data?.metdata?.info || "Anonymous"}
          </p>
          <p className="text-xs tabular-nums text-fg-subtle">
            {data.all_messages.length}{" "}
            {data.all_messages.length === 1 ? "message" : "messages"}
            {data?.created_at &&
              ` · ${dayjs(data.created_at).format("MMM D, YYYY h:mm A")}`}
          </p>
        </div>
      </div>
      <div className="chat-scroll flex-grow overflow-y-auto">
        <div className="mx-auto flex w-full max-w-3xl flex-col gap-7 px-4 py-6 sm:px-6">
          {data.all_messages.map((sender, index) => {
            return (
              <PlaygroundMessage
                isBot={sender.isBot}
                message={sender.message || ""}
                onSourceClick={() => {}}
                textToSpeech={false}
                textToSpeechType="web_api"
                sources={sender.sources}
                key={index}
                hideCopy={true}
                userAvatar={
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-surface-3 text-fg-muted ring-1 ring-inset ring-line">
                    <UserIcon className="!h-4 !w-4" />
                  </div>
                }
                botAvatar={
                  <div className="[&_svg]:!h-4 [&_svg]:!w-4">
                    <BotAvatar />
                  </div>
                }
              />
            );
          })}
        </div>
      </div>
    </div>
  );
};
