import { useState, useEffect } from "react";

type QueryParams = {
  [key: string]: string;
};

const useQueryParams = (): QueryParams => {
  const [queryParams, setQueryParams] = useState<QueryParams>({});

  useEffect(() => {
    const params: QueryParams = {};

    // Parse from search
    const searchParams = new URLSearchParams(window.location.search);
    for (const [key, value] of searchParams.entries()) {
      params[key] = value;
    }

    // Parse from hash (for HashRouter compatibility)
    const hash = window.location.hash;
    const hashSearchIndex = hash.indexOf("?");
    if (hashSearchIndex !== -1) {
      const hashSearchParams = new URLSearchParams(hash.slice(hashSearchIndex));
      for (const [key, value] of hashSearchParams.entries()) {
        params[key] = value;
      }
    }

    setQueryParams(params);
  }, []);

  return queryParams;
};

export default useQueryParams;
