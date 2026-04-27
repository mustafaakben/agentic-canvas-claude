import fs from "node:fs";
import fsp from "node:fs/promises";
import http from "node:http";
import path from "node:path";
import { fileURLToPath } from "node:url";

import {
  CURRENT_SCHEMA_VERSION,
  addClaimToWorkflow,
  normalizeWorkflow,
  reviewClaimInWorkflow,
  validateWorkflow,
} from "./canvas-schema.mjs";

const DEFAULT_MAX_BODY_BYTES = 10 * 1024 * 1024;

const MIME_TYPES = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".mjs": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".ico": "image/x-icon",
};

function defaultStaticRoot() {
  return path.dirname(path.dirname(fileURLToPath(import.meta.url)));
}

function toUrlPath(relativePath) {
  return relativePath.split(path.sep).join("/");
}

function isWindowsAbsolutePath(value) {
  return /^[A-Za-z]:[\\/]/.test(value);
}

function assertInsideRoot(root, candidate) {
  const relative = path.relative(root, candidate);
  if (relative === "") return;
  if (relative.startsWith("..") || path.isAbsolute(relative)) {
    throw Object.assign(new Error("Path resolves outside the workspace"), { statusCode: 403 });
  }
}

export function resolveWorkspacePath(workspaceRoot, requestPath, options = {}) {
  const jsonOnly = options.jsonOnly !== false;
  const root = path.resolve(workspaceRoot || process.cwd());
  const rawPath = String(requestPath || "").trim();
  if (!rawPath) throw Object.assign(new Error("Missing workflow path"), { statusCode: 400 });
  if (path.isAbsolute(rawPath) || isWindowsAbsolutePath(rawPath)) {
    throw Object.assign(new Error("Workflow path must be relative to the workspace"), { statusCode: 403 });
  }
  const normalizedInput = rawPath.replace(/\\/g, "/");
  const absolutePath = path.resolve(root, normalizedInput);
  assertInsideRoot(root, absolutePath);
  if (jsonOnly && path.extname(absolutePath).toLowerCase() !== ".json") {
    throw Object.assign(new Error("Canvas server only reads and writes JSON workflow files"), { statusCode: 400 });
  }
  return {
    absolutePath,
    relativePath: toUrlPath(path.relative(root, absolutePath)),
  };
}

function resolveStaticPath(staticRoot, requestPath) {
  const root = path.resolve(staticRoot || defaultStaticRoot());
  const rawPath = decodeURIComponent(requestPath.split("?")[0] || "/");
  const cleaned = rawPath === "/" ? "/canvas.html" : rawPath;
  const relative = cleaned.replace(/^\/+/, "");
  const absolutePath = path.resolve(root, relative);
  assertInsideRoot(root, absolutePath);
  return absolutePath;
}

function sendJson(response, statusCode, payload) {
  response.writeHead(statusCode, {
    "content-type": "application/json; charset=utf-8",
    "cache-control": "no-store",
  });
  response.end(JSON.stringify(payload, null, 2));
}

function sendError(response, error) {
  const statusCode = Number.isInteger(error.statusCode) ? error.statusCode : 500;
  sendJson(response, statusCode, {
    ok: false,
    error: error.message || "Server error",
  });
}

async function readJsonBody(request, maxBytes = DEFAULT_MAX_BODY_BYTES) {
  let total = 0;
  const chunks = [];
  for await (const chunk of request) {
    total += chunk.length;
    if (total > maxBytes) {
      throw Object.assign(new Error("Request body is too large"), { statusCode: 413 });
    }
    chunks.push(chunk);
  }
  const text = Buffer.concat(chunks).toString("utf8");
  if (!text.trim()) return {};
  try {
    return JSON.parse(text);
  } catch (error) {
    throw Object.assign(new Error(`Malformed JSON: ${error.message}`), { statusCode: 400 });
  }
}

async function readWorkflowFile(workspaceRoot, requestPath) {
  const resolved = resolveWorkspacePath(workspaceRoot, requestPath);
  let parsed;
  try {
    parsed = JSON.parse(await fsp.readFile(resolved.absolutePath, "utf8"));
  } catch (error) {
    if (error.code === "ENOENT") {
      throw Object.assign(new Error(`Workflow not found: ${resolved.relativePath}`), { statusCode: 404 });
    }
    if (error instanceof SyntaxError) {
      throw Object.assign(new Error(`Malformed workflow JSON: ${error.message}`), { statusCode: 400 });
    }
    throw error;
  }
  return {
    ...resolved,
    workflow: parsed,
  };
}

async function writeWorkflowFile(workspaceRoot, requestPath, workflow) {
  const resolved = resolveWorkspacePath(workspaceRoot, requestPath);
  const validation = validateWorkflow(workflow);
  if (!validation.ok) {
    throw Object.assign(new Error("Workflow validation failed"), {
      statusCode: 422,
      validation,
    });
  }
  const normalized = normalizeWorkflow(workflow);
  await fsp.mkdir(path.dirname(resolved.absolutePath), { recursive: true });
  await fsp.writeFile(resolved.absolutePath, JSON.stringify(normalized, null, 2) + "\n", "utf8");
  return {
    ...resolved,
    workflow: normalized,
    validation,
  };
}

