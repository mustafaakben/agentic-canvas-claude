export const CURRENT_SCHEMA_VERSION = "0.4";
export const WORKFLOW_KIND = "agentic-coding-sketch";

export const PRIMITIVES = {
  generic: {
    inputs: 1,
    outputs: 1,
    portRoles: { inputs: ["in"], outputs: ["out"] },
  },
  human: {
    inputs: 1,
    outputs: 1,
    portRoles: { inputs: ["in"], outputs: ["out"] },
  },
  start: {
    inputs: 0,
    outputs: 1,
    portRoles: { inputs: [], outputs: ["start"] },
  },
  end: {
    inputs: 1,
    outputs: 0,
    portRoles: { inputs: ["in"], outputs: [] },
  },
  branch: {
    inputs: 1,
    outputs: 2,
    portRoles: { inputs: ["in"], outputs: ["true", "false"] },
  },
  merge: {
    inputs: 2,
    outputs: 1,
    portRoles: { inputs: ["branch_1", "branch_2"], outputs: ["out"] },
  },
  loop: {
    inputs: 2,
    outputs: 2,
    portRoles: { inputs: ["in", "again"], outputs: ["body", "done"] },
  },
  parallel: {
    inputs: 1,
    outputs: 3,
    portRoles: { inputs: ["in"], outputs: ["branch_1", "branch_2", "branch_3"] },
  },
  trycatch: {
    inputs: 1,
    outputs: 2,
    portRoles: { inputs: ["in"], outputs: ["ok", "error"] },
  },
  wait: {
    inputs: 1,
    outputs: 1,
    portRoles: { inputs: ["in"], outputs: ["done"] },
  },
  subflow: {
    inputs: 1,
    outputs: 1,
    portRoles: { inputs: ["in"], outputs: ["done"] },
  },
};

export const PROGRESS_STATUSES = new Set([
  "not_started",
  "planned",
  "in_progress",
  "blocked",
  "needs_review",
  "review_pending",
  "completed",
  "rejected",
  "superseded",
  "error",
]);

export const CLAIM_REVIEW_STATUSES = new Set(["pending", "approved", "rejected"]);
export const EVIDENCE_TYPES = new Set(["command", "file", "diff", "screenshot", "test", "url", "human_note"]);
export const RISK_LEVELS = new Set(["low", "medium", "high"]);

function isPlainObject(value) {
  return !!value && typeof value === "object" && !Array.isArray(value);
}

function cleanString(value, fallback = "") {
  const text = String(value ?? "").trim();
  return text || fallback;
}

function cleanOptionalString(value) {
  const text = cleanString(value);
  return text || undefined;
}

function normalizeNumber(value, fallback = 0) {
  const number = Number(value);
  return Number.isFinite(number) ? number : fallback;
}

function normalizeCount(value, fallback) {
  if (typeof value === "number" || typeof value === "string") {
    const count = Number.parseInt(value, 10);
    return Number.isFinite(count) && count >= 0 ? count : fallback;
  }
  if (isPlainObject(value)) return Object.keys(value).length;
  return fallback;
}

function normalizeStringList(value) {
  if (Array.isArray(value)) {
    return value.map(item => cleanString(item)).filter(Boolean);
  }
  const text = cleanString(value);
  if (!text) return [];
  return text.split(/\r?\n/).map(item => cleanString(item.replace(/^[-*]\s*/, ""))).filter(Boolean);
}

function normalizeObjectList(value) {
  return Array.isArray(value) ? value.filter(isPlainObject).map(item => ({ ...item })) : [];
}

function normalizeStatus(value, fallback = "not_started") {
  const status = cleanString(value).toLowerCase();
  return PROGRESS_STATUSES.has(status) ? status : fallback;
}

function normalizeRiskLevel(value) {
  const level = cleanString(value).toLowerCase();
  return RISK_LEVELS.has(level) ? level : undefined;
}

function normalizeReviewStatus(value) {
  const status = cleanString(value || "pending").toLowerCase();
  return CLAIM_REVIEW_STATUSES.has(status) ? status : "pending";
}

