---
description: Use for adversarial review of Agent Canvas workflows, progress claims, completion status, evidence quality, or readiness before moving to implementation or release.
argument-hint: "<workflow.json>"
---

# Review Canvas Evidence

Use this skill to challenge a workflow or progress state. The goal is to find unsupported claims, missing evidence, weak gates, schema drift, and places where a human or agent could misunderstand the plan.

## Review Flow

1. Validate the workflow:

```bash
agent-canvas validate <workflow.json>
```

2. Inspect claims:

```bash
agent-canvas claims <workflow.json>
```

3. Read the workflow JSON directly when claims or statuses look suspicious.
4. Identify the workflow's pattern (see *Pattern → Example Reference* below) and skim the matching example. Use it as the reference shape — deviations are not automatically wrong, but they are where review attention should concentrate.
5. List findings first, ordered by severity.
6. For each finding include:

- severity,
- node ID or file/path reference,
- issue,
- impact,
- recommended fix,
- whether it blocks execution.

## Evidence Semantics

Use these as the bar when reviewing claims.

**`progress.status` values** — `not_started`, `planned`, `in_progress`, `blocked`, `needs_review`, `review_pending`, `completed`, `rejected`, `superseded`, `error`. Only `completed` carries the load of "this is done"; all others are work-in-progress signals.

**Valid evidence types** — `command`, `file`, `diff`, `test`, `screenshot`, `url`, `human_note`. Anything else is not evidence.

**Independence rule** — `review.status` is separate from `progress.status`. An agent claiming `completed` does not constitute review approval. Look for `review.status: approved` distinctly.

**Acceptance criteria** — every node with non-trivial work should have `agent.acceptanceCriteria[]`. Missing criteria on a high-risk or completed node is a finding.

## What To Attack

- Completed nodes with no claim evidence.
- Claims marked completed without evidence.
- Approved reviews attached to non-completion claims.
- Human gates that are bypassed or auto-resolved without `human_note` evidence.
- Wait gates with no release condition documented in `purposeInstructions` or `meta`.
- Parallel work that actually has shared write scope.
- Loops without stop conditions (`_stopMode`, `_stopConditions` absent or empty).
- Trycatch nodes without a defined escalation path on the catch branch.
- Branch nodes with unlabeled outputs or outputs that don't rejoin a `merge`.
- Missing acceptance criteria for high-risk or `risk_level: high` nodes.
- Schema fields silently dropped or normalized in a way that changes intent.
- Docs or summaries that disagree with the JSON.

## Review Tone

Be adversarial and concrete. Do not spend time praising the workflow. If there are no blocking findings, say so clearly and still list residual risks or test gaps.

## Pattern → Example Reference

Use the example matching the workflow's pattern key as the comparison baseline. Anchoring against a known-good shape sharpens findings — "this loop is missing a stop rule that `single-loops_monthly-dining.json` has" is more actionable than "this loop is suspicious."

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
- `AGENT-CANVAS.md` — agent operating handbook
- `USER-GUIDE.md` — browser canvas guide
