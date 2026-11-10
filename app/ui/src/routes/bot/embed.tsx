import { useQuery } from "@tanstack/react-query";
import { Link, useNavigate, useParams } from "react-router-dom";
import api from "../../services/api";
import React from "react";
import { SkeletonLoading } from "../../components/Common/SkeletonLoading";
import { Cooking } from "../../components/Common/Cooking";
import { EmbedBoard } from "../../components/Bot/Embed/EmbedBoard";

export default function BotEmbedRoot() {
  const param = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data, status } = useQuery(
    ["getBotEmbedding", param.id],
    async () => {
      const response = await api.get(`/bot/${param.id}/embed`);
      return response.data as {
        inProgress: boolean;
        public_id: string;
      };
    },
    {
      enabled: !!param.id,
      refetchInterval: 1000,
    }
  );

  React.useEffect(() => {
    if (status === "error") {
      navigate("/");
    }
  }, [status]);

  return (
    <div className="px-4 pb-10 pt-6 sm:px-8 sm:pt-8">
      <div className="max-w-[920px]">
        {status === "loading" && <SkeletonLoading className="mt-0" />}
        {status === "success" && data.inProgress && <Cooking />}
        {status === "success" && !data.inProgress && (
          <div className="flex flex-col gap-6">
            <div>
              <h1 className="m-0 text-2xl font-semibold tracking-tight text-fg">
                Embed on a site
              </h1>
              <p className="m-0 mt-1.5 text-sm text-fg-muted">
                Pick how it should show up, then paste the snippet into your
                site. The bot's name and greeting come from{" "}
                <Link
                  to={`/bot/${param.id}/appearance`}
                  className="text-indigo-700 hover:text-indigo-800 dark:text-indigo-300 dark:hover:text-indigo-200"
                >
                  Appearance
                </Link>
                .
              </p>
            </div>
            <EmbedBoard public_id={data.public_id} />
          </div>
        )}
      </div>
    </div>
  );
}
