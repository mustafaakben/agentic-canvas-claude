#!/usr/bin/env node
import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { execFile } from "node:child_process";
import { promisify } from "node:util";
import { fileURLToPath } from "node:url";

import { startCanvasServer } from "../scripts/canvas-server.mjs";

const execFileAsync = promisify(execFile);
const pluginRoot = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const canvasctlPath = path.join(pluginRoot, "scripts", "canvasctl.mjs");

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

async function runAgentCanvas(args, cwd) {
  return execFileAsync(process.execPath, [canvasctlPath, ...args], {
    cwd,
    env: process.env,
    timeout: 10000,
    windowsHide: true,
  });
}

const workspace = await fs.mkdtemp(path.join(os.tmpdir(), "agent-canvas-plugin-"));
const workflowPath = "workflows/plans/plugin-smoke.json";

try {
  const created = await runAgentCanvas(["new", workflowPath], workspace);
  assert(created.stdout.includes(`Created ${workflowPath}`), "agent-canvas new should create a workspace workflow");

  const validated = await runAgentCanvas(["validate", workflowPath], workspace);
  assert(validated.stdout.includes(`Valid workflow: ${workflowPath}`), "agent-canvas validate should validate the new workflow");

  const summarized = await runAgentCanvas(["summarize", workflowPath], workspace);
  assert(summarized.stdout.includes("Schema: 0.4"), "agent-canvas summarize should read the workspace workflow");

  const server = await startCanvasServer({
    workspaceRoot: workspace,
    staticRoot: pluginRoot,
    workflowPath,
    port: 0,
  });

  try {
    const address = server.address();
    const port = typeof address === "object" ? address.port : address;
    const baseUrl = `http://127.0.0.1:${port}`;
    const canvasResponse = await fetch(`${baseUrl}/canvas.html`);
    const canvasHtml = await canvasResponse.text();
    assert(canvasResponse.ok, "plugin server should serve canvas.html");
    assert(canvasHtml.includes("./src/canvas/main.js"), "served canvas should reference plugin-local JavaScript");

    const workflowResponse = await fetch(`${baseUrl}/api/workflow?path=${encodeURIComponent(workflowPath)}`);
    const workflowBody = await workflowResponse.json();
    assert(workflowResponse.ok, "plugin server should load workspace workflow JSON");
    assert(workflowBody.ok === true, "workflow API should report ok for generated workflow");
    assert(workflowBody.workflow?.schemaVersion === "0.4", "workflow API should return schema 0.4");
  } finally {
    await new Promise(resolve => server.close(resolve));
  }

  console.log("Claude plugin CLI smoke passed.");
} finally {
  await fs.rm(workspace, { recursive: true, force: true });
}
