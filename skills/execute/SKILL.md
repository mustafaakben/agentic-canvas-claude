---
description: Use when a saved Agent Canvas workflow JSON should guide implementation, task execution, sequencing, agent delegation, or progress updates.
argument-hint: "<workflow.json>"
---

# Execute Canvas Plan

Use this skill after the user has approved or saved a workflow in Agent Canvas.

## Purpose

The workflow JSON is the execution contract. Follow the graph, node instructions, acceptance criteria, gates, loops, and progress evidence requirements instead of improvising a new plan.

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

4. Identify the current runnable node or slice:

- Start nodes and nodes with satisfied dependencies can run.
- `human` and `wait` nodes are gates.
- `parallel` branches can be delegated only if their write scopes do not conflict.
- `loop` nodes require a stop condition.

5. Execute the smallest coherent slice.
6. Verify the work with command output, diffs, tests, screenshots, review notes, or user approval.
7. Add or update progress claims only with evidence.
8. Stop at human gates, unresolved review gates, or ambiguous instructions.

## Execution Rules

- Do not skip validation.
- Do not claim completion without fresh evidence.
- Do not overwrite user changes outside the workflow's intended scope.
- Do not keep executing past a human approval checkpoint.
- Keep summaries concise and tied to workflow node IDs.

## Useful References

- `AGENT-CANVAS.md`
- `SCHEMA.md`
- `USER-GUIDE.md`
