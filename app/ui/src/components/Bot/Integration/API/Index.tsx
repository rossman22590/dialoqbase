import React from "react";
import NoApiKeyComponent from "./NoApiKeyComponent";
import { BotIntegrationAPI } from "../../../../@types/bot";
import ApiPlaygroundComponent from "./ApiPlaygroundComponent";
import { PageHeader } from "../../../ui";

const IntegrationAPIBody: React.FC<BotIntegrationAPI> = ({
  is_api_enabled,
  data,
}) => {
  return (
    <div>
      <PageHeader
        eyebrow="Developer"
        title="API Integration"
        description="Talk to your bot from any backend. Try requests live, then copy a ready-made snippet in your language."
      />
      <div className="mt-8">
        {!is_api_enabled && <NoApiKeyComponent />}
        {is_api_enabled && (
          <ApiPlaygroundComponent data={data} is_api_enabled={is_api_enabled} />
        )}
      </div>
    </div>
  );
};

export default IntegrationAPIBody;
