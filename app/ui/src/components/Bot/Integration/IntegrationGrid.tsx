import { Modal } from "antd";
import React from "react";
import { IntegrationForm } from "./IntegrationForm";
import { useParams } from "react-router-dom";
import { IntegrationCard } from "./IntegrationCard";
import { PageHeader } from "../../ui";

type Props = {
  data: {
    name: string;
    channel: string;
    logo: string;
    description: string;
    link: string;
    fields: {
      name: string;
      type: string;
      title: string;
      description: string;
      help: string;
      inputType: string;
      requiredMessage: string;
      value: string;
    }[];
    isPaused: boolean;
    status: string;
    color: string;
    textColor: string;
    connectBtn?: {
      text: string;
      link: string;
    } | null;
  }[];
};

export const IntegrationGrid: React.FC<Props> = ({ data }) => {
  const [open, setOpen] = React.useState(false);
  const [selectedIntegration, setSelectedIntegration] = React.useState<{
    name: string;
    channel: string;
    logo: string;
    description: string;
    link: string;
    fields: {
      name: string;
      type: string;
      title: string;
      description: string;
      help: string;
      requiredMessage: string;
      inputType: string;
      value: string;
    }[];
    isPaused: boolean;
    status: string;
    color: string;
    textColor: string;
  } | null>();
  const param = useParams<{ id: string }>();
  return (
    <div>
      <PageHeader
        title="Integrations"
        description="Make your bot available on the channels and platforms your users already use."
      />

      <h2 className="mt-8 text-xs font-semibold uppercase tracking-[0.08em] text-fg-subtle">
        Channels
      </h2>
      {/* GRID */}
      <div className="mt-3 grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-5 lg:grid-cols-3">
        {data.map((integration, index) => (
          <div
            key={integration.channel || index}
            className="animate-fade-up h-full"
            style={{ animationDelay: `${index * 40}ms` }}
          >
            <IntegrationCard
              onClick={() => {
                setSelectedIntegration(integration);
                setOpen(true);
              }}
              logo={integration.logo}
              name={integration.name}
              color={integration.color}
              textColor={integration.textColor}
              status={integration.status}
              description={integration.description}
            />
          </div>
        ))}
      </div>

      <h2 className="mt-10 text-xs font-semibold uppercase tracking-[0.08em] text-fg-subtle">
        Embed &amp; developer
      </h2>
      <div className="mt-3 grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-5 lg:grid-cols-3">
        <IntegrationCard
          href={`/bot/${param.id}/embed?type=html`}
          logo="/providers/html.svg"
          name="HTML Embed"
          color="#fff"
          textColor="#000"
          description="Embed your chatbot on your website or blog using HTML snippet."
        />

        <IntegrationCard
          href={`/bot/${param.id}/embed?type=nextjs`}
          logo="/providers/web.svg"
          name="Next.js Embed"
          color="#fff"
          textColor="#000"
          description="Embed your chatbot on your Next.js application using a React component."
        />

        <IntegrationCard
          href={`/bot/${param.id}/integrations/api`}
          logo="/providers/api.svg"
          name="API"
          color="#fff"
          textColor="#000"
          description="Customize your integration using our robust API. Connect and expand the capabilities of your chatbot across platforms."
        />
      </div>

      {/* MODAL */}
      <Modal
        title={
          <div className="flex items-center gap-3">
            {selectedIntegration?.logo && (
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-line bg-white p-1.5 shadow-soft">
                <img
                  src={selectedIntegration.logo}
                  alt=""
                  className="h-full w-full object-contain"
                />
              </span>
            )}
            <span className="text-[15px] font-semibold tracking-tight text-fg">
              {`${selectedIntegration?.name} Integration`}
            </span>
          </div>
        }
        open={open}
        onCancel={() => setOpen(false)}
        footer={null}
        maskClosable={false}
      >
        <IntegrationForm
          onClose={() => setOpen(false)}
          data={selectedIntegration!}
        />
      </Modal>
    </div>
  );
};
