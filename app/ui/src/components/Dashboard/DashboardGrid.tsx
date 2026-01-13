import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import api from "../../services/api";
import { ChevronRightIcon, XCircleIcon, MagnifyingGlassIcon } from "@heroicons/react/24/outline";
import { Empty } from "antd";
import { sources } from "../../utils/sources";
import { useMemo, useState } from "react";

export const DashboardGrid = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const { data, status } = useQuery(["getAllBots"], async () => {
    const response = await api.get("/bot");
    return response.data;
  });

  const filteredData = useMemo(() => {
    if (!data) return [];
    return data.filter((bot: any) =>
      bot.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [data, searchQuery]);

  return (
    <div className="mt-8">
      {status === "success" && data.length > 0 && (
        <div className="mb-8 max-w-md">
          <div className="relative group">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <MagnifyingGlassIcon className="h-5 w-5 text-gray-400 group-focus-within:text-indigo-500 transition-colors" aria-hidden="true" />
            </div>
            <input
              type="text"
              placeholder="Search your bots..."
              autoComplete="off"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="block w-full pl-11 pr-4 py-3 bg-white dark:bg-[#1e1e1e] border border-gray-200 dark:border-gray-700 rounded-2xl text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all shadow-sm hover:border-gray-300 dark:hover:border-gray-600 dark:text-white"
            />
          </div>
        </div>
      )}

      {status === "loading" && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          {[1, 2, 3, 4, 5, 6].map((item) => (
            <div
              className="flex animate-pulse h-28 px-3 py-4 bg-gray-200 dark:bg-[#1e1e1e] rounded-xl shadow-sm border border-gray-100 dark:border-gray-800"
              key={item}
            ></div>
          ))}
        </div>
      )}

      {status === "success" && data.length === 0 && (
        <div className="flex flex-col items-center justify-center py-12">
          <Empty description="No bots created yet" />
        </div>
      )}

      {status === "success" && data.length > 0 && (
        <>
          {filteredData.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12">
              <Empty description="No bots match your search" />
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
              {filteredData.map((bot: any) => (
                <Link
                  to={`/bot/${bot.id}`}
                  className="group flex rounded-2xl hover:shadow-xl hover:shadow-indigo-500/5 transition-all duration-300 ease-in-out cursor-pointer border border-gray-200 bg-white dark:bg-[#1e1e1e] dark:border-gray-800 dark:hover:bg-[#232323] dark:hover:border-gray-700 hover:bg-gray-50 hover:border-indigo-200 dark:hover:border-indigo-500/30 overflow-hidden"
                  key={bot.id}
                >
                  <div className="w-full truncate ">
                    <div className="flex flex-1 items-center justify-between ">
                      <div className="flex-1 truncate px-6 py-5">
                        <h3 className="text-lg font-bold text-gray-900 group-hover:text-indigo-600 dark:text-gray-100 dark:group-hover:text-white transition-colors truncate mb-1">
                          {bot.name}
                        </h3>
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] uppercase tracking-wider font-bold text-gray-400 dark:text-gray-500 bg-gray-100 dark:bg-gray-800 px-2 py-0.5 rounded-full">
                            {bot.model
                              .replace("-dbase", "")
                              .replace(/_dialoqbase_[0-9]+$/, "")}
                          </span>
                        </div>
                      </div>
                      <div className="flex-shrink-0 pr-4 opacity-0 group-hover:opacity-100 transition-opacity">
                        <div className="h-8 w-8 flex items-center justify-center rounded-full bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400">
                          <ChevronRightIcon className="h-5 w-5" aria-hidden="true" />
                        </div>
                      </div>
                    </div>

                    <div className="px-6 pb-5 flex flex-wrap gap-2 text-gray-500 text-xs dark:text-gray-400 border-t border-gray-50 dark:border-gray-800/50 pt-3">
                      {bot.source.map((source: any, idx: number) => (
                        <span
                          title={`${source.type} source`}
                          key={idx}
                          className="flex items-center gap-1.5 opacity-70 group-hover:opacity-100 transition-opacity"
                        >
                          {sources[source.type as keyof typeof sources]}
                          <span className="text-[10px] capitalize">{source.type}</span>
                        </span>
                      ))}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </>
      )}

      {status === "error" && (
        <div className="rounded-2xl bg-red-50 dark:bg-red-900/10 p-4 border border-red-100 dark:border-red-900/20">
          <div className="flex">
            <div className="flex-shrink-0">
              <XCircleIcon className="h-5 w-5 text-red-400" aria-hidden="true" />
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800 dark:text-red-400">
                Something went wrong while loading your bots
              </h3>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
