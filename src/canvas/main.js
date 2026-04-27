/* ============================================================
   PRIMITIVES - the only node kinds.
   Everything else is a Generic node renamed to whatever you want.
   ============================================================ */
const PRIMITIVES = {
  generic: {
    label: "Generic",
    desc: "A step. Rename to whatever you need.",
    inputs: 1, outputs: 1,
    portRoles: { inputs: ["in"], outputs: ["out"] },
    icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"><rect x="4" y="4" width="16" height="16" rx="2"/><circle cx="12" cy="12" r="3"/></svg>',
  },
  human: {
    label: "Human Input",
    desc: "A step where a human provides input or makes a decision.",
    inputs: 1, outputs: 1,
    portRoles: { inputs: ["in"], outputs: ["out"] },
    icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="8" r="4"/><path d="M4 21c0-4 4-7 8-7s8 3 8 7"/></svg>',
  },
  start: {
    label: "Start",
    desc: "Entry point of the flow.",
    inputs: 0, outputs: 1,
    portRoles: { inputs: [], outputs: ["start"] },
    icon: '<svg viewBox="0 0 24 24" fill="currentColor" stroke="none"><polygon points="6,4 20,12 6,20"/></svg>',
  },
  end: {
    label: "End",
    desc: "Termination of a path.",
    inputs: 1, outputs: 0,
    portRoles: { inputs: ["in"], outputs: [] },
    icon: '<svg viewBox="0 0 24 24" fill="currentColor" stroke="none"><rect x="5" y="5" width="14" height="14" rx="2"/></svg>',
  },
  branch: {
    label: "Branch",
    desc: "Switch / IF - split flow on a condition.",
    inputs: 1, outputs: 2,
    portRoles: { inputs: ["in"], outputs: ["true", "false"] },
    icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"><line x1="6" y1="3" x2="6" y2="15"/><circle cx="18" cy="6" r="3"/><circle cx="6" cy="18" r="3"/><path d="M18 9a9 9 0 0 1-9 9"/></svg>',
  },
  merge: {
    label: "Merge",
    desc: "Join branches back into one path.",
    inputs: 2, outputs: 1,
    portRoles: { inputs: ["branch_1", "branch_2"], outputs: ["out"] },
    icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"><circle cx="6" cy="6" r="3"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="12" r="3"/><path d="M9 6c0 4 6 4 6 6"/><path d="M9 18c0-4 6-4 6-6"/></svg>',
  },
  loop: {
    label: "Loop",
    desc: "Repeat a body path for an agent-defined condition.",
    inputs: 2, outputs: 2,
    portRoles: { inputs: ["in", "again"], outputs: ["body", "done"] },
    icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"><path d="M3 12a9 9 0 0 1 15-6.7L21 8"/><polyline points="21 3 21 8 16 8"/><path d="M21 12a9 9 0 0 1-15 6.7L3 16"/><polyline points="3 21 3 16 8 16"/></svg>',
  },
  parallel: {
    label: "Parallel",
    desc: "Run branches concurrently (fan-out).",
    inputs: 1, outputs: 3,
    portRoles: { inputs: ["in"], outputs: ["branch_1", "branch_2", "branch_3"] },
    icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"><line x1="4" y1="6" x2="20" y2="6"/><line x1="4" y1="12" x2="20" y2="12"/><line x1="4" y1="18" x2="20" y2="18"/></svg>',
  },
  trycatch: {
    label: "Try / Catch",
    desc: "Wrap with error handling. ok + error outputs.",
    inputs: 1, outputs: 2,
    portRoles: { inputs: ["in"], outputs: ["ok", "error"] },
    icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><line x1="12" y1="9" x2="12" y2="13"/><circle cx="12" cy="16" r=".5" fill="currentColor"/></svg>',
  },
  wait: {
    label: "Wait",
    desc: "Pause for human, time, or external event.",
    inputs: 1, outputs: 1,
    portRoles: { inputs: ["in"], outputs: ["done"] },
    icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"/><polyline points="12 7 12 12 15 14"/></svg>',
  },
  subflow: {
    label: "Sub-flow",
    desc: "Encapsulates another graph. (Composition.)",
    inputs: 1, outputs: 1,
    portRoles: { inputs: ["in"], outputs: ["done"] },
    icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2"/><rect x="7" y="7" width="10" height="10" rx="1"/></svg>',
  },
};

/* Ribbon order. null = visual divider. */
const RIBBON_ORDER = [
  "generic", "human",
  "start", "end",
  null,
  "branch", "merge",
  null,
  "loop", "parallel",
  null,
  "trycatch", "wait",
  null,
  "subflow",
];

const SCHEMA_VERSION = "0.4";
const WORKFLOW_KIND = "agentic-coding-sketch";
const DEFAULT_APP_TITLE = "Node Canvas";
const DEFAULT_WORKFLOW_NAME = "Untitled";

const LOOP_MODES = [
  { value: "custom", label: "Custom" },
  { value: "foreach", label: "Foreach" },
  { value: "while", label: "While" },
  { value: "until", label: "Until" },
  { value: "approval", label: "Approval" },
  { value: "retry", label: "Retry" },
  { value: "externalGate", label: "External gate" },
];

const PROGRESS_STATUSES = [
  { value: "not_started", label: "Not started", icon: "dot" },
  { value: "planned", label: "Planned", icon: "plan" },
  { value: "in_progress", label: "In progress", icon: "progress" },
  { value: "needs_review", label: "Needs review", icon: "review" },
  { value: "review_pending", label: "Review pending", icon: "reviewPending" },
  { value: "completed", label: "Completed", icon: "completed" },
  { value: "rejected", label: "Rejected", icon: "blocked" },
  { value: "superseded", label: "Superseded", icon: "dot" },
  { value: "blocked", label: "Blocked", icon: "blocked" },
  { value: "error", label: "Error", icon: "error" },
];

const EVIDENCE_TYPES = [
  { value: "command", label: "Command" },
  { value: "file", label: "File" },
  { value: "diff", label: "Diff" },
  { value: "screenshot", label: "Screenshot" },
  { value: "test", label: "Test" },
  { value: "url", label: "URL" },
  { value: "human_note", label: "Human note" },
];

const LAYOUT_OPTIONS = [
  {
    value: "dagreSafeFlow",
    label: "Safe flow",
    shortLabel: "Safe",
    desc: "Conservative left-to-right graph cleanup.",
  },
  {
    value: "elkLayered",
    label: "ELK layered",
    shortLabel: "ELK",
    desc: "Stronger directed layout with port awareness.",
  },
  {
    value: "semanticAgentic",
    label: "Semantic lanes",
    shortLabel: "Lanes",
    desc: "Agentic workflow lanes by task meaning.",
  },
  {
    value: "compactGrid",
    label: "Compact",
    shortLabel: "Compact",
    desc: "Dense grid cleanup for quick scanning.",
  },
  {
    value: "selectedOnly",
    label: "Selected only",
    shortLabel: "Selected",
    desc: "Organize the selected nodes without moving the rest.",
  },
];

/* ============================================================
   SAMPLE - loads on first open. Brainstorm of a paper-review pipeline.
   ============================================================ */
const SAMPLE = {
  schemaVersion: SCHEMA_VERSION,
  workflowKind: WORKFLOW_KIND,
  name: "Paper review pipeline",
  nodes: [
    { id: "n1",  type: "start",    label: "Paper submitted",    x: 80,   y: 320 },
    { id: "n2",  type: "generic",  label: "LLM auto-screen",    x: 240,  y: 320 },
    { id: "n3",  type: "branch",   label: "Worth full review?", x: 420,  y: 320 },
    { id: "n4",  type: "parallel", label: "Send to 3 reviewers",x: 620,  y: 200 },
    { id: "n5",  type: "generic",  label: "Reviewer A",         x: 820,  y: 80  },
    { id: "n6",  type: "generic",  label: "Reviewer B",         x: 820,  y: 220 },
    { id: "n7",  type: "generic",  label: "Reviewer C",         x: 820,  y: 360 },
    { id: "n8",  type: "merge",    label: "Aggregate scores",   x: 1020, y: 220 },
    { id: "n9",  type: "branch",   label: "Score > threshold?", x: 1200, y: 220 },
    { id: "n10", type: "wait",     label: "Editor decision",    x: 1380, y: 140 },
    {
      id: "n14",
      type: "loop",
      label: "Revision loop",
      x: 1560,
      y: 140,
      loop: {
        mode: "approval",
        intent: "Repeat revision work until the reviewer approves the manuscript.",
        body: "Author revision, citation check, and reviewer approval request.",
        exitRule: "Exit through done when reviewer approval is received.",
        agentNotes: "Treat this as an agent-readable workflow sketch. The implementation can choose a for/while/retry pattern that fits the task.",
      },
      exitMode: "any",
      exitConditions: [{ text: "Reviewer approves the manuscript" }],
    },
    { id: "n15", type: "generic",  label: "Author revision",    x: 1740, y: 60  },
    { id: "n16", type: "generic",  label: "Citation check",     x: 1920, y: 60  },
    { id: "n17", type: "wait",     label: "Reviewer approval",  x: 2100, y: 60  },
    { id: "n11", type: "end",      label: "Accept",             x: 2280, y: 140 },
    { id: "n12", type: "end",      label: "Reject",             x: 1380, y: 320 },
    { id: "n13", type: "end",      label: "Desk reject",        x: 620,  y: 480 },
  ],
  connections: [
    { from: "n1",  fromPort: 1, to: "n2",  toPort: 1 },
    { from: "n2",  fromPort: 1, to: "n3",  toPort: 1 },
    { from: "n3",  fromPort: 1, to: "n4",  toPort: 1 },
    { from: "n3",  fromPort: 2, to: "n13", toPort: 1 },
    { from: "n4",  fromPort: 1, to: "n5",  toPort: 1 },
    { from: "n4",  fromPort: 2, to: "n6",  toPort: 1 },
    { from: "n4",  fromPort: 3, to: "n7",  toPort: 1 },
    { from: "n5",  fromPort: 1, to: "n8",  toPort: 1 },
    { from: "n6",  fromPort: 1, to: "n8",  toPort: 1 },
    { from: "n7",  fromPort: 1, to: "n8",  toPort: 2 },
    { from: "n8",  fromPort: 1, to: "n9",  toPort: 1 },
    { from: "n9",  fromPort: 1, to: "n10", toPort: 1 },
    { from: "n9",  fromPort: 2, to: "n12", toPort: 1 },
    { from: "n10", fromPort: 1, to: "n14", toPort: 1 },
    { from: "n14", fromPort: 1, to: "n15", toPort: 1 },
    { from: "n15", fromPort: 1, to: "n16", toPort: 1 },
    { from: "n16", fromPort: 1, to: "n17", toPort: 1 },
    { from: "n17", fromPort: 1, to: "n14", toPort: 2 },
    { from: "n14", fromPort: 2, to: "n11", toPort: 1 },
  ],
};

/* ============================================================
   STATE
   ============================================================ */
const App = {
  editor: null,
  syncing: false,
  idMap: {},          // userId -> drawflowId
  reverseIdMap: {},   // drawflowId -> userId
  selection: {
    nodes: new Set(),
    connections: new Map(),
    groupDrag: null,
    marquee: { active: false, startX: 0, startY: 0 },
  },
  inspectorNodeId: null,
  appTitle: DEFAULT_APP_TITLE,
  workflowName: DEFAULT_WORKFLOW_NAME,
  selectedLayout: "dagreSafeFlow",
  layoutMenuEl: null,
  layoutSplitEl: null,
  layoutRunning: false,
  clipboard: null,
  lastCanvasMouse: null,
  server: {
    connected: false,
    workflowPath: "",
    workspaceRoot: "",
    dirty: false,
    saving: false,
    error: "",
  },
};

let _userIdCounter = 1;
function newUserId() {
  while (App.idMap["n" + _userIdCounter]) _userIdCounter++;
  return "n" + _userIdCounter++;
}
function bumpCounterTo(n) { _userIdCounter = Math.max(_userIdCounter, n + 1); }

/* ============================================================
   CANVAS TITLE
   ============================================================ */
function normalizeTitlePart(value, fallback) {
  const text = String(value ?? "").trim();
  return text || fallback;
}

function updateDocumentTitle() {
  document.title = `${App.appTitle} — ${App.workflowName}`;
}

function updatePersistenceStatus() {
  const status = document.getElementById("persistence-status");
  const label = document.getElementById("persistence-label");
  const pathEl = document.getElementById("persistence-path");
  if (!status || !label || !pathEl) return;
  status.classList.toggle("connected", App.server.connected && !App.server.dirty && !App.server.error);
  status.classList.toggle("dirty", App.server.connected && App.server.dirty && !App.server.error);
  status.classList.toggle("error", !!App.server.error);
  if (App.server.error) {
    label.textContent = App.server.error;
  } else if (App.server.connected) {
    label.textContent = App.server.dirty ? "Unsaved changes" : "Saved";
  } else {
    label.textContent = "Local file export";
  }
  pathEl.textContent = App.server.connected && App.server.workflowPath ? App.server.workflowPath : "";
}

function markDirty() {
  if (App.syncing) return;
  App.server.dirty = true;
  App.server.error = "";
  updatePersistenceStatus();
}

function markClean() {
  App.server.dirty = false;
  App.server.error = "";
  updatePersistenceStatus();
}

function setPersistenceError(message) {
  App.server.error = String(message || "Save error");
  updatePersistenceStatus();
}

function renderCanvasTitle() {
  const appEl = document.querySelector("[data-title-field='app']");
  const workflowEl = document.querySelector("[data-title-field='workflow']");
  if (appEl) appEl.textContent = App.appTitle;
  if (workflowEl) workflowEl.textContent = App.workflowName;
  updateDocumentTitle();
}

function setAppTitle(value) {
  App.appTitle = normalizeTitlePart(value, App.appTitle || DEFAULT_APP_TITLE);
  renderCanvasTitle();
}

function setWorkflowName(value, fallback = DEFAULT_WORKFLOW_NAME) {
  App.workflowName = normalizeTitlePart(value, fallback);
  renderCanvasTitle();
  markDirty();
}

function getTitleFieldValue(field) {
  return field === "app" ? App.appTitle : App.workflowName;
}

function setTitleFieldValue(field, value) {
  if (field === "app") {
    setAppTitle(value);
  } else {
    setWorkflowName(value, App.workflowName || DEFAULT_WORKFLOW_NAME);
  }
}

function startCanvasTitleEdit(fieldEl) {
  const field = fieldEl.dataset.titleField;
  if (!field) return;

  document.querySelector(".corner-title-editor")?.blur();

  const input = document.createElement("input");
  input.className = "corner-title-editor";
  input.type = "text";
  input.value = getTitleFieldValue(field);
  input.dataset.titleField = field;
  input.setAttribute("aria-label", field === "app" ? "Canvas app label" : "Workflow name");
  input.size = Math.max(8, Math.min(input.value.length + 2, 38));

  fieldEl.hidden = true;
  fieldEl.after(input);
  input.focus();
  input.select();

  let finished = false;
  const finish = (save) => {
    if (finished) return;
    finished = true;
    if (save) setTitleFieldValue(field, input.value);
    input.remove();
    fieldEl.hidden = false;
    renderCanvasTitle();
  };

  input.addEventListener("keydown", (ev) => {
    ev.stopPropagation();
    if (ev.key === "Enter") finish(true);
    if (ev.key === "Escape") finish(false);
  });
  input.addEventListener("input", () => {
    input.size = Math.max(8, Math.min(input.value.length + 2, 38));
  });
  input.addEventListener("click", (ev) => ev.stopPropagation());
  input.addEventListener("dblclick", (ev) => ev.stopPropagation());
  input.addEventListener("blur", () => finish(true));
}