function normalizeEvidenceType(value) {
  const type = cleanString(value).toLowerCase();
  return EVIDENCE_TYPES.has(type) ? type : "human_note";
}

function roleForPort(type, direction, portNumber) {
  const def = PRIMITIVES[type] || PRIMITIVES.generic;
  const list = def.portRoles[direction] || [];
  return list[portNumber - 1] || `${direction === "inputs" ? "input" : "output"}_${portNumber}`;
}

function roleMap(type, direction, count) {
  const result = {};
  for (let i = 1; i <= count; i += 1) result[String(i)] = roleForPort(type, direction, i);
  return result;
}

function normalizeAgent(agent) {
  if (!isPlainObject(agent)) return undefined;
  const normalized = {
    role: cleanString(agent.role),
    intent: cleanString(agent.intent),
    inputs: normalizeStringList(agent.inputs),
    outputs: normalizeStringList(agent.outputs),
    acceptanceCriteria: normalizeStringList(agent.acceptanceCriteria),
    recommendedTools: normalizeStringList(agent.recommendedTools),
    riskLevel: normalizeRiskLevel(agent.riskLevel),
    notes: cleanString(agent.notes),
  };
  const hasValue = Object.entries(normalized).some(([, value]) => (
    Array.isArray(value) ? value.length > 0 : !!value
  ));
  if (!hasValue) return undefined;
  for (const key of Object.keys(normalized)) {
    if (Array.isArray(normalized[key]) && normalized[key].length === 0) delete normalized[key];
    if (normalized[key] == null || normalized[key] === "") delete normalized[key];
  }
  return normalized;
}

function normalizeEvidence(evidence) {
  const item = isPlainObject(evidence) ? evidence : { type: "human_note", value: evidence };
  return {
    type: normalizeEvidenceType(item.type),
    label: cleanString(item.label),
    value: cleanString(item.value ?? item.path ?? item.url ?? item.note),
    result: cleanString(item.result),
    path: cleanString(item.path),
    url: cleanString(item.url),
  };
}

function normalizeClaim(claim, index = 0) {
  const item = isPlainObject(claim) ? claim : { summary: claim };
  const review = isPlainObject(item.review) ? item.review : {};
  return {
    id: cleanString(item.id, `claim-${String(index + 1).padStart(3, "0")}`),
    status: normalizeStatus(item.status, "completed"),
    summary: cleanString(item.summary),
    claimedBy: cleanString(item.claimedBy),
    claimedAt: cleanString(item.claimedAt),
    evidence: Array.isArray(item.evidence) ? item.evidence.map(normalizeEvidence) : [],
    review: {
      status: normalizeReviewStatus(review.status),
      reviewer: cleanString(review.reviewer),
      reviewedAt: cleanString(review.reviewedAt),
      notes: cleanString(review.notes),
    },
  };
}

function normalizeProgress(progress, fallbackStatus) {
  const item = isPlainObject(progress) ? progress : {};
  const normalized = {
    status: normalizeStatus(item.status ?? fallbackStatus),
    owner: cleanString(item.owner),
    updatedAt: cleanString(item.updatedAt),
    claims: Array.isArray(item.claims) ? item.claims.map(normalizeClaim) : [],
  };
  if (!normalized.owner) delete normalized.owner;
  if (!normalized.updatedAt) delete normalized.updatedAt;
  return normalized;
}

function normalizeLoop(node) {
  const loop = isPlainObject(node.loop) ? node.loop : {};
  const normalized = {
    mode: cleanString(loop.mode ?? node.loopMode ?? node._loopMode ?? "custom", "custom"),
    intent: cleanString(loop.intent ?? node.loopIntent ?? node.loopDefinition ?? node._loopDefinition),
    body: cleanString(loop.body ?? node.loopBody ?? node._loopBody),
    exitRule: cleanString(loop.exitRule ?? node.loopExitRule ?? node._loopExitRule),
    agentNotes: cleanString(loop.agentNotes ?? node.loopAgentNotes ?? node._loopAgentNotes),
  };
  for (const key of Object.keys(normalized)) {
    if (normalized[key] === "") delete normalized[key];
  }
  return normalized;
}

