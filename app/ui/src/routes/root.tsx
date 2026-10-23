import React from "react";
import { DashboardGrid } from "../components/Dashboard/DashboardGrid";
import { DashboardNewBtn } from "../components/Dashboard/DashboardNewBtn";
import { useMessage } from "../hooks/useMessage";
import { PageHeader } from "../components/ui";

export default function Root() {
  const { setMessages, setHistory, setIsFirstMessage , setHistoryId} = useMessage();

  React.useEffect(() => {
    setHistoryId(null);
    setIsFirstMessage(true);
    setMessages([]);
    setHistory([]);
  }, []);

  return (
    <div className="ui-page">
      <PageHeader
        className="animate-fade-up"
        eyebrow="Workspace"
        title="Your bots"
        description="Every bot you've built, trained on your own data. Open one to chat with it, tune its settings or embed it anywhere."
        actions={<DashboardNewBtn />}
      />
      <DashboardGrid />
    </div>
  );
}
