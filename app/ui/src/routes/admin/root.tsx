import { Result, Tabs } from "antd";
import { useNavigate, useParams } from "react-router-dom";
import {
  ArrowsRightLeftIcon,
  ChartBarIcon,
  CpuChipIcon,
  QueueListIcon,
  Squares2X2Icon,
  UsersIcon,
} from "@heroicons/react/24/outline";
import { useIsAdmin } from "../../hooks/useIsAdmin";
import { AdminOverview } from "../../components/Admin/Overview";
import { AdminUsers } from "../../components/Admin/Users";
import { AdminBots } from "../../components/Admin/Bots";
import { AdminTransactions } from "../../components/Admin/Transactions";
import { AdminUsage } from "../../components/Admin/Usage";
import { AdminQueue } from "../../components/Admin/Queue";
import { PageHeader } from "../../components/ui";

const TabLabel = ({
  icon: Icon,
  children,
}: {
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  children: React.ReactNode;
}) => (
  <span className="inline-flex items-center gap-1.5">
    <Icon className="h-4 w-4" aria-hidden="true" />
    {children}
  </span>
);

const TABS = [
  {
    key: "overview",
    label: <TabLabel icon={Squares2X2Icon}>Overview</TabLabel>,
    children: <AdminOverview />,
  },
  {
    key: "users",
    label: <TabLabel icon={UsersIcon}>Users</TabLabel>,
    children: <AdminUsers />,
  },
  {
    key: "bots",
    label: <TabLabel icon={CpuChipIcon}>Bots</TabLabel>,
    children: <AdminBots />,
  },
  {
    key: "transactions",
    label: <TabLabel icon={ArrowsRightLeftIcon}>Transactions</TabLabel>,
    children: <AdminTransactions />,
  },
  {
    key: "usage",
    label: <TabLabel icon={ChartBarIcon}>Usage</TabLabel>,
    children: <AdminUsage />,
  },
  {
    key: "queue",
    label: <TabLabel icon={QueueListIcon}>Queue</TabLabel>,
    children: <AdminQueue />,
  },
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
    <div className="ui-page">
      <PageHeader
        eyebrow="Administration"
        title="Admin"
        description="Every user, bot, credit and background job on this server."
      />
      <div className="mt-6">
        <Tabs
          activeKey={TABS.some((t) => t.key === tab) ? tab : "overview"}
          onChange={(key) => navigate(`/admin/${key}`)}
          items={TABS}
          destroyInactiveTabPane
        />
      </div>
    </div>
  );
}