function normalizeExitConditions(node) {
  const loop = isPlainObject(node.loop) ? node.loop : {};
  const raw = loop.exitConditions ?? node.exitConditions ?? node.stopConditions ?? node._stopConditions;
  if (!Array.isArray(raw)) return [];
  return raw.map(item => {
    if (typeof item === "string") return { text: cleanString(item) };
    return { text: cleanString(item?.text ?? item?.condition ?? item?.label) };
  }).filter(item => item.text);
}

function normalizeNode(node, index = 0) {
  const raw = isPlainObject(node) ? node : {};
  const type = PRIMITIVES[raw.type] ? raw.type : "generic";
  const def = PRIMITIVES[type];
  let inputs = normalizeCount(raw.inputs ?? raw.inputCount ?? raw.ports?.inputs, def.inputs);
  let outputs = normalizeCount(raw.outputs ?? raw.outputCount ?? raw.ports?.outputs, def.outputs);
  if (type === "loop") {
    inputs = 2;
    outputs = 2;
  }

  const normalized = {
    id: cleanString(raw.id, `n${index + 1}`),
    type,
    label: cleanString(raw.label, type),
    purposeInstructions: cleanString(raw.purposeInstructions ?? raw.purpose ?? raw.instructions),
    progress: normalizeProgress(raw.progress, raw.progressStatus ?? raw.status),
    inputs,
    outputs,
    ports: {
      inputs: roleMap(type, "inputs", inputs),
      outputs: roleMap(type, "outputs", outputs),
    },
    x: Math.round(normalizeNumber(raw.x)),
    y: Math.round(normalizeNumber(raw.y)),
  };

  const agent = normalizeAgent(raw.agent);
  if (agent) normalized.agent = agent;

  if (type === "loop") {
    normalized.loop = normalizeLoop(raw);
    normalized.loopDefinition = normalized.loop.intent || "";
    normalized.exitMode = cleanString(raw.exitMode ?? raw.stopMode) === "all" ? "all" : "any";
    normalized.exitConditions = normalizeExitConditions(raw);
  }

  return normalized;
}

function normalizeConnection(connection) {
  const item = isPlainObject(connection) ? connection : {};
  return {
    from: cleanString(item.from),
    fromPort: Math.max(1, Math.round(normalizeNumber(item.fromPort, 1))),
    fromRole: cleanString(item.fromRole),
    to: cleanString(item.to),
    toPort: Math.max(1, Math.round(normalizeNumber(item.toPort, 1))),
    toRole: cleanString(item.toRole),
  };
}

export function createBlankWorkflow(name = "Untitled") {
  return {
    schemaVersion: CURRENT_SCHEMA_VERSION,
    workflowKind: WORKFLOW_KIND,
    name: cleanString(name, "Untitled"),
    nodes: [],
    connections: [],
  };
}

export function normalizeWorkflow(workflow) {
  if (!isPlainObject(workflow)) throw new Error("Workflow JSON must be an object");
  const nodes = Array.isArray(workflow.nodes) ? workflow.nodes.map(normalizeNode) : [];
  const typeById = new Map(nodes.map(node => [node.id, node.type]));
  const connections = Array.isArray(workflow.connections) ? workflow.connections.map(connection => {
    const normalized = normalizeConnection(connection);
    const fromType = typeById.get(normalized.from) || "generic";
    const toType = typeById.get(normalized.to) || "generic";
    normalized.fromRole ||= roleForPort(fromType, "outputs", normalized.fromPort);
    normalized.toRole ||= roleForPort(toType, "inputs", normalized.toPort);
    return normalized;
  }) : [];

  const normalized = {
    schemaVersion: CURRENT_SCHEMA_VERSION,
    workflowKind: WORKFLOW_KIND,
    name: cleanString(workflow.name, "Untitled"),
    nodes,
    connections,
  };

  if (cleanOptionalString(workflow.owner)) normalized.owner = cleanString(workflow.owner);
  if (cleanOptionalString(workflow.designIntent)) normalized.designIntent = cleanString(workflow.designIntent);
  const runs = normalizeObjectList(workflow.runs);
  if (runs.length) normalized.runs = runs;
  return normalized;
}

