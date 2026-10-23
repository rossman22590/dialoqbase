import { useQuery } from "@tanstack/react-query";
import React from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../../services/api";
import { SkeletonLoading } from "../../components/Common/SkeletonLoading";
import IntegrationAPIBody from "../../components/Bot/Integration/API/Index";
import { BotIntegrationAPI } from "../../@types/bot";

export default function BotIntegrationAPIRoot() {
  const param = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data, status } = useQuery(
    ["getBotIntegrationAPI", param.id],
    async () => {
      const response = await api.get(`/bot/integration/${param.id}/api`);
      return response.data as BotIntegrationAPI;
    },
    {
      enabled: !!param.id,
    }
  );

  React.useEffect(() => {
    if (status === "error") {
      navigate("/");
    }
  }, [status]);

  return (
    <div className="ui-page">
      {status === "loading" && <SkeletonLoading className="mt-0" />}
      {status === "success" && <IntegrationAPIBody {...data} />}
    </div>
  );
}
