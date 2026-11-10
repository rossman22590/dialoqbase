import React from "react";
import NoApiKeyComponent from "./NoApiKeyComponent";
import { BotIntegrationAPI } from "../../../../@types/bot";
import ApiPlaygroundComponent from "./ApiPlaygroundComponent";

const IntegrationAPIBody: React.FC<BotIntegrationAPI> = ({
  is_api_enabled,
  data,
}) => {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="m-0 text-2xl font-semibold tracking-tight text-fg">
          API
        </h1>
        <p className="m-0 mt-1.5 text-sm text-fg-muted">
          Call your bot from your own code. Send a POST request with this
          bot's API key in the <code className="text-[13px]">x-api-key</code>{" "}
          header.
        </p>
      </div>
      {!is_api_enabled && <NoApiKeyComponent />}
      {is_api_enabled && (
        <ApiPlaygroundComponent data={data} is_api_enabled={is_api_enabled} />
      )}
    </div>
  );
};

export default IntegrationAPIBody;