function wireCanvasTitleEditing() {
  renderCanvasTitle();
  document.querySelector(".corner-title")?.addEventListener("dblclick", (ev) => {
    const fieldEl = ev.target.closest("[data-title-field]");
    if (!fieldEl) return;
    ev.preventDefault();
    ev.stopPropagation();
    startCanvasTitleEdit(fieldEl);
  });
}

/* ============================================================
   NODE HTML
   ============================================================ */
function escHtml(s) { return String(s).replace(/[<>&]/g, c => ({"<":"&lt;",">":"&gt;","&":"&amp;"}[c])); }
function escAttr(s) { return escHtml(s).replace(/"/g, "&quot;"); }

function getPurposeInstructionsValue(source = {}) {
  const explicit = source.purposeInstructions ?? source._purposeInstructions;
  if (explicit != null) return String(explicit);
  const parts = [source.purpose ?? source._purpose, source.instructions ?? source._instructions]
    .map(value => String(value || "").trim())
    .filter(Boolean);
  return parts.join("\n\n");
}

function normalizeRoleText(value) {
  return String(value || "").trim();
}

function getPortRole(type, kind, portNumber) {
  const def = PRIMITIVES[type] || PRIMITIVES.generic;
  const list = def.portRoles?.[kind === "input" ? "inputs" : "outputs"] || [];
  return normalizeRoleText(list[portNumber - 1]) || `${kind}_${portNumber}`;
}

function getPortRoleMap(type, kind, count) {
  const result = {};
  for (let i = 1; i <= count; i += 1) result[String(i)] = getPortRole(type, kind, i);
  return result;
}

function getRoleAliases(type, kind) {
  if (type !== "loop") return {};
  if (kind === "input") return { return: "again", back: "again", next: "again" };
  return { loop: "body", iter: "body", iterate: "body", each: "body" };
}

function getPortNumberFromRole(type, kind, role) {
  const raw = normalizeRoleText(role);
  if (!raw) return null;
  const directPort = raw.match(/^(?:input|output|port)_(\d+)$/i);
  if (directPort) return parseInt(directPort[1], 10);
  const normalized = raw.replace(/\s+/g, "_").toLowerCase();
  const aliases = getRoleAliases(type, kind);
  const wanted = aliases[normalized] || normalized;
  const def = PRIMITIVES[type] || PRIMITIVES.generic;
  const list = def.portRoles?.[kind === "input" ? "inputs" : "outputs"] || [];
  const index = list.findIndex(item => item === wanted);
  return index >= 0 ? index + 1 : null;
}

function setSelectValueAllowingCustom(select, value, label) {
  if (!select) return;
  const normalized = normalizeRoleText(value) || "custom";
  if (![...select.options].some(option => option.value === normalized)) {
    const option = document.createElement("option");
    option.value = normalized;
    option.textContent = label || normalized;
    select.appendChild(option);
  }
  select.value = normalized;
}

function renderNodeLabelHtml(type, label) {
  const def = PRIMITIVES[type] || PRIMITIVES.generic;
  return `${escHtml(label || def.label)}<span class="node-kind">${type}</span>`;
}

function normalizeStopMode(value) {
  return value === "all" ? "all" : "any";
}

function normalizeStopConditions(value) {
  if (!Array.isArray(value)) return [];
  return value.map((item) => {
    if (typeof item === "string") return { text: item };
    return { text: String(item?.text || item?.condition || item?.label || item?.name || "") };
  });
}

function normalizeLoopMode(value) {
  const mode = normalizeRoleText(value);
  return mode || "custom";
}

function getLoopObject(source = {}) {
  return source && typeof source.loop === "object" && source.loop ? source.loop : {};
}

function getLoopModeValue(source = {}) {
  const loop = getLoopObject(source);
  return normalizeLoopMode(loop.mode ?? source.loopMode ?? source._loopMode ?? source.mode);
}

function getLoopDefinitionValue(source = {}) {
  const loop = getLoopObject(source);
  return String(loop.intent ?? source.loopIntent ?? source._loopIntent ?? source.loopDefinition ?? source._loopDefinition ?? source.definition ?? "");
}

function getLoopBodyValue(source = {}) {
  const loop = getLoopObject(source);
  return String(loop.body ?? source.loopBody ?? source._loopBody ?? "");
}

function getLoopExitRuleValue(source = {}) {
  const loop = getLoopObject(source);
  return String(loop.exitRule ?? source.loopExitRule ?? source._loopExitRule ?? source.exitRule ?? "");
}

function getLoopAgentNotesValue(source = {}) {
  const loop = getLoopObject(source);
  return String(loop.agentNotes ?? source.loopAgentNotes ?? source._loopAgentNotes ?? source.agentNotes ?? "");
}

function getLoopStopModeValue(source = {}) {
  const loop = getLoopObject(source);
  return normalizeStopMode(loop.exitMode ?? source.exitMode ?? source._exitMode ?? source.stopMode ?? source._stopMode ?? source.stopConditionMode);
}

function getLoopStopConditionsValue(source = {}) {
  const loop = getLoopObject(source);
  return normalizeStopConditions(loop.exitConditions ?? source.exitConditions ?? source._exitConditions ?? source.stopConditions ?? source._stopConditions ?? source.conditions);
}

function normalizeProgressStatus(value) {
  const normalized = normalizeRoleText(value).toLowerCase();
  if (!normalized) return "not_started";
  return PROGRESS_STATUSES.some((status) => status.value === normalized) ? normalized : "not_started";
}

function getProgressStatusValue(source = {}) {
  const progress = source && typeof source.progress === "object" ? source.progress : {};
  return normalizeProgressStatus(
    progress.status ??
    source.progressStatus ??
    source.status ??
    source._progressStatus
  );
}

function getProgressStatusMeta(value) {
  return PROGRESS_STATUSES.find((status) => status.value === value) || PROGRESS_STATUSES[0];
}

function normalizeList(value) {
  if (Array.isArray(value)) return value.map(item => String(item || "").trim()).filter(Boolean);
  return String(value || "")
    .split(/\r?\n/)
    .map(item => item.replace(/^[-*]\s*/, "").trim())
    .filter(Boolean);
}

function listToText(value) {
  return normalizeList(value).join("\n");
}

function getAgentValue(source = {}) {
  const agent = source && typeof source.agent === "object" && source.agent ? source.agent : {};
  return {
    role: String(agent.role ?? source._agentRole ?? ""),
    intent: String(agent.intent ?? source._agentIntent ?? ""),
    inputs: normalizeList(agent.inputs ?? source._agentInputs),
    outputs: normalizeList(agent.outputs ?? source._agentOutputs),
    acceptanceCriteria: normalizeList(agent.acceptanceCriteria ?? source._agentAcceptanceCriteria),
    recommendedTools: normalizeList(agent.recommendedTools ?? source._agentRecommendedTools),
    riskLevel: String(agent.riskLevel ?? source._agentRiskLevel ?? ""),
    notes: String(agent.notes ?? source._agentNotes ?? ""),
  };
}

function hasAgentValue(agent) {
  return Boolean(
    agent.role ||
    agent.intent ||
    agent.inputs.length ||
    agent.outputs.length ||
    agent.acceptanceCriteria.length ||
    agent.recommendedTools.length ||
    agent.riskLevel ||
    agent.notes
  );
}

function normalizeEvidenceType(value) {
  const normalized = normalizeRoleText(value).toLowerCase();
  return EVIDENCE_TYPES.some(type => type.value === normalized) ? normalized : "human_note";
}

function normalizeReviewStatus(value) {
  const normalized = normalizeRoleText(value).toLowerCase();
  return ["pending", "approved", "rejected"].includes(normalized) ? normalized : "pending";
}

function normalizeEvidenceList(value) {
  if (!Array.isArray(value)) return [];
  return value.map(item => ({
    type: normalizeEvidenceType(item?.type),
    label: String(item?.label || ""),
    value: String(item?.value ?? item?.path ?? item?.url ?? item?.note ?? ""),
    result: String(item?.result || ""),
    path: String(item?.path || ""),
    url: String(item?.url || ""),
  }));
}

function normalizeClaims(value) {
  if (!Array.isArray(value)) return [];
  return value.map((claim, index) => ({
    id: String(claim?.id || `claim-${String(index + 1).padStart(3, "0")}`),
    status: normalizeProgressStatus(claim?.status || "completed"),
    summary: String(claim?.summary || ""),
    claimedBy: String(claim?.claimedBy || ""),
    claimedAt: String(claim?.claimedAt || ""),
    evidence: normalizeEvidenceList(claim?.evidence || []),
    review: {
      status: normalizeReviewStatus(claim?.review?.status),
      reviewer: String(claim?.review?.reviewer || ""),
      reviewedAt: String(claim?.review?.reviewedAt || ""),
      notes: String(claim?.review?.notes || ""),
    },
  }));
}

function getProgressOwnerValue(source = {}) {
  const progress = source && typeof source.progress === "object" ? source.progress : {};
  return String(progress.owner ?? source._progressOwner ?? "");
}

function getProgressUpdatedAtValue(source = {}) {
  const progress = source && typeof source.progress === "object" ? source.progress : {};
  return String(progress.updatedAt ?? source._progressUpdatedAt ?? "");
}

function getProgressClaimsValue(source = {}) {
  const progress = source && typeof source.progress === "object" ? source.progress : {};
  return normalizeClaims(progress.claims ?? source.claims ?? source._progressClaims);
}

function newClaim() {
  return {
    id: `claim-${Date.now()}`,
    status: "completed",
    summary: "",
    claimedBy: "human",
    claimedAt: new Date().toISOString(),
    evidence: [{ type: "human_note", label: "", value: "", result: "", path: "", url: "" }],
    review: { status: "pending", reviewer: "", reviewedAt: "", notes: "" },
  };
}

function progressIconSvg(icon) {
  if (icon === "plan") {
    return '<svg viewBox="0 0 20 20" aria-hidden="true"><path d="M5 3h10a2 2 0 0 1 2 2v10l-4-2-4 2-4-2-2 1V5a2 2 0 0 1 2-2z"></path></svg>';
  }
  if (icon === "progress") {
    return '<svg viewBox="0 0 20 20" aria-hidden="true"><circle cx="10" cy="10" r="7"></circle><path d="M10 10V5"></path><path d="M10 10l3 2"></path></svg>';
  }
  if (icon === "review") {
    return '<svg viewBox="0 0 20 20" aria-hidden="true"><path d="M3 10l4 4 10-10"></path></svg>';
  }
  if (icon === "reviewPending") {
    return '<svg viewBox="0 0 20 20" aria-hidden="true"><path d="M5 10h10"></path><path d="M10 5v10"></path></svg>';
  }
  if (icon === "completed") {
    return '<svg viewBox="0 0 20 20" aria-hidden="true"><circle cx="10" cy="10" r="7"></circle><path d="M6 10l3 3 5-6"></path></svg>';
  }
  if (icon === "blocked") {
    return '<svg viewBox="0 0 20 20" aria-hidden="true"><circle cx="10" cy="10" r="7"></circle><path d="M6 6l8 8"></path></svg>';
  }
  if (icon === "error") {
    return '<svg viewBox="0 0 20 20" aria-hidden="true"><circle cx="10" cy="10" r="7"></circle><path d="M10 5v5"></path><circle cx="10" cy="13.5" r=".9"></circle></svg>';
  }
  return '<svg viewBox="0 0 20 20" aria-hidden="true"><circle cx="10" cy="10" r="3"></circle></svg>';
}

function renderNodeHtml(type, label, options = {}) {
  const def = PRIMITIVES[type] || PRIMITIVES.generic;
  const progressStatus = getProgressStatusValue(options);
  const progressMeta = getProgressStatusMeta(progressStatus);
  const modeBadge = type === "loop"
    ? `<span class="node-mode-badge">${escHtml(getLoopModeValue(options))}</span>`
    : "";
  return `
    <div class="node-card">
      <div class="node-icon">${def.icon}</div>
      <div class="node-progress-badge status-${progressStatus}" title="${escHtml(progressMeta.label)}" aria-label="${escHtml(progressMeta.label)}">
        ${progressIconSvg(progressMeta.icon)}
      </div>
      ${modeBadge}
    </div>
    <div class="node-label">${renderNodeLabelHtml(type, label)}</div>
  `;
}

function normalizePortCount(value, fallback) {
  const n = parseInt(value, 10);
  return Number.isFinite(n) && n >= 0 ? n : fallback;
}

/* ============================================================
   CREATE NODE (used both by drag-drop and by import)
   ============================================================ */
function createNode(type, x, y, label, userId, options = {}) {
  const def = PRIMITIVES[type];
  if (!def) return null;
  const uid = userId || newUserId();
  const lbl = label || def.label;
  let inputCount = normalizePortCount(options.inputs, def.inputs);
  let outputCount = normalizePortCount(options.outputs, def.outputs);
  if (type === "loop") {
    inputCount = 2;
    outputCount = 2;
  }
  const data = {
    _userId: uid,
    _label: lbl,
    _purposeInstructions: getPurposeInstructionsValue(options),
    _progressStatus: getProgressStatusValue(options),
    _progressOwner: getProgressOwnerValue(options),
    _progressUpdatedAt: getProgressUpdatedAtValue(options),
    _progressClaims: getProgressClaimsValue(options),
  };
  const agent = getAgentValue(options);
  data._agentRole = agent.role;
  data._agentIntent = agent.intent;
  data._agentInputs = agent.inputs;
  data._agentOutputs = agent.outputs;
  data._agentAcceptanceCriteria = agent.acceptanceCriteria;
  data._agentRecommendedTools = agent.recommendedTools;
  data._agentRiskLevel = agent.riskLevel;
  data._agentNotes = agent.notes;
  if (type === "loop") {
    data._loopMode = getLoopModeValue(options);
    data._loopDefinition = getLoopDefinitionValue(options);
    data._loopBody = getLoopBodyValue(options);
    data._loopExitRule = getLoopExitRuleValue(options);
    data._loopAgentNotes = getLoopAgentNotesValue(options);
    data._stopMode = getLoopStopModeValue(options);
    data._stopConditions = getLoopStopConditionsValue(options);
  }
  const dfId = App.editor.addNode(
    type,
    inputCount, outputCount,
    x, y,
    type,
    data,
    renderNodeHtml(type, lbl, data),
  );
  App.idMap[uid] = dfId;
  App.reverseIdMap[dfId] = uid;
  if (type === "loop") requestAnimationFrame(() => syncLoopPorts(dfId));
  return dfId;
}

/* ============================================================
   RIBBON BUILD
   ============================================================ */
function getLayoutOption(value = App.selectedLayout) {
  return LAYOUT_OPTIONS.find(option => option.value === value) || LAYOUT_OPTIONS[0];
}

function layoutIconSvg() {
  return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="6" height="5" rx="1"/><rect x="15" y="4" width="6" height="5" rx="1"/><rect x="9" y="15" width="6" height="5" rx="1"/><path d="M9 6.5h6"/><path d="M12 9v6"/></svg>';
}

function caretUpSvg() {
  return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"><polyline points="18 15 12 9 6 15"/></svg>';
}

function updateLayoutSplitAction() {
  if (!App.layoutSplitEl) return;
  const option = getLayoutOption();
  const main = App.layoutSplitEl.querySelector(".layout-main-action");
  const name = App.layoutSplitEl.querySelector(".layout-main-action .name");
  if (name) name.textContent = "Auto";
  if (main) main.title = `Apply ${option.label} layout`;
  App.layoutSplitEl.dataset.layout = option.value;
  App.layoutSplitEl.querySelectorAll(".layout-option").forEach(button => {
    const selected = button.dataset.layoutValue === option.value;
    button.classList.toggle("selected", selected);
    button.setAttribute("aria-selected", selected ? "true" : "false");
    const check = button.querySelector(".check");
    if (check) check.innerHTML = selected ? "&#10003;" : "";
  });
}

function positionLayoutMenu() {
  if (!App.layoutMenuEl || !App.layoutSplitEl) return;
  const rect = App.layoutSplitEl.getBoundingClientRect();
  const menuRect = App.layoutMenuEl.getBoundingClientRect();
  const width = menuRect.width || 236;
  const height = menuRect.height || 160;
  const left = Math.min(Math.max(12, rect.left + rect.width / 2 - width / 2), window.innerWidth - width - 12);
  const top = Math.max(12, rect.top - height - 10);
  App.layoutMenuEl.style.left = `${Math.round(left)}px`;
  App.layoutMenuEl.style.top = `${Math.round(top)}px`;
}

function closeLayoutMenu() {
  if (!App.layoutMenuEl || !App.layoutSplitEl) return;
  App.layoutMenuEl.classList.remove("open");
  App.layoutMenuEl.hidden = true;
  App.layoutMenuEl.setAttribute("aria-hidden", "true");
  App.layoutSplitEl.classList.remove("menu-open");
  App.layoutSplitEl.querySelector(".layout-menu-trigger")?.setAttribute("aria-expanded", "false");
}

function openLayoutMenu() {
  if (!App.layoutMenuEl || !App.layoutSplitEl) return;
  updateLayoutSplitAction();
  App.layoutMenuEl.hidden = false;
  App.layoutMenuEl.setAttribute("aria-hidden", "false");
  App.layoutMenuEl.classList.add("open");
  App.layoutSplitEl.classList.add("menu-open");
  App.layoutSplitEl.querySelector(".layout-menu-trigger")?.setAttribute("aria-expanded", "true");
  positionLayoutMenu();
}

function toggleLayoutMenu() {
  if (App.layoutMenuEl?.classList.contains("open")) closeLayoutMenu();
  else openLayoutMenu();
}

function setSelectedLayout(value) {
  App.selectedLayout = getLayoutOption(value).value;
  updateLayoutSplitAction();
  closeLayoutMenu();
  toast(`Auto layout set to ${getLayoutOption().label}`, "good");
}

function createLayoutSplitAction() {
  const wrap = document.createElement("div");
  wrap.className = "layout-split-action";
  wrap.dataset.action = "auto-layout";
  wrap.innerHTML = `
    <button class="layout-main-action" type="button">
      <div class="icon">${layoutIconSvg()}</div>
      <div class="name">Auto</div>
    </button>
    <button class="layout-menu-trigger" type="button" title="Choose auto-layout" aria-label="Choose auto-layout" aria-haspopup="menu" aria-expanded="false">
      ${caretUpSvg()}
    </button>
  `;

  const menu = document.createElement("div");
  menu.className = "layout-menu";
  menu.setAttribute("role", "menu");
  menu.setAttribute("aria-hidden", "true");
  menu.hidden = true;
  menu.innerHTML = LAYOUT_OPTIONS.map(option => `
    <button class="layout-option" type="button" role="menuitemradio" data-layout-value="${option.value}" aria-selected="false">
      <span class="check"></span>
      <span>
        <span class="label">${escHtml(option.label)}</span>
        <span class="desc">${escHtml(option.desc)}</span>
      </span>
    </button>
  `).join("");

  App.layoutSplitEl = wrap;
  App.layoutMenuEl = menu;
  document.body.appendChild(menu);

  wrap.querySelector(".layout-main-action").addEventListener("click", applySelectedLayout);
  wrap.querySelector(".layout-menu-trigger").addEventListener("click", (ev) => {
    ev.stopPropagation();
    toggleLayoutMenu();
  });
  menu.addEventListener("click", (ev) => {
    const optionButton = ev.target.closest(".layout-option");
    if (!optionButton) return;
    setSelectedLayout(optionButton.dataset.layoutValue);
  });
  document.addEventListener("click", (ev) => {
    if (!App.layoutMenuEl?.classList.contains("open")) return;
    if (App.layoutMenuEl.contains(ev.target) || App.layoutSplitEl?.contains(ev.target)) return;
    closeLayoutMenu();
  });
  window.addEventListener("resize", positionLayoutMenu);
  window.addEventListener("scroll", positionLayoutMenu, true);
  document.addEventListener("keydown", (ev) => {
    if (ev.key === "Escape") closeLayoutMenu();
  });

  updateLayoutSplitAction();
  return wrap;
}

function buildRibbon() {
  const ribbon = document.getElementById("ribbon");
  const fileInput = document.getElementById("file-input");
  const fragment = document.createDocumentFragment();

  for (const key of RIBBON_ORDER) {
    if (key === null) {
      const div = document.createElement("div");
      div.className = "ribbon-divider";
      fragment.appendChild(div);
      continue;
    }
    const def = PRIMITIVES[key];
    const item = document.createElement("div");
    item.className = "ribbon-item " + key;
    item.draggable = true;
    item.dataset.nodeType = key;
    item.title = def.desc;
    item.innerHTML = `
      <div class="icon">${def.icon}</div>
      <div class="name">${def.label}</div>
    `;
    item.addEventListener("dragstart", (ev) => {
      ev.dataTransfer.setData("application/x-node-type", key);
      ev.dataTransfer.effectAllowed = "copy";
    });
    fragment.appendChild(item);
  }

  // Divider before actions
  const sep = document.createElement("div");
  sep.className = "ribbon-divider";
  fragment.appendChild(sep);
  fragment.appendChild(createLayoutSplitAction());

  const actions = [
    {
      name: "Save",
      title: "Save to the connected workspace file",
      icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/></svg>',
      onClick: () => saveWorkflowToServer(),
    },
    {
      name: "Save As",
      title: "Save to another workspace JSON path",
      icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"><path d="M12 20h9"/><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4 12.5-12.5z"/></svg>',
      onClick: saveWorkflowAs,
    },
    {
      name: "Reload",
      title: "Reload the connected workspace file",
      icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"><path d="M21 12a9 9 0 0 1-15.5 6.2"/><path d="M3 12A9 9 0 0 1 18.5 5.8"/><polyline points="21 4 21 10 15 10"/><polyline points="3 20 3 14 9 14"/></svg>',
      onClick: reloadWorkflowFromServer,
    },
    {
      name: "Import",
      title: "Load a .json file from your computer",
      icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>',
      onClick: () => fileInput.click(),
    },
    {
      name: "Export",
      title: "Save current canvas as .json",
      icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>',
      onClick: downloadJson,
    },
    {
      name: "Print",
      title: "Download the full canvas as a high-resolution PNG",
      icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"><polyline points="6 9 6 2 18 2 18 9"/><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><rect x="6" y="14" width="12" height="8"/></svg>',
      onClick: downloadCanvasPng,
    },
    {
      name: "Clear",
      title: "Clear the entire canvas",
      icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-2 14a2 2 0 0 1-2 2H9a2 2 0 0 1-2-2L5 6"/></svg>',
      onClick: () => {
        if (Object.keys(App.editor.export().drawflow.Home.data).length === 0) return;
        if (!confirm("Clear the entire canvas?")) return;
        clearCanvas();
        toast("Canvas cleared", "good");
      },
    },
  ];

  for (const a of actions) {
    const el = document.createElement("div");
    el.className = "ribbon-action";
    el.title = a.title;
    el.innerHTML = `<div class="icon">${a.icon}</div><div class="name">${a.name}</div>`;
    el.addEventListener("click", a.onClick);
    fragment.appendChild(el);
  }

  ribbon.insertBefore(fragment, fileInput);

  // File input -> import
  fileInput.addEventListener("change", async (e) => {
    const f = e.target.files[0];
    if (!f) return;
    try {
      const text = await f.text();
      const obj = JSON.parse(text);
      loadFromUserJson(obj, f.name.replace(/\.json$/i, ""));
      markDirty();
      toast(`Loaded ${f.name}`, "good");
    } catch (err) {
      toast("Couldn't load: " + err.message, "error");
    }
    fileInput.value = "";
  });
}

/* ============================================================
   DRAG-AND-DROP - palette -> canvas
   ============================================================ */
function wireDropZone() {
  const el = document.getElementById("drawflow");
  el.addEventListener("dragover", (ev) => {
    ev.preventDefault();
    ev.dataTransfer.dropEffect = "copy";
  });
  el.addEventListener("drop", (ev) => {
    ev.preventDefault();
    const type = ev.dataTransfer.getData("application/x-node-type");
    if (!type || !PRIMITIVES[type]) return;
    const rect = App.editor.precanvas.getBoundingClientRect();
    const zoom = App.editor.zoom;
    const x = (ev.clientX - rect.x) / zoom - 42;
    const y = (ev.clientY - rect.y) / zoom - 42;
    createNode(type, x, y);
    markDirty();
    updateEmptyState();
    toast(`+ ${PRIMITIVES[type].label}`, "good");
  });
}

/* ============================================================
   IN-PLACE LABEL EDIT (double-click)
   ============================================================ */
function wireLabelEditing() {
  const el = document.getElementById("drawflow");
  el.addEventListener("dblclick", (ev) => {
    const labelEl = ev.target.closest(".node-label");
    if (!labelEl) return;
    ev.stopPropagation();
    ev.preventDefault();
    startLabelEdit(labelEl);
  });
}

function startLabelEdit(labelEl) {
  const nodeEl = labelEl.closest(".drawflow-node");
  if (!nodeEl) return;
  const dfId = nodeEl.id.replace("node-", "");
  const kindSpan = labelEl.querySelector(".node-kind");
  const kindHtml = kindSpan ? kindSpan.outerHTML : "";
  const kindText = kindSpan ? kindSpan.textContent : "";
  const oldText = (labelEl.textContent || "").replace(kindText, "").trim();

  // Strip the kind chip while editing (cleaner UX)
  labelEl.textContent = oldText;
  labelEl.contentEditable = "true";
  labelEl.spellcheck = false;
  labelEl.focus();

  // Select the whole label
  const range = document.createRange();
  range.selectNodeContents(labelEl);
  const sel = window.getSelection();
  sel.removeAllRanges();
  sel.addRange(range);

  let cancelled = false;

  function finish(save) {
    labelEl.removeEventListener("keydown", onKey);
    labelEl.removeEventListener("blur", onBlur);
    labelEl.contentEditable = "false";
    const newText = (labelEl.textContent || "").trim();
    const finalText = (save && newText) ? newText : oldText;
    labelEl.innerHTML = escHtml(finalText) + kindHtml;
    try {
      updateNodeData(dfId, { _label: finalText });
      refreshNodeInspector();
    } catch (e) { console.warn(e); }
  }
  function onKey(e) {
    if (e.key === "Enter") { e.preventDefault(); finish(true); }
    else if (e.key === "Escape") { e.preventDefault(); cancelled = true; finish(false); }
  }
  function onBlur() { if (!cancelled) finish(true); }

  labelEl.addEventListener("keydown", onKey);
  labelEl.addEventListener("blur", onBlur);
}

/* ============================================================
   NODE INSPECTOR
   ============================================================ */
function getLiveNode(dfId) {
  return App.editor?.drawflow?.drawflow?.[App.editor.module]?.data?.[dfId] || null;
}

function updateNodeData(dfId, patch) {
  const node = getLiveNode(dfId);
  if (!node) return;
  const nextData = { ...(node.data || {}), ...patch };
  App.editor.updateNodeDataFromId(dfId, nextData);
  markDirty();
  if (
    node.name === "loop" &&
    (
      "_loopMode" in patch ||
      "_loopDefinition" in patch ||
      "_loopBody" in patch ||
      "_loopExitRule" in patch ||
      "_loopAgentNotes" in patch ||
      "_stopMode" in patch ||
      "_stopConditions" in patch ||
      "_progressStatus" in patch
    )
  ) {
    refreshNodeVisual(dfId);
    return;
  }
  if ("_progressStatus" in patch) refreshNodeVisual(dfId);
}

function syncLoopPorts(dfId) {
  const node = getLiveNode(dfId);
  const nodeEl = getNodeElement(dfId);
  if (!node || node.name !== "loop" || !nodeEl) return;
  requestAnimationFrame(() => App.editor.updateConnectionNodes("node-" + dfId));
}

function updateNodeLabel(dfId, label) {
  const node = getLiveNode(dfId);
  if (!node) return;
  const finalLabel = label.trim() || (PRIMITIVES[node.name]?.label || node.name);
  updateNodeData(dfId, { _label: finalLabel });
  const labelEl = getNodeElement(dfId)?.querySelector(".node-label");
  if (labelEl) labelEl.innerHTML = renderNodeLabelHtml(node.name, finalLabel);
  if (node.name === "loop") App.editor.updateConnectionNodes("node-" + dfId);
}

function refreshNodeVisual(dfId) {
  const node = getLiveNode(dfId);
  const contentEl = getNodeElement(dfId)?.querySelector(".drawflow_content_node");
  if (!node || !contentEl) return;
  contentEl.innerHTML = renderNodeHtml(node.name, node.data?._label, node.data || {});
  if (node.name === "loop") syncLoopPorts(dfId);
  App.editor.updateConnectionNodes("node-" + dfId);
}

function unionRects(rects) {
  const usable = rects.filter(rect => rect && rect.width > 0 && rect.height > 0);
  if (!usable.length) return null;
  const left = Math.min(...usable.map(rect => rect.left));
  const top = Math.min(...usable.map(rect => rect.top));
  const right = Math.max(...usable.map(rect => rect.right));
  const bottom = Math.max(...usable.map(rect => rect.bottom));
  return {
    left,
    top,
    right,
    bottom,
    width: right - left,
    height: bottom - top,
  };
}

function getInspectorAnchorRect(nodeEl) {
  if (!nodeEl?.classList.contains("loop")) return nodeEl.getBoundingClientRect();
  const selectors = [".node-card", ".node-label"];
  const rects = selectors
    .map(selector => nodeEl.querySelector(selector)?.getBoundingClientRect())
    .filter(Boolean);
  return unionRects(rects) || nodeEl.getBoundingClientRect();
}

function positionNodeInspector() {
  const panel = document.getElementById("node-inspector");
  const nodeEl = App.inspectorNodeId ? getNodeElement(App.inspectorNodeId) : null;
  if (!panel || !nodeEl || !panel.classList.contains("visible")) return;

  const nodeRect = getInspectorAnchorRect(nodeEl);
  const panelRect = panel.getBoundingClientRect();
  const gap = 12;
  const margin = 16;
  const viewportWidth = window.innerWidth;
  const viewportHeight = window.innerHeight;
  const baseMaxHeight = Math.min(560, viewportHeight - margin * 2);
  const availableAbove = nodeRect.top - margin - gap;
  const availableBelow = viewportHeight - nodeRect.bottom - margin - gap;
  const availableRight = viewportWidth - nodeRect.right - margin - gap;
  const availableLeft = nodeRect.left - margin - gap;
  const desiredHeight = Math.min(panelRect.height, baseMaxHeight);
  const desiredWidth = panelRect.width;
  const usableVerticalSpace = 180;
  const verticalChoices = [
    { side: "above", space: availableAbove },
    { side: "below", space: availableBelow },
  ];
  const horizontalChoices = [
    { side: "right", space: availableRight },
    { side: "left", space: availableLeft },
  ];
  let placement = verticalChoices.find(choice => choice.space >= desiredHeight)?.side;
  if (!placement) placement = verticalChoices.find(choice => choice.space >= usableVerticalSpace)?.side;
  if (!placement) placement = horizontalChoices.find(choice => choice.space >= desiredWidth)?.side;
  if (!placement) {
    placement = [...verticalChoices, ...horizontalChoices].sort((a, b) => b.space - a.space)[0].side;
  }

  const centerX = nodeRect.left + nodeRect.width / 2;
  const centerY = nodeRect.top + nodeRect.height / 2;
  const minLeft = margin + panelRect.width / 2;
  const maxLeft = viewportWidth - margin - panelRect.width / 2;
  const minTop = margin + panelRect.height / 2;
  const maxTop = viewportHeight - margin - panelRect.height / 2;
  let left = Math.min(Math.max(centerX, minLeft), Math.max(minLeft, maxLeft));
  let top = nodeRect.top;
  let availableHeight = availableAbove;

  if (placement === "below") {
    top = nodeRect.bottom;
    availableHeight = availableBelow;
  } else if (placement === "right") {
    left = nodeRect.right;
    top = Math.min(Math.max(centerY, minTop), Math.max(minTop, maxTop));
    availableHeight = viewportHeight - margin * 2;
  } else if (placement === "left") {
    left = nodeRect.left;
    top = Math.min(Math.max(centerY, minTop), Math.max(minTop, maxTop));
    availableHeight = viewportHeight - margin * 2;
  }

  panel.style.maxHeight = Math.max(180, Math.min(baseMaxHeight, availableHeight)) + "px";
  panel.classList.toggle("below", placement === "below");
  panel.classList.toggle("right", placement === "right");
  panel.classList.toggle("left", placement === "left");
  panel.style.left = left + "px";
  panel.style.top = top + "px";
}

function getPortCounts(dfId) {
  const node = getLiveNode(dfId);
  return {
    inputs: node ? Object.keys(node.inputs || {}).length : 0,
    outputs: node ? Object.keys(node.outputs || {}).length : 0,
  };
}

function setLoopStopConditions(dfId, conditions, renderEditor = false) {
  updateNodeData(dfId, { _stopConditions: normalizeStopConditions(conditions) });
  if (renderEditor) renderLoopStopConditionEditor(dfId);
  positionNodeInspector();
}

function renderLoopStopConditionEditor(dfId) {
  const list = document.getElementById("loop-stop-condition-list");
  const node = getLiveNode(dfId);
  if (!list || !node) return;
  const conditions = getLoopStopConditionsValue(node.data || {});
  list.innerHTML = "";
  if (!conditions.length) {
    const empty = document.createElement("div");
    empty.className = "loop-condition-empty-editor";
    empty.textContent = "No exit conditions yet";
    list.appendChild(empty);
    return;
  }

  conditions.forEach((condition, index) => {
    const row = document.createElement("div");
    row.className = "loop-condition-row";
    row.dataset.index = String(index);

    const head = document.createElement("div");
    head.className = "loop-condition-row-head";
    const title = document.createElement("div");
    title.className = "loop-condition-row-title";
    title.textContent = "Condition " + (index + 1);
    const remove = document.createElement("button");
    remove.className = "loop-condition-remove";
    remove.type = "button";
    remove.title = "Remove exit condition";
    remove.dataset.action = "remove-stop-condition";
    remove.dataset.index = String(index);
    remove.textContent = "x";
    head.appendChild(title);
    head.appendChild(remove);
    row.appendChild(head);

    const label = document.createElement("label");
    label.className = "field";
    const span = document.createElement("span");
    span.textContent = "Exit when";
    const textarea = document.createElement("textarea");
    textarea.dataset.index = String(index);
    textarea.value = condition.text || "";
    label.appendChild(span);
    label.appendChild(textarea);
    row.appendChild(label);
    list.appendChild(row);
  });
}

function renderProgressClaimEditor(dfId) {
  const list = document.getElementById("progress-claim-list");
  const node = getLiveNode(dfId);
  if (!list || !node) return;
  const claims = getProgressClaimsValue(node.data || {});
  list.innerHTML = "";
  if (!claims.length) {
    const empty = document.createElement("div");
    empty.className = "claim-empty-editor";
    empty.textContent = "No claims yet";
    list.appendChild(empty);
    return;
  }

  claims.forEach((claim, index) => {
    const evidence = claim.evidence[0] || { type: "human_note", label: "", value: "", result: "" };
    const row = document.createElement("div");
    row.className = "claim-row";
    row.dataset.index = String(index);
    row.innerHTML = `
      <div class="claim-row-head">
        <div class="claim-row-title">${escHtml(claim.id || `Claim ${index + 1}`)}</div>
        <button class="claim-remove" type="button" title="Remove claim" data-action="remove-claim" data-index="${index}">x</button>
      </div>
      <label class="field">
        <span>Claim summary</span>
        <textarea data-claim-field="summary" data-index="${index}">${escHtml(claim.summary)}</textarea>
      </label>
      <div class="claim-grid">
        <label class="field">
          <span>Claimed by</span>
          <input type="text" value="${escAttr(claim.claimedBy)}" data-claim-field="claimedBy" data-index="${index}" />
        </label>
        <label class="field">
          <span>Review</span>
          <select data-claim-field="review.status" data-index="${index}">
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
          </select>
        </label>
      </div>
      <div class="claim-grid">
        <label class="field">
          <span>Evidence type</span>
          <select data-claim-field="evidence.0.type" data-index="${index}">
            ${EVIDENCE_TYPES.map(type => `<option value="${type.value}">${escHtml(type.label)}</option>`).join("")}
          </select>
        </label>
        <label class="field">
          <span>Evidence result</span>
          <input type="text" value="${escAttr(evidence.result)}" data-claim-field="evidence.0.result" data-index="${index}" />
        </label>
      </div>
      <label class="field">
        <span>Evidence</span>
        <textarea data-claim-field="evidence.0.value" data-index="${index}">${escHtml(evidence.value)}</textarea>
      </label>
      <label class="field">
        <span>Reviewer notes</span>
        <textarea data-claim-field="review.notes" data-index="${index}">${escHtml(claim.review.notes)}</textarea>
      </label>
    `;
    row.querySelector("[data-claim-field='review.status']").value = claim.review.status;
    row.querySelector("[data-claim-field='evidence.0.type']").value = evidence.type;
    list.appendChild(row);
  });
}

function setProgressClaims(dfId, claims, renderEditor = false) {
  updateNodeData(dfId, {
    _progressClaims: normalizeClaims(claims),
    _progressUpdatedAt: new Date().toISOString(),
  });
  if (renderEditor) renderProgressClaimEditor(dfId);
  positionNodeInspector();
}

function patchClaimField(claims, index, field, value) {
  const claim = claims[index];
  if (!claim) return claims;
  if (field === "summary") claim.summary = value;
  else if (field === "claimedBy") claim.claimedBy = value;
  else if (field === "review.status") claim.review.status = normalizeReviewStatus(value);
  else if (field === "review.notes") claim.review.notes = value;
  else if (field === "evidence.0.type") {
    claim.evidence[0] = claim.evidence[0] || { type: "human_note", label: "", value: "", result: "" };
    claim.evidence[0].type = normalizeEvidenceType(value);
  } else if (field === "evidence.0.result") {
    claim.evidence[0] = claim.evidence[0] || { type: "human_note", label: "", value: "", result: "" };
    claim.evidence[0].result = value;
  } else if (field === "evidence.0.value") {
    claim.evidence[0] = claim.evidence[0] || { type: "human_note", label: "", value: "", result: "" };
    claim.evidence[0].value = value;
  }
  return claims;
}

function showNodeInspector(dfId) {
  const node = getLiveNode(dfId);
  const panel = document.getElementById("node-inspector");
  if (!node || !panel) return;
  App.inspectorNodeId = String(dfId);
  panel.classList.add("visible");
  panel.setAttribute("aria-hidden", "false");
  refreshNodeInspector();
  requestAnimationFrame(positionNodeInspector);
}

function hideNodeInspector() {
  App.inspectorNodeId = null;
  const panel = document.getElementById("node-inspector");
  if (!panel) return;
  panel.classList.remove("visible");
  panel.classList.remove("below");
  panel.classList.remove("right");
  panel.classList.remove("left");
  panel.style.maxHeight = "";
  panel.setAttribute("aria-hidden", "true");
}

function refreshNodeInspector() {
  const dfId = App.inspectorNodeId;
  const node = dfId ? getLiveNode(dfId) : null;
  if (!node) {
    hideNodeInspector();
    return;
  }

  const counts = getPortCounts(dfId);
  document.getElementById("inspector-kind").textContent = node.name || "node";
  document.getElementById("node-name-input").value = node.data?._label || PRIMITIVES[node.name]?.label || node.name;
  document.getElementById("node-purpose-instructions-input").value = getPurposeInstructionsValue(node.data || {});
  document.getElementById("node-progress-status-input").value = getProgressStatusValue(node.data || {});
  const agent = getAgentValue(node.data || {});
  document.getElementById("node-agent-role-input").value = agent.role;
  document.getElementById("node-agent-intent-input").value = agent.intent;
  document.getElementById("node-agent-inputs-input").value = listToText(agent.inputs);
  document.getElementById("node-agent-outputs-input").value = listToText(agent.outputs);
  document.getElementById("node-agent-acceptance-input").value = listToText(agent.acceptanceCriteria);
  document.getElementById("node-agent-tools-input").value = listToText(agent.recommendedTools);
  document.getElementById("node-agent-risk-input").value = agent.riskLevel;
  document.getElementById("node-agent-notes-input").value = agent.notes;
  renderProgressClaimEditor(dfId);
  document.getElementById("node-input-count").textContent = String(counts.inputs);
  document.getElementById("node-output-count").textContent = String(counts.outputs);
  const isLoop = node.name === "loop";
  document.getElementById("add-input-port").disabled = isLoop;
  document.getElementById("add-output-port").disabled = isLoop;
  document.getElementById("remove-input-port").disabled = isLoop || counts.inputs <= 0;
  document.getElementById("remove-output-port").disabled = isLoop || counts.outputs <= 0;
  document.getElementById("loop-port-hint").hidden = !isLoop;
  const loopSection = document.getElementById("loop-editor-section");
  loopSection.hidden = node.name !== "loop";
  if (node.name === "loop") {
    setSelectValueAllowingCustom(
      document.getElementById("loop-mode-input"),
      getLoopModeValue(node.data || {}),
      getLoopModeValue(node.data || {}),
    );
    document.getElementById("loop-definition-input").value = getLoopDefinitionValue(node.data || {});
    document.getElementById("loop-body-input").value = getLoopBodyValue(node.data || {});
    document.getElementById("loop-exit-rule-input").value = getLoopExitRuleValue(node.data || {});
    document.getElementById("loop-agent-notes-input").value = getLoopAgentNotesValue(node.data || {});
    document.getElementById("loop-stop-mode-input").value = getLoopStopModeValue(node.data || {});
    renderLoopStopConditionEditor(dfId);
  }
  requestAnimationFrame(positionNodeInspector);
}

function addNodePort(kind) {
  const dfId = App.inspectorNodeId;
  const node = getLiveNode(dfId);
  if (!dfId || !node || node.name === "loop") return;
  if (kind === "input") App.editor.addNodeInput(dfId);
  else App.editor.addNodeOutput(dfId);
  markDirty();
  refreshNodeInspector();
  positionNodeInspector();
  toast(`${kind === "input" ? "Input" : "Output"} added`, "good");
}

function removeNodePort(kind) {
  const dfId = App.inspectorNodeId;
  const node = getLiveNode(dfId);
  if (!node || node.name === "loop") return;
  const counts = getPortCounts(dfId);
  const count = kind === "input" ? counts.inputs : counts.outputs;
  if (count <= 0) return;
  clearObjectSelection();
  try {
    if (kind === "input") App.editor.removeNodeInput(dfId, "input_" + count);
    else App.editor.removeNodeOutput(dfId, "output_" + count);
    markDirty();
    refreshNodeInspector();
    positionNodeInspector();
    toast(`${kind === "input" ? "Input" : "Output"} removed`, "good");
  } catch (e) {
    console.warn("port remove failed", kind, dfId, e);
    toast("Couldn't remove port", "error");
  }
}

function wireNodeInspector() {
  document.getElementById("inspector-close").addEventListener("click", hideNodeInspector);
  document.getElementById("node-name-input").addEventListener("input", (ev) => {
    if (!App.inspectorNodeId) return;
    updateNodeLabel(App.inspectorNodeId, ev.target.value);
  });
  document.getElementById("node-purpose-instructions-input").addEventListener("input", (ev) => {
    if (App.inspectorNodeId) updateNodeData(App.inspectorNodeId, { _purposeInstructions: ev.target.value });
  });
  document.getElementById("node-progress-status-input").addEventListener("change", (ev) => {
    if (!App.inspectorNodeId) return;
    updateNodeData(App.inspectorNodeId, {
      _progressStatus: normalizeProgressStatus(ev.target.value),
      _progressUpdatedAt: new Date().toISOString(),
    });
  });
  document.getElementById("node-agent-role-input").addEventListener("input", (ev) => {
    if (App.inspectorNodeId) updateNodeData(App.inspectorNodeId, { _agentRole: ev.target.value });
  });
  document.getElementById("node-agent-intent-input").addEventListener("input", (ev) => {
    if (App.inspectorNodeId) updateNodeData(App.inspectorNodeId, { _agentIntent: ev.target.value });
  });
  document.getElementById("node-agent-inputs-input").addEventListener("input", (ev) => {
    if (App.inspectorNodeId) updateNodeData(App.inspectorNodeId, { _agentInputs: normalizeList(ev.target.value) });
  });
  document.getElementById("node-agent-outputs-input").addEventListener("input", (ev) => {
    if (App.inspectorNodeId) updateNodeData(App.inspectorNodeId, { _agentOutputs: normalizeList(ev.target.value) });
  });
  document.getElementById("node-agent-acceptance-input").addEventListener("input", (ev) => {
    if (App.inspectorNodeId) updateNodeData(App.inspectorNodeId, { _agentAcceptanceCriteria: normalizeList(ev.target.value) });
  });
  document.getElementById("node-agent-tools-input").addEventListener("input", (ev) => {
    if (App.inspectorNodeId) updateNodeData(App.inspectorNodeId, { _agentRecommendedTools: normalizeList(ev.target.value) });
  });
  document.getElementById("node-agent-risk-input").addEventListener("change", (ev) => {
    if (App.inspectorNodeId) updateNodeData(App.inspectorNodeId, { _agentRiskLevel: ev.target.value });
  });
  document.getElementById("node-agent-notes-input").addEventListener("input", (ev) => {
    if (App.inspectorNodeId) updateNodeData(App.inspectorNodeId, { _agentNotes: ev.target.value });
  });
  document.getElementById("loop-mode-input").addEventListener("change", (ev) => {
    if (App.inspectorNodeId) updateNodeData(App.inspectorNodeId, { _loopMode: normalizeLoopMode(ev.target.value) });
  });
  document.getElementById("loop-definition-input").addEventListener("input", (ev) => {
    if (App.inspectorNodeId) updateNodeData(App.inspectorNodeId, { _loopDefinition: ev.target.value });
  });
  document.getElementById("loop-body-input").addEventListener("input", (ev) => {
    if (App.inspectorNodeId) updateNodeData(App.inspectorNodeId, { _loopBody: ev.target.value });
  });
  document.getElementById("loop-exit-rule-input").addEventListener("input", (ev) => {
    if (App.inspectorNodeId) updateNodeData(App.inspectorNodeId, { _loopExitRule: ev.target.value });
  });
  document.getElementById("loop-agent-notes-input").addEventListener("input", (ev) => {
    if (App.inspectorNodeId) updateNodeData(App.inspectorNodeId, { _loopAgentNotes: ev.target.value });
  });
  document.getElementById("loop-stop-mode-input").addEventListener("change", (ev) => {
    if (App.inspectorNodeId) updateNodeData(App.inspectorNodeId, { _stopMode: normalizeStopMode(ev.target.value) });
  });
  document.getElementById("add-loop-stop-condition").addEventListener("click", () => {
    if (!App.inspectorNodeId) return;
    const conditions = getLoopStopConditionsValue(getLiveNode(App.inspectorNodeId)?.data || {});
    conditions.push({ text: "" });
    setLoopStopConditions(App.inspectorNodeId, conditions, true);
  });
  document.getElementById("loop-stop-condition-list").addEventListener("input", (ev) => {
    if (!App.inspectorNodeId || ev.target.tagName !== "TEXTAREA") return;
    const index = parseInt(ev.target.dataset.index, 10);
    if (!Number.isFinite(index)) return;
    const conditions = getLoopStopConditionsValue(getLiveNode(App.inspectorNodeId)?.data || {});
    conditions[index] = conditions[index] || { text: "" };
    conditions[index].text = ev.target.value;
    setLoopStopConditions(App.inspectorNodeId, conditions);
  });
  document.getElementById("loop-stop-condition-list").addEventListener("click", (ev) => {
    const removeButton = ev.target.closest("[data-action='remove-stop-condition']");
    if (!removeButton || !App.inspectorNodeId) return;
    const index = parseInt(removeButton.dataset.index, 10);
    if (!Number.isFinite(index)) return;
    const conditions = getLoopStopConditionsValue(getLiveNode(App.inspectorNodeId)?.data || {});
    conditions.splice(index, 1);
    setLoopStopConditions(App.inspectorNodeId, conditions, true);
  });
  document.getElementById("add-progress-claim").addEventListener("click", () => {
    if (!App.inspectorNodeId) return;
    const claims = getProgressClaimsValue(getLiveNode(App.inspectorNodeId)?.data || {});
    claims.push(newClaim());
    setProgressClaims(App.inspectorNodeId, claims, true);
    updateNodeData(App.inspectorNodeId, { _progressStatus: "needs_review" });
  });
  document.getElementById("progress-claim-list").addEventListener("input", (ev) => {
    if (!App.inspectorNodeId || !ev.target.dataset.claimField) return;
    const index = parseInt(ev.target.dataset.index, 10);
    if (!Number.isFinite(index)) return;
    const claims = getProgressClaimsValue(getLiveNode(App.inspectorNodeId)?.data || {});
    patchClaimField(claims, index, ev.target.dataset.claimField, ev.target.value);
    setProgressClaims(App.inspectorNodeId, claims);
  });
  document.getElementById("progress-claim-list").addEventListener("change", (ev) => {
    if (!App.inspectorNodeId || !ev.target.dataset.claimField) return;
    const index = parseInt(ev.target.dataset.index, 10);
    if (!Number.isFinite(index)) return;
    const claims = getProgressClaimsValue(getLiveNode(App.inspectorNodeId)?.data || {});
    patchClaimField(claims, index, ev.target.dataset.claimField, ev.target.value);
    setProgressClaims(App.inspectorNodeId, claims);
  });
  document.getElementById("progress-claim-list").addEventListener("click", (ev) => {
    const removeButton = ev.target.closest("[data-action='remove-claim']");
    if (!removeButton || !App.inspectorNodeId) return;
    const index = parseInt(removeButton.dataset.index, 10);
    if (!Number.isFinite(index)) return;
    const claims = getProgressClaimsValue(getLiveNode(App.inspectorNodeId)?.data || {});
    claims.splice(index, 1);
    setProgressClaims(App.inspectorNodeId, claims, true);
  });
  document.getElementById("add-input-port").addEventListener("click", () => addNodePort("input"));
  document.getElementById("remove-input-port").addEventListener("click", () => removeNodePort("input"));
  document.getElementById("add-output-port").addEventListener("click", () => addNodePort("output"));
  document.getElementById("remove-output-port").addEventListener("click", () => removeNodePort("output"));

  document.getElementById("drawflow").addEventListener("mousedown", (ev) => {
    if (ev.button !== 0) return;
    const nodeEl = ev.target.closest(".drawflow-node");
    if (!nodeEl) return;
    if (ev.target.closest(".input, .output") || isTextEditingTarget(ev.target)) return;

    if (ev.shiftKey) {
      const dfId = getNodeIdFromElement(nodeEl);
      if (dfId) requestAnimationFrame(() => showNodeInspector(dfId));
      return;
    }

    hideNodeInspector();
  }, true);

  App.editor.on("nodeUnselected", () => {
    if (!App.editor.node_selected) hideNodeInspector();
  });
  App.editor.on("connectionSelected", hideNodeInspector);
  App.editor.on("nodeMoved", positionNodeInspector);
  App.editor.on("mouseMove", positionNodeInspector);
  App.editor.on("zoom", () => requestAnimationFrame(positionNodeInspector));
  App.editor.on("translate", () => requestAnimationFrame(positionNodeInspector));
  window.addEventListener("resize", positionNodeInspector);
  document.addEventListener("mousedown", (ev) => {
    if (!App.inspectorNodeId) return;
    if (ev.target.closest("#node-inspector")) return;
    const nodeEl = ev.target.closest(".drawflow-node");
    const openGesture = nodeEl && ev.shiftKey && !ev.target.closest(".input, .output") && !isTextEditingTarget(ev.target);
    if (openGesture) return;
    hideNodeInspector();
  }, true);
  document.addEventListener("keydown", (ev) => {
    if (ev.key !== "Escape" || !App.inspectorNodeId) return;
    ev.preventDefault();
    hideNodeInspector();
  });
}

/* ============================================================
   MULTI-SELECTION / GROUP MANIPULATION
   ============================================================ */
function isTextEditingTarget(target) {
  return target && (
    target.isContentEditable ||
    ["INPUT", "TEXTAREA", "SELECT"].includes(target.tagName)
  );
}

function getNodeIdFromElement(nodeEl) {
  return nodeEl ? nodeEl.id.replace("node-", "") : null;
}

function getNodeElement(dfId) {
  return document.getElementById("node-" + dfId);
}

function nodeExists(dfId) {
  return !!App.editor?.drawflow?.drawflow?.[App.editor.module]?.data?.[dfId];
}

function connectionMetaFromElement(connectionEl) {
  if (!connectionEl) return null;
  const classes = Array.from(connectionEl.classList);
  const inputNode = classes.find(c => c.startsWith("node_in_node-"));
  const outputNode = classes.find(c => c.startsWith("node_out_node-"));
  const outputClass = classes.find(c => c.startsWith("output_"));
  const inputClass = classes.find(c => c.startsWith("input_"));
  if (!inputNode || !outputNode || !outputClass || !inputClass) return null;
  return {
    outputId: outputNode.replace("node_out_node-", ""),
    inputId: inputNode.replace("node_in_node-", ""),
    outputClass,
    inputClass,
  };
}

function connectionMetaFromDetail(detail) {
  if (!detail) return null;
  return {
    outputId: String(detail.output_id),
    inputId: String(detail.input_id),
    outputClass: detail.output_class,
    inputClass: detail.input_class,
  };
}

function connectionKey(meta) {
  return `${meta.outputId}:${meta.outputClass}->${meta.inputId}:${meta.inputClass}`;
}

function getConnectionElement(meta) {
  return App.editor.container.querySelector(
    `.connection.node_in_node-${meta.inputId}.node_out_node-${meta.outputId}.${meta.outputClass}.${meta.inputClass}`
  );
}

function renderObjectSelection() {
  App.editor.container.querySelectorAll(".drawflow-node.multi-selected")
    .forEach(el => el.classList.remove("multi-selected"));
  App.editor.container.querySelectorAll(".connection.multi-selected")
    .forEach(el => el.classList.remove("multi-selected"));

  for (const dfId of App.selection.nodes) {
    const nodeEl = getNodeElement(dfId);
    if (nodeEl) nodeEl.classList.add("multi-selected");
  }
  for (const meta of App.selection.connections.values()) {
    const connectionEl = getConnectionElement(meta);
    if (connectionEl) connectionEl.classList.add("multi-selected");
  }
}

function selectedObjectCount() {
  return App.selection.nodes.size + App.selection.connections.size;
}

function clearObjectSelection() {
  App.selection.nodes.clear();
  App.selection.connections.clear();
  App.selection.groupDrag = null;
  App.selection.marquee.active = false;
  const marqueeEl = document.getElementById("selection-marquee");
  if (marqueeEl) marqueeEl.style.display = "none";
  renderObjectSelection();
}

function promoteCurrentDrawflowSelection() {
  if (selectedObjectCount() > 0) return;
  if (App.editor.node_selected?.isConnected) {
    App.selection.nodes.add(getNodeIdFromElement(App.editor.node_selected));
  }
  if (App.editor.connection_selected?.isConnected) {
    const meta = connectionMetaFromElement(App.editor.connection_selected.parentElement);
    if (meta) App.selection.connections.set(connectionKey(meta), meta);
  }
}

function toggleNodeSelection(nodeEl) {
  const dfId = getNodeIdFromElement(nodeEl);
  let selected = false;
  promoteCurrentDrawflowSelection();
  if (App.selection.nodes.has(dfId)) {
    App.selection.nodes.delete(dfId);
    if (App.editor.node_selected === nodeEl) {
      nodeEl.classList.remove("selected");
      App.editor.node_selected = null;
    }
  } else {
    App.selection.nodes.add(dfId);
    selected = true;
  }
  renderObjectSelection();
  if (!selected && App.selection.nodes.size === 0) hideNodeInspector();
  toast(`${selectedObjectCount()} selected`, "good");
}

function toggleConnectionSelection(connectionEl) {
  const meta = connectionMetaFromElement(connectionEl);
  if (!meta) return;
  const key = connectionKey(meta);
  promoteCurrentDrawflowSelection();
  if (App.selection.connections.has(key)) {
    App.selection.connections.delete(key);
    if (App.editor.connection_selected?.parentElement === connectionEl) {
      connectionEl.querySelectorAll(".main-path").forEach(path => path.classList.remove("selected"));
      App.editor.connection_selected = null;
    }
  } else {
    App.selection.connections.set(key, meta);
  }
  renderObjectSelection();
  if (App.selection.nodes.size === 0) hideNodeInspector();
  toast(`${selectedObjectCount()} selected`, "good");
}

function setNodePosition(dfId, x, y) {
  const nodeEl = getNodeElement(dfId);
  const nodeData = App.editor.drawflow.drawflow[App.editor.module].data[dfId];
  if (!nodeEl || !nodeData) return;
  nodeEl.style.left = x + "px";
  nodeEl.style.top = y + "px";
  nodeData.pos_x = x;
  nodeData.pos_y = y;
  App.editor.updateConnectionNodes("node-" + dfId);
  if (App.inspectorNodeId === String(dfId)) positionNodeInspector();
  markDirty();
}

/* ============================================================
   AUTO LAYOUT
   ============================================================ */
const SEMANTIC_LAYOUT_LANES = [
  {
    name: "Intake",
    pattern: /\b(start|intake|kickoff|goal|scope|request|brief|need|problem)\b/i,
  },
  {
    name: "Orchestration",
    pattern: /\b(branch|merge|parallel|loop|router|orchestrate|coordinate|fan.?out|join)\b/i,
  },
  {
    name: "Planning",
    pattern: /\b(plan|planning|strategy|blueprint|discovery|stakeholder|timeline|roadmap|governance|design)\b/i,
  },
  {
    name: "Curriculum",
    pattern: /\b(curriculum|syllabus|module|lesson|activity|content|session design|learning|rubric|resource)\b/i,
  },
  {
    name: "Logistics",
    pattern: /\b(logistics|schedule|venue|room|budget|catering|registration|platform|materials|technology|lms|calendar)\b/i,
  },
  {
    name: "Outreach",
    pattern: /\b(marketing|communications|outreach|invite|invitation|promotion|audience|brand|newsletter|social)\b/i,
  },
  {
    name: "People",
    pattern: /\b(partner|speaker|facilitator|participant|community|volunteer|sponsor|staff|faculty|student)\b/i,
  },
  {
    name: "Review",
    pattern: /\b(review|approval|approve|assessment|evaluation|survey|metric|decision|gate|check|score|quality|threshold)\b/i,
  },
  {
    name: "Delivery",
    pattern: /\b(delivery|deliver|launch|run|facilitate|iterate|revision|revise|weekly|practice|workshop|event)\b/i,
  },
  {
    name: "Closeout",
    pattern: /\b(end|final|report|closeout|archive|handoff|retrospective|wrap|complete|completion)\b/i,
  },
];

function getLayoutHomeData() {
  return App.editor?.drawflow?.drawflow?.[App.editor.module]?.data || {};
}

function getLayoutNodeSize(dfId) {
  const node = getLiveNode(dfId);
  const nodeEl = getNodeElement(dfId);
  return {
    width: Math.max(nodeEl?.offsetWidth || 0, node?.name === "loop" ? 132 : 116),
    height: Math.max(nodeEl?.offsetHeight || 0, 128),
  };
}

function getLayoutConnections() {
  const home = getLayoutHomeData();
  const edges = [];
  for (const fromId of Object.keys(home)) {
    const node = home[fromId];
    for (const outKey of Object.keys(node.outputs || {})) {
      const fromPort = parseInt(outKey.replace("output_", ""), 10);
      for (const conn of node.outputs[outKey].connections || []) {
        const toId = String(conn.node);
        const target = home[toId];
        if (!target) continue;
        const toPort = parseInt(String(conn.output).replace("input_", ""), 10);
        edges.push({
          fromId: String(fromId),
          toId,
          fromPort,
          toPort,
          fromRole: getPortRole(node.name, "output", fromPort),
          toRole: getPortRole(target.name, "input", toPort),
        });
      }
    }
  }
  return edges;
}

function isLoopReturnLayoutEdge(edge) {
  return normalizeRoleText(edge.toRole).toLowerCase() === "again";
}

function compareLayoutNodes(a, b, home) {
  const nodeA = home[a] || {};
  const nodeB = home[b] || {};
  return (nodeA.pos_y - nodeB.pos_y) || (nodeA.pos_x - nodeB.pos_x) || String(a).localeCompare(String(b));
}

function getLayoutComponents(home, edges) {
  const ids = Object.keys(home);
  const parent = {};
  for (const id of ids) parent[id] = id;

  function find(id) {
    if (parent[id] !== id) parent[id] = find(parent[id]);
    return parent[id];
  }

  function unite(a, b) {
    if (!(a in parent) || !(b in parent)) return;
    const rootA = find(a);
    const rootB = find(b);
    if (rootA !== rootB) parent[rootB] = rootA;
  }

  for (const edge of edges) unite(edge.fromId, edge.toId);

  const groups = new Map();
  for (const id of ids) {
    const root = find(id);
    if (!groups.has(root)) groups.set(root, []);
    groups.get(root).push(id);
  }

  return [...groups.values()]
    .map(group => group.sort((a, b) => compareLayoutNodes(a, b, home)))
    .sort((a, b) => compareLayoutNodes(a[0], b[0], home));
}

function refreshLayoutConnections(ids) {
  for (const id of ids) App.editor.updateConnectionNodes("node-" + id);
}

function getLoopReturnSuffix(edges) {
  const softenedCount = edges.filter(isLoopReturnLayoutEdge).length;
  return softenedCount ? `; softened ${softenedCount} loop return edge${softenedCount === 1 ? "" : "s"}` : "";
}

function prepareLayoutRun(home) {
  const ids = Object.keys(home);
  if (!ids.length) {
    toast("Nothing to organize", "error");
    return null;
  }
  clearObjectSelection();
  hideNodeInspector();
  closeLayoutMenu();
  return ids;
}

function applyDagreComponentLayout(component, edges, originX, originY) {
  const graph = new window.dagre.graphlib.Graph({ multigraph: true });
  graph.setGraph({
    rankdir: "LR",
    align: "UL",
    nodesep: 90,
    ranksep: 150,
    marginx: 20,
    marginy: 20,
  });
  graph.setDefaultEdgeLabel(() => ({}));

  const home = getLayoutHomeData();
  const componentSet = new Set(component);
  for (const id of component) graph.setNode(id, getLayoutNodeSize(id));

  let edgeCount = 0;
  for (const edge of edges) {
    if (!componentSet.has(edge.fromId) || !componentSet.has(edge.toId)) continue;
    if (isLoopReturnLayoutEdge(edge)) continue;
    graph.setEdge(edge.fromId, edge.toId, { weight: 1 }, "edge-" + edgeCount++);
  }

  if (edgeCount === 0 && component.length > 1) {
    const sorted = [...component].sort((a, b) => compareLayoutNodes(a, b, home));
    for (let i = 0; i < sorted.length - 1; i += 1) {
      graph.setEdge(sorted[i], sorted[i + 1], { weight: 0 }, "fallback-" + i);
    }
  }

  window.dagre.layout(graph);

  const placed = [];
  for (const id of component) {
    const result = graph.node(id);
    const size = getLayoutNodeSize(id);
    if (!result || !Number.isFinite(result.x) || !Number.isFinite(result.y)) continue;
    placed.push({
      id,
      left: result.x - size.width / 2,
      top: result.y - size.height / 2,
      width: size.width,
      height: size.height,
    });
  }

  if (!placed.length) return 0;
  const minLeft = Math.min(...placed.map(item => item.left));
  const minTop = Math.min(...placed.map(item => item.top));
  const maxBottom = Math.max(...placed.map(item => item.top + item.height));

  for (const item of placed) {
    setNodePosition(item.id, Math.round(originX + item.left - minLeft), Math.round(originY + item.top - minTop));
  }

  return Math.ceil(maxBottom - minTop);
}

function organizeCanvasWithDagre() {
  if (!window.dagre) {
    toast("Dagre layout engine is still loading", "error");
    return;
  }

  const home = getLayoutHomeData();
  const ids = prepareLayoutRun(home);
  if (!ids) return;

  const edges = getLayoutConnections();
  const components = getLayoutComponents(home, edges);
  let cursorY = 80;
  for (const component of components) {
    const height = applyDagreComponentLayout(component, edges, 80, cursorY);
    cursorY += Math.max(height, 160) + 220;
  }

  refreshLayoutConnections(ids);
  toast(`Organized ${ids.length} nodes with Safe flow${getLoopReturnSuffix(edges)}`, "good");
}

function getElkInputPortId(nodeId, portNumber) {
  return `node-${nodeId}-input-${portNumber}`;
}

function getElkOutputPortId(nodeId, portNumber) {
  return `node-${nodeId}-output-${portNumber}`;
}

function getElkPortSide(node, kind, portNumber) {
  if (node.name === "loop" && kind === "input" && getPortRole(node.name, "input", portNumber) === "again") return "EAST";
  return kind === "input" ? "WEST" : "EAST";
}

function buildElkNode(dfId, node) {
  const size = getLayoutNodeSize(dfId);
  const ports = [];
  for (const inputKey of Object.keys(node.inputs || {})) {
    const portNumber = parseInt(inputKey.replace("input_", ""), 10);
    ports.push({
      id: getElkInputPortId(dfId, portNumber),
      width: 8,
      height: 8,
      layoutOptions: { "elk.port.side": getElkPortSide(node, "input", portNumber) },
    });
  }
  for (const outputKey of Object.keys(node.outputs || {})) {
    const portNumber = parseInt(outputKey.replace("output_", ""), 10);
    ports.push({
      id: getElkOutputPortId(dfId, portNumber),
      width: 8,
      height: 8,
      layoutOptions: { "elk.port.side": getElkPortSide(node, "output", portNumber) },
    });
  }
  return {
    id: String(dfId),
    width: size.width,
    height: size.height,
    ports,
    layoutOptions: { "elk.portConstraints": "FIXED_SIDE" },
  };
}

function buildElkGraph(home, edges) {
  return {
    id: "root",
    layoutOptions: {
      "elk.algorithm": "layered",
      "elk.direction": "RIGHT",
      "elk.spacing.nodeNode": "90",
      "elk.layered.spacing.nodeNodeBetweenLayers": "150",
      "elk.layered.nodePlacement.strategy": "NETWORK_SIMPLEX",
      "elk.layered.cycleBreaking.strategy": "GREEDY",
      "elk.separateConnectedComponents": "true",
      "elk.layered.considerModelOrder.strategy": "NODES_AND_EDGES",
    },
    children: Object.keys(home).map(id => buildElkNode(id, home[id])),
    edges: edges
      .filter(edge => !isLoopReturnLayoutEdge(edge))
      .map((edge, index) => ({
        id: "edge-" + index,
        sources: [getElkOutputPortId(edge.fromId, edge.fromPort)],
        targets: [getElkInputPortId(edge.toId, edge.toPort)],
      })),
  };
}

async function organizeCanvasWithElk() {
  if (!window.ELK) {
    toast("ELK layout engine is still loading", "error");
    return;
  }

  const home = getLayoutHomeData();
  const ids = prepareLayoutRun(home);
  if (!ids) return;

  try {
    const edges = getLayoutConnections();
    const elk = new window.ELK();
    const result = await elk.layout(buildElkGraph(home, edges));
    const children = (result.children || []).filter(child => Number.isFinite(child.x) && Number.isFinite(child.y));
    if (!children.length) throw new Error("ELK returned no node positions");

    const minX = Math.min(...children.map(child => child.x));
    const minY = Math.min(...children.map(child => child.y));
    for (const child of children) {
      setNodePosition(child.id, Math.round(80 + child.x - minX), Math.round(80 + child.y - minY));
    }

    refreshLayoutConnections(ids);
    toast(`Organized ${ids.length} nodes with ELK layered${getLoopReturnSuffix(edges)}`, "good");
  } catch (err) {
    console.error("ELK layout failed", err);
    toast("ELK layout failed: " + err.message, "error");
  }
}

function getSemanticText(node) {
  const data = node.data || {};
  return [
    node.name,
    data._label,
    getPurposeInstructionsValue(data),
    getLoopModeValue(data),
    getLoopDefinitionValue(data),
    getLoopBodyValue(data),
    getLoopExitRuleValue(data),
    getLoopAgentNotesValue(data),
    ...getLoopStopConditionsValue(data).map(condition => condition.text),
  ].filter(Boolean).join(" ");
}

function getSemanticLaneIndex(node) {
  if (node.name === "start") return 0;
  if (node.name === "end") return SEMANTIC_LAYOUT_LANES.length - 1;
  if (["branch", "merge", "parallel", "loop"].includes(node.name)) return 1;

  const text = getSemanticText(node);
  for (let i = 0; i < SEMANTIC_LAYOUT_LANES.length; i += 1) {
    if (SEMANTIC_LAYOUT_LANES[i].pattern.test(text)) return i;
  }

  if (node.name === "wait") return 7;
  return 2;
}

function compareSemanticNodes(a, b, home) {
  const nodeA = home[a] || {};
  const nodeB = home[b] || {};
  return (nodeA.pos_x - nodeB.pos_x) || (nodeA.pos_y - nodeB.pos_y) || String(a).localeCompare(String(b));
}

function computeSemanticRanks(home, edges) {
  const ids = Object.keys(home);
  const ranks = Object.fromEntries(ids.map(id => [id, 0]));
  const incoming = Object.fromEntries(ids.map(id => [id, 0]));
  const outgoing = Object.fromEntries(ids.map(id => [id, []]));
  const forwardEdges = edges.filter(edge => !isLoopReturnLayoutEdge(edge));

  for (const edge of forwardEdges) {
    if (!(edge.fromId in outgoing) || !(edge.toId in incoming)) continue;
    outgoing[edge.fromId].push(edge.toId);
    incoming[edge.toId] += 1;
  }

  const queue = ids
    .filter(id => home[id].name === "start" || incoming[id] === 0)
    .sort((a, b) => compareSemanticNodes(a, b, home));
  const visited = new Set();

  while (queue.length) {
    const id = queue.shift();
    visited.add(id);
    for (const toId of outgoing[id]) {
      ranks[toId] = Math.max(ranks[toId], ranks[id] + 1);
      incoming[toId] -= 1;
      if (incoming[toId] === 0) queue.push(toId);
    }
    queue.sort((a, b) => compareSemanticNodes(a, b, home));
  }

  const positioned = ids
    .map(id => home[id].pos_x)
    .filter(value => Number.isFinite(value));
  const minX = positioned.length ? Math.min(...positioned) : 0;
  for (const id of ids) {
    if (visited.has(id)) continue;
    ranks[id] = Math.max(0, Math.round(((home[id].pos_x || minX) - minX) / 240));
  }

  return ranks;
}

function organizeCanvasSemantically() {
  const home = getLayoutHomeData();
  const ids = prepareLayoutRun(home);
  if (!ids) return;

  const edges = getLayoutConnections();
  const ranks = computeSemanticRanks(home, edges);
  const laneById = Object.fromEntries(ids.map(id => [id, getSemanticLaneIndex(home[id])]));
  const stackCounts = new Map();
  const baseX = 80;
  const baseY = 80;
  const columnGap = 240;
  const laneGap = 245;
  const stackGap = 138;

  const sorted = [...ids].sort((a, b) => {
    return (ranks[a] - ranks[b]) ||
      (laneById[a] - laneById[b]) ||
      compareSemanticNodes(a, b, home);
  });

  for (const id of sorted) {
    const rank = ranks[id];
    const lane = laneById[id];
    const key = `${rank}:${lane}`;
    const stackIndex = stackCounts.get(key) || 0;
    stackCounts.set(key, stackIndex + 1);

    const x = baseX + rank * columnGap;
    const y = baseY + lane * laneGap + stackIndex * stackGap;
    setNodePosition(id, x, y);
  }

  refreshLayoutConnections(ids);
  const laneCount = new Set(Object.values(laneById)).size;
  toast(`Organized ${ids.length} nodes into ${laneCount} semantic lanes${getLoopReturnSuffix(edges)}`, "good");
}

function organizeCanvasCompact() {
  const home = getLayoutHomeData();
  const ids = prepareLayoutRun(home);
  if (!ids) return;
  const sorted = [...ids].sort((a, b) => compareSemanticNodes(a, b, home));
  const columns = Math.max(1, Math.ceil(Math.sqrt(sorted.length)));
  const cellWidth = 170;
  const cellHeight = 145;
  sorted.forEach((id, index) => {
    const col = index % columns;
    const row = Math.floor(index / columns);
    setNodePosition(id, 80 + col * cellWidth, 80 + row * cellHeight);
  });
  refreshLayoutConnections(ids);
  toast(`Organized ${ids.length} nodes compactly`, "good");
}

function organizeSelectedNodes() {
  const home = getLayoutHomeData();
  const selected = Array.from(App.selection.nodes).filter(id => home[id]);
  if (selected.length < 2) {
    toast("Select two or more nodes first", "error");
    return;
  }
  if (!window.dagre) {
    toast("Dagre layout engine is still loading", "error");
    return;
  }
  const edges = getLayoutConnections().filter(edge => selected.includes(edge.fromId) && selected.includes(edge.toId));
  const minX = Math.min(...selected.map(id => home[id].pos_x));
  const minY = Math.min(...selected.map(id => home[id].pos_y));
  applyDagreComponentLayout(selected, edges, minX, minY);
  refreshLayoutConnections(selected);
  toast(`Organized ${selected.length} selected nodes`, "good");
}

async function applySelectedLayout() {
  if (App.layoutRunning) return;
  const option = getLayoutOption();
  App.layoutRunning = true;
  try {
    if (option.value === "elkLayered") await organizeCanvasWithElk();
    else if (option.value === "semanticAgentic") organizeCanvasSemantically();
    else if (option.value === "compactGrid") organizeCanvasCompact();
    else if (option.value === "selectedOnly") organizeSelectedNodes();
    else organizeCanvasWithDagre();
  } finally {
    App.layoutRunning = false;
  }
}

function getNodeSelectionRect(dfId) {
  const node = getLiveNode(dfId);
  if (!node) return null;
  return {
    left: node.pos_x,
    top: node.pos_y,
    right: node.pos_x + 84,
    bottom: node.pos_y + 84,
  };
}

function startGroupDrag(ev, primaryNodeId) {
  const starts = new Map();
  const primary = primaryNodeId ? String(primaryNodeId) : "";
  let nodesToMove = new Set(App.selection.nodes);
  if (primary && !nodesToMove.has(primary)) nodesToMove = new Set([primary]);
  if (nodesToMove.size === 0) return;

  for (const dfId of nodesToMove) {
    const nodeData = App.editor.drawflow.drawflow[App.editor.module].data[dfId];
    if (nodeData) starts.set(dfId, { x: nodeData.pos_x, y: nodeData.pos_y });
  }
  if (starts.size === 0) return;
  App.selection.groupDrag = {
    primaryNodeId,
    startX: ev.clientX,
    startY: ev.clientY,
    starts,
  };
}

function updateGroupDrag(ev) {
  const drag = App.selection.groupDrag;
  if (!drag) return;
  const dx = (ev.clientX - drag.startX) / App.editor.zoom;
  const dy = (ev.clientY - drag.startY) / App.editor.zoom;
  for (const [dfId, start] of drag.starts) {
    setNodePosition(dfId, start.x + dx, start.y + dy);
  }
}

function endGroupDrag() {
  App.selection.groupDrag = null;
}

function forgetNodeSelection(dfId) {
  const userId = App.reverseIdMap[dfId];
  if (userId) delete App.idMap[userId];
  delete App.reverseIdMap[dfId];
  App.selection.nodes.delete(String(dfId));
  if (App.inspectorNodeId === String(dfId)) hideNodeInspector();
  renderObjectSelection();
}

function forgetConnectionSelection(detail) {
  const meta = connectionMetaFromDetail(detail);
  if (!meta) return;
  App.selection.connections.delete(connectionKey(meta));
  renderObjectSelection();
}

function deleteObjectSelection() {
  const selectedConnections = Array.from(App.selection.connections.values());
  const selectedNodes = Array.from(App.selection.nodes);
  let removed = 0;

  for (const meta of selectedConnections) {
    if (!getConnectionElement(meta)) continue;
    try {
      App.editor.removeSingleConnection(meta.outputId, meta.inputId, meta.outputClass, meta.inputClass);
      removed++;
    } catch (e) {
      console.warn("connection delete failed", meta, e);
    }
  }

  for (const dfId of selectedNodes) {
    if (!nodeExists(dfId)) continue;
    try {
      App.editor.removeNodeId("node-" + dfId);
      removed++;
    } catch (e) {
      console.warn("node delete failed", dfId, e);
    }
  }

  const deleteButton = App.editor.precanvas.querySelector(".drawflow-delete");
  if (deleteButton) deleteButton.remove();
  App.editor.node_selected = null;
  App.editor.connection_selected = null;
  clearObjectSelection();
  updateEmptyState();
  if (removed) toast(`${removed} deleted`, "good");
}

function copySelection() {
  const dfIds = Array.from(App.selection.nodes);
  if (dfIds.length === 0 && App.selection.connections.size === 0) return false;

  const home = App.editor.drawflow.drawflow[App.editor.module].data;
  const indexByDfId = new Map();
  const nodes = [];

  for (const dfId of dfIds) {
    const node = home[dfId];
    if (!node) continue;
    indexByDfId.set(String(dfId), nodes.length);
    const dataClone = JSON.parse(JSON.stringify(node.data || {}));
    delete dataClone._userId;
    nodes.push({
      type: node.name,
      data: dataClone,
      inputs: Object.keys(node.inputs || {}).length,
      outputs: Object.keys(node.outputs || {}).length,
      pos_x: node.pos_x,
      pos_y: node.pos_y,
    });
  }

  const edges = [];
  for (const meta of App.selection.connections.values()) {
    const fromIdx = indexByDfId.get(String(meta.outputId));
    const toIdx = indexByDfId.get(String(meta.inputId));
    if (fromIdx === undefined || toIdx === undefined) continue;
    const fromPort = parseInt(meta.outputClass.replace("output_", ""), 10);
    const toPort = parseInt(meta.inputClass.replace("input_", ""), 10);
    edges.push({ fromIdx, toIdx, fromPort, toPort });
  }

  App.clipboard = { nodes, edges };
  toast(`${nodes.length} copied`, "good");
  return true;
}

function pasteClipboard() {
  if (!App.clipboard || App.clipboard.nodes.length === 0) {
    toast("Clipboard empty", "error");
    return;
  }

  let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
  for (const n of App.clipboard.nodes) {
    if (n.pos_x < minX) minX = n.pos_x;
    if (n.pos_y < minY) minY = n.pos_y;
    if (n.pos_x > maxX) maxX = n.pos_x;
    if (n.pos_y > maxY) maxY = n.pos_y;
  }
  const boxCx = (minX + maxX) / 2;
  const boxCy = (minY + maxY) / 2;

  let targetX, targetY;
  if (App.lastCanvasMouse) {
    const rect = App.editor.precanvas.getBoundingClientRect();
    const zoom = App.editor.zoom;
    targetX = (App.lastCanvasMouse.clientX - rect.x) / zoom;
    targetY = (App.lastCanvasMouse.clientY - rect.y) / zoom;
  } else {
    targetX = boxCx + 48;
    targetY = boxCy + 48;
  }

  const dx = targetX - boxCx;
  const dy = targetY - boxCy;

  const newDfIds = [];
  for (const snap of App.clipboard.nodes) {
    const dfId = createNode(
      snap.type,
      snap.pos_x + dx,
      snap.pos_y + dy,
      snap.data._label || PRIMITIVES[snap.type]?.label || snap.type,
      undefined,
      { inputs: snap.inputs, outputs: snap.outputs }
    );
    if (dfId === null || dfId === undefined) continue;
    const home = App.editor.drawflow.drawflow[App.editor.module].data;
    const nodeData = home[dfId]?.data;
    if (nodeData) {
      const freshUid = nodeData._userId;
      Object.assign(nodeData, snap.data);
      nodeData._userId = freshUid;
    }
    newDfIds.push(String(dfId));
  }

  const newConnections = new Map();
  for (const e of App.clipboard.edges) {
    const fromDf = newDfIds[e.fromIdx];
    const toDf = newDfIds[e.toIdx];
    if (!fromDf || !toDf) continue;
    try {
      App.editor.addConnection(fromDf, toDf, "output_" + e.fromPort, "input_" + e.toPort);
      const meta = {
        outputId: String(fromDf),
        inputId: String(toDf),
        outputClass: "output_" + e.fromPort,
        inputClass: "input_" + e.toPort,
      };
      newConnections.set(connectionKey(meta), meta);
    } catch (err) {
      console.warn("paste connection failed", e, err);
    }
  }

  clearObjectSelection();
  for (const id of newDfIds) App.selection.nodes.add(id);
  for (const [k, m] of newConnections) App.selection.connections.set(k, m);
  renderObjectSelection();
  updateEmptyState();

  toast(`${newDfIds.length} pasted`, "good");
}

function cutSelection() {
  if (copySelection()) deleteObjectSelection();
}

function markDrawflowNodeSelected(nodeEl) {
  if (!nodeEl) return;
  if (App.editor.node_selected && App.editor.node_selected !== nodeEl) {
    App.editor.node_selected.classList?.remove("selected");
  }
  App.editor.node_selected = nodeEl;
  nodeEl.classList.add("selected");
}

function rectsIntersect(a, b) {
  return !(a.left > b.right || a.right < b.left || a.top > b.bottom || a.bottom < b.top);
}

function wireObjectSelection() {
  const el = document.getElementById("drawflow");
  const marqueeEl = document.getElementById("selection-marquee");

  // Keep Drawflow's keyboard shortcuts alive after selecting a connection.
  App.editor.on("connectionSelected", () => {
    try {
      el.focus({ preventScroll: true });
    } catch (e) {
      el.focus();
    }
  });

  App.editor.on("connectionRemoved", forgetConnectionSelection);

  el.addEventListener("mousedown", (ev) => {
    if (ev.button !== 0) return;

    const nodeEl = ev.target.closest(".drawflow-node");
    const connectionEl = ev.target.closest(".connection");
    const portEl = ev.target.closest(".input, .output");
    const textTarget = isTextEditingTarget(ev.target);
    const hasModifier = ev.ctrlKey || ev.metaKey;
    const hasShift = ev.shiftKey;
    const nodeId = getNodeIdFromElement(nodeEl);
    const connectionMeta = connectionMetaFromElement(connectionEl);
    const clickedSelectedNode = nodeId && App.selection.nodes.has(nodeId);
    const clickedSelectedConnection = connectionMeta && App.selection.connections.has(connectionKey(connectionMeta));

    if (hasShift && !nodeEl && !connectionEl && !portEl && !textTarget) {
      ev.preventDefault();
      ev.stopImmediatePropagation();
      App.selection.marquee = { active: true, startX: ev.clientX, startY: ev.clientY };
      marqueeEl.style.left = ev.clientX + "px";
      marqueeEl.style.top = ev.clientY + "px";
      marqueeEl.style.width = "0px";
      marqueeEl.style.height = "0px";
      marqueeEl.style.display = "block";
      hideNodeInspector();
      el.focus();
      return;
    }

    if (hasModifier && nodeEl && !portEl && !textTarget) {
      ev.preventDefault();
      ev.stopPropagation();
      toggleNodeSelection(nodeEl);
      el.focus();
      return;
    }

    if (hasModifier && connectionEl) {
      ev.preventDefault();
      ev.stopPropagation();
      toggleConnectionSelection(connectionEl);
      el.focus();
      return;
    }

    if (hasModifier || hasShift) return;

    if (clickedSelectedNode && !portEl && !textTarget && App.selection.nodes.size >= 2) {
      ev.preventDefault();
      ev.stopPropagation();
      startGroupDrag(ev, nodeId);
      el.focus();
      return;
    }
    if (!clickedSelectedNode && !clickedSelectedConnection && !ev.target.closest(".drawflow-delete")) {
      clearObjectSelection();
    }
  }, true);

  document.addEventListener("mousemove", (ev) => {
    if (App.selection.marquee.active) {
      const m = App.selection.marquee;
      const left = Math.min(ev.clientX, m.startX);
      const top = Math.min(ev.clientY, m.startY);
      const width = Math.abs(ev.clientX - m.startX);
      const height = Math.abs(ev.clientY - m.startY);
      marqueeEl.style.left = left + "px";
      marqueeEl.style.top = top + "px";
      marqueeEl.style.width = width + "px";
      marqueeEl.style.height = height + "px";
      return;
    }

    updateGroupDrag(ev);
  });

  document.addEventListener("mouseup", () => {
    if (App.selection.marquee.active) {
      const mRect = marqueeEl.getBoundingClientRect();
      marqueeEl.style.display = "none";
      App.selection.marquee.active = false;

      const zoom = App.editor.zoom;
      const canvasX = App.editor.canvas_x;
      const canvasY = App.editor.canvas_y;
      const containerRect = el.getBoundingClientRect();
      const selectionRect = {
        left: (mRect.left - containerRect.left - canvasX) / zoom,
        top: (mRect.top - containerRect.top - canvasY) / zoom,
        right: (mRect.right - containerRect.left - canvasX) / zoom,
        bottom: (mRect.bottom - containerRect.top - canvasY) / zoom,
      };

      const home = App.editor.drawflow.drawflow[App.editor.module].data;
      let added = 0;
      const nodesInsideMarquee = new Set();
      for (const idStr of Object.keys(home)) {
        const nodeRect = getNodeSelectionRect(idStr);
        if (!nodeRect || !rectsIntersect(selectionRect, nodeRect)) continue;
        nodesInsideMarquee.add(String(idStr));
        if (!App.selection.nodes.has(String(idStr))) added++;
        App.selection.nodes.add(String(idStr));
      }
      for (const fromId of nodesInsideMarquee) {
        const fromNode = home[fromId];
        if (!fromNode) continue;
        for (const outKey of Object.keys(fromNode.outputs || {})) {
          for (const conn of (fromNode.outputs[outKey].connections || [])) {
            const toId = String(conn.node);
            if (!nodesInsideMarquee.has(toId)) continue;
            const meta = {
              outputId: String(fromId),
              inputId: toId,
              outputClass: outKey,
              inputClass: String(conn.output),
            };
            const key = connectionKey(meta);
            if (!App.selection.connections.has(key)) {
              App.selection.connections.set(key, meta);
              added++;
            }
          }
        }
      }
      renderObjectSelection();
      if (added > 0) toast(`${selectedObjectCount()} selected`, "good");
      return;
    }

    endGroupDrag();
  });

  el.addEventListener("mousemove", (ev) => {
    App.lastCanvasMouse = { clientX: ev.clientX, clientY: ev.clientY };
  });
  el.addEventListener("mouseleave", () => {
    App.lastCanvasMouse = null;
  });

  document.addEventListener("keydown", (ev) => {
    if (isTextEditingTarget(ev.target)) return;

    const isMod = ev.metaKey || ev.ctrlKey;
    const key = ev.key.toLowerCase();

    if (isMod && key === "c") {
      if (selectedObjectCount() === 0) return;
      ev.preventDefault();
      ev.stopPropagation();
      copySelection();
      return;
    }
    if (isMod && key === "x") {
      if (selectedObjectCount() === 0) return;
      ev.preventDefault();
      ev.stopPropagation();
      cutSelection();
      return;
    }
    if (isMod && key === "v") {
      if (!App.clipboard) return;
      ev.preventDefault();
      ev.stopPropagation();
      pasteClipboard();
      return;
    }

    const wantsDelete = ev.key === "Delete" || (ev.key === "Backspace" && (ev.metaKey || ev.ctrlKey));
    if (!wantsDelete) return;

    if (selectedObjectCount() > 0) {
      ev.preventDefault();
      ev.stopPropagation();
      deleteObjectSelection();
      return;
    }

    if (App.editor?.connection_selected) {
      ev.preventDefault();
      ev.stopPropagation();
      const deleteButton = App.editor.precanvas.querySelector(".drawflow-delete");
      if (deleteButton) deleteButton.remove();
      App.editor.removeConnection();
      toast("Edge deleted", "good");
    }
  }, true);
}

/* ============================================================
   IMPORT / EXPORT (friendly schema <-> Drawflow internals)
   ============================================================ */
function countFromJson(value, fallback) {
  if (typeof value === "number" || typeof value === "string") return normalizePortCount(value, fallback);
  if (value && typeof value === "object") return Object.keys(value).length;
  return fallback;
}

function getJsonNodeTypes(userJson) {
  const result = {};
  for (const node of userJson.nodes || []) {
    const id = String(node.id || "");
    if (!id) continue;
    result[id] = PRIMITIVES[node.type] ? node.type : "generic";
  }
  return result;
}

function getJsonConnectionPort(connection, endpoint, kind, nodeTypes) {
  const portKey = endpoint === "from" ? "fromPort" : "toPort";
  const roleKey = endpoint === "from" ? "fromRole" : "toRole";
  const type = nodeTypes[String(connection[endpoint])] || "generic";
  const explicitRole = connection[roleKey];
  const portValue = connection[portKey];
  const stringPortRole = typeof portValue === "string" && !/^\d+$/.test(portValue.trim()) ? portValue : null;
  const rolePort = getPortNumberFromRole(type, kind, explicitRole ?? stringPortRole);
  if (rolePort != null) return rolePort;
  return normalizePortCount(portValue, 1);
}

function isPortWithinCount(portNumber, count) {
  return Number.isFinite(portNumber) && portNumber >= 1 && portNumber <= count;
}

function getImportPortCounts(userJson) {
  const counts = {};
  const nodeTypes = getJsonNodeTypes(userJson);
  for (const node of userJson.nodes) {
    const id = String(node.id || "");
    if (!id) continue;
    const type = nodeTypes[id] || "generic";
    const def = PRIMITIVES[type];
    counts[id] = {
      inputs: countFromJson(node.inputs ?? node.inputCount ?? node.ports?.inputs, def.inputs),
      outputs: countFromJson(node.outputs ?? node.outputCount ?? node.ports?.outputs, def.outputs),
    };
    if (type === "loop") {
      counts[id].inputs = 2;
      counts[id].outputs = 2;
    }
  }
  for (const c of userJson.connections || []) {
    const from = String(c.from);
    const to = String(c.to);
    const fromPort = getJsonConnectionPort(c, "from", "output", nodeTypes);
    const toPort = getJsonConnectionPort(c, "to", "input", nodeTypes);
    if (counts[from] && nodeTypes[from] !== "loop") counts[from].outputs = Math.max(counts[from].outputs, fromPort);
    if (counts[to] && nodeTypes[to] !== "loop") counts[to].inputs = Math.max(counts[to].inputs, toPort);
  }
  return counts;
}

function loadFromUserJson(userJson, fallbackName = DEFAULT_WORKFLOW_NAME) {
  if (!userJson || typeof userJson !== "object") throw new Error("JSON must be an object");
  if (!Array.isArray(userJson.nodes)) throw new Error('"nodes" must be an array');
  if (!Array.isArray(userJson.connections)) userJson.connections = [];
  App.syncing = true;
  setWorkflowName(userJson.name, fallbackName);
  const migratedBoundaryLoops = userJson.nodes.filter(node => (
    (PRIMITIVES[node.type] ? node.type : "generic") === "loop" &&
    (node._bWidth != null || node._bHeight != null || node.bWidth != null || node.bHeight != null || node.boundaryWidth != null || node.boundaryHeight != null)
  )).length;
  const nodeTypes = getJsonNodeTypes(userJson);
  const portCounts = getImportPortCounts(userJson);

  try {
    clearCanvas(true);

    for (const node of userJson.nodes) {
      const type = PRIMITIVES[node.type] ? node.type : "generic";
      const uid = String(node.id || newUserId());
      const counts = portCounts[uid] || PRIMITIVES[type];
      createNode(type, Number(node.x) || 0, Number(node.y) || 0, node.label, uid, {
        inputs: counts.inputs,
        outputs: counts.outputs,
        purposeInstructions: getPurposeInstructionsValue(node),
        progressStatus: getProgressStatusValue(node),
        progressOwner: getProgressOwnerValue(node),
        progressUpdatedAt: getProgressUpdatedAtValue(node),
        progressClaims: getProgressClaimsValue(node),
        agent: getAgentValue(node),
        loopMode: getLoopModeValue(node),
        loopDefinition: getLoopDefinitionValue(node),
        loopBody: getLoopBodyValue(node),
        loopExitRule: getLoopExitRuleValue(node),
        loopAgentNotes: getLoopAgentNotesValue(node),
        stopMode: getLoopStopModeValue(node),
        stopConditions: getLoopStopConditionsValue(node),
      });
      const m = uid.match(/^n(\d+)$/);
      if (m) bumpCounterTo(parseInt(m[1], 10));
    }

    for (const c of userJson.connections) {
      const fromDf = App.idMap[String(c.from)];
      const toDf   = App.idMap[String(c.to)];
      if (fromDf == null || toDf == null) continue;
      const fromPort = getJsonConnectionPort(c, "from", "output", nodeTypes);
      const toPort = getJsonConnectionPort(c, "to", "input", nodeTypes);
      const fromCount = portCounts[String(c.from)]?.outputs || 0;
      const toCount = portCounts[String(c.to)]?.inputs || 0;
      if (!isPortWithinCount(fromPort, fromCount) || !isPortWithinCount(toPort, toCount)) {
        console.warn("connection skipped because the port is outside the node contract", c);
        continue;
      }
      try {
        App.editor.addConnection(
          fromDf, toDf,
          "output_" + fromPort,
          "input_"  + toPort,
        );
      } catch (e) { console.warn("connection failed", c, e); }
    }
  } finally {
    App.syncing = false;
    updateEmptyState();
    if (migratedBoundaryLoops) {
      toast(`${migratedBoundaryLoops} old boundary loop${migratedBoundaryLoops === 1 ? "" : "s"} migrated to compact loop form`, "good");
    }
  }
}

function exportUserJson() {
  const dfData = App.editor.export();
  const home = dfData.drawflow.Home.data;
  const nodes = [], connections = [];

  for (const dfIdStr of Object.keys(home)) {
    const node = home[dfIdStr];
    const userId = App.reverseIdMap[node.id] || ("n" + node.id);
    const label = node.data?._label || (PRIMITIVES[node.name]?.label || node.name);
    const inputs = Object.keys(node.inputs || {}).length;
    const outputs = Object.keys(node.outputs || {}).length;

    const exportedNode = {
      id: userId,
      type: node.name,
      label,
      purposeInstructions: getPurposeInstructionsValue(node.data || {}),
      progress: {
        status: getProgressStatusValue(node.data || {}),
        owner: getProgressOwnerValue(node.data || {}),
        updatedAt: getProgressUpdatedAtValue(node.data || {}),
        claims: getProgressClaimsValue(node.data || {}),
      },
      inputs,
      outputs,
      ports: {
        inputs: getPortRoleMap(node.name, "input", inputs),
        outputs: getPortRoleMap(node.name, "output", outputs),
      },
      x: Math.round(node.pos_x),
      y: Math.round(node.pos_y),
    };
    if (!exportedNode.progress.owner) delete exportedNode.progress.owner;
    if (!exportedNode.progress.updatedAt) delete exportedNode.progress.updatedAt;
    if (!exportedNode.progress.claims.length) delete exportedNode.progress.claims;
    const agent = getAgentValue(node.data || {});
    if (hasAgentValue(agent)) exportedNode.agent = agent;
    if (node.name === "loop") {
      exportedNode.loop = {
        mode: getLoopModeValue(node.data || {}),
        intent: getLoopDefinitionValue(node.data || {}),
        body: getLoopBodyValue(node.data || {}),
        exitRule: getLoopExitRuleValue(node.data || {}),
        agentNotes: getLoopAgentNotesValue(node.data || {}),
      };
      exportedNode.loopDefinition = exportedNode.loop.intent;
      exportedNode.exitMode = getLoopStopModeValue(node.data || {});
      exportedNode.exitConditions = getLoopStopConditionsValue(node.data || {});
    }
    nodes.push(exportedNode);

    for (const outKey of Object.keys(node.outputs || {})) {
      const fromPort = parseInt(outKey.replace("output_", ""), 10);
      const conns = node.outputs[outKey].connections || [];
      for (const conn of conns) {
        const targetUserId = App.reverseIdMap[conn.node] || ("n" + conn.node);
        const target = home[String(conn.node)];
        const toPort = parseInt(String(conn.output).replace("input_", ""), 10);
        connections.push({
          from: userId,
          fromPort,
          fromRole: getPortRole(node.name, "output", fromPort),
          to: targetUserId,
          toPort,
          toRole: getPortRole(target?.name, "input", toPort),
        });
      }
    }
  }
  return {
    schemaVersion: SCHEMA_VERSION,
    workflowKind: WORKFLOW_KIND,
    name: App.workflowName || DEFAULT_WORKFLOW_NAME,
    nodes,
    connections,
  };
}

function workflowPathFromUrl() {
  try {
    return new URLSearchParams(window.location.search).get("workflow") || "";
  } catch {
    return "";
  }
}

async function serverJson(path, options = {}) {
  const response = await fetch(path, {
    ...options,
    headers: {
      ...(options.body ? { "content-type": "application/json" } : {}),
      ...(options.headers || {}),
    },
  });
  const json = await response.json();
  if (!response.ok || json.ok === false) {
    const message = json.error || (json.errors || []).join("; ") || `HTTP ${response.status}`;
    throw new Error(message);
  }
  return json;
}

async function detectServerMode() {
  try {
    const status = await serverJson("/api/status");
    App.server.connected = true;
    App.server.workspaceRoot = status.workspaceRoot || "";
    App.server.workflowPath = workflowPathFromUrl() || status.workflowPath || "";
    App.server.error = "";
    updatePersistenceStatus();
    return true;
  } catch {
    App.server.connected = false;
    App.server.workflowPath = "";
    updatePersistenceStatus();
    return false;
  }
}

async function loadWorkflowFromServer(path = App.server.workflowPath) {
  if (!App.server.connected || !path) return false;
  const data = await serverJson(`/api/workflow?path=${encodeURIComponent(path)}`);
  App.server.workflowPath = data.workflowPath || path;
  loadFromUserJson(data.workflow, App.server.workflowPath.replace(/\.json$/i, ""));
  markClean();
  toast(`Loaded ${App.server.workflowPath}`, "good");
  return true;
}

async function saveWorkflowToServer(path = App.server.workflowPath) {
  if (!App.server.connected || !path) {
    downloadJson();
    return false;
  }
  if (App.server.saving) return false;
  App.server.saving = true;
  updatePersistenceStatus();
  try {
    const data = await serverJson(`/api/workflow?path=${encodeURIComponent(path)}`, {
      method: "PUT",
      body: JSON.stringify(exportUserJson()),
    });
    App.server.workflowPath = data.workflowPath || path;
    markClean();
    toast(`Saved ${App.server.workflowPath}`, "good");
    return true;
  } catch (error) {
    setPersistenceError(error.message);
    toast("Save failed: " + error.message, "error");
    return false;
  } finally {
    App.server.saving = false;
    updatePersistenceStatus();
  }
}

async function saveWorkflowAs() {
  if (!App.server.connected) {
    downloadJson();
    return;
  }
  const nextPath = prompt("Workspace-relative JSON path", App.server.workflowPath || "workflows/plans/agent-canvas.workflow.json");
  if (!nextPath) return;
  await saveWorkflowToServer(nextPath);
}

async function reloadWorkflowFromServer() {
  if (!App.server.connected) {
    toast("Open with canvasctl to reload from workspace", "error");
    return;
  }
  if (App.server.dirty && !confirm("Reload from disk and discard unsaved changes?")) return;
  try {
    await loadWorkflowFromServer();
  } catch (error) {
    setPersistenceError(error.message);
    toast("Reload failed: " + error.message, "error");
  }
}

async function bootWorkflow() {
  const requestedWorkflow = workflowPathFromUrl();
  const connected = requestedWorkflow ? await detectServerMode() : false;
  if (connected && App.server.workflowPath) {
    try {
      await loadWorkflowFromServer(App.server.workflowPath);
      return;
    } catch (error) {
      setPersistenceError(error.message);
      toast("Server load failed: " + error.message, "error");
    }
  }
  loadFromUserJson(SAMPLE);
  markClean();
}

function downloadJson() {
  const obj = exportUserJson();
  const blob = new Blob([JSON.stringify(obj, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = (obj.name || "workflow").replace(/\W+/g, "_").toLowerCase() + ".json";
  a.click();
  URL.revokeObjectURL(url);
  toast("Downloaded " + a.download, "good");
}

function getCanvasExportBounds(padding = 220) {
  const home = App.editor?.drawflow?.drawflow?.[App.editor.module]?.data || {};
  const ids = Object.keys(home);
  if (!ids.length) return null;

  let left = Infinity;
  let top = Infinity;
  let right = -Infinity;
  let bottom = -Infinity;

  for (const id of ids) {
    const node = home[id];
    const nodeEl = getNodeElement(id);
    const width = Math.max(nodeEl?.offsetWidth || 0, 120);
    const height = Math.max(nodeEl?.offsetHeight || 0, 120);
    left = Math.min(left, node.pos_x);
    top = Math.min(top, node.pos_y);
    right = Math.max(right, node.pos_x + width);
    bottom = Math.max(bottom, node.pos_y + height);
  }

  return {
    left: Math.floor(left - padding),
    top: Math.floor(top - padding),
    width: Math.ceil(right - left + padding * 2),
    height: Math.ceil(bottom - top + padding * 2),
  };
}

function getPngExportScale(bounds) {
  const desiredScale = 2;
  const maxPixelDimension = 16000;
  const maxPixelArea = 120000000;
  const dimensionScale = maxPixelDimension / Math.max(bounds.width, bounds.height);
  const areaScale = Math.sqrt(maxPixelArea / (bounds.width * bounds.height));
  return Math.max(1, Math.min(desiredScale, dimensionScale, areaScale));
}

function createCanvasExportStage(bounds) {
  const source = document.querySelector("#drawflow > .drawflow, #drawflow .precanvas");
  if (!source) throw new Error("Canvas surface not found");

  const stage = document.createElement("div");
  stage.className = "drawflow canvas-export-stage";
  stage.style.cssText = [
    "position:fixed",
    "left:-100000px",
    "top:0",
    `width:${bounds.width}px`,
    `height:${bounds.height}px`,
    "overflow:hidden",
    "pointer-events:none",
    "background:radial-gradient(circle, #d6d2c4 1px, transparent 1px) 0 0/24px 24px, var(--canvas-bg)",
  ].join(";");

  const clone = source.cloneNode(true);
  clone.style.position = "absolute";
  clone.style.left = "0";
  clone.style.top = "0";
  clone.style.width = Math.max(bounds.width, source.scrollWidth || 0) + "px";
  clone.style.height = Math.max(bounds.height, source.scrollHeight || 0) + "px";
  clone.style.transformOrigin = "0 0";
  clone.style.transform = `translate(${-bounds.left}px, ${-bounds.top}px) scale(1)`;
  stage.appendChild(clone);
  document.body.appendChild(stage);
  return stage;
}

function canvasToBlob(canvas) {
  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (blob) resolve(blob);
      else reject(new Error("PNG export failed"));
    }, "image/png");
  });
}

async function downloadCanvasPng() {
  if (!window.html2canvas) {
    toast("PNG renderer is still loading", "error");
    return;
  }

  const bounds = getCanvasExportBounds();
  if (!bounds) {
    toast("Nothing to print", "error");
    return;
  }

  let stage = null;
  try {
    toast("Rendering high-res PNG...", "good");
    stage = createCanvasExportStage(bounds);
    await new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve)));
    const scale = getPngExportScale(bounds);
    const canvas = await html2canvas(stage, {
      backgroundColor: null,
      scale,
      useCORS: true,
      width: bounds.width,
      height: bounds.height,
      windowWidth: bounds.width,
      windowHeight: bounds.height,
      logging: false,
    });
    const blob = await canvasToBlob(canvas);
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    const baseName = (App.workflowName || "workflow").replace(/\W+/g, "_").toLowerCase();
    a.href = url;
    a.download = `${baseName}_canvas_${Math.round(scale * 100)}x.png`;
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    toast("Downloaded " + a.download, "good");
  } catch (err) {
    console.error("PNG export failed", err);
    toast("Couldn't print PNG: " + err.message, "error");
  } finally {
    if (stage) stage.remove();
  }
}

