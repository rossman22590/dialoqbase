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
    <div className="mx-auto flex w-full max-w-[1200px] flex-col gap-6 px-4 pb-12 pt-8 sm:px-6">
      <PageHeader
        title="Bots"
        description="Each bot answers from the sources you give it."
        actions={<DashboardNewBtn />}
      />
      <DashboardGrid />
    </div>
  );
}
