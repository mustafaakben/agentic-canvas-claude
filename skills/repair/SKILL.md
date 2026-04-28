---
description: Use when an Agent Canvas workflow JSON needs validation, schema repair, migration, normalization review, or careful correction without changing the user's planning intent.
argument-hint: "<workflow.json>"
---

# Repair Canvas Workflow

Use this skill when a workflow is malformed, outdated, invalid, hard to load, or inconsistent with the Agent Canvas schema.

## Repair Flow

1. Read the workflow JSON.
2. Run validation:

```bash
agent-canvas validate <workflow.json>
```

3. Identify whether the problem is syntax, schema, missing fields, invalid connections, unsupported node type, progress/evidence semantics, or docs drift.
4. Identify the workflow's design pattern (see *Pattern → Example Reference* below) and skim the matching example. The example shows what a healthy version of this pattern looks like — repair toward that shape, not toward generic validity.
5. Make the smallest correction that preserves user intent.
6. Validate again.
7. Summarize what changed and why.

## Repair Rules

- Preserve node IDs whenever possible.
- Preserve labels, instructions, and graph structure unless they are the cause of the failure.
- **Preserve pattern intent.** A trycatch wrapping a high-risk node is not the same as a branch with two outputs; do not normalize one into the other to satisfy validation.
- Do not silently convert unsupported semantics into generic behavior without reporting it.
- Do not mark progress completed as part of schema repair.
- Keep workflow files inside the workspace.
- Keep output JSON readable and stable.

## Pattern → Example Reference

When repairing, identify the workflow's pattern key and use the matching example as the reference for "what this should look like when healthy." Repair toward the shape of the matching example, not toward an abstract notion of validity.

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

## Useful References

- `skills/plan/SKILL.md` — design contract (full pattern catalog, design recipe, gate semantics)
- `SCHEMA.md` — JSON schema reference
- `schemas/agent-canvas.schema.json` — formal JSON schema
- `scripts/canvas-schema.mjs` — runtime validation logic
- `AGENT-CANVAS.md` — agent operating handbook
