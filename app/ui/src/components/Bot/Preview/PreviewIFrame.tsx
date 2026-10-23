import React from "react";

type Props = {
  public_id: string;
};

export const PreviewIframe = ({ public_id }: Props) => {
  const [hostUrl] = React.useState<string>(
    () =>
      import.meta.env.VITE_HOST_URL ||
      window.location.protocol + "//" + window.location.host
  );
  return (
    <>
      <div className="bg-surface-2">
        <iframe
          src={`${hostUrl}/bot/${public_id}?mode=iframe&no=button`}
          className="block w-full border-0 bg-white"
          height={585}
          title="Botcraft Pro"
        />
      </div>
    </>
  );
};
