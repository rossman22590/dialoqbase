import React from "react";

type Props = {
  public_id: string;
  // Fill the parent's height instead of the fixed 585px.
  fill?: boolean;
  className?: string;
};

export const PreviewIframe = ({ public_id, fill, className }: Props) => {
  const [hostUrl] = React.useState<string>(
    () =>
      import.meta.env.VITE_HOST_URL ||
      window.location.protocol + "//" + window.location.host
  );
  return (
    <div className={`bg-white ${fill ? "h-full" : ""} ${className || ""}`}>
      <iframe
        src={`${hostUrl}/bot/${public_id}?mode=iframe&no=button`}
        className={`block w-full border-0 bg-white ${fill ? "h-full" : ""}`}
        height={fill ? undefined : 585}
        title="Botcraft Pro chat preview"
      />
    </div>
  );
};