export function validateWorkflow(workflow) {
  const errors = [];
  let normalized;
  try {
    normalized = normalizeWorkflow(workflow);
  } catch (error) {
    return { ok: false, errors: [error.message], warnings: [] };
  }

  if (!Array.isArray(workflow?.nodes)) errors.push("workflow must include nodes[]");
  if (!Array.isArray(workflow?.connections)) errors.push("workflow must include connections[]");

  const ids = new Set();
  for (const node of normalized.nodes) {
    if (!node.id) errors.push("node is missing id");
    if (ids.has(node.id)) errors.push(`duplicate node id ${node.id}`);
    ids.add(node.id);
    if (!PRIMITIVES[node.type]) errors.push(`node ${node.id} has unsupported type ${node.type}`);
    if (!Number.isFinite(node.x)) errors.push(`node ${node.id} is missing numeric x`);
    if (!Number.isFinite(node.y)) errors.push(`node ${node.id} is missing numeric y`);
    for (const claim of node.progress.claims || []) {
      if (claim.status === "completed" && claim.evidence.length === 0) {
        errors.push(`node ${node.id} claim ${claim.id} is completed without evidence`);
      }
      for (const evidence of claim.evidence || []) {
        if (!EVIDENCE_TYPES.has(evidence.type)) {
          errors.push(`node ${node.id} claim ${claim.id} has unsupported evidence type ${evidence.type}`);
        }
      }
      if (!CLAIM_REVIEW_STATUSES.has(claim.review.status)) {
        errors.push(`node ${node.id} claim ${claim.id} has unsupported review status ${claim.review.status}`);
      }
    }
  }

  for (const connection of normalized.connections) {
    if (!ids.has(connection.from)) errors.push(`connection references missing from node ${connection.from}`);
    if (!ids.has(connection.to)) errors.push(`connection references missing to node ${connection.to}`);
    if (!Number.isFinite(Number(connection.fromPort)) && !connection.fromRole) {
      errors.push(`connection ${connection.from}->${connection.to} missing fromPort/fromRole`);
    }
    if (!Number.isFinite(Number(connection.toPort)) && !connection.toRole) {
      errors.push(`connection ${connection.from}->${connection.to} missing toPort/toRole`);
    }
  }

  return { ok: errors.length === 0, errors, warnings: [], workflow: normalized };
}

export function addClaimToWorkflow(workflow, nodeId, claim) {
  const normalized = normalizeWorkflow(workflow);
  const node = normalized.nodes.find(item => item.id === nodeId);
  if (!node) throw new Error(`Node not found: ${nodeId}`);
  const claims = node.progress.claims || [];
  const nextClaim = normalizeClaim({
    id: claim?.id || `claim-${Date.now()}`,
    status: claim?.status || "completed",
    summary: claim?.summary,
    claimedBy: claim?.claimedBy,
    claimedAt: claim?.claimedAt || new Date().toISOString(),
    evidence: claim?.evidence || [],
    review: claim?.review || { status: "pending" },
  }, claims.length);
  node.progress.claims = [...claims, nextClaim];
  node.progress.status = claim?.nodeStatus || "needs_review";
  node.progress.updatedAt = new Date().toISOString();
  return normalized;
}

export function reviewClaimInWorkflow(workflow, nodeId, claimId, review) {
  const normalized = normalizeWorkflow(workflow);
  const node = normalized.nodes.find(item => item.id === nodeId);
  if (!node) throw new Error(`Node not found: ${nodeId}`);
  const claim = (node.progress.claims || []).find(item => item.id === claimId);
  if (!claim) throw new Error(`Claim not found: ${claimId}`);
  claim.review = {
    status: normalizeReviewStatus(review?.status),
    reviewer: cleanString(review?.reviewer),
    reviewedAt: review?.reviewedAt || new Date().toISOString(),
    notes: cleanString(review?.notes),
  };
  node.progress.status = claim.review.status === "approved" ? "completed" : node.progress.status;
  node.progress.status = claim.review.status === "rejected" ? "needs_review" : node.progress.status;
  node.progress.updatedAt = new Date().toISOString();
  return normalized;
}
