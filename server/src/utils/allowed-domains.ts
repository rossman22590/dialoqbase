// Sites allowed to embed a bot ("Allowed sites" on the Embed page).
// Stored as bare lowercase hostnames, e.g. "biology101.example.edu".

const HOSTNAME = /^(?=.{1,253}$)(?!-)[a-z0-9-]{1,63}(?<!-)(\.(?!-)[a-z0-9-]{1,63}(?<!-))*$/;

export const MAX_ALLOWED_DOMAINS = 20;

// Accepts "example.edu", "https://example.edu/page" or "*.example.edu" and
// returns "example.edu", or null if it isn't a usable hostname.
export const normalizeDomain = (input: string): string | null => {
  let value = String(input || "").trim().toLowerCase();
  if (!value) return null;
  value = value.replace(/^\*\./, "");
  try {
    if (/^[a-z]+:\/\//.test(value)) {
      value = new URL(value).hostname;
    } else {
      value = new URL(`https://${value}`).hostname;
    }
  } catch {
    return null;
  }
  return HOSTNAME.test(value) ? value : null;
};

// Content-Security-Policy value that only lets the listed sites (and their
// subdomains) put the bot page in an iframe. Null means no restriction.
export const frameAncestorsPolicy = (domains: string[] | null | undefined) => {
  const list = (domains || []).filter(Boolean);
  if (list.length === 0) return null;
  const sources = list.flatMap((d) => [`https://${d}`, `https://*.${d}`]);
  return `frame-ancestors 'self' ${sources.join(" ")}`;
};
