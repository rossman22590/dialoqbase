import { Result } from "antd";
import { Link, useParams } from "react-router-dom";
import { useIsAdmin } from "../../hooks/useIsAdmin";
import { AdminOverview } from "../../components/Admin/Overview";
import { AdminUsers } from "../../components/Admin/Users";
import { AdminBots } from "../../components/Admin/Bots";
import { AdminTransactions } from "../../components/Admin/Transactions";
import { AdminUsage } from "../../components/Admin/Usage";
import { AdminQueue } from "../../components/Admin/Queue";

const TABS = [
  { key: "overview", label: "Overview", Component: AdminOverview },
  { key: "users", label: "Users", Component: AdminUsers },
  { key: "bots", label: "Bots", Component: AdminBots },
  { key: "transactions", label: "Transactions", Component: AdminTransactions },
  { key: "usage", label: "Usage", Component: AdminUsage },
  { key: "queue", label: "Queue", Component: AdminQueue },
];

export default function AdminRoot() {
  const { data: adminInfo } = useIsAdmin();
  const { tab = "overview" } = useParams<{ tab?: string }>();

  if (!adminInfo?.is_admin) {
    return (
      <Result
        status="403"
        title="Admins only"
        subTitle="You need administrator access to view this page."
      />
    );
  }

  const active = TABS.find((t) => t.key === tab) || TABS[0];
  const ActiveTab = active.Component;

  return (
    <div className="mx-auto flex w-full max-w-[1200px] flex-col gap-5 px-4 py-8 sm:px-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-fg">Admin</h1>
        <p className="mt-1.5 text-sm text-fg-muted">
          Everyone's bots, credits and jobs.
        </p>
      </div>
      <nav
        aria-label="Admin sections"
        className="flex gap-1 overflow-x-auto border-b border-line"
      >
        {TABS.map((t) => (
          <Link
            key={t.key}
            to={`/admin/${t.key}`}
            aria-current={t.key === active.key ? "page" : undefined}
            className={`ui-tab min-h-[44px] px-3 ${
              t.key === active.key ? "ui-tab-active" : ""
            }`}
          >
            {t.label}
          </Link>
        ))}
      </nav>
      {/* key remounts the tab so each one starts fresh, as before */}
      <ActiveTab key={active.key} />
    </div>
  );
}
