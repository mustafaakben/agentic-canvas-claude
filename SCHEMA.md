# Agent Canvas Schema

The current export schema is `0.4`.

```json
{
  "schemaVersion": "0.4",
  "workflowKind": "agentic-coding-sketch",
  "name": "Workflow name",
  "nodes": [],
  "connections": []
}
```

The formal JSON schema lives at `schemas/agent-canvas.schema.json`. Runtime validation is implemented in `scripts/canvas-schema.mjs`.

## Nodes

Each node has:

- `id`: stable workflow ID, such as `n1`.
- `type`: one of `generic`, `human`, `start`, `end`, `branch`, `merge`, `loop`, `parallel`, `trycatch`, `wait`, or `subflow`.
- `label`: display label.
- `purposeInstructions`: free-text instructions.
- `x` and `y`: canvas position.
- `inputs` and `outputs`: port counts.
- `ports`: role names by port number.
- `agent`: optional structured execution metadata.
- `progress`: status plus optional claims and evidence.

## Agent Metadata

`agent` can include:

- `role`
- `intent`
- `inputs`
- `outputs`
- `acceptanceCriteria`
- `recommendedTools`
- `riskLevel`
- `notes`

These fields are optional. Empty fields should not make the UI heavy or prevent simple workflows.

## Progress

`progress.status` can be:

```text
not_started
planned
in_progress
blocked
needs_review
review_pending
completed
rejected
superseded
error
```

Claims include:

- `summary`
- `claimedBy`
- `claimedAt`
- `evidence[]`
- `review.status`

Evidence types are `command`, `file`, `diff`, `screenshot`, `test`, `url`, and `human_note`.

## Connections

Connections use stable node IDs and 1-indexed ports:

```json
{
  "from": "n1",
  "fromPort": 1,
  "fromRole": "start",
  "to": "n2",
  "toPort": 1,
  "toRole": "in"
}
```

## Compatibility

The importer still accepts older examples without `schemaVersion`, `workflowKind`, port roles, agent metadata, or progress claims. Export normalizes workflows to schema `0.4`.

## Examples

Working JSON files live under [`workflows/examples/`](workflows/examples/). Three useful starting points:

- [`single-full_dinner-party.json`](workflows/examples/single-full_dinner-party.json) — touches most primitives in one workflow (start, parallel, merge, loop, wait, end).
- [`greenwashing.json`](workflows/examples/greenwashing.json) — full-scale pipeline (66 nodes / 91 connections) with parallel fan-outs, loops, and a human-in-the-loop wait.
- [`trycatch-escalation_grant-application.json`](workflows/examples/trycatch-escalation_grant-application.json) — trycatch with an escalation path.

For the design intent behind each pattern (when to pick what, how to compose them, how the schema fields tie back to design decisions), see [`skills/plan/SKILL.md`](skills/plan/SKILL.md). For the full pattern → example map, see [AGENT-CANVAS.md](AGENT-CANVAS.md).
