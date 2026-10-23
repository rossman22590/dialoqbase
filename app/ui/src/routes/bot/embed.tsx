import { useQuery } from "@tanstack/react-query";
import { useNavigate, useParams } from "react-router-dom";
import api from "../../services/api";
import React from "react";
import { SkeletonLoading } from "../../components/Common/SkeletonLoading";
import { Cooking } from "../../components/Common/Cooking";
import { EmbedBoard } from "../../components/Bot/Embed/EmbedBoard";
import { PreviewIframe } from "../../components/Bot/Preview/PreviewIFrame";
import { Card, CardHeader, PageHeader } from "../../components/ui";
import { EyeIcon } from "@heroicons/react/24/outline";

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
    <div className="ui-page">
      {status === "loading" && <SkeletonLoading />}
      {status === "success" && data.inProgress && <Cooking />}
      {status === "success" && !data.inProgress && (
        <div>
          <PageHeader
            title="Embed"
            description="Put your bot on any website or app. Tweak the widget, copy the snippet, and paste it into your page."
          />
          <div className="mt-8 grid grid-cols-1 items-start gap-6 lg:grid-cols-3">
            <section aria-label="Embed snippets" className="min-w-0 lg:col-span-2">
              <EmbedBoard public_id={data.public_id} />
            </section>
            <section
              aria-label="Live preview"
              className="min-w-0 lg:sticky lg:top-20"
            >
              <Card className="overflow-hidden">
                <CardHeader
                  icon={<EyeIcon />}
                  title="Live preview"
                  description="How visitors will see your bot."
                />
                <PreviewIframe public_id={data.public_id} />
              </Card>
            </section>
          </div>
        </div>
      )}
    </div>
  );
}