async function handleStatic(request, response, staticRoot) {
  try {
    const absolutePath = resolveStaticPath(staticRoot, request.url);
    const stat = await fsp.stat(absolutePath);
    if (!stat.isFile()) {
      sendJson(response, 404, { ok: false, error: "Not found" });
      return;
    }
    const ext = path.extname(absolutePath).toLowerCase();
    response.writeHead(200, {
      "content-type": MIME_TYPES[ext] || "application/octet-stream",
      "cache-control": "no-store",
    });
    fs.createReadStream(absolutePath).pipe(response);
  } catch (error) {
    if (error.code === "ENOENT") sendJson(response, 404, { ok: false, error: "Not found" });
    else sendError(response, error);
  }
}

async function handleApi(request, response, context) {
  const url = new URL(request.url, "http://127.0.0.1");
  const requestedWorkflowPath = url.searchParams.get("path") || context.workflowPath;

  try {
    if (request.method === "GET" && url.pathname === "/api/status") {
      sendJson(response, 200, {
        ok: true,
        workspaceRoot: context.workspaceRoot,
        workflowPath: context.workflowPath,
        schemaVersion: CURRENT_SCHEMA_VERSION,
        capabilities: {
          loadWorkflow: true,
          saveWorkflow: true,
          validateWorkflow: true,
          addClaim: true,
          reviewClaim: true,
        },
      });
      return;
    }

    if (request.method === "GET" && url.pathname === "/api/workflow") {
      const loaded = await readWorkflowFile(context.workspaceRoot, requestedWorkflowPath);
      const validation = validateWorkflow(loaded.workflow);
      sendJson(response, validation.ok ? 200 : 422, {
        ok: validation.ok,
        workflowPath: loaded.relativePath,
        workflow: validation.workflow,
        errors: validation.errors,
        warnings: validation.warnings,
      });
      return;
    }

    if (request.method === "PUT" && url.pathname === "/api/workflow") {
      const body = await readJsonBody(request);
      const saved = await writeWorkflowFile(context.workspaceRoot, requestedWorkflowPath, body);
      sendJson(response, 200, {
        ok: true,
        workflowPath: saved.relativePath,
        workflow: saved.workflow,
        errors: [],
        warnings: saved.validation.warnings,
      });
      return;
    }

    if (request.method === "POST" && url.pathname === "/api/validate") {
      const body = await readJsonBody(request);
      const validation = validateWorkflow(body);
      sendJson(response, 200, {
        ok: validation.ok,
        errors: validation.errors,
        warnings: validation.warnings,
        workflow: validation.workflow,
      });
      return;
    }

    if (request.method === "POST" && url.pathname === "/api/workflow/claim") {
      const body = await readJsonBody(request);
      const loaded = await readWorkflowFile(context.workspaceRoot, requestedWorkflowPath);
      const workflow = addClaimToWorkflow(loaded.workflow, body.nodeId, body.claim || body);
      const saved = await writeWorkflowFile(context.workspaceRoot, loaded.relativePath, workflow);
      sendJson(response, 200, {
        ok: true,
        workflowPath: saved.relativePath,
        workflow: saved.workflow,
      });
      return;
    }

    if (request.method === "POST" && url.pathname === "/api/workflow/review") {
      const body = await readJsonBody(request);
      const loaded = await readWorkflowFile(context.workspaceRoot, requestedWorkflowPath);
      const workflow = reviewClaimInWorkflow(loaded.workflow, body.nodeId, body.claimId, body.review || body);
      const saved = await writeWorkflowFile(context.workspaceRoot, loaded.relativePath, workflow);
      sendJson(response, 200, {
        ok: true,
        workflowPath: saved.relativePath,
        workflow: saved.workflow,
      });
      return;
    }

    sendJson(response, 404, { ok: false, error: "API route not found" });
  } catch (error) {
    if (error.validation) {
      sendJson(response, error.statusCode || 422, {
        ok: false,
        error: error.message,
        errors: error.validation.errors,
        warnings: error.validation.warnings,
      });
      return;
    }
    sendError(response, error);
  }
}

export function createCanvasServer(options = {}) {
  const context = {
    workspaceRoot: path.resolve(options.workspaceRoot || process.cwd()),
    staticRoot: path.resolve(options.staticRoot || defaultStaticRoot()),
    workflowPath: options.workflowPath || "workflows/plans/agent-canvas.workflow.json",
  };

  return http.createServer((request, response) => {
    if (request.url.startsWith("/api/")) {
      handleApi(request, response, context);
      return;
    }
    if (!["GET", "HEAD"].includes(request.method)) {
      sendJson(response, 405, { ok: false, error: "Method not allowed" });
      return;
    }
    handleStatic(request, response, context.staticRoot);
  });
}

export async function startCanvasServer(options = {}) {
  const host = options.host || "127.0.0.1";
  const port = Number.isFinite(Number(options.port)) ? Number(options.port) : 0;
  const server = createCanvasServer(options);
  await new Promise((resolve, reject) => {
    server.once("error", reject);
    server.listen(port, host, resolve);
  });
  return server;
}
