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
4. Make the smallest correction that preserves user intent.
5. Validate again.
6. Summarize what changed and why.

## Repair Rules

- Preserve node IDs whenever possible.
- Preserve labels, instructions, and graph structure unless they are the cause of the failure.
- Do not silently convert unsupported semantics into generic behavior without reporting it.
- Do not mark progress completed as part of schema repair.
- Keep workflow files inside the workspace.
- Keep output JSON readable and stable.

## Useful References

- `SCHEMA.md`
- `schemas/agent-canvas.schema.json`
- `scripts/canvas-schema.mjs`
