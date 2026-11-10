import { useQuery } from "@tanstack/react-query";
import { useNavigate, useParams } from "react-router-dom";
import React from "react";
import { SkeletonLoading } from "../../components/Common/SkeletonLoading";
import { DsTable } from "../../components/Bot/DS/DsTable";
import api from "../../services/api";
import { Pagination } from "antd";

export default function BotDSRoot() {
  const param = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [page, setPage] = React.useState(1);
  const [limit, setLimit] = React.useState(10);
  const [search, setSearch] = React.useState<string | undefined>(undefined);
  const [searchValue, setSearchValue] = React.useState<string | undefined>(
    undefined
  );

  const { data: botData, status } = useQuery(
    ["getBotDS", param.id, page, limit, searchValue],
    async () => {
      const response = await api.get(
        `/bot/${param.id}/source?page=${page}&limit=${limit}${
          searchValue && searchValue.trim().length > 0
            ? `&search=${searchValue}`
            : ""
        }`
      );
      return response.data as {
        data: {
          id: string;
          type: string;
          content: string;
          status: string;
          createdAt?: string;
          updatedAt?: string;
        }[];
        limit: number;
        page: number;
        total: number;
      };
    },
    {
      refetchInterval: 2 * 60 * 1000,
      keepPreviousData: true,
    }
  );

  React.useEffect(() => {
    if (status === "error") {
      navigate("/");
    }
  }, [status]);

  return (
    <div className="px-4 pb-10 pt-6 sm:px-8 sm:pt-8">
      <div className="max-w-[1040px]">
        {status === "loading" && <SkeletonLoading className="mt-0" />}
        {status === "success" && (
          <DsTable
            data={botData.data}
            total={botData.total}
            searchNode={
              <input
                type="search"
                aria-label="Search sources"
                placeholder="Search sources"
                value={search ?? ""}
                onChange={(e) => {
                  setSearch(e.target.value);
                  // Clearing the box resets the list, like Input.Search's clear.
                  if (e.target.value === "") setSearchValue(e.target.value);
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    setSearchValue(search);
                  }
                }}
                className="ui-input h-[34px] w-full border-line text-[13px] sm:w-[200px]"
              />
            }
            paginationNode={
              botData.total >= 10 ? (
                <Pagination
                  size="small"
                  onShowSizeChange={(current, size) => {
                    setPage(current);
                    setLimit(size);
                  }}
                  total={botData.total}
                  current={botData.page}
                  pageSize={botData.limit}
                  showSizeChanger
                  onChange={(page, pageSize) => {
                    setPage(page);
                    setLimit(pageSize);
                  }}
                />
              ) : null
            }
          />
        )}
      </div>
    </div>
  );
}
