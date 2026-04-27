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