function clearCanvas(silent = false) {
  const wasSyncing = App.syncing;
  App.syncing = true;
  App.editor.clear();
  App.idMap = {};
  App.reverseIdMap = {};
  App.selection.nodes.clear();
  App.selection.connections.clear();
  App.selection.groupDrag = null;
  App.selection.marquee.active = false;
  hideNodeInspector();
  _userIdCounter = 1;
  App.syncing = wasSyncing;
  markDirty();
  if (!silent) updateEmptyState();
}

/* ============================================================
   EMPTY STATE
   ============================================================ */
function updateEmptyState() {
  const hasNodes = Object.keys(App.editor.export().drawflow.Home.data).length > 0;
  document.getElementById("empty-state").classList.toggle("hidden", hasNodes);
}

/* ============================================================
   TOAST
   ============================================================ */
let toastTimer = null;
function toast(message, kind) {
  const el = document.getElementById("toast");
  el.textContent = message;
  el.className = "toast show" + (kind ? " " + kind : "");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => el.classList.remove("show"), 1800);
}

/* ============================================================
   INIT
   ============================================================ */
async function init() {
  const container = document.getElementById("drawflow");
  App.editor = new Drawflow(container);
  App.editor.reroute = true;
  App.editor.reroute_fix_curvature = true;
  App.editor.reroute_width = 8;
  App.editor.curvature = 0.5;
  App.editor.start();

  App.editor.on("nodeCreated", () => {
    updateEmptyState();
    markDirty();
  });
  App.editor.on("nodeRemoved", (dfId) => {
    forgetNodeSelection(dfId);
    updateEmptyState();
    markDirty();
  });
  App.editor.on("nodeMoved", markDirty);
  App.editor.on("connectionCreated", markDirty);
  App.editor.on("connectionRemoved", markDirty);

  buildRibbon();
  wireCanvasTitleEditing();
  wireDropZone();
  wireLabelEditing();
  wireNodeInspector();
  wireObjectSelection();

  document.getElementById("zoom-in").onclick    = () => App.editor.zoom_in();
  document.getElementById("zoom-out").onclick   = () => App.editor.zoom_out();
  document.getElementById("zoom-reset").onclick = () => App.editor.zoom_reset();

  await bootWorkflow();
}

document.addEventListener("DOMContentLoaded", init);
