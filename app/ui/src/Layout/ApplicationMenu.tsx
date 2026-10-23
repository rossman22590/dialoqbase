import { Menu } from "@headlessui/react";
import { Transition } from "@headlessui/react";
import { Fragment } from "react";
import { useAuth } from "../context/AuthContext";
import Avatar from "../components/Common/Avatar";
import { Link, useNavigate } from "react-router-dom";
import {
  ArrowRightOnRectangleIcon,
  Cog6ToothIcon,
  MoonIcon,
  ShieldCheckIcon,
  SunIcon,
} from "@heroicons/react/24/outline";
import { useDarkMode } from "../hooks/useDarkmode";
import { useQuery } from "@tanstack/react-query";
import api from "../services/api";

//@ts-ignore
function classNames(...classes) {
  return classes.filter(Boolean).join(" ");
}

const itemClass = (active: boolean) =>
  classNames(
    active ? "bg-surface-2 text-fg" : "text-fg-muted",
    "flex w-full cursor-pointer items-center gap-2.5 rounded-lg px-2.5 py-2 text-sm transition-colors"
  );

export const ApplicationMenu = () => {
  const { profile, logout } = useAuth();
  const { mode, toggleDarkMode } = useDarkMode();
  const navigate = useNavigate();
  // Not useIsAdmin: that one suspends, and this menu sits outside any boundary
  const { data: adminInfo } = useQuery(["fetchDialoqbaseUserInfo"], async () => {
    const response = await api.get("/user/is-admin");
    return response.data as { is_admin: boolean };
  });
  return (
    <Menu as="div" className="relative ml-3">
      <div>
        <Menu.Button className="flex max-w-xs items-center rounded-full text-sm ring-2 ring-transparent ring-offset-2 ring-offset-chrome transition hover:ring-line-strong focus:outline-none focus-visible:ring-indigo-500">
          <span className="sr-only">Open user menu</span>
          <Avatar username={profile?.username || "admin"} />
        </Menu.Button>
      </div>
      <Transition
        as={Fragment}
        enter="transition ease-out duration-150"
        enterFrom="transform opacity-0 scale-95 -translate-y-1"
        enterTo="transform opacity-100 scale-100 translate-y-0"
        leave="transition ease-in duration-100"
        leaveFrom="transform opacity-100 scale-100"
        leaveTo="transform opacity-0 scale-95"
      >
        <Menu.Items className="absolute right-0 z-[1100] mt-2 w-60 origin-top-right rounded-xl border border-line bg-surface p-1.5 shadow-float focus:outline-none">
          <div className="flex items-center gap-3 px-2.5 pb-2.5 pt-2">
            <Avatar username={profile?.username || "admin"} />
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-fg">
                {profile?.username || "Account"}
              </p>
              <p className="text-xs text-fg-subtle">
                {adminInfo?.is_admin ? "Administrator" : "Signed in"}
              </p>
            </div>
          </div>
          <div className="my-1 h-px bg-line" />
          <Menu.Item>
            {({ active }) => (
              <Link className={itemClass(active)} to="/settings">
                <Cog6ToothIcon className="h-4 w-4" />
                Settings
              </Link>
            )}
          </Menu.Item>
          {adminInfo?.is_admin && (
            <Menu.Item>
              {({ active }) => (
                <Link className={itemClass(active)} to="/admin">
                  <ShieldCheckIcon className="h-4 w-4" />
                  Admin panel
                </Link>
              )}
            </Menu.Item>
          )}
          <Menu.Item>
            {({ active }) => (
              <div
                className={itemClass(active)}
                onClick={() => {
                  toggleDarkMode();
                }}
              >
                {mode === "dark" ? (
                  <SunIcon className="h-4 w-4" />
                ) : (
                  <MoonIcon className="h-4 w-4" />
                )}
                {mode === "dark" ? "Light mode" : "Dark mode"}
              </div>
            )}
          </Menu.Item>
          <div className="my-1 h-px bg-line" />
          <Menu.Item>
            {({ active }) => (
              <span
                className={classNames(
                  active
                    ? "bg-red-50 text-red-600 dark:bg-red-500/10 dark:text-red-400"
                    : "text-red-600 dark:text-red-400",
                  "flex w-full cursor-pointer items-center gap-2.5 rounded-lg px-2.5 py-2 text-sm transition-colors"
                )}
                onClick={() => {
                  logout();
                  navigate("/login");
                }}
              >
                <ArrowRightOnRectangleIcon className="h-4 w-4" />
                Sign out
              </span>
            )}
          </Menu.Item>
        </Menu.Items>
      </Transition>
    </Menu>
  );
};
