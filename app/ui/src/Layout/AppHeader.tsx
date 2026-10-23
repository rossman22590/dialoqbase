import { Bars3BottomLeftIcon } from "@heroicons/react/24/outline";
import { Link } from "react-router-dom";
import { ApplicationMenu } from "./ApplicationMenu";

// Top bar shared by the dashboard and bot layouts.
export const AppHeader = ({
  balance,
  onOpenNav,
  contained = false,
  zIndex = "z-[999]",
}: {
  balance?: number | string | null;
  // Shows a menu button below md that opens the layout's mobile nav.
  onOpenNav?: () => void;
  // Constrain the content to the dashboard's max width.
  contained?: boolean;
  zIndex?: string;
}) => (
  <header
    className={`sticky top-0 ${zIndex} h-14 border-b border-line bg-chrome/80 backdrop-blur-xl backdrop-saturate-150`}
  >
    <div
      className={`flex h-full items-center ${
        contained ? "mx-auto max-w-7xl px-4 sm:px-6 lg:px-8" : ""
      }`}
    >
      {onOpenNav && (
        <button
          type="button"
          className="flex h-full items-center border-r border-line px-4 text-fg-muted transition-colors hover:text-fg focus:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-indigo-500 md:hidden"
          onClick={onOpenNav}
        >
          <span className="sr-only">Open sidebar</span>
          <Bars3BottomLeftIcon className="h-6 w-6" aria-hidden="true" />
        </button>
      )}
      <Link
        to="/"
        className={`group flex shrink-0 items-center rounded-lg text-fg focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 ${
          contained ? "" : "px-3"
        }`}
      >
        <img
          className="h-8 w-auto transition-transform duration-300 group-hover:rotate-[-8deg] group-hover:scale-105"
          src="/logo.png"
          alt="Botcraft Pro"
        />
        <span className="ml-1 whitespace-nowrap text-lg font-semibold tracking-tight sm:text-xl">
          Botcraft Pro
        </span>
        <span className="ml-2 hidden flex-shrink-0 rounded-full bg-emerald-50 px-2 py-0.5 text-[11px] font-medium text-emerald-700 ring-1 ring-inset ring-emerald-600/15 dark:bg-emerald-500/10 dark:text-emerald-300 dark:ring-emerald-400/20 sm:inline-block">
          {/* @ts-ignore */}
          {`v${__APP_VERSION__}`}
        </span>
      </Link>
      <div
        className={`flex min-w-0 flex-1 items-center justify-end ${
          contained ? "" : "px-3 sm:px-4"
        }`}
      >
        <div
          title="Credits"
          className="mr-1 flex items-center gap-1.5 whitespace-nowrap rounded-full border border-line bg-surface py-1 pl-2 pr-3 text-[13px] font-medium tabular-nums text-fg-muted shadow-soft"
        >
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 shadow-[0_0_0_3px_rgb(16_185_129/0.15)]" />
          <span className="hidden sm:inline">Credits</span>
          <span className="text-fg">
            ${Number(balance || 0).toFixed(4)}
          </span>
        </div>
        <ApplicationMenu />
      </div>
    </div>
  </header>
);
