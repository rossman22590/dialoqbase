import React from "react";
import { useSearchParams } from "react-router-dom";
import { EmbedBoardCard } from "./EmbedBoardCard";
import { EmbedBoardScript } from "./EmbedBoardScript";
import { EmbedBoardNextjs } from "./EmbedBoardNextjs";

type Props = {
  public_id: string;
};

export const EmbedBoard = ({ public_id }: Props) => {
  const [searchParams] = useSearchParams();
  const type = searchParams.get("type");

  const [hostUrl] = React.useState<string>(
    () =>
      import.meta.env.VITE_HOST_URL ||
      window.location.protocol + "//" + window.location.host
  );

  const showHtml = !type || type === "html";
  const showNextjs = !type || type === "nextjs";

  return (
    <div className="lg:col-span-9">
      {showHtml && (
        <EmbedBoardScript
          hostUrl={hostUrl}
          public_id={public_id}
        />
      )}

      {showNextjs && (
        <EmbedBoardNextjs
          hostUrl={hostUrl}
          public_id={public_id}
        />
      )}

      {showHtml && (
        <>
          <EmbedBoardCard
            title="Public URL"
            description="This is the public URL of your bot. You can use this URL to embed"
            content={`${hostUrl}/bot/${public_id}`}
          />

          <EmbedBoardCard
            title="Iframe"
            description="You can use this iframe to embed your bot"
            content={`<iframe src="${hostUrl}/bot/${public_id}?mode=iframe" width="400" height="500" />`}
          />
        </>
      )}
    </div>
  );
};
