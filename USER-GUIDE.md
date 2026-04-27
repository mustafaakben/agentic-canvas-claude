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
