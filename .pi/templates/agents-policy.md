# Agents Policy Scaffold

This is an inert source scaffold explicitly read by /init.
It provides compact universal gates and merge guidance; /init must synthesize project-specific instructions from evidence.

## 1. Authority and action scope
- User authority controls project intent, but system/platform safety still wins.
- Keep actions within the requested scope.

## 2. Deletion needs written permission
- Never delete a file or directory without written permission naming the paths.
- Deletion includes remove, rename away, truncate to empty, or replace with unrelated content.

## 3. Destructive and irreversible actions
- Use this exact sequence: preflight, first written confirmation, refreshed preflight, second immediate confirmation, exact execution, audit.
- Treat discard, overwrite, rewrite, and remote publication as destructive until approved.

## 4. Concurrent and unrelated work
- Preserve concurrent and unrelated work.
- Do not stash, reset, restore, rebase away, or overwrite other changes.

## 5. Git, branch, and integration approval
- Do not branch, create worktrees, commit, merge, push, or deploy without explicit approval.
- Each action needs fresh confirmation; no standing authorization.

## 6. Editing discipline
- Prefer manual targeted edits.
- Avoid speculative file proliferation. For generated files, edit the authoritative source, regenerate with the canonical generator, and review the output instead of hand-editing generated output.

## 7. Evidence before claims
- Evidence before completion: verify from the narrowest useful check to broader checks.
- Do not claim completion without observable evidence.

## 8. Bounded delegation
- Delegate only when useful and keep it bounded. Keep it parent-verified.
- Parent inspection and verification remain required.

## 9. /init merge guidance
- Classify content as mandatory, project-detected, conditional, conflicting, or preserved custom.
- Preserve existing custom rules unless they weaken a mandatory gate.
- For new files, keep the generated contract concise.
- If an existing file is too large to fit preserved content plus the kernel, preserve content and report the line-budget exception instead of truncating user-authored rules.
- Optional workflows need both project evidence and executable validation.
