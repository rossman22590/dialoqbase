import { QueryErrorResetBoundary } from "@tanstack/react-query";
import React from "react";
import { ErrorBoundary, FallbackProps } from "react-error-boundary";
import {
  ArrowPathIcon,
  ExclamationTriangleIcon,
} from "@heroicons/react/24/outline";

export const QueryBoundaries = ({
  children,
}: {
  children: React.ReactNode;
}) => (
  <QueryErrorResetBoundary>
    {({ reset }) => (
      <ErrorBoundary onReset={reset} FallbackComponent={ErrorView}>
        <React.Suspense fallback={<LoadingView />}>{children}</React.Suspense>
      </ErrorBoundary>
    )}
  </QueryErrorResetBoundary>
);

const LoadingView = () => (
  <div className="animate-fade-in fixed inset-0 z-50 flex h-screen w-full flex-col items-center justify-center overflow-hidden bg-app/80 backdrop-blur-sm">
    <div role="status" className="flex flex-col items-center">
      <div className="relative h-14 w-14">
        <div
          aria-hidden="true"
          className="chat-hero-glow pointer-events-none absolute left-1/2 top-1/2 h-40 w-40 -translate-x-1/2 -translate-y-1/2"
        />
        <div
          aria-hidden="true"
          className="absolute inset-0 rounded-full border-2 border-indigo-500/15"
        />
        <div
          aria-hidden="true"
          className="absolute inset-0 animate-spin rounded-full border-2 border-transparent border-t-indigo-600 [animation-duration:0.9s] dark:border-t-indigo-400"
        />
        <img
          src="/logo.png"
          alt=""
          aria-hidden="true"
          className="absolute inset-3 h-8 w-8 rounded-lg object-contain"
        />
      </div>
      <h2 className="mt-5 text-sm font-medium tracking-tight text-fg-muted">
        Loading...
      </h2>
    </div>
  </div>
);

const ErrorView = ({ error, resetErrorBoundary }: FallbackProps) => {
  return (
    <div className="flex min-h-[60vh] items-center justify-center px-4 py-16">
      <div className="ui-card animate-fade-up w-full max-w-md p-6 text-center sm:p-8">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-red-50 text-red-600 ring-1 ring-inset ring-red-100 dark:bg-red-500/10 dark:text-red-300 dark:ring-red-400/20">
          <ExclamationTriangleIcon className="h-6 w-6" aria-hidden="true" />
        </div>
        <h2 className="mt-4 text-base font-semibold tracking-tight text-fg">
          Something went wrong
        </h2>
        <div className="mt-1.5 break-words text-sm leading-relaxed text-fg-muted">
          {error.message}
        </div>
        <button
          onClick={resetErrorBoundary}
          className="ui-btn-primary mt-6"
        >
          <ArrowPathIcon aria-hidden="true" />
          Retry
        </button>
      </div>
    </div>
  );
};
