# Agent Canvas

A local-first visual planning canvas for designing, executing, and tracking multi-agent workflows. Drag nodes onto an infinite canvas, connect them, annotate with instructions and acceptance criteria, then hand the workflow JSON to your coding agents as an execution contract.

No build step. No framework. No install required. Just open it in a browser and start planning.

## Install

**Step 1 — Add the marketplace:**

```bash
claude plugin marketplace add mustafaakben/agentic-canvas-claude
```

**Step 2 — Install the plugin:**

```bash
claude plugin install agent-canvas@agentic-canvas-marketplace
```

**Or load locally during development:**

```bash
claude --plugin-dir ./path-to-this-folder
```

After installation, the following skills appear automatically:

| Skill | Purpose |
|---|---|
| `agent-canvas:plan` | Turn a complex request into a visual workflow plan |
| `agent-canvas:execute` | Follow a saved workflow JSON as the execution contract |
| `agent-canvas:review` | Adversarial review of claims, evidence, and gates |
| `agent-canvas:repair` | Fix malformed or outdated workflow JSON |

## What It Does

Agent Canvas is a shared planning surface for humans and coding agents:

1. **Plan visually** -- Drag node primitives (start, end, branch, loop, parallel, human, wait, etc.) onto the canvas and connect them.
2. **Annotate** -- Add purpose/instructions, agent metadata, acceptance criteria, and progress claims to each node.
3. **Hand off** -- Save the workflow JSON. Agents read it as a structured execution contract with dependencies, gates, and evidence requirements.
4. **Track progress** -- Completion claims require evidence (commands, diffs, tests, screenshots). Review approval is separate from the agent's claim.

### Node Types

11 built-in primitives: `start`, `end`, `generic`, `human`, `branch`, `merge`, `loop`, `parallel`, `trycatch`, `wait`, `subflow`.

### Workflow Schema

Exports JSON (schema v0.4) with nodes, connections, port roles, agent metadata, and evidence-backed progress claims. See [SCHEMA.md](SCHEMA.md) for the full specification.

## CLI

When the plugin is active, the `agent-canvas` command is available in your shell. Skills use it automatically, but you can also run it directly:

```bash
# Create a new workflow
agent-canvas new workflows/plans/my-plan.json

# Open the canvas in a browser
agent-canvas open workflows/plans/my-plan.json

# Validate a workflow
agent-canvas validate workflows/plans/my-plan.json

# Summarize the graph
agent-canvas summarize workflows/plans/my-plan.json

# Inspect progress claims
agent-canvas claims workflows/plans/my-plan.json

# Export as markdown
agent-canvas export-plan workflows/plans/my-plan.json --format markdown
```

The local server binds to `127.0.0.1` only. Workflow files must be inside the current workspace.

## How It Works

```
You: "Let's plan this refactor with Agent Canvas."
Agent: Creates or opens a workflow JSON, launches the canvas.
You: Review and edit the visual plan in the browser, then save.
Agent: Reads the saved JSON, summarizes the graph, executes step by step.
Agent: Adds progress claims with evidence at each node.
You: Review claims, approve or reject, agent continues from the approved state.
```

## Project Structure

```
.claude-plugin/
  plugin.json              # Plugin manifest
skills/
  plan/                    # Planning skill
  execute/                 # Execution skill
  review/                  # Review skill
  repair/                  # Repair skill
bin/
  agent-canvas             # POSIX CLI wrapper
  agent-canvas.cmd         # Windows CLI wrapper
scripts/
  canvasctl.mjs            # CLI entry point
  canvas-server.mjs        # Local HTTP server
  canvas-schema.mjs        # Schema validation and normalization
  canvas-handoff.mjs       # Markdown/text export
  open-browser.mjs         # Cross-platform browser opener
canvas.html                # Browser canvas (no build step)
styles/canvas.css          # Design tokens and layout
src/canvas/main.js         # Canvas behavior
schemas/
  agent-canvas.schema.json # Formal JSON schema
vendor/                    # Vendored browser dependencies (Drawflow, Dagre, ELK, html2canvas)
workflows/examples/        # Sample workflow files
```

## Design Principles

- **No build system** -- Plain HTML, CSS, and JavaScript. Open `canvas.html` in a browser.
- **Local-first** -- Server binds to localhost. Workflow files stay in your workspace.
- **Evidence-backed progress** -- Completion claims require proof, not just status flags.
- **Skill-first** -- Skills guide agent behavior. No MCP surfaces yet (deferred until server hardening is complete).
- **Cross-platform** -- Works on macOS, Linux, and Windows (POSIX shell + cmd wrappers).

## Running Tests

```bash
node tests/check-plugin.mjs    # Structural validation
node tests/smoke-cli.mjs       # End-to-end CLI smoke test
```

## Documentation

- [AGENT-CANVAS.md](AGENT-CANVAS.md) -- Instructions for agents using the canvas
- [SCHEMA.md](SCHEMA.md) -- Workflow JSON schema reference
- [USER-GUIDE.md](USER-GUIDE.md) -- How to use the browser canvas

## Requirements

- Node.js 18+
- A modern browser (Chrome, Firefox, Safari, Edge)

## License

[MIT](LICENSE)

## Author

**Mustafa Akben, PhD**
Assistant Professor of Management | Director of AI Integration
Elon University
[makben@elon.edu](mailto:makben@elon.edu) | [mustafaakben.com](https://www.mustafaakben.com)
