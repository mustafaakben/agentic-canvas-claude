# Agent Canvas Instructions

Agent Canvas is the shared planning surface for humans and coding agents. The browser canvas is for visual editing; the workflow JSON is the execution contract.

The full design contract — pattern catalog, design recipe, gate semantics — lives in [`skills/plan/SKILL.md`](skills/plan/SKILL.md). Treat that file as canonical. This handbook is the operating reference: when to use the canvas, how to launch it, how to read a workflow, and which example to consult for which pattern.

## When To Use It

Use the canvas when a task has several dependent phases, parallel work, review gates, loops, or handoffs. Do not use it for tiny one-step edits unless the user explicitly asks.

## Launch

The plugin exposes an `agent-canvas` CLI wrapper:

```bash
agent-canvas new workflows/plans/<name>.json
agent-canvas open workflows/plans/<name>.json
agent-canvas validate workflows/plans/<name>.json
agent-canvas summarize workflows/plans/<name>.json
agent-canvas claims workflows/plans/<name>.json
agent-canvas export-plan workflows/plans/<name>.json --format markdown
```

The launcher binds the local server to `127.0.0.1`, prints the URL, and opens the browser when possible. If browser opening fails, open the printed URL manually.

The underlying script is `scripts/canvasctl.mjs` if the wrapper is unavailable.

## Working Order

Follow this order whenever a new plan is being designed. Steps mirror `skills/plan/SKILL.md` §7.

1. **Ideate with the user.** Scope the deliverable, identify phases, decide single-start vs multi-start.
2. **Pick a pattern key** (see *Pattern Selection* below). The pattern key encodes the workflow shape — sequential, parallel fan-out, loop, branch, trycatch, multi-start, etc.
3. **Read the matching example end-to-end.** Anchor against a known-good shape before sketching nodes.
4. **Sketch the workflow JSON** following plan/SKILL.md §7 Steps 4–7.
5. **Save the workflow** through the canvas or `agent-canvas` CLI.
6. **Hand off to execute.** The execute skill reads the saved JSON as the source of truth.

## Agent Workflow

1. Create or open a workflow JSON file.
2. Start the canvas with `agent-canvas open`.
3. Ask the user to review and revise the visual plan.
4. Wait for the user to save the canvas.
5. Read the saved JSON.
6. Execute according to the graph, respecting dependencies, parallel branches, loops, human nodes, and wait gates.
7. Add progress claims only with evidence.

## Reading Order

Read the graph in this order:

1. **Start nodes** — every entry point (multi-start workflows have several).
2. **Dependencies** — incoming connections; a node is runnable when its predecessors complete.
3. **Parallel branches** — confirm write scopes do not collide before delegating.
4. **Branches and try/catch paths** — `branch` decisions, `merge` rejoin points, `trycatch` happy/escalation routes.
5. **Loops** — every `loop` must have a stop rule.
6. **Human and wait gates** — `human` and `wait` nodes are checkpoints; do not run past them.
7. **Acceptance criteria** — `agent.acceptanceCriteria[]` is each node's completion contract.
8. **Progress claims and review status** — current state plus reviewer approval.

The CLI helps:

```bash
agent-canvas summarize workflows/plans/<name>.json
agent-canvas export-plan workflows/plans/<name>.json --format markdown
agent-canvas claims workflows/plans/<name>.json
```

## Pattern Selection

Pick the pattern key that most closely matches the workflow being planned (or being executed). Read the matching example before sketching or executing — the example is a working demonstration of the pattern's port wiring, gate placement, and metadata shape.

All examples live under `workflows/examples/`. Sizes are nodes / connections.

| Pattern key | Example file | Size | When to pick it |
|---|---|---|---|
| `single-full` | `single-full_dinner-party.json` | 16 / 17 | One coherent project that touches most primitives — start, parallel, merge, loop, wait, end. |
| `single-loops` | `single-loops_monthly-dining.json` | 19 / 21 | Iteration-heavy work over a window (weekly/monthly) with multiple wait gates. |
| `multi-islands` | `multi-islands_multi-platform-publishing.json` | 22 / 18 | Genuinely independent chains that share a theme but never merge. |
| `multi-ideation` | `multi-ideation_syllabus-redesign.json` | 15 / 12 | Several alternative approaches to the same problem, kept independent for later comparison. |
| `multi-merge` (small) | `multi-merge_landing-page.json` | 19 / 18 | Cross-functional collab where 2–3 starts converge at a shared merge. |
| `multi-merge` (large) | `multi-merge_ai-future-of-work-presentation.json` | 64 / 83 | Major program with many starts, several phases, and multiple parallels/merges/trycatches. |
| `branch-decision` | `branch-decision_paper-submission.json` | 9 / 9 | A binary decision point where the two paths rejoin. |
| `trycatch-escalation` | `trycatch-escalation_grant-application.json` | 10 / 9 | High-risk step where the failure path needs an explicit escalation route. |
| `subflow-composition` | `subflow-composition_course-launch.json` | 10 / 10 | A step that should be its own future workflow — mark with `subflow` to defer the detail. |
| `pipeline` (full) | `greenwashing.json` | 66 / 91 | Real research/data pipeline — multi-phase, parallel fan-outs, loops, human-in-the-loop. |
| `pipeline` (compact) | `greenwashing-literature-review-multi-start.json` | 13 / 13 | Slim version of a pipeline before scaling up. |
| `cop` (legacy) | `cop.json` | — | Original community-of-practice reference example. |

If the workflow does not match any pattern cleanly, read `single-full_dinner-party.json` first for the primitive vocabulary, then `greenwashing.json` for what a real pipeline looks like.

Filename convention is `<pattern-key>_<topic>.json`. Use the same convention when saving new workflows.

## Progress Claims

Do not treat `completed` as trustworthy by itself. A completion claim should include evidence such as a command, file path, diff note, screenshot, test, URL, or human note. Review approval is separate from the agent's claim.

Valid evidence types: `command`, `file`, `diff`, `test`, `screenshot`, `url`, `human_note`.

`progress.status` values: `not_started`, `planned`, `in_progress`, `blocked`, `needs_review`, `review_pending`, `completed`, `rejected`, `superseded`, `error`.

`review.status` is independent of `progress.status` — an agent's claim does not constitute a review approval.

## Safety Rules

- Keep workflow files inside the workspace.
- Use JSON workflow files only for server save/load.
- Do not add browser APIs that execute shell commands.
- Do not expose the server beyond `127.0.0.1`.
- Preserve the lightweight no-build architecture.

## Useful References

- [`skills/plan/SKILL.md`](skills/plan/SKILL.md) — design contract (full pattern catalog, design recipe, gate semantics)
- [`skills/execute/SKILL.md`](skills/execute/SKILL.md) — execution discipline
- [`skills/review/SKILL.md`](skills/review/SKILL.md) — adversarial review
- [`skills/repair/SKILL.md`](skills/repair/SKILL.md) — schema repair
- [`SCHEMA.md`](SCHEMA.md) — JSON schema reference
- [`USER-GUIDE.md`](USER-GUIDE.md) — browser canvas guide
