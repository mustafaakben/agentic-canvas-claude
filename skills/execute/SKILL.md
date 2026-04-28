---
description: Use when a saved Agent Canvas workflow JSON should guide implementation, task execution, sequencing, agent delegation, or progress updates.
argument-hint: "<workflow.json>"
---

# Execute Canvas Plan

Use this skill after the user has approved or saved a workflow in Agent Canvas.

## Purpose

The workflow JSON is the execution contract. Follow the graph, node instructions, acceptance criteria, gates, loops, and progress evidence requirements instead of improvising a new plan.

## Reading Order

Read the workflow graph in this order before doing any work:

1. **Start nodes** — every entry point. Multi-start workflows have several.
2. **Dependencies** — a node is runnable when all its predecessors are completed (or non-blocking by design).
3. **Parallel branches** — `parallel` fan-outs. Confirm write scopes do not collide before delegating.
4. **Branches and try/catch paths** — `branch` decisions, `merge` rejoin points, `trycatch` happy/escalation paths.
5. **Loops** — every `loop` must have a stop rule (`_stopMode`, `_stopConditions`).
6. **Human and wait gates** — `human` and `wait` nodes are checkpoints. Do not run past them.
7. **Acceptance criteria** — each `agent.acceptanceCriteria[]` is the contract for that node's completion.
8. **Progress claims and review status** — current state of completion + reviewer approval.

## Execution Flow

1. Validate the workflow:

```bash
agent-canvas validate <workflow.json>
```

2. Summarize the graph:

```bash
agent-canvas summarize <workflow.json>
```

3. Export the plan if a markdown execution view helps:

```bash
agent-canvas export-plan <workflow.json> --format markdown
```

4. Identify the workflow's design pattern (see *Pattern → Example Reference* below) and read the matching example before executing — it anchors expectations for port wiring, gate placement, and evidence shape.

5. Identify the current runnable node or slice:

- Start nodes and nodes with satisfied dependencies can run.
- `human` and `wait` nodes are gates.
- `parallel` branches can be delegated only if their write scopes do not conflict.
- `loop` nodes require a stop condition.

6. Execute the smallest coherent slice.
7. Verify the work with command output, diffs, tests, screenshots, review notes, or user approval.
8. Add or update progress claims only with evidence.
9. Stop at human gates, unresolved review gates, or ambiguous instructions.

## Execution Rules

- Do not skip validation.
- Do not claim completion without fresh evidence.
- Do not overwrite user changes outside the workflow's intended scope.
- Do not keep executing past a human approval checkpoint.
- Keep summaries concise and tied to workflow node IDs.

## Evidence & Claims

A `progress.status` of `completed` is meaningful only when accompanied by evidence. Valid evidence types:

- `command` — the shell command that demonstrates the work
- `file` — a file path pointing at the artifact
- `diff` — a code diff
- `test` — a passing test name or path
- `screenshot` — a UI verification capture
- `url` — a deployed or published URL
- `human_note` — explicit user confirmation

`review.status` is separate from `progress.status`. The agent's claim and the human's approval are independent — do not promote `needs_review` or `review_pending` to `completed` on the agent's own authority.

## Pattern → Example Reference

After summarizing the workflow, identify which design pattern it most closely matches and read the corresponding example end-to-end. Anchoring execution to a known-good shape catches drift in port wiring, gate placement, and evidence expectations early.

All examples live under `workflows/examples/`. Sizes are nodes / connections.

| Pattern key | Example file | Size | What it demonstrates |
|---|---|---|---|
| `single-full` | `single-full_dinner-party.json` | 16 / 17 | Compact "one of each" — start, parallel, merge, loop, wait, end across 7 phases. |
| `single-loops` | `single-loops_monthly-dining.json` | 19 / 21 | Iteration-heavy: 3 loops + 3 wait gates over a month-long plan with split owners. |
| `multi-islands` | `multi-islands_multi-platform-publishing.json` | 22 / 18 | Four genuinely independent chains, 4 starts → 4 ends, no shared merge. |
| `multi-ideation` | `multi-ideation_syllabus-redesign.json` | 15 / 12 | Three ideation lenses on the same problem, 3 starts → 3 ends, comparison off-canvas. |
| `multi-merge` (small) | `multi-merge_landing-page.json` | 19 / 18 | Three-start collab converging at a single merge — minimum viable multi-merge. |
| `multi-merge` (large) | `multi-merge_ai-future-of-work-presentation.json` | 64 / 83 | 6 starts, 5 phases, 7 parallels + 8 merges + a trycatch. Major program shape. |
| `branch-decision` | `branch-decision_paper-submission.json` | 9 / 9 | Minimal binary branch (READY vs. REVISE) with rejoin at a merge. |
| `trycatch-escalation` | `trycatch-escalation_grant-application.json` | 10 / 9 | Trycatch wrapping a funder decision — funded path activates, rejected path escalates. |
| `subflow-composition` | `subflow-composition_course-launch.json` | 10 / 10 | Four `subflow` markers signaling "this step is its own workflow." |
| `pipeline` (full) | `greenwashing.json` | 66 / 91 | Real working lit-review pipeline — 9 phases, parallel fan-outs, loops, human-in-the-loop wait. |
| `pipeline` (compact) | `greenwashing-literature-review-multi-start.json` | 13 / 13 | Slim multi-start lit-review variant. |
| `cop` (legacy) | `cop.json` | — | Original community-of-practice reference example. |

If the workflow does not match any pattern cleanly, read `single-full_dinner-party.json` first for the primitive vocabulary, then `greenwashing.json` for what a real pipeline looks like.

## Useful References

- `skills/plan/SKILL.md` — design contract (full pattern catalog, design recipe, gate semantics)
- `AGENT-CANVAS.md` — agent operating handbook
- `SCHEMA.md` — JSON schema reference
- `USER-GUIDE.md` — browser canvas guide
