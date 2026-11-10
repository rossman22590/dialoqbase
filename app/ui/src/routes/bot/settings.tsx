import { useQuery } from "@tanstack/react-query";
import { useNavigate, useParams } from "react-router-dom";
import api from "../../services/api";
import React from "react";
import { SkeletonLoading } from "../../components/Common/SkeletonLoading";
import { SettingsBody } from "../../components/Bot/Settings/SettingsBody";
import { BotSettings } from "../../@types/bot";

export default function BotSettingsRoot() {
  const param = useParams<{ id: string }>();
  const navigate = useNavigate();

  const { data, status } = useQuery(
    ["getBotSettings", param.id],
    async () => {
      const response = await api.get(`/bot/${param.id}/settings`);
      return response.data as BotSettings;
    },
    {
      refetchInterval: 1000,
    }
  );

  React.useEffect(() => {
    if (status === "error") {
      navigate("/");
    }
  }, [status]);
  return (
    <>
      {status === "loading" && (
        <div className="max-w-3xl px-4 pt-6 sm:px-8 sm:pt-7">
          <SkeletonLoading className="mt-0" />
        </div>
      )}
      {status === "success" && <SettingsBody {...data} />}
    </>
  );
}
