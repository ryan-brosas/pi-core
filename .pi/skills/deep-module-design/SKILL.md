---
name: deep-module-design
description: Use when designing modules, refactoring shallow structures, or reviewing AI-generated code for structural quality.
version: 1.0.0
tags: [architecture, code-quality, ousterhout]
dependencies: []
tools: [grep, find, read, bash]
---

# Deep Module Design

## Iron Laws

<EXTREMELY-IMPORTANT>
- **Interface is the design.** What the module *exposes* is what it is.
- **Hide complexity behind the interface.** Caller doesn't read internals to use it.
- **Push complexity down, expose simplicity up.** If user thinks about it, module failed.
- **One concept per module.** Two things = two interfaces pretending to be one.
- **Small interface, deep implementation.** Hard problem, small surface.
</EXTREMELY-IMPORTANT>

## When to Use

Designing a new module; reviewing structure; refactoring shallow modules; "this class is too big"; API of a new library; service boundary.

## When NOT to Use

Trivial one-function helpers; structure is fine and change is in body; "design" without a real module.

## Depth as Leverage

Depth is the capability and complexity hidden per unit of interface a caller must learn. It is not a line-count ratio: padding an implementation does not deepen a module.

- **Deep**: a small, stable interface provides substantial useful capability and hides decisions.
- **Shallow**: callers must understand nearly as much complexity as the implementation contains.

Judge depth by caller knowledge, change locality, and observable capability—not implementation size.

## Interface Tells

| Sign | Meaning |
|---|---|
| Many public methods | Module is doing too much |
| Methods with complex args | Caller knows too much |
| Methods returning complex types | Caller handles too much |
| Public state | Caller can break invariants |
| Config that requires docs | Hide defaults |
| `addX`/`addY`/`addZ` | One method, options |

## Design Tells

| Sign | Meaning |
|---|---|
| Impl bigger than expected | Caller reads the impl |
| Two ways to do the same | Pick one, hide the other |
| Caller calls 3+ methods | One method, the right thing |
| "Don't call from outside" | Should be private |
| Tests mock internals | Internals leaking |

## Refactoring Toward Depth

1. **Find shallowest surface.** List public methods + args.
2. **Combine methods.** `addUser + addUserAddress` → `addUser({ ..., address })`.
3. **Hide the helper.** Make internal calls private.
4. **Move config inside.** Env, sensible default. Not per-call args.
5. **Return less.** `{ ok, data, error, meta }` → `data`. Errors at boundary.

## Test Seams via Interface

An interface becomes a test seam only when an enabling point can select one behavior or a real alternative. Test success and controlled failure through the public interface, not the implementation. If your test needs to mock an internal call, the internal is leaking. Before changing an existing shared interface, map its callers and consequences from current source.

```ts
// GOOD: test the interface
const svc = new UserService({ db: mockDb, mailer: mockMailer })
await svc.addUser({ name, email })
expect(mockDb.users).toContain(...)

// BAD: test the internals
jest.spyOn(svc, "_insertIntoDb")
jest.spyOn(svc, "_sendEmail")
```

## Common Mistakes

Shallow modules; exposed state; config in args (env); "two ways to do it"; tests mock internals; `addX`/`addY`/`addZ`; "don't call from outside" comments; pass-through modules.

## Red Flags

10+ public methods; `addX`/`addY`/`addZ`; public state; config in args; "don't call from outside"; tests mock internals; pass-through; "two ways to do it"; 3+ methods in sequence.

## Anti-Patterns

**Shallow module**; **public state**; **config in args**; **two ways to do it**; **tests mock internals**; **addX/addY/addZ**; **pass-through**; **complex return types**.
