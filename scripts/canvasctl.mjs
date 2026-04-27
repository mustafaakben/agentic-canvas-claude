#!/usr/bin/env node
import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { createBlankWorkflow, normalizeWorkflow, validateWorkflow } from "./canvas-schema.mjs";
import { startCanvasServer } from "./canvas-server.mjs";
import { workflowToMarkdown, workflowToTextSummary } from "./canvas-handoff.mjs";
import { openBrowser } from "./open-browser.mjs";

const DEFAULT_WORKFLOW_PATH = "workflows/plans/agent-canvas.workflow.json";
const PLUGIN_ROOT = path.dirname(path.dirname(fileURLToPath(import.meta.url)));

function printUsage() {
  console.log(`Agent Canvas CLI

Usage:
  node scripts/canvasctl.mjs open [workflow.json] [--port 8080] [--no-open]
  node scripts/canvasctl.mjs validate <workflow.json>
  node scripts/canvasctl.mjs new <workflow.json> [--from prompt.txt]
  node scripts/canvasctl.mjs print <workflow.json>
  node scripts/canvasctl.mjs summarize <workflow.json>
  node scripts/canvasctl.mjs claims <workflow.json>
  node scripts/canvasctl.mjs export-plan <workflow.json> --format markdown
`);
}

function parseOptions(args) {
  const options = {};
  const positionals = [];
  for (let i = 0; i < args.length; i += 1) {
    const arg = args[i];
    if (arg === "--port") {
      options.port = Number(args[++i]);
    } else if (arg === "--format") {
      options.format = args[++i];
    } else if (arg === "--from") {
      options.from = args[++i];
    } else if (arg === "--no-open") {
      options.noOpen = true;
    } else if (arg === "--help" || arg === "-h") {
      options.help = true;
    } else {
      positionals.push(arg);
    }
  }
  return { options, positionals };
}

function displayNameFromPath(filePath) {
  return path.basename(filePath).replace(/\.json$/i, "");
}

function toWorkspaceRelative(workspaceRoot, filePath) {
  const absolute = path.isAbsolute(filePath) ? filePath : path.resolve(workspaceRoot, filePath);
  const relative = path.relative(workspaceRoot, absolute);
  if (relative.startsWith("..") || path.isAbsolute(relative)) {
    throw new Error("Open command only serves workflow files inside the current workspace");
  }
  return relative.split(path.sep).join("/");
}

async function readWorkflowFile(filePath) {
  return JSON.parse(await fs.readFile(filePath, "utf8"));
}

async function writeWorkflowFile(filePath, workflow) {
  await fs.mkdir(path.dirname(filePath), { recursive: true });
  await fs.writeFile(filePath, JSON.stringify(normalizeWorkflow(workflow), null, 2) + "\n", "utf8");
}

async function ensureWorkflowFile(workspaceRoot, relativePath) {
  const absolutePath = path.resolve(workspaceRoot, relativePath);
  try {
    await fs.access(absolutePath);
  } catch {
    await writeWorkflowFile(absolutePath, createBlankWorkflow(displayNameFromPath(relativePath)));
  }
}

async function commandOpen(args) {
  const { options, positionals } = parseOptions(args);
  const workspaceRoot = process.cwd();
  const workflowPath = toWorkspaceRelative(workspaceRoot, positionals[0] || DEFAULT_WORKFLOW_PATH);
  await ensureWorkflowFile(workspaceRoot, workflowPath);
  const server = await startCanvasServer({
    workspaceRoot,
    staticRoot: PLUGIN_ROOT,
    workflowPath,
    port: options.port,
  });
  const address = server.address();
  const port = typeof address === "object" ? address.port : options.port;
  const url = `http://127.0.0.1:${port}/canvas.html?workflow=${encodeURIComponent(workflowPath)}`;
  const opened = openBrowser(url, { noOpen: options.noOpen });
  console.log(`Canvas server started:\n${url}`);
  console.log(`Workflow: ${workflowPath}`);
  if (!opened) console.log("Browser was not opened automatically; open the URL above.");
  console.log("Press Ctrl+C to stop the server.");
  process.on("SIGINT", () => {
    server.close(() => process.exit(0));
  });
}

async function commandValidate(args) {
  const { positionals } = parseOptions(args);
  if (!positionals[0]) throw new Error("validate requires a workflow path");
  const workflow = await readWorkflowFile(positionals[0]);
  const result = validateWorkflow(workflow);
  if (!result.ok) {
    console.error(result.errors.join("\n"));
    process.exitCode = 1;
    return;
  }
  console.log(`Valid workflow: ${positionals[0]}`);
}

async function commandNew(args) {
  const { options, positionals } = parseOptions(args);
  if (!positionals[0]) throw new Error("new requires a workflow path");
  const workflow = createBlankWorkflow(displayNameFromPath(positionals[0]));
  if (options.from) {
    workflow.designIntent = await fs.readFile(options.from, "utf8");
  }
  await writeWorkflowFile(positionals[0], workflow);
  console.log(`Created ${positionals[0]}`);
}

async function commandSummarize(args) {
  const { positionals } = parseOptions(args);
  if (!positionals[0]) throw new Error("summarize requires a workflow path");
  const workflow = await readWorkflowFile(positionals[0]);
  console.log(workflowToTextSummary(workflow));
}

async function commandExportPlan(args) {
  const { options, positionals } = parseOptions(args);
  if (!positionals[0]) throw new Error("export-plan requires a workflow path");
  if ((options.format || "markdown") !== "markdown") throw new Error("Only --format markdown is supported");
  const workflow = await readWorkflowFile(positionals[0]);
  process.stdout.write(workflowToMarkdown(workflow));
}

async function commandClaims(args) {
  const { positionals } = parseOptions(args);
  if (!positionals[0]) throw new Error("claims requires a workflow path");
  const workflow = normalizeWorkflow(await readWorkflowFile(positionals[0]));
  let count = 0;
  for (const node of workflow.nodes) {
    for (const claim of node.progress.claims || []) {
      count += 1;
      console.log(`${node.id} ${claim.id} ${claim.status} review:${claim.review.status} ${claim.summary}`);
    }
  }
  if (!count) console.log("No claims found.");
}

async function main() {
  const [command, ...args] = process.argv.slice(2);
  if (!command || command === "--help" || command === "-h") {
    printUsage();
    return;
  }
  if (command === "open") return commandOpen(args);
  if (command === "validate") return commandValidate(args);
  if (command === "new") return commandNew(args);
  if (command === "summarize") return commandSummarize(args);
  if (command === "export-plan") return commandExportPlan(args);
  if (command === "claims") return commandClaims(args);
  if (command === "print") return commandExportPlan(args);
  throw new Error(`Unknown command: ${command}`);
}

main().catch(error => {
  console.error(error.message);
  process.exitCode = 1;
});
