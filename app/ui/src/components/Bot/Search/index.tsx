import DefaultSearchBox from "./DefaultSearchBox";
import { useState } from "react";
import AISearchEngine from "./AISearchEngine";
import { useParams } from "react-router-dom";
import api from "../../../services/api";
import { ISearchResult } from "./types";
import { useMutation } from "@tanstack/react-query";
import { notification } from "antd";
import axios from "axios";
import { useSettings } from "../../../hooks/useSettings";
import { ExclamationTriangleIcon } from "@heroicons/react/24/outline";
import { Card, EmptyState } from "../../ui";
import { useCurrentBot } from "../Playground/useCurrentBot";

export const BotSearchFeature = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [defaultSearchBox, setDefaultSearchBox] = useState(true);
  const params = useParams<{ id: string }>();
  const [data, setData] = useState<ISearchResult>([]);
  const { data: settings, status } = useSettings();
  const bot = useCurrentBot();
  const onSearch = async (query: string) => {
    const res = await api.post(`/bot/${params.id}/search`, {
      query,
    });

    return res.data as ISearchResult;
  };

  const { isLoading, mutate: search } = useMutation({
    mutationFn: onSearch,
    onSuccess: (data) => {
      setData(data);
    },
    onError: (err: any) => {
      notification.error({
        message: axios.isAxiosError(err)
          ? err.response?.data?.message || err.message
          : err.message,
      });
    },
  });
  const header = (
    <div className="flex flex-col gap-3">
      <h1 className="m-0 flex items-center gap-2.5 text-2xl font-semibold tracking-tight text-fg">
        Search
        <span className="ui-badge ui-badge-neutral bg-transparent">Beta</span>
      </h1>
      <p className="m-0 text-sm text-fg-muted">
        Semantic search over {bot.name ? `${bot.name}'s` : "this bot's"}{" "}
        sources. Results are ranked by meaning, not keywords.
      </p>
    </div>
  );

  if (status === "success" && !settings.internalSearchEnabled) {
    return (
      <div className="px-4 py-8 sm:px-8">
        <div className="mx-auto flex max-w-[760px] flex-col gap-[22px]">
          {header}
          <Card>
            <EmptyState
              icon={<ExclamationTriangleIcon />}
              title="Search is turned off"
              description="Internal search needs to be enabled by an admin in order to use this feature."
            />
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="px-4 pb-10 pt-8 sm:px-8">
      <div className="mx-auto flex max-w-[760px] flex-col gap-[22px]">
        {header}
        <DefaultSearchBox
          onSubmit={(query) => {
            if (query.length === 0) {
              return;
            }
            search(query);
            setDefaultSearchBox(false);
          }}
          placeholder={bot.name ? `Search ${bot.name}'s sources` : undefined}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          isLoading={isLoading}
        />
        {defaultSearchBox ? (
          <p className="m-0 text-[13px] text-fg-subtle">
            Ask in plain language. Each result shows the passage it matched and
            which source it came from.
          </p>
        ) : (
          <AISearchEngine isLoading={isLoading} data={data} />
        )}
      </div>
    </div>
  );
};
