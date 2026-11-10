import { useMutation, useQueryClient } from "@tanstack/react-query";
import { notification } from "antd";
import React from "react";
import api from "../../../../services/api";
import { useParams } from "react-router-dom";

const NoApiKeyComponent: React.FC = () => {
  const client = useQueryClient();
  const param = useParams<{ id: string }>();
  const { mutate: generateAPIKey, isLoading: isGeneratingAPIKey } = useMutation(
    async () => {
      const response = await api.post(`/bot/integration/${param.id}/api`);
      return response.data;
    },
    {
      onSuccess: () => {
        notification.success({
          message: "Success",
          description: "API key generated successfully.",
        });
        client.invalidateQueries(["getBotIntegrationAPI"]);
      },
      onError: (e) => {
        console.log(e);
        notification.error({
          message: "Error",
          description: "Something went wrong while generating the API key.",
        });
      },
    }
  );

  return (
    <section className="ui-card flex flex-col items-start gap-3 px-5 py-5 sm:flex-row sm:items-center">
      <div className="min-w-0 flex-1">
        <h2 className="m-0 text-[15px] font-semibold text-fg">
          No API key yet
        </h2>
        <p className="m-0 mt-0.5 text-sm text-fg-muted">
          Generate a key to start calling this bot. You can regenerate it at
          any time.
        </p>
      </div>
      <button
        type="button"
        disabled={isGeneratingAPIKey}
        onClick={() => {
          generateAPIKey();
        }}
        className="ui-btn-primary shrink-0"
      >
        {!isGeneratingAPIKey ? "Generate API key" : "Generating API key..."}
      </button>
    </section>
  );
};

export default NoApiKeyComponent;
