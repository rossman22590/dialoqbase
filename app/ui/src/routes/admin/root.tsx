import { Result, Tabs } from "antd";
import { useNavigate, useParams } from "react-router-dom";
import { useIsAdmin } from "../../hooks/useIsAdmin";
import { AdminOverview } from "../../components/Admin/Overview";
import { AdminUsers } from "../../components/Admin/Users";
import { AdminBots } from "../../components/Admin/Bots";
import { AdminTransactions } from "../../components/Admin/Transactions";
import { AdminUsage } from "../../components/Admin/Usage";
import { AdminQueue } from "../../components/Admin/Queue";

const TABS = [
  { key: "overview", label: "Overview", children: <AdminOverview /> },
  { key: "users", label: "Users", children: <AdminUsers /> },
  { key: "bots", label: "Bots", children: <AdminBots /> },
  { key: "transactions", label: "Transactions", children: <AdminTransactions /> },
  { key: "usage", label: "Usage", children: <AdminUsage /> },
  { key: "queue", label: "Queue", children: <AdminQueue /> },
];

export default function AdminRoot() {
  const { data: adminInfo } = useIsAdmin();
  const { tab = "overview" } = useParams<{ tab?: string }>();
  const navigate = useNavigate();

  if (!adminInfo?.is_admin) {
    return (
      <Result
        status="403"
        title="Admins only"
        subTitle="You need administrator access to view this page."
      />
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-4">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Admin</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Every user, bot, credit and background job on this server.
        </p>
      </div>
      <Tabs
        activeKey={TABS.some((t) => t.key === tab) ? tab : "overview"}
        onChange={(key) => navigate(`/admin/${key}`)}
        items={TABS}
        destroyInactiveTabPane
      />
    </div>
  );
}
