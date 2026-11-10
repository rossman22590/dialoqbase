import { useIsAdmin } from "../hooks/useIsAdmin";
import { Link, useLocation } from "react-router-dom";

const NavLink = ({
  href,
  name,
  current,
}: {
  href: string;
  name: string;
  current: string;
}) => {
  const active = current === href;
  return (
    <li>
      <Link
        to={href}
        aria-current={active ? "page" : undefined}
        className={`flex min-h-[40px] items-center whitespace-nowrap rounded-lg px-2.5 text-sm transition-colors ${
          active
            ? "bg-surface-2 font-medium text-fg"
            : "text-fg-muted hover:text-fg"
        }`}
      >
        {name}
      </Link>
    </li>
  );
};

export const SettingsLayout = ({ children }: { children: React.ReactNode }) => {
  const { data: adminInfo } = useIsAdmin();
  const location = useLocation();

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
      <h1 className="text-2xl font-semibold tracking-tight text-fg">Settings</h1>
      <div className="mt-6 flex flex-col gap-8 lg:flex-row lg:items-start">
        <aside className="lg:sticky lg:top-24 lg:w-[220px] lg:flex-none">
          <nav aria-label="Settings" className="flex gap-6 overflow-x-auto lg:flex-col lg:gap-4">
            <div>
              <p className="ui-eyebrow mb-1">Account</p>
              <ul role="list" className="flex gap-1 lg:flex-col">
                <NavLink
                  href="/settings"
                  name="Profile & API key"
                  current={location.pathname}
                />
              </ul>
            </div>
            {adminInfo?.is_admin && (
              <div>
                <p className="ui-eyebrow mb-1">Workspace (admin)</p>
                <ul role="list" className="flex gap-1 lg:flex-col">
                  <NavLink
                    href="/settings/teams"
                    name="Team"
                    current={location.pathname}
                  />
                  <NavLink
                    href="/settings/model"
                    name="Models"
                    current={location.pathname}
                  />
                  <NavLink
                    href="/settings/application"
                    name="Application"
                    current={location.pathname}
                  />
                </ul>
              </div>
            )}
          </nav>
        </aside>
        <main className="min-w-0 flex-1">
          <div className="flex flex-col gap-5">{children}</div>
        </main>
      </div>
    </div>
  );
};
