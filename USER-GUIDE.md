# Agent Canvas User Guide

Agent Canvas is a local browser canvas for sketching agentic workflows. Drag nodes onto the canvas, connect them, add instructions, and save or export the workflow JSON.

## Open The Canvas

Static mode:

```bash
python3 -m http.server 8080 --bind 127.0.0.1
```

Then open:

```text
http://127.0.0.1:8080/canvas.html
```

Workspace save/load mode:

```bash
node scripts/canvasctl.mjs open workflows/plans/my-plan.canvas.json
```

## Example Workflows To Study

Twelve example workflows ship under `workflows/examples/`, one per design pattern. Open any of them to see the pattern in action before sketching your own. Sizes are nodes / connections.

| Pattern | Example file | Size | What you'll see |
|---|---|---|---|
| `single-full` | `single-full_dinner-party.json` | 16 / 17 | Compact "one of each" — start, parallel, merge, loop, wait, end across 7 phases. |
| `single-loops` | `single-loops_monthly-dining.json` | 19 / 21 | Iteration-heavy: 3 loops + 3 wait gates over a month-long plan. |
| `multi-islands` | `multi-islands_multi-platform-publishing.json` | 22 / 18 | Four independent chains, 4 starts → 4 ends, no shared merge. |
| `multi-ideation` | `multi-ideation_syllabus-redesign.json` | 15 / 12 | Three ideation lenses on the same problem, kept independent for comparison. |
| `multi-merge` (small) | `multi-merge_landing-page.json` | 19 / 18 | Three-start collab converging at a single merge. |
| `multi-merge` (large) | `multi-merge_ai-future-of-work-presentation.json` | 64 / 83 | 6 starts, 5 phases, 7 parallels + 8 merges + a trycatch. |
| `branch-decision` | `branch-decision_paper-submission.json` | 9 / 9 | Binary branch (READY vs. REVISE) with rejoin at a merge. |
| `trycatch-escalation` | `trycatch-escalation_grant-application.json` | 10 / 9 | Trycatch wrapping a funder decision with an escalation path. |
| `subflow-composition` | `subflow-composition_course-launch.json` | 10 / 10 | Four `subflow` markers signaling "this step is its own workflow." |
| `pipeline` (full) | `greenwashing.json` | 66 / 91 | Real lit-review pipeline — 9 phases, parallel fan-outs, loops, human-in-the-loop wait. |
| `pipeline` (compact) | `greenwashing-literature-review-multi-start.json` | 13 / 13 | Slim multi-start lit-review variant. |
| `cop` (legacy) | `cop.json` | — | Original community-of-practice reference example. |

Open one with:

```bash
agent-canvas open workflows/examples/single-full_dinner-party.json
```

For the design contract behind each pattern (when to pick which, how to compose them), see [`skills/plan/SKILL.md`](skills/plan/SKILL.md).

## Edit A Workflow

- Drag node primitives from the bottom ribbon.
- Connect a filled output dot to a hollow input dot.
- Double-click labels to rename nodes.
- Shift-click a node to open the inspector.
- Use the inspector to edit instructions, agent metadata, progress status, claims, loop details, and port counts.

## Save And Export

When opened through `canvasctl`, use Save, Save As, or Reload from the ribbon. The status pill near the top-left shows whether the canvas is connected and saved.

Export still downloads a JSON file. Print downloads a high-resolution PNG.

## Layout

The Auto menu supports:

- Safe Flow
- ELK Layered
- Semantic Lanes
- Compact
- Selected Only

Layouts run only when you choose them. Manual movement remains available after layout.

## Hand Back To An Agent

After saving, tell the agent to read the JSON. The agent should treat the saved workflow as the source of truth and should respect wait gates, human nodes, loops, and acceptance criteria.
