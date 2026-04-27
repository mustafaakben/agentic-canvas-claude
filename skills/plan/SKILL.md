---
description: Use when the user asks to use Agent Canvas, plan visually, design a multi-agent workflow, decompose complex work, map dependencies, or create a workflow JSON plan before implementation.
argument-hint: "[goal or workflow path]"
user-invocable: true
---

# Plan With Agent Canvas

Use this skill to turn a complex user request into a local visual workflow that the user can inspect and revise before coding starts.

## Purpose

Agent Canvas is the shared planning surface. The browser canvas is for human inspection and design; the workflow JSON is the execution contract for agents.

## Default Flow

1. Clarify the target outcome only if the user request is ambiguous.
2. Choose or create a workflow path inside `workflows/plans/`.
3. If creating a new workflow, run:

```bash
agent-canvas new workflows/plans/<name>.json
```

4. Open the canvas:

```bash
agent-canvas open workflows/plans/<name>.json
```

5. Ask the user to review and save the visual plan in the browser.
6. Wait for the user to say the plan is ready.
7. Validate and summarize the saved workflow:

```bash
agent-canvas validate workflows/plans/<name>.json
agent-canvas summarize workflows/plans/<name>.json
```

8. Read the workflow JSON before turning it into implementation steps.

## Planning Rules

- Keep the plan local-first and workspace-bound.
- Prefer a few meaningful workflow nodes over a crowded graph.
- Use generic nodes when a task does not need a special structural node.
- Use `human` or `wait` nodes for user checkpoints.
- Use `parallel` only when work can truly run independently.
- Use `loop` only when repeated work has a clear exit rule.
- Capture acceptance criteria in node agent metadata when possible.
- Do not treat a visual node marked completed as proof without evidence.
- If `agent-canvas` is not available in `PATH`, ask the user to reload the plugin or run Claude Code with `--plugin-dir`.

## Useful References

- `AGENT-CANVAS.md`
- `USER-GUIDE.md`
- `SCHEMA.md`
- `workflows/examples/cop.json`
