/**
 * Prompt Leverage Extension
 *
 * Upgrades substantive user prompts with a structured execution framework.
 * Ported from an OpenCode message transform to Pi's non-destructive context event.
 */
import type { ContextEvent, ExtensionAPI } from "@earendil-works/pi-coding-agent";

const TASK_KEYWORDS: Record<string, string[]> = {
  coding: [
    "code",
    "bug",
    "repo",
    "refactor",
    "test",
    "implement",
    "fix",
    "function",
    "api",
    "add",
    "update",
    "remove",
  ],
  research: [
    "research",
    "compare",
    "find",
    "latest",
    "sources",
    "analyze",
    "look up",
  ],
  writing: [
    "write",
    "rewrite",
    "draft",
    "email",
    "memo",
    "blog",
    "copy",
    "tone",
  ],
  review: ["review", "audit", "critique", "inspect", "evaluate", "assess"],
  planning: ["plan", "roadmap", "strategy", "framework", "outline"],
  analysis: ["analyze", "explain", "break down", "diagnose", "root cause"],
};

function detectTask(prompt: string): string {
  const lowered = prompt.toLowerCase();
  const scores: Record<string, number> = {};
  for (const [task, keywords] of Object.entries(TASK_KEYWORDS)) {
    scores[task] = keywords.filter((keyword) => lowered.includes(keyword)).length;
  }
  const best = Object.entries(scores).sort((a, b) => b[1] - a[1]);
  return best[0]?.[1] ? best[0][0] : "analysis";
}

function inferIntensity(prompt: string, task: string): string {
  const lowered = prompt.toLowerCase();
  if (
    ["careful", "deep", "thorough", "critical", "production"].some((term) =>
      lowered.includes(term),
    )
  ) {
    return "Deep";
  }
  if (task === "coding" || task === "research" || task === "review") {
    return "Standard";
  }
  return "Light";
}

function buildToolRules(task: string): string {
  const rules: Record<string, string> = {
    coding:
      "Inspect the relevant files and dependencies first. Validate the final change with the narrowest useful checks before broadening scope.",
    research:
      "Retrieve evidence from reliable sources before concluding. Do not guess facts that can be checked.",
    review:
      "Read enough surrounding context to understand intent before critiquing. Distinguish confirmed issues from plausible risks.",
  };
  return (
    rules[task] ||
    "Use tools or extra context only when they materially improve correctness or completeness."
  );
}

function buildOutputContract(task: string): string {
  const contracts: Record<string, string> = {
    coding:
      "Return the result in a practical execution format: concise summary, concrete changes or code, validation notes, and any remaining risks.",
    research:
      "Return a structured synthesis with key findings, supporting evidence, uncertainty where relevant, and a concise bottom line.",
    writing:
      "Return polished final copy in the requested tone and format. If useful, include a short rationale for major editorial choices.",
    review:
      "Return findings grouped by severity or importance, explain why each matters, and suggest the smallest credible next step.",
  };
  return (
    contracts[task] ||
    "Return a clear, well-structured response matched to the task, with no unnecessary verbosity."
  );
}

function upgradePrompt(userPrompt: string): string {
  const normalized = userPrompt.trim().replace(/\s+/g, " ");
  if (normalized.includes("Objective:") && normalized.includes("Context:")) {
    return userPrompt;
  }
  if (normalized.length < 15 || normalized.split(" ").length < 3) {
    return userPrompt;
  }

  const task = detectTask(normalized);
  const intensity = inferIntensity(normalized, task);
  const toolRules = buildToolRules(task);
  const outputContract = buildOutputContract(task);

  return `Objective:
- Complete this task: ${normalized}
- Optimize for a correct, useful result rather than a merely plausible one.

Context:
- Preserve the user's original intent and constraints.
- Surface any key assumptions if required information is missing.

Work Style:
- Task type: ${task}
- Effort level: ${intensity}
- Understand the problem broadly enough to avoid narrow mistakes, then go deep where the risk or complexity is highest.
- Use first-principles reasoning before proposing changes.
- For non-trivial work, review the result once with fresh eyes before finalizing.

Tool Rules:
- ${toolRules}

Output Contract:
- ${outputContract}

Verification:
- Check correctness, completeness, and edge cases.
- Improve obvious weaknesses if a better approach is available within scope.

Done Criteria:
- Stop only when the response satisfies the task, matches the requested format, and passes the verification step.`;
}

function upgradeLatestUserMessage(
  messages: ContextEvent["messages"],
): ContextEvent["messages"] | undefined {
  for (let index = messages.length - 1; index >= 0; index--) {
    const message = messages[index];
    if (message.role !== "user") continue;

    if (typeof message.content === "string") {
      const content = upgradePrompt(message.content);
      if (content === message.content) return undefined;

      const upgraded = [...messages];
      upgraded[index] = { ...message, content };
      return upgraded;
    }

    let changed = false;
    const content = message.content.map((part) => {
      if (part.type !== "text") return part;
      const text = upgradePrompt(part.text);
      if (text === part.text) return part;
      changed = true;
      return { ...part, text };
    });
    if (!changed) return undefined;

    const upgraded = [...messages];
    upgraded[index] = { ...message, content };
    return upgraded;
  }

  return undefined;
}

export default function (pi: ExtensionAPI) {
  pi.on("context", async (event) => {
    const messages = upgradeLatestUserMessage(event.messages);
    return messages ? { messages } : undefined;
  });

  pi.on("before_agent_start", async (event, ctx) => {
    if (ctx.hasUI && upgradePrompt(event.prompt) !== event.prompt) {
      ctx.ui.notify("PromptLeverage upgraded the prompt", "info");
    }
  });
}
