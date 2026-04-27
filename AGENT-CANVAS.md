# Agent Canvas Instructions

Agent Canvas is the shared planning surface for humans and coding agents. The browser canvas is for visual editing; the workflow JSON is the execution contract.

## When To Use It

Use the canvas when a task has several dependent phases, parallel work, review gates, loops, or handoffs. Do not use it for tiny one-step edits unless the user explicitly asks.

## Launch

```bash
node scripts/canvasctl.mjs open
node scripts/canvasctl.mjs open workflows/examples/cop.json
node scripts/canvasctl.mjs open workflows/plans/auth.canvas.json --port 8080
```

The launcher binds the local server to `127.0.0.1`, prints the URL, and opens the browser when possible. If browser opening fails, open the printed URL manually.

## Agent Workflow

1. Create or open a workflow JSON file.
2. Start the canvas with `canvasctl open`.
3. Ask the user to review and revise the visual plan.
4. Wait for the user to save the canvas.
5. Read the saved JSON.
6. Execute according to the graph, respecting dependencies, parallel branches, loops, human nodes, and wait gates.
7. Add progress claims only with evidence.

## Reading Order

Read the graph in this order:

1. start nodes,
2. dependencies,
3. parallel branches,
4. branches and try/catch paths,
5. loops,
6. human and wait gates,
7. acceptance criteria,
8. progress claims and review status.

The CLI can help:

```bash
node scripts/canvasctl.mjs summarize workflows/plans/auth.canvas.json
node scripts/canvasctl.mjs export-plan workflows/plans/auth.canvas.json --format markdown
node scripts/canvasctl.mjs claims workflows/plans/auth.canvas.json
```

## Progress Claims

Do not treat `completed` as trustworthy by itself. A completion claim should include evidence such as a command, file path, diff note, screenshot, test, URL, or human note. Review approval is separate from the agent's claim.

## Safety Rules

- Keep workflow files inside the workspace.
- Use JSON workflow files only for server save/load.
- Do not add browser APIs that execute shell commands.
- Do not expose the server beyond `127.0.0.1`.
- Preserve the lightweight no-build architecture.
