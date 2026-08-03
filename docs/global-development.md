# Global Development with Pi Core

## Goal

Pi Core is the canonical source of truth for the shared Pi development layer: universal operating policy, extensions, prompts, skills, and their verification contracts. A developer can enter any target project and start Pi without copying Pi Core resources or reconfiguring Fabric for that repository.

Target projects remain authoritative for their own source, requirements, product plans, verification commands, and project-specific policy. Pi Core supplies the reusable operating layer; it does not turn unrelated repositories into subdirectories or centralize their application state.

## Current Architecture

The canonical checkout is `/home/ryanj/work/projects/pi-core`.

The global Pi settings register `pi-core/.pi` once as a local package. Pi therefore discovers its extensions, prompts, and skills from every working directory. The global `~/.pi/agent/AGENTS.md` points to Pi Core's universal policy, while a target repository's own `AGENTS.md` adds project-local facts and rules.

Fabric itself is configured globally at `~/.pi/agent/fabric.json` with full code mode and agents enabled. Its first-class MCP provider reads the private mcporter registry selected by `mcp.configPath`; no duplicate MCP adapter is installed. Target projects need local Fabric configuration only when they intentionally override a global default. Pi Core's `.pi/fabric.json` remains the project override used while developing Pi Core.

Hindsight is the durable, project-scoped semantic memory authority. Fabric session memory and VCC retrieve prior transcript evidence without creating another project state store. Project identity comes from the real working directory, Git root, local policy, and Hindsight scope rather than an ambient workspace-receipt extension.

## Daily Workflow

Start Pi directly in the project that owns the work:

```bash
cd <project>
pi
```

For a direct child of the configured projects root, the existing launcher is equivalent:

```bash
pi-work <project-name>
```

Starting in the target directory matters because Pi uses that directory for project trust, local `AGENTS.md` discovery, Git identity, sessions, and project-local overrides. Pi Core remains globally available through the package registration.

When changing Pi Core itself:

```bash
cd /home/ryanj/work/projects/pi-core
node --experimental-strip-types .pi/scripts/doctor.ts
node --experimental-strip-types --test .pi/tests/*.test.ts
```

Run `/reload` in an active Pi session, or start a new session, after changing extensions, prompts, skills, or runtime configuration.

## Ownership Boundaries

| Concern | Authority |
|---|---|
| Shared Pi policy, skills, prompts, and extensions | Pi Core |
| Global package registration and default Fabric runtime | `~/.pi/agent` |
| First-class MCP server registry | Fabric `mcp.configPath` target |
| Durable project memory | Hindsight project scope/bank |
| Session transcript retrieval | Fabric memory and VCC |
| Application source and dependencies | Target project |
| Product goal, plans, requirements, and acceptance checks | Target project |
| Project-specific Pi exceptions | Target project `AGENTS.md` or trusted `.pi/` configuration |

Do not copy Pi Core's full `.pi` directory into every target repository. Use `/init` when a project needs local context, Hindsight reconciliation, MCP/graph readiness checks, or explicit exceptions beyond the global layer.

## Development Plan

1. **Canonical shared layer — active.** Maintain reusable Pi resources and verification in Pi Core.
2. **Global availability — active.** Keep the Pi Core package registered exactly once, the universal policy linked, and full Fabric code mode enabled globally.
3. **Project isolation — active.** Launch Pi from the target project and keep its source, policy, Hindsight tags, and sessions scoped there.
4. **Drift prevention — next.** Add an idempotent checked-in installer/synchronizer only if package, policy, launcher, or global runtime settings begin drifting across machines.
5. **Cross-directory smoke evidence — ongoing.** Verify package discovery, Fabric availability, project identity, reload behavior, and local-policy precedence from a non-Pi-Core repository.

## Success Criteria

- `cd <project> && pi` exposes Pi Core resources without copying configuration.
- Fabric full code mode and agent support are available without a project-local Fabric file.
- Target-project policy and source remain authoritative within that project.
- Pi Core resource changes become visible after `/reload` or a new session.
- Global registration remains singular; Hindsight project tags and transcript retrieval do not cross project boundaries.
