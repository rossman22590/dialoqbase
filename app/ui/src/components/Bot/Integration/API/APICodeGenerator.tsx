import React from "react";
import { CopyTextButton } from "../../Embed/EmbedBoardCard";

interface APICodeGeneratorProps {
  api: string;
  xApiKey: string;
  body: string;
}

type Lang = "curl" | "node" | "python" | "go";

const buildCodes = (api: string, xApiKey: string, body: string) => ({
  curl: `curl --request POST \\
     --url ${api} \\
     --header 'content-type: application/json' \\
     --header 'x-api-key: ${xApiKey}' \\
     --data '${body}'
    `,
  node: `const axios = require('axios');

axios.post('${api}', ${body}, {
  headers: {
    'content-type': 'application/json',
    'x-api-key': '${xApiKey}'
  }
});
    `,
  python: `import requests

headers = {
    'content-type': 'application/json',
    'x-api-key': '${xApiKey}'
}

response = requests.post('${api}', headers=headers, json=${body})
    `,
  go: `package main

import (
	"bytes"
	"net/http"
)

func main() {
	body := []byte(\`${body}\`)
	req, _ := http.NewRequest("POST", "${api}", bytes.NewBuffer(body))
	req.Header.Set("content-type", "application/json")
	req.Header.Set("x-api-key", "${xApiKey}")

	client := &http.Client{}
	resp, _ := client.Do(req)
	defer resp.Body.Close()
}
    `,
});

const LANGS: { key: Lang; name: string }[] = [
  { key: "curl", name: "cURL" },
  { key: "node", name: "Node.js" },
  { key: "python", name: "Python" },
  { key: "go", name: "Go" },
];

// Code samples in a few languages, with underline tabs and Copy.
const APICodeGenerator: React.FC<APICodeGeneratorProps> = ({
  api,
  xApiKey,
  body,
}) => {
  const [lang, setLang] = React.useState<Lang>("curl");
  const codes = React.useMemo(
    () => buildCodes(api, xApiKey, body),
    [api, xApiKey, body]
  );
  const code = codes[lang].replace(/\s+$/, "");

  return (
    <section className="ui-card flex min-w-0 flex-[1_1_380px] flex-col overflow-hidden">
      <div className="flex items-center gap-2 border-b border-line bg-app pl-3 pr-3">
        <div
          role="tablist"
          aria-label="Language"
          className="flex min-w-0 flex-1 gap-1 overflow-x-auto"
        >
          {LANGS.map((l) => (
            <button
              key={l.key}
              type="button"
              role="tab"
              aria-selected={lang === l.key}
              onClick={() => setLang(l.key)}
              className={`ui-tab text-[13px] ${
                lang === l.key ? "ui-tab-active" : ""
              }`}
            >
              {l.name}
            </button>
          ))}
        </div>
        <CopyTextButton value={code} />
      </div>
      <pre className="m-0 flex-1 overflow-x-auto p-4 text-[13px] leading-relaxed text-fg">
        {code}
      </pre>
    </section>
  );
};

export default APICodeGenerator;
