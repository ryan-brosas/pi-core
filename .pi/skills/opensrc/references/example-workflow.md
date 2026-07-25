# Example: Complete Workflow

**Scenario:** Need to understand how zod handles async refinements.

```bash
# 1. Fetch source
npx opensrc zod
```

```typescript
// 2. Find refinement code
const matches = grep({
  pattern: "refine.*async",
  path: "opensrc/",
  glob: "*.ts",
});

// 3. Locate likely implementation files
const files = find({
  pattern: "*types.ts",
  path: "opensrc/repos/github.com/colinhacks/zod/",
});

// 4. Read the implementation
const implementation = read({
  path: "opensrc/repos/github.com/colinhacks/zod/src/types.ts",
  offset: 500,
  limit: 100,
});

// 5. Find and read usage tests
const tests = find({
  pattern: "*.test.ts",
  path: "opensrc/",
});

const example = read({
  path: "opensrc/repos/.../async.test.ts",
});

// 6. Read the active progress log, then append with an exact edit
const progress = read({
  path: ".pi/artifacts/<slug>/progress.md",
});

edit({
  path: ".pi/artifacts/<slug>/progress.md",
  oldText: "<exact existing tail>",
  newText: `<exact existing tail>

## Research: Zod Async Refinements

**Finding:** Async refinements use \`parseAsync()\` rather than \`parse()\`.

**Evidence:** \`src/types.ts:842-856\`

Async refinements return \`Promise<Output>\` and require:
- Use the \`.parseAsync()\` method.
- The refinement function returns \`Promise<boolean>\`.
- Handle errors through promise rejection.

**Recommendation:** Use \`.refine(async (val) => {...})\` with \`.parseAsync()\`.
`,
});
```