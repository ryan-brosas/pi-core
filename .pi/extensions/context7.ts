/**
 * Context7 Tool — library documentation lookup via Context7 API v2.
 * Ported from an OpenCode tool to a native pi extension.
 */
import type { ExtensionAPI } from "@earendil-works/pi-coding-agent";
import { Type } from "typebox";

const CONTEXT7_API = "https://context7.com/api/v2"; // aislop-ignore-line -- stable public API

interface LibraryInfo {
  id: string;
  title: string;
  description?: string;
  totalSnippets?: number;
  trustScore?: number;
  benchmarkScore?: number;
  versions?: string[];
}

interface SearchResponse {
  results: LibraryInfo[];
}

const textResult = (text: string) => ({
  content: [{ type: "text" as const, text }],
  details: {},
});

export default function (pi: ExtensionAPI) {
  pi.registerTool({
    name: "context7",
    label: "Context7",
    description:
      "Resolve Context7 library IDs and query current library documentation. Use resolve before query; use local grep for project code and web search for general research.",
    promptSnippet: "Resolve library identifiers and query current library documentation",
    promptGuidelines: [
      "Use context7 for current library APIs, signatures, and examples; resolve the library ID before querying documentation.",
    ],
    parameters: Type.Object({
      operation: Type.Optional(
        Type.String({ description: "Operation: resolve or query" }),
      ),
      libraryName: Type.Optional(
        Type.String({ description: "Library name for resolve" }),
      ),
      libraryId: Type.Optional(
        Type.String({ description: "Resolved library ID for query" }),
      ),
      topic: Type.Optional(
        Type.String({ description: "Documentation topic for query" }),
      ),
    }),
    async execute(_toolCallId, args, signal) {
      const operation = args.operation || "resolve";
      const apiKey = process.env.CONTEXT7_API_KEY;
      const headers: HeadersInit = {
        Accept: "application/json",
        "User-Agent": "pi/1.0",
      };
      if (apiKey) headers.Authorization = `Bearer ${apiKey}`;

      if (operation === "resolve") {
        const libraryName = args.libraryName?.trim();
        if (!libraryName) {
          return textResult("Error: libraryName is required for resolve operation");
        }

        try {
          const url = new URL(`${CONTEXT7_API}/libs/search`);
          url.searchParams.set("libraryName", libraryName);
          url.searchParams.set("query", "documentation");

          const response = await fetch(url, { headers, signal });
          if (!response.ok) {
            if (response.status === 401) {
              return textResult(
                "Error: Invalid CONTEXT7_API_KEY. Get a free key at https://context7.com/dashboard",
              );
            }
            if (response.status === 429) {
              return textResult(
                "Error: Rate limit exceeded. Get a free Context7 API key for higher limits.",
              );
            }
            return textResult(`Error: Context7 API returned ${response.status}`);
          }

          const data = (await response.json()) as SearchResponse;
          const libraries = data.results || [];
          if (libraries.length === 0) {
            return textResult(`No libraries found matching: ${libraryName}

Try a different spelling or the official package name.`);
          }

          const formatted = libraries
            .slice(0, 5)
            .map((lib, index) => {
              const description = lib.description
                ? `
   ${lib.description.slice(0, 100)}...`
                : "";
              const snippets = lib.totalSnippets
                ? ` (${lib.totalSnippets} snippets)`
                : "";
              const score = lib.benchmarkScore
                ? ` [score: ${lib.benchmarkScore}]`
                : "";
              return `${index + 1}. **${lib.title}** -> ${lib.id}${snippets}${score}${description}`;
            })
            .join("\n\n");

          return textResult(`Found ${libraries.length} libraries matching "${libraryName}":

${formatted}

Next: call context7 with operation=query, a libraryId above, and a topic.`);
        } catch (error: unknown) {
          const message = error instanceof Error ? error.message : String(error);
          return textResult(`Error resolving library: ${message}`);
        }
      }

      if (operation === "query") {
        const libraryId = args.libraryId?.trim();
        const topic = args.topic?.trim();
        if (!libraryId) {
          return textResult(
            'Error: libraryId is required (use operation: "resolve" first)',
          );
        }
        if (!topic) {
          return textResult(
            "Error: topic is required (for example: hooks, setup, or API reference)",
          );
        }

        try {
          const url = new URL(`${CONTEXT7_API}/context`);
          url.searchParams.set("libraryId", libraryId);
          url.searchParams.set("query", topic);

          const response = await fetch(url, {
            headers: { ...headers, Accept: "text/plain" },
            signal,
          });
          if (!response.ok) {
            if (response.status === 401) {
              return textResult(
                "Error: Invalid CONTEXT7_API_KEY. Get a free key at https://context7.com/dashboard",
              );
            }
            if (response.status === 404) {
              return textResult(
                `Error: Library not found: ${libraryId}. Resolve the ID first.`,
              );
            }
            if (response.status === 429) {
              return textResult(
                "Error: Rate limit exceeded. Get a free Context7 API key for higher limits.",
              );
            }
            return textResult(`Error: Context7 API returned ${response.status}`);
          }

          const content = await response.text();
          if (!content.trim()) {
            return textResult(
              `No documentation found for "${topic}" in ${libraryId}. Try a simpler or broader topic.`,
            );
          }

          return textResult(`# Documentation: ${topic} (${libraryId})

${content}`);
        } catch (error: unknown) {
          const message = error instanceof Error ? error.message : String(error);
          return textResult(`Error querying documentation: ${message}`);
        }
      }

      return textResult(`Unknown operation: ${operation}. Use resolve or query.`);
    },
  });
}
