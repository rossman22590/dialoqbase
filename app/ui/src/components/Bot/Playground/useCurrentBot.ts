import { useQuery } from "@tanstack/react-query";
import { useParams } from "react-router-dom";
import api from "../../../services/api";
import { removeUUID } from "../../../utils/filename";

// Reads the current bot from the bot list BotLayout already loads, so chat
// screens can show the same name/avatar tile as the sidebar without another
// request. Same key and fetcher as BotLayout; disabled here so it only reads
// the cache.
export const useCurrentBot = () => {
  const { id } = useParams<{ id: string }>();
  const { data } = useQuery(
    ["getAllBots"],
    async () => {
      const response = await api.get("/bot");
      return response.data;
    },
    { enabled: false }
  );
  const bot = Array.isArray(data)
    ? data.find((b: any) => b.id === id)
    : undefined;
  return {
    id: id as string | undefined,
    name: bot?.name as string | undefined,
    model: bot?.model as string | undefined,
  };
};

export const cleanModelName = (model?: string) =>
  (model || "")
    .replace("-dbase", "")
    .replace(/_dialoqbase_[0-9]+$/, "")
    .replace(/^[^/]+\//, "");

// "./uploads/<uuid>-file.pdf" -> "file.pdf", "https://a.b/c" -> "a.b/c"
export const sourceName = (source: any) => {
  const raw = `${source?.metadata?.path || source?.metadata?.source || ""}`;
  let name = removeUUID(raw.replace("./uploads/", ""));
  if (/^https?:\/\//i.test(name)) {
    name = name.replace(/^https?:\/\//i, "").replace(/\/$/, "");
  }
  return name || "Source";
};

// Chip label: the document name plus the page when the source has one.
export const sourceLabel = (source: any) => {
  const page = source?.metadata?.loc?.pageNumber;
  const name = sourceName(source);
  return page ? `${name}, p. ${page}` : name;
};
