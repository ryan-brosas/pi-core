/**
 * Skill-MCP Extension — bridge between pi skills and MCP servers.
 *
 * Loads MCP server declarations from a skill's mcp.json or YAML frontmatter,
 * connects lazily on tool use, and exposes list/call/status/disconnect tools.
 */
import { dirname } from "node:path";
import type { ExtensionAPI } from "@earendil-works/pi-coding-agent";
import { Type } from "typebox";
import type { McpClient, McpServerConfig } from "./skill-mcp/types.js";
import { findSkillPath, loadMcpConfig } from "./skill-mcp/utils.js";
import {
  connectServer,
  disconnectAll,
  sendRequest,
} from "./skill-mcp/client.js";

const jsonResult = (value: unknown) => ({
  content: [
    { type: "text" as const, text: JSON.stringify(value, null, 2) },
  ],
  details: value,
});

export default function (pi: ExtensionAPI) {
  const clients = new Map<string, McpClient>();
  const loadedSkills = new Map<string, Record<string, McpServerConfig>>();
  const state = { clients, loadedSkills };

  pi.registerTool({
    name: "skill_mcp",
    label: "Skill MCP",
    description:
      "List or call tools from an MCP server declared by a pi skill. The skill must contain mcp.json or an mcp YAML-frontmatter block.",
    promptSnippet: "List or call MCP tools declared by a loaded skill",
    promptGuidelines: [
      "Use skill_mcp only for MCP servers declared by the relevant skill; list tools before calling an unfamiliar server.",
    ],
    parameters: Type.Object({
      skill_name: Type.String({
        description: "Name of the skill containing the MCP declaration",
      }),
      mcp_name: Type.Optional(
        Type.String({ description: "Server name when the skill declares multiple MCPs" }),
      ),
      list_tools: Type.Optional(
        Type.Boolean({ description: "List the MCP server's available tools" }),
      ),
      tool_name: Type.Optional(
        Type.String({ description: "MCP tool to invoke" }),
      ),
      arguments: Type.Optional(
        Type.String({ description: "JSON string containing MCP tool arguments" }),
      ),
    }),
    async execute(_toolCallId, args, _signal, _onUpdate, ctx) {
      const skillName = args.skill_name?.trim();
      if (!skillName) return jsonResult({ error: "skill_name required" });

      const skillPath = findSkillPath(skillName, ctx.cwd);
      if (!skillPath) {
        return jsonResult({ error: `Skill '${skillName}' not found` });
      }

      const skillDir = dirname(skillPath);
      const mcpConfig = loadMcpConfig(skillDir, skillPath);
      if (!mcpConfig) {
        return jsonResult({
          error: `Skill '${skillName}' has no MCP config (check mcp.json or YAML frontmatter)`,
        });
      }

      loadedSkills.set(skillName, mcpConfig);
      const serverNames = Object.keys(mcpConfig);
      const targetServer = args.mcp_name || serverNames[0];
      if (!targetServer || !mcpConfig[targetServer]) {
        return jsonResult({
          error: `MCP server '${targetServer || "(none)"}' not found in skill`,
          available: serverNames,
        });
      }

      const serverConfig = mcpConfig[targetServer];
      let client: McpClient;
      try {
        client = await connectServer(
          state,
          skillName,
          targetServer,
          serverConfig,
        );
      } catch (error: unknown) {
        const message = error instanceof Error ? error.message : String(error);
        return jsonResult({ error: `Failed to connect: ${message}` });
      }

      if (args.list_tools) {
        const totalTools = client.capabilities?.tools?.length || 0;
        const filteredTools = client.filteredTools || [];
        const isFiltered = Boolean(serverConfig.includeTools?.length);
        const tokenSavings =
          totalTools > 0
            ? `~${Math.round((1 - filteredTools.length / totalTools) * 100)}%`
            : "n/a";

        return jsonResult({
          mcp: targetServer,
          tools: filteredTools.map((tool: any) => ({
            name: tool.name,
            description: tool.description,
            schema: tool.inputSchema,
          })),
          ...(isFiltered && {
            filtering: {
              patterns: serverConfig.includeTools,
              showing: filteredTools.length,
              total: totalTools,
              tokenSavings,
            },
          }),
        });
      }

      if (args.tool_name) {
        if (serverConfig.includeTools?.length) {
          const isAllowed = client.filteredTools?.some(
            (tool: any) => tool.name === args.tool_name,
          );
          if (!isAllowed) {
            return jsonResult({
              error: `Tool '${args.tool_name}' is not in includeTools`,
              allowed: client.filteredTools?.map((tool: any) => tool.name) || [],
              hint: "Add the tool to includeTools in mcp.json or YAML frontmatter",
            });
          }
        }

        let toolArgs: Record<string, unknown> = {};
        if (args.arguments) {
          try {
            toolArgs = JSON.parse(args.arguments) as Record<string, unknown>;
          } catch {
            return jsonResult({ error: "Invalid JSON in arguments" });
          }
        }

        try {
          const result = await sendRequest(client, "tools/call", {
            name: args.tool_name,
            arguments: toolArgs,
          });
          return jsonResult({ result });
        } catch (error: unknown) {
          const message = error instanceof Error ? error.message : String(error);
          return jsonResult({ error: `Tool call failed: ${message}` });
        }
      }

      return jsonResult({
        error: "Specify either list_tools=true or tool_name",
        mcp: targetServer,
        available_tools: client.filteredTools?.map((tool: any) => tool.name) || [],
      });
    },
  });

  pi.registerTool({
    name: "skill_mcp_status",
    label: "Skill MCP Status",
    description: "Show connected skill MCP servers and their exposed tool counts.",
    parameters: Type.Object({}),
    async execute() {
      const servers: Array<Record<string, unknown>> = [];
      for (const [key, client] of clients) {
        const [skillName, serverName] = key.split(":");
        const totalTools = client.capabilities?.tools?.length || 0;
        const filteredTools = client.filteredTools?.length || 0;
        const isFiltered = Boolean(client.config.includeTools?.length);

        servers.push({
          skill: skillName,
          server: serverName,
          connected: !client.process.killed,
          tools: filteredTools,
          ...(isFiltered && {
            filtering: { total: totalTools, filtered: filteredTools },
          }),
        });
      }

      return jsonResult({ connected_servers: servers, count: servers.length });
    },
  });

  pi.registerTool({
    name: "skill_mcp_disconnect",
    label: "Skill MCP Disconnect",
    description: "Disconnect one skill's MCP servers, or all connected servers.",
    parameters: Type.Object({
      skill_name: Type.Optional(
        Type.String({ description: "Specific skill to disconnect; omit for all" }),
      ),
    }),
    async execute(_toolCallId, args) {
      if (args.skill_name) {
        const disconnected: string[] = [];
        for (const key of clients.keys()) {
          if (key.startsWith(`${args.skill_name}:`)) disconnected.push(key);
        }
        for (const key of disconnected) {
          clients.get(key)?.process.kill();
          clients.delete(key);
        }
        return jsonResult({ disconnected });
      }

      const count = clients.size;
      disconnectAll(state);
      return jsonResult({ disconnected: "all", count });
    },
  });

  pi.on("session_shutdown", async () => {
    disconnectAll(state);
  });
}
