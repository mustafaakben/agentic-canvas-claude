import { normalizeWorkflow } from "./canvas-schema.mjs";

function nodeText(node) {
  return [node.label, node.purposeInstructions].filter(Boolean).join(" - ");
}

function getOutgoing(workflow) {
  const outgoing = new Map(workflow.nodes.map(node => [node.id, []]));
  for (const connection of workflow.connections) {
    if (!outgoing.has(connection.from)) outgoing.set(connection.from, []);
    outgoing.get(connection.from).push(connection);
  }
  return outgoing;
}

function getIncoming(workflow) {
  const incoming = new Map(workflow.nodes.map(node => [node.id, []]));
  for (const connection of workflow.connections) {
    if (!incoming.has(connection.to)) incoming.set(connection.to, []);
    incoming.get(connection.to).push(connection);
  }
  return incoming;
}

function readingOrder(workflow) {
  const nodeById = new Map(workflow.nodes.map(node => [node.id, node]));
  const outgoing = getOutgoing(workflow);
  const incoming = getIncoming(workflow);
  const remainingIncoming = new Map([...incoming].map(([id, edges]) => [id, edges.length]));
  const queue = workflow.nodes
    .filter(node => node.type === "start" || (remainingIncoming.get(node.id) || 0) === 0)
    .sort((a, b) => (a.x - b.x) || (a.y - b.y) || a.id.localeCompare(b.id));
  const seen = new Set();
  const ordered = [];

  while (queue.length) {
    const node = queue.shift();
    if (!node || seen.has(node.id)) continue;
    seen.add(node.id);
    ordered.push(node);
    for (const edge of outgoing.get(node.id) || []) {
      remainingIncoming.set(edge.to, Math.max(0, (remainingIncoming.get(edge.to) || 0) - 1));
      if ((remainingIncoming.get(edge.to) || 0) === 0 && nodeById.has(edge.to)) {
        queue.push(nodeById.get(edge.to));
      }
    }
    queue.sort((a, b) => (a.x - b.x) || (a.y - b.y) || a.id.localeCompare(b.id));
  }

  for (const node of workflow.nodes) {
    if (!seen.has(node.id)) ordered.push(node);
  }
  return ordered;
}

function acceptanceCriteria(node) {
  return node.agent?.acceptanceCriteria || [];
}

function nodeLine(node) {
  const parts = [`${node.id}`, node.type, node.label].filter(Boolean);
  return parts.join(" | ");
}

export function summarizeWorkflow(input) {
  const workflow = normalizeWorkflow(input);
  const outgoing = getOutgoing(workflow);
  const incoming = getIncoming(workflow);
  const startIds = workflow.nodes
    .filter(node => node.type === "start" || (incoming.get(node.id) || []).length === 0)
    .map(node => node.id);
  return {
    name: workflow.name,
    schemaVersion: workflow.schemaVersion,
    workflowKind: workflow.workflowKind,
    nodeCount: workflow.nodes.length,
    connectionCount: workflow.connections.length,
    startIds,
    readingOrder: readingOrder(workflow).map(node => node.id),
    parallelNodes: workflow.nodes.filter(node => node.type === "parallel"),
    branchNodes: workflow.nodes.filter(node => node.type === "branch" || node.type === "trycatch"),
    mergeNodes: workflow.nodes.filter(node => node.type === "merge"),
    loops: workflow.nodes.filter(node => node.type === "loop"),
    gates: workflow.nodes.filter(node => node.type === "wait" || node.type === "human"),
    ends: workflow.nodes.filter(node => node.type === "end" || (outgoing.get(node.id) || []).length === 0),
  };
}

function section(title, lines) {
  const useful = lines.filter(Boolean);
  if (!useful.length) return "";
  return [`## ${title}`, "", ...useful, ""].join("\n");
}

function bullet(text) {
  return `- ${text}`;
}

function nodeBullets(nodes) {
  return nodes.map(node => bullet(`\`${node.id}\` ${node.label}: ${node.purposeInstructions || node.type}`));
}

export function workflowToMarkdown(input) {
  const workflow = normalizeWorkflow(input);
  const summary = summarizeWorkflow(workflow);
  const ordered = readingOrder(workflow);
  const lines = [
    `# ${workflow.name}`,
    "",
    `Schema: \`${workflow.schemaVersion}\``,
    `Workflow kind: \`${workflow.workflowKind}\``,
    `Nodes: ${workflow.nodes.length}`,
    `Connections: ${workflow.connections.length}`,
    "",
  ];

  lines.push(section("Recommended Reading Order", ordered.map((node, index) => (
    `${index + 1}. \`${node.id}\` ${node.label} (${node.type})`
  ))));

  lines.push(section("Execution Steps", ordered.map((node, index) => {
    const criteria = acceptanceCriteria(node);
    const criteriaText = criteria.length ? ` Acceptance criteria: ${criteria.join("; ")}.` : "";
    const roleText = node.agent?.role ? ` Role: ${node.agent.role}.` : "";
    return `${index + 1}. **${node.label}** (\`${node.id}\`, ${node.type}). ${node.purposeInstructions || "No instructions provided."}${roleText}${criteriaText}`;
  })));

  lines.push(section("Parallel Work", nodeBullets(summary.parallelNodes)));
  lines.push(section("Branches And Error Paths", nodeBullets(summary.branchNodes)));
  lines.push(section("Loops", summary.loops.map(node => {
    const intent = node.loop?.intent || node.loopDefinition || node.purposeInstructions || "Loop intent not specified.";
    const exitRule = node.loop?.exitRule ? ` Exit rule: ${node.loop.exitRule}` : "";
    return bullet(`\`${node.id}\` ${node.label}: ${intent}.${exitRule}`);
  })));
  lines.push(section("Human Gates And Waits", nodeBullets(summary.gates)));

  const criteriaLines = workflow.nodes.flatMap(node => (
    acceptanceCriteria(node).map(item => bullet(`\`${node.id}\` ${item}`))
  ));
  lines.push(section("Acceptance Criteria", criteriaLines));

  lines.push(section("Terminal Nodes", summary.ends.map(node => bullet(`\`${node.id}\` ${nodeText(node) || nodeLine(node)}`))));

  return lines.join("\n").replace(/\n{3,}/g, "\n\n").trim() + "\n";
}

export function workflowToTextSummary(input) {
  const summary = summarizeWorkflow(input);
  return [
    `${summary.name}`,
    `Schema: ${summary.schemaVersion}`,
    `Nodes: ${summary.nodeCount}`,
    `Connections: ${summary.connectionCount}`,
    `Starts: ${summary.startIds.join(", ") || "none"}`,
    `Parallel nodes: ${summary.parallelNodes.map(node => node.id).join(", ") || "none"}`,
    `Loops: ${summary.loops.map(node => node.id).join(", ") || "none"}`,
    `Gates: ${summary.gates.map(node => node.id).join(", ") || "none"}`,
  ].join("\n");
}
