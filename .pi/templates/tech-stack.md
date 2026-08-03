---
purpose: Verified runtime, dependencies, integrations, and commands
---

# Tech stack

Record detected facts and their evidence. Do not turn example commands into claims.

## Runtime and languages

- Runtime: [name and version, with source]
- Languages: [language and mode]
- Platform constraints: [verified constraint]

## Manifests and package management

- Package manager: [name or none]
- Manifests: [authoritative paths]
- Lockfiles: [paths or none]
- Dependency policy: [verified rule]

## Frameworks and libraries

- Application framework: [name and version or none]
- Test framework: [name and version]
- Build and type tools: [tools or none]
- Important libraries: [name, role, evidence]

## Storage and integrations

- Data stores: [service and boundary]
- External services: [service and purpose]
- Authentication: [verified mechanism]
- Observability: [verified mechanism]

## Repository layout

- Maintained source: [paths]
- Tests: [paths]
- Configuration: [paths]
- Generated output: [paths and generator]
- Runtime-managed data: [paths]

## Verified commands

For each command, record cwd, observed exit status, and what it proves.

```text
[command]  # observed: [status], proves: [claim]
```

## Unverified commands

List plausible commands that were not run. Do not present them as working.

- [command and reason it remains unverified]

## Deployment and live checks

- Build artifact: [verified output or none]
- Deployment command: [verified command or unknown]
- Live servers: [verified names or unconfirmed]
- Feature flags: [verified names or unconfirmed]

## Constraints and unknowns

- [constraint with source]
- [unknown that affects implementation]

Update this file when the runtime, dependency graph, integrations, or verification commands change.
