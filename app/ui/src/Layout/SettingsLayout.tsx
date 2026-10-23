import {
  CubeIcon,
  ShieldCheckIcon,
  UserCircleIcon,
  UsersIcon,
} from "@heroicons/react/24/outline";
import { useIsAdmin } from "../hooks/useIsAdmin";
import { Link, useLocation } from "react-router-dom";
import { AiIcon } from "../components/Icons/AiIcon";

//@ts-ignore
function classNames(...classes) {
  return classes.filter(Boolean).join(" ");
}

const LinkComponent = (item: {
  href: string;
  name: string;
  icon: any;
  current: string;
}) => {
  return (
    <li>
      <Link
        to={item.href}
        aria-current={item.current === item.href ? "page" : undefined}
        className={classNames(
          item.current === item.href
            ? "bg-surface text-fg shadow-soft ring-1 ring-line"
            : "text-fg-muted hover:bg-surface-2 hover:text-fg",
          "group flex items-center gap-x-2.5 rounded-xl py-2 pl-2.5 pr-3 text-sm font-medium leading-6 transition-colors"
        )}
      >
        <item.icon
          className={classNames(
            item.current === item.href
              ? "text-indigo-600 dark:text-indigo-300"
              : "text-fg-subtle group-hover:text-fg-muted",
            "h-5 w-5 shrink-0"
          )}
          aria-hidden="true"
        />
        {item.name}
      </Link>
    </li>
  );
};

export const SettingsLayout = ({ children }: { children: React.ReactNode }) => {
  const { data: adminInfo } = useIsAdmin();
  const location = useLocation();
  return (
    <>
      <div className="mx-auto max-w-7xl lg:flex lg:gap-x-16 lg:px-8">
        <aside className="flex overflow-x-auto border-b border-line py-3 lg:sticky lg:top-24 lg:mt-12 lg:block lg:w-60 lg:flex-none lg:self-start lg:border-0 lg:py-0">
          <nav className="flex-none px-4 sm:px-6 lg:px-0">
            <p className="mb-2 hidden px-2.5 text-[11px] font-semibold uppercase tracking-[0.08em] text-fg-subtle lg:block">
              Settings
            </p>
            <ul
              role="list"
              className="flex gap-x-3 gap-y-1 whitespace-nowrap lg:flex-col"
            >
              <LinkComponent
                href="/settings"
                name="General"
                icon={UserCircleIcon}
                current={location.pathname}
              />
              {adminInfo?.is_admin && (
                <>
                  <LinkComponent
                    href="/settings/application"
                    name="Application"
                    icon={CubeIcon}
                    current={location.pathname}
                  />

                  <LinkComponent
                    href="/settings/teams"
                    name="Teams"
                    icon={UsersIcon}
                    current={location.pathname}
                  />

                  <LinkComponent
                    href="/settings/model"
                    name="Model"
                    current={location.pathname}
                    icon={AiIcon}
                  />

                  <LinkComponent
                    href="/admin"
                    name="Admin panel"
                    current={location.pathname}
                    icon={ShieldCheckIcon}
                  />
                </>
              )}
            </ul>
          </nav>
        </aside>

        <main
          className={
            "px-4 py-10 sm:px-6 lg:flex-auto lg:px-0 lg:py-12 lg:mx-auto lg:max-w-3xl"
          }
        >
          <div className="mx-auto max-w-3xl space-y-8 lg:mx-0 lg:max-w-none">
            {children}
          </div>
        </main>
      </div>
    </>
  );
};
