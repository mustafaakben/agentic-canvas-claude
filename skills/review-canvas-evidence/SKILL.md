---
description: Use for adversarial review of Agent Canvas workflows, progress claims, completion status, evidence quality, or readiness before moving to implementation or release.
argument-hint: "<workflow.json>"
---

# Review Canvas Evidence

Use this skill to challenge a workflow or progress state. The goal is to find unsupported claims, missing evidence, weak gates, schema drift, and places where a human or agent could misunderstand the plan.

## Review Flow

1. Validate the workflow:

```bash
agent-canvas validate <workflow.json>
```

2. Inspect claims:

```bash
agent-canvas claims <workflow.json>
```

3. Read the workflow JSON directly when claims or statuses look suspicious.
4. List findings first, ordered by severity.
5. For each finding include:

- severity,
- node ID or file/path reference,
- issue,
- impact,
- recommended fix,
- whether it blocks execution.

## What To Attack

- Completed nodes with no claim evidence.
- Claims marked completed without evidence.
- Approved reviews attached to non-completion claims.
- Human gates that are bypassed.
- Parallel work that actually has shared write scope.
- Loops without stop conditions.
- Missing acceptance criteria for high-risk work.
- Schema fields silently dropped or normalized in a way that changes intent.
- Docs or summaries that disagree with the JSON.

## Review Tone

Be adversarial and concrete. Do not spend time praising the workflow. If there are no blocking findings, say so clearly and still list residual risks or test gaps.

## Useful References

- `SCHEMA.md`
- `AGENT-CANVAS.md`
- `USER-GUIDE.md`
