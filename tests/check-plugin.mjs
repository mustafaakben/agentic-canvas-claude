#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const pluginRoot = path.dirname(path.dirname(fileURLToPath(import.meta.url)));

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

function readText(relativePath) {
  return fs.readFileSync(path.join(pluginRoot, relativePath), "utf8");
}

function exists(relativePath) {
  return fs.existsSync(path.join(pluginRoot, relativePath));
}

function parseJson(relativePath) {
  return JSON.parse(readText(relativePath));
}

const manifest = parseJson(".claude-plugin/plugin.json");
assert(manifest.name === "agent-canvas", "plugin manifest name must be agent-canvas");
assert(typeof manifest.description === "string" && manifest.description.length > 20, "plugin manifest needs a useful description");
assert(typeof manifest.version === "string" && manifest.version.length > 0, "plugin manifest needs a version");

const requiredFiles = [
  "README.md",
  "canvas.html",
  "styles/canvas.css",
  "src/canvas/main.js",
  "scripts/canvasctl.mjs",
  "bin/agent-canvas",
  "bin/agent-canvas.cmd",
  "scripts/canvas-server.mjs",
  "scripts/canvas-schema.mjs",
  "scripts/canvas-handoff.mjs",
  "scripts/open-browser.mjs",
  "schemas/agent-canvas.schema.json",
  "vendor/drawflow.min.css",
  "vendor/drawflow.min.js",
  "vendor/html2canvas.min.js",
  "vendor/dagre.min.js",
  "vendor/elk.bundled.js",
  "AGENT-CANVAS.md",
  "SCHEMA.md",
  "USER-GUIDE.md",
  "workflows/examples/cop.json",
];

for (const file of requiredFiles) {
  assert(exists(file), `missing required plugin file: ${file}`);
}

const canvasHtml = readText("canvas.html");
assert(canvasHtml.includes("./vendor/drawflow.min.css"), "canvas.html must load vendored Drawflow CSS");
assert(canvasHtml.includes("./vendor/drawflow.min.js"), "canvas.html must load vendored Drawflow JS");
assert(canvasHtml.includes("./styles/canvas.css"), "canvas.html must load plugin-local CSS");
assert(canvasHtml.includes("./src/canvas/main.js"), "canvas.html must load plugin-local JS");

const skillNames = [
  "plan",
  "execute",
  "review",
  "repair",
];

for (const skillName of skillNames) {
  const skillPath = `skills/${skillName}/SKILL.md`;
  assert(exists(skillPath), `missing skill: ${skillName}`);
  const skill = readText(skillPath);
  assert(skill.startsWith("---\n"), `${skillName} must start with YAML frontmatter`);
  assert(/\ndescription:\s+/.test(skill), `${skillName} must declare a description`);
  assert(skill.includes("agent-canvas"), `${skillName} should mention the agent-canvas wrapper`);
}

const forbidden = [
  ".codex-plugin",
  ".mcp.json",
  "archive",
  "experiments",
  "node_modules",
];

for (const entry of forbidden) {
  assert(!exists(entry), `plugin package should not include ${entry}`);
}

console.log("Claude plugin package check passed.");
