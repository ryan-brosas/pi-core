/**
 * grep.app Tool — search real-world GitHub code examples.
 * Ported from an OpenCode tool to a native pi extension.
 */
import type { ExtensionAPI } from "@earendil-works/pi-coding-agent";
import { Type } from "typebox";

const GREP_APP_API = "https://grep.app/api/search"; // aislop-ignore-line -- stable public API

interface SearchResult {
  repo: string;
  path: string;
  content: { snippet: string };
  total_matches: string;
}

interface GrepResponse {
  hits: { hits: SearchResult[] };
  time: number;
}

const textResult = (text: string) => ({
  content: [{ type: "text" as const, text }],
  details: {},
});

export default function (pi: ExtensionAPI) {
  pi.registerTool({
    name: "grepsearch",
    label: "grep.app Search",
    description:
      "Search literal code patterns in public GitHub repositories through grep.app. Use it for real-world API usage and production patterns, not local code or general web research.",
    promptSnippet: "Search public GitHub repositories for literal code patterns",
    promptGuidelines: [
      "Use grepsearch for real-world code examples; search literal code patterns and apply language or repository filters when useful.",
    ],
    parameters: Type.Object({
      query: Type.String({ description: "Literal code pattern to search for" }),
      language: Type.Optional(
        Type.String({ description: "Language filter, such as TypeScript or Rust" }),
      ),
      repo: Type.Optional(
        Type.String({ description: "Repository filter, such as owner/repo" }),
      ),
      path: Type.Optional(
        Type.String({ description: "File path filter, such as src/ or .test.ts" }),
      ),
      limit: Type.Optional(
        Type.Integer({
          minimum: 1,
          maximum: 20,
          description: "Maximum results (default 10, maximum 20)",
        }),
      ),
    }),
    async execute(_toolCallId, args, signal) {
      const query = args.query?.trim();
      if (!query) return textResult("Error: query is required");

      const url = new URL(GREP_APP_API);
      url.searchParams.set("q", query);
      if (args.language) url.searchParams.set("filter[lang][0]", args.language);
      if (args.repo) url.searchParams.set("filter[repo][0]", args.repo);
      if (args.path) url.searchParams.set("filter[path][0]", args.path);

      try {
        const response = await fetch(url, {
          headers: {
            Accept: "application/json",
            "User-Agent": "pi/1.0",
          },
          signal,
        });
        if (!response.ok) {
          return textResult(`Error: grep.app API returned ${response.status}`);
        }

        const data = (await response.json()) as GrepResponse;
        if (!data.hits?.hits?.length) {
          return textResult(
            `No results found for: ${query}${args.language ? ` (${args.language})` : ""}`,
          );
        }

        const maxResults = Math.min(args.limit ?? 10, 20);
        const results = data.hits.hits.slice(0, maxResults);
        const formatted = results.map((hit, index) => {
          const cleanCode = (hit.content?.snippet || "")
            .replace(/<[^>]*>/g, "")
            .replace(/&lt;/g, "<")
            .replace(/&gt;/g, ">")
            .replace(/&amp;/g, "&")
            .replace(/&quot;/g, '"')
            .split("\n")
            .slice(0, 8)
            .join("\n")
            .trim();

          return `## ${index + 1}. ${hit.repo || "unknown"}
File: ${hit.path || "unknown"}
${cleanCode}`;
        });

        return textResult(`Found ${data.hits.hits.length} results (showing ${results.length}) in ${data.time}ms:

${formatted.join("\n\n")}`);
      } catch (error: unknown) {
        const message = error instanceof Error ? error.message : String(error);
        return textResult(`Error searching grep.app: ${message}`);
      }
    },
  });
}
