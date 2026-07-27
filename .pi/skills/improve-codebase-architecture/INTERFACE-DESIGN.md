# Interface Design

When a chosen deepening candidate has a consequential interface trade-off, design it twice before editing. Main can do this coherently with zero children. Add a child only when an independent design constraint provides concrete value.

Uses the vocabulary in [LANGUAGE.md](LANGUAGE.md) — **module**, **interface**, **seam**, **adapter**, **leverage**.

## Process

### 1. Frame the problem space

Frame the problem space for the chosen candidate:

- The constraints any new interface would need to satisfy
- The dependencies it would rely on, and which category they fall into (see [DEEPENING.md](DEEPENING.md))
- A rough illustrative code sketch to ground the constraints — not a proposal, just a way to make the constraints concrete

Proceed directly when the constraints are evidenced and the next comparison is clear; ask one consequential question only when the answer changes the public contract.

### 2. Produce Distinct Designs

Main produces at least two materially different interfaces. Zero children is the default. When an independent perspective materially improves the decision, call one foreground child with `agents.run` inside `fabric_exec`; use a single `Promise.all` wave only for genuinely independent constraints. The parent verifies source facts and owns the recommendation.

Give each design a different constraint:

- Design A: "Minimize the interface — aim for 1–3 entry points max. Maximise leverage per entry point."
- Design B: "Optimise for the most common caller — make the default case trivial."
- Design C, only when extension is a demonstrated requirement: "Support the named variants without exposing internals."
- Design D, only for a real cross-seam dependency: "Use ports and adapters for the concrete production and test alternatives."

Use [LANGUAGE.md](LANGUAGE.md) and current project vocabulary consistently. Each design outputs:

1. Interface (types, methods, params — plus invariants, ordering, error modes)
2. Usage example showing how callers use it
3. What the implementation hides behind the seam
4. Dependency strategy and adapters (see [DEEPENING.md](DEEPENING.md))
5. Trade-offs — where leverage is high, where it's thin

### 3. Present and compare

Present designs sequentially so the user can absorb each one, then compare them in prose. Contrast by **depth** (leverage at the interface), **locality** (where change concentrates), and **seam placement**.

After comparing, give your own recommendation: which design you think is strongest and why. If elements from different designs would combine well, propose a hybrid. Be opinionated — the user wants a strong read, not a menu.
