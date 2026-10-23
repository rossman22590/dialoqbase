import { useQuery } from "@tanstack/react-query";
import { useNavigate, useParams } from "react-router-dom";
import React from "react";
import { SkeletonLoading } from "../../components/Common/SkeletonLoading";
import { DsTable } from "../../components/Bot/DS/DsTable";
import api from "../../services/api";
import { Input, Pagination } from "antd";

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
    <div className="ui-page">
      {status === "loading" && <SkeletonLoading />}
      {status === "success" && (
        <div>
          <DsTable
            data={botData.data}
            searchNode={
              <div className="w-full sm:w-72">
                <Input.Search
                  value={search}
                  onSearch={(value) => setSearchValue(value)}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search sources"
                  className="w-full"
                />
              </div>
            }
          />
          {botData.total >= 10 && (
            <div className="mt-4 flex items-center justify-end">
              <Pagination
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
            </div>
          )}
        </div>
      )}
    </div>
  );
}
