import { useMutation, useQueryClient } from "@tanstack/react-query";
import { notification } from "antd";
import React from "react";
import api from "../../../../services/api";
import { useParams } from "react-router-dom";
import { KeyIcon } from "@heroicons/react/24/outline";
import { Card, EmptyState } from "../../../ui";

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
    <Card className="mx-auto max-w-2xl">
      <EmptyState
        icon={<KeyIcon />}
        title="No API key found"
        description="You need to generate an API key to get started. You can regenerate it at any time."
        action={
          <button
            disabled={isGeneratingAPIKey}
            onClick={() => {
              generateAPIKey();
            }}
            className="ui-btn-primary"
          >
            {!isGeneratingAPIKey ? "Generate API Key" : "Generating API Key..."}
          </button>
        }
      />
    </Card>
  );
};

export default NoApiKeyComponent;
