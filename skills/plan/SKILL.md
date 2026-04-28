---
description: Use when the user asks to use Agent Canvas, plan visually, design a multi-agent workflow, decompose complex work, map dependencies, or create a workflow JSON plan before implementation.
argument-hint: "[goal or workflow path]"
user-invocable: true
---

## Skill activation

Use the local `agent-canvas` CLI for round-tripping work with the editor:

```bash
agent-canvas new workflows/plans/<name>.json       # create a blank plan
agent-canvas open workflows/plans/<name>.json      # open canvas.html in browser
agent-canvas validate workflows/plans/<name>.json  # schema check
agent-canvas summarize workflows/plans/<name>.json # readable summary
```

Then follow the verbatim design contract below.

**Working order:** (1) have the initial ideation conversation with the user
to scope the deliverable and pick a pattern key, (2) read the matching
reference example at the bottom of this file, (3) apply the design recipe
in §7.

---

# Multi-Agent Workflow Design — Instructions

This file is the working contract between Mustafa and Claude for designing multi-agent
parallel/sequential/multi-start workflows. Read it at the start of any new design task.
Update it when we learn something new.

The canvas (`canvas.html`) is the editor. Workflows live as JSON. The JSON drives both:
(a) the visual canvas, and (b) future execution by sub-agents or an SDK.

---

## 1. Output preference

**Default deliverable: a `.json` file** that imports cleanly into `canvas.html`. Do not
fork `canvas.html` itself — keep one editor, many JSON workflows.

**Filename convention:** `<pattern-key>_<topic>.json` — pattern key first so the
*intent* is obvious from `ls`, topic second for human readability. Use kebab-case
within each token and a single underscore between them.

Pattern keys (mapped to the §4 design patterns):

| Key | Pattern | Spec ref |
|---|---|---|
| `single-full` | Single-start, full primitive menu (compact "one of each") | §4.1–4.6 mix |
| `single-loops` | Single-start, iteration-heavy (loops + waits dominant) | §4.3 + §4.6 |
| `multi-islands` | Multi-start, independent islands, no merge | §4.7 |
| `multi-ideation` | Multi-start, divergent framings, no merge | §4.8 |
| `multi-merge` | Multi-start with terminal merge (cross-functional integration) | (future §4.9) |
| `branch-decision` | Branch-centric small demo | §4.4 |
| `trycatch-escalation` | Trycatch-centric small demo | §4.5 |
| `subflow-composition` | Subflow primitive demo | §3 |
| `pipeline` | Real working pipeline, not a pattern demo | (project work) |

Examples: `multi-merge_landing-page.json`, `single-full_dinner-party.json`,
`single-loops_monthly-dining.json`. New patterns get a new key — extend this table
when you invent one.

Never embed the workflow into a cloned HTML. The Import/Export buttons on the canvas
are the round-trip — JSON in, JSON out, edits preserved.

---

## 2. Canvas JSON schema (the contract)

```json
{
  "name": "string — workflow title shown in export",
  "meta": { "...": "optional, canvas ignores it, humans + orchestrators read it" },
  "nodes": [
    {
      "id": "string — unique, semantic preferred (e.g. p3_review)",
      "type": "generic | human | start | end | branch | merge | loop | parallel | trycatch | wait | subflow",
      "label": "short display name (≤ ~24 chars renders cleanly)",
      "x": 0, "y": 0,
      "purposeInstructions": "intent + instructions for this agent — multi-line OK with \\n",
      "inputs":  0,  
      "outputs": 0,
      "loopDefinition": "loop body description (loop nodes only)",
      "stopMode": "any | all (loop nodes only)",
      "stopConditions": [ { "text": "exit condition" } ]
    }
  ],
  "connections": [
    { "from": "nodeId", "fromPort": 1, "to": "nodeId", "toPort": 1 }
  ]
}
```

Important behaviors of `loadFromUserJson`:

- `connections` is required as an array; missing/empty is tolerated.
- `inputs`/`outputs` are optional — port counts auto-grow from connection port indices.
- Anything outside `name`, `nodes`, `connections` is preserved on disk but ignored by
  the canvas. Use `meta` freely.
- Port numbers are **1-based**.
- Unknown node types fall back to `generic`.

---

## 3. Node primitives — full reference

| Type | Default ports | Use for |
|------|--------------|---------|
| `start` | 0 in / 1 out | Pipeline entry point. Multiple `start` nodes = multi-start workflow. |
| `end` | 1 in / 0 out | Termination. Use multiple ends for distinct outcomes (success / escalation / decline). |
| `generic` | 1 in / 1 out | A normal agent / step. Most nodes are this. Rename via `label`. |
| `human` | 1 in / 1 out | Active human work: decide, write, review, choose, or provide input inside the workflow. |
| `parallel` | 1 in / 3+ out | Fan-out. Outputs grow as you add connections. Each output is independent. |
| `merge` | 2+ in / 1 out | Fan-in. Inputs grow as connections target it. Waits for all inputs. |
| `branch` | 1 in / 2 out | Conditional split. Output 1 = first branch, output 2 = second branch. |
| `loop` | 2 in / 2 out | Iteration. **Ports: in_1 = entry, in_2 = return-from-body, out_1 = loop-to-body, out_2 = done-exit.** Carries `loopDefinition`, `stopMode`, `stopConditions`. |
| `trycatch` | 1 in / 2 out | Error wrapping. Output 1 = ok path, output 2 = error path. Pair with a separate `end` for the error branch. |
| `wait` | 1 in / 1 out | Passive pause: stop for approval, a timer, an external event, or another release signal. |
| `subflow` | 1 in / 1 out | Visual marker for a referenced sub-graph. Currently no actual nesting; just signals composition. |

**Human vs. wait.** Use `human` when a person actively performs work in the
workflow: decide, write, review, choose, provide input, facilitate, or synthesize.
Use `wait` when the workflow simply pauses until approval, a timer, an external
event, or another release signal arrives.

**Connecting a loop properly:**

```
upstream → loop.in_1
loop.out_1 → body.in_1     (optional — only if you model the body explicitly)
body.out_1 → loop.in_2     (optional return edge)
loop.out_2 → downstream    (this is the "done" exit, ALWAYS use port 2 here)
```

If you don't model the body, connect only `in_1` and `out_2`. The canvas will render
the loop with its special icon and its `loopDefinition` + `stopConditions` carry the
intent.

**Trycatch wiring:**

```
upstream → trycatch.in_1
trycatch.out_1 → ok_continuation
trycatch.out_2 → error_handler_or_end
```

---

## 4. Design patterns (with shape sketches)

### 4.1 Sequential chain
```
A → B → C → D
```
Use when each step depends on the prior one. Default for protocol/setup phases.

### 4.2 Parallel fan-out / fan-in
```
        ┌──▶ B1 ──┐
A ─▶ par┼──▶ B2 ──┼─▶ merge ─▶ C
        └──▶ B3 ──┘
```
Use when sub-tasks are independent. Every B that fans out must reconverge at a merge
unless the branches truly run forever or terminate at their own ends.

### 4.3 Loop with body
```
upstream ─▶ [loop] ──out_1─▶ body ──in_2─▶ (back to loop)
              │
              out_2 (done) ─▶ downstream
```
Always set `stopConditions`. If the loop runs over a collection, say so: "iterates
over every X". If it's bounded by quality/time, list those bounds explicitly.

### 4.4 Branch with merge
```
                  ┌─▶ accept_path ─┐
A ─▶ B ─▶ branch ─┤                 ├─▶ merge ─▶ end
                  └─▶ reject_path ─┘
```
Two-way decision. For more than two paths, chain branches or use a parallel that
fans out to multiple end nodes (when paths don't reconverge).

### 4.5 Trycatch with escalation end
```
A ─▶ trycatch ─out_1─▶ B ─▶ continue
         │
         out_2 (error) ─▶ end_escalate
```
Use sparingly — only where genuine error paths exist (incident triage, validation
failures, external-service failures).

### 4.6 Human task or wait gate
Active human work:
```
A ─▶ human("Mustafa reviews strategy") ─▶ B
```

Passive wait gate:
```
A ─▶ wait("Sponsor approval") ─▶ B
```
Use `human` when the person is doing work that belongs in the workflow. Use
`wait` when the agent must stop until someone or something releases the next step.
For waits, the label should name *who* approves and *what* they're approving.

### 4.7 Multi-start (independently launchable sub-pipelines)
```
start_A ─▶ par ─▶ ... ─▶ merge ─▶ branch ─▶ end_A1
                                  └────▶ end_A2

start_B ─▶ par ─▶ ... (entirely separate sub-graph)
```
**Use multi-start when:**
- Sub-pipelines have no inter-dependencies and ship at different cadences.
- Different humans/agents own different starts.
- One pipeline can be paused or cancelled without blocking the others.
- The deliverables are distinct (or merge much later, outside the workflow).

**Don't use multi-start when:**
- The "branches" actually depend on a shared upstream — that's a single-start
  workflow with a parallel fan-out.
- You want a single shared status / progress view.

A multi-start workflow can have multiple independent end nodes, no shared merge,
and no lines between sub-graphs. The canvas renders them as separate islands.

### 4.8 Multi-start with diverse ideation (parallel angles on one question)

Sometimes the reason for multiple starts isn't ownership or cadence (§4.7) — it's
that you deliberately want **N agents working the same problem from different
angles** so the combined output is richer than any single chain. Each start
carries its own framing and runs its own pipeline; outputs are compared by a
human (or a later merge agent) once all sides are in.

Use this when one perspective would underfit the question: literature reviews
where theory is contested, strategy briefs, design crits, hypothesis generation,
anything with genuinely competing framings. The point is **divergence by
construction** — not redundancy.

**Example A — Theoretical-lens triangulation (research)**
```
start_socialcog   ─▶ search ─▶ synth ─▶ critique ─▶ end_socialcog
start_behaviorist ─▶ search ─▶ synth ─▶ critique ─▶ end_behaviorist
start_systems     ─▶ search ─▶ synth ─▶ critique ─▶ end_systems
```
Three starts, one research question. Each `start.label` names the lens
("Social-cognitive lens", "Behaviorist lens", "Systems lens") and its
`purposeInstructions` seeds the entire sub-pipeline with that frame. The
chains use the same primitives but the seeded prompts make them produce
divergent reads. Comparison is the deliverable.

**Example B — Hat-based ideation (decision/design review)**
```
start_optimist   ─▶ analyze ─▶ recommend ─▶ end_optimist
start_skeptic    ─▶ analyze ─▶ recommend ─▶ end_skeptic
start_integrator ─▶ analyze ─▶ recommend ─▶ end_integrator
start_contrarian ─▶ analyze ─▶ recommend ─▶ end_contrarian
```
Same brief, four roles. Each start's `purposeInstructions` is *explicit and
one-sided*: "Argue every strength as if the proposal already won." / "Find
every reason it dies in production." / "Reconcile the prior two." / "Attack
the framing itself." Drift between agents is the feature; do not soften the
prompts toward neutrality.

**Example C — Mechanism-pathway exploration (meta-analysis flavor)**
```
start_motivation ─▶ moderator search ─▶ evidence assembly ─▶ end_motivation
start_learning   ─▶ moderator search ─▶ evidence assembly ─▶ end_learning
start_affect     ─▶ moderator search ─▶ evidence assembly ─▶ end_affect
```
Same focal effect (e.g., feedback → performance), three competing mediating
mechanisms. Each start lays out its mechanism's predictions, then its chain
gathers and codes evidence specific to that pathway. Terminates without a
workflow-level merge — synthesis happens in the paper's discussion, not in
the JSON.

**Documenting it in `meta`.** This pattern doesn't fit `independentBranchPoints`
(which describes intra-pipeline fan-outs from a single start). Use a separate
`ideationStarts` field so a future orchestrator knows these starts share a
question but require *different* seed prompts:

```json
"ideationStarts": [
  {
    "starts": ["start_motivation", "start_learning", "start_affect"],
    "sharedQuestion": "What mediates feedback → performance?",
    "framings": {
      "start_motivation": "expectancy / goal-setting pathway",
      "start_learning":   "skill acquisition / error-correction pathway",
      "start_affect":     "emotion regulation / spillover pathway"
    },
    "comparison": "narrative synthesis in paper §4 — no JSON-level merge"
  }
]
```

**Don't confuse this with §4.2 parallel fan-out.** A `parallel` node fans out
*one* input to many workers — same prompt, parallel execution, then merge.
Multi-start ideation seeds *different* prompts at separate entry points and
typically does **not** merge inside the workflow. If a future orchestrator
dispatches an ideation multi-start, it must read each start's framing and
launch each agent with its own seed prompt — never broadcast a single prompt
across the starts.

---

## 5. Layout conventions

The canvas accepts arbitrary `x`/`y`. Be consistent:

- **Trunk runs left-to-right.** Default trunk y = 500.
- **x-step between sequential nodes:** 180 px.
- **y-step between parallel siblings:** 110–130 px.
- **Parallel fan-out:** stack siblings symmetrically around the trunk y. With 5
  siblings on trunk y=500, use y = 200, 320, 440 (trunk = 440 in this case for
  symmetry), 560, 680, 800. Pick a baseline that keeps the merge target on the
  trunk.
- **Multi-start sub-graphs:** stack vertically with ~400 px between the trunk-y
  of each sub-graph, so they don't visually crash.
- **Phase blocks:** if you mark phase headers (P0, P1, ...) into labels, leave a
  visible gap (~60 px extra x) between phases so the eye can chunk them.

Don't obsess over pixel-perfection — the user can rearrange in the canvas. Aim for
"readable on first import."

---

## 6. The `meta` block

Always include `meta` — the canvas ignores it, but humans and orchestrators rely on it.

Recommended fields:

```json
"meta": {
  "author": "Mustafa Akben",
  "topic": "short description",
  "phases": ["P0 Discovery", "P1 Search", "..."],
  "independentBranchPoints": [
    {
      "after": "p1_fan",
      "branches": ["p1_wos", "p1_scopus", "..."],
      "note": "describe why these are independent and how to dispatch"
    }
  ],
  "iterativeLoops": [
    { "node": "p7_revise", "iteratesOver": "revision rounds", "exitWhen": "..." }
  ],
  "humanInTheLoop": ["p4_advisor", "p0_sponsor"],
  "totalNodes": 66,
  "totalConnections": 91
}
```

`independentBranchPoints` is the most important field — it tells a future
orchestrator (or me, in a later session) where it's safe to dispatch parallel
sub-agents without re-deriving the dependency graph.

`humanInTheLoop` is the compact index of all human touchpoints. A future schema
may split this into active human tasks and passive wait gates, but today the node
type carries that distinction: `human` = active person-does-work step, `wait` =
passive stop-until-released gate.

---

## 7. Workflow design recipe

Apply this whenever a new task arrives.

### Step 1: Scope the deliverable
- What is the user actually trying to produce?
- What does "done" look like?
- Is there a deadline / hard constraint?

### Step 2: Sketch phases (P0, P1, ..., Pn)
- A phase is a coarse unit of work that ends in a checkpoint or artifact.
- Aim for 5–9 phases for a major project, 3–5 for a smaller one.
- Each phase ends with a wait gate, a merge, or hands off cleanly to the next phase.

### Step 3: Decide single-start vs multi-start
- Default to single-start if there's a coherent linear story.
- Choose multi-start when sub-pipelines genuinely run independently and ship on
  different cadences.

### Step 4: Within each phase, decompose into agents
For each agent ask:
- What is its **input**?
- What is its **output**?
- Does it depend on a sibling, or is it independent?

Independent siblings → parallel fan-out + merge.
Dependent siblings → sequential chain.

### Step 5: Identify iteration and decisions
- Anywhere you'd say "for each X, do Y" → that's a loop. Define `stopConditions`.
- Anywhere you'd say "if X then ... else ..." → that's a branch.
- Anywhere you'd say "this could fail and we need to escalate" → that's a trycatch.
- Anywhere a person performs work/input/decision/review → that's a human node.
- Anywhere the system pauses for release/timing/external event → that's a wait.

### Step 6: Lay out coordinates
- Trunk y = 500.
- Sequential: x += 180.
- Parallel siblings: stack around trunk y with 110–130 px spacing.

### Step 7: Write `purposeInstructions` for every node
- Open with a one-sentence statement of intent ("X Agent. Do Y so that Z.").
- Follow with concrete instructions: what to do, what to output, what to avoid.
- Reference real tools/sources/standards by name where it helps the agent be specific.
- Tight: avoid throat-clearing. The agent reads this as its prompt.

### Step 8: Write the `meta` block
- Every parallel fan-out is an `independentBranchPoint`.
- Every loop is in `iterativeLoops`.
- Every human node and every wait gate is in `humanInTheLoop`.

### Step 9: Validate before declaring done
Run the validation checks in §9 below.

### Step 10: Save and report
- Write to `<topic>.json` in the working directory.
- Report: total nodes, total connections, phase summary, primitives used,
  independent branch points, assumptions baked in, and recommended first edits
  for the user.

---

## 8. Heuristics — what to scale up/down

- **5–15 nodes:** small task, single phase or two. Don't over-decompose.
- **30–60 nodes:** medium project (one literature review, one event, one paper).
- **60–100 nodes:** major program (CoP, multi-paper review, multi-track product launch).
- **100+ nodes:** consider splitting into multi-start sub-pipelines — at that scale
  one mega-graph is hostile to read.

If you're tempted to fan out to 7+ siblings, ask whether they're truly all
independent or whether some chain together. Same for merges with 7+ inputs.

If a phase has only one node, ask whether it's really a phase or just a step
within a neighboring phase.

---

## 9. Validation checks (run before declaring done)

After writing the JSON, **always** run:

```bash
node -e "const fs=require('fs'); const j=JSON.parse(fs.readFileSync('PATH','utf8'));
const ids=new Set(j.nodes.map(n=>n.id));
console.log('nodes:',j.nodes.length,'connections:',j.connections.length,'unique ids:',ids.size);
const types={}; j.nodes.forEach(n=>{types[n.type]=(types[n.type]||0)+1}); console.log('types:',types);
let bad=0; for(const c of j.connections){if(!ids.has(c.from)){console.log('bad from:',c.from);bad++} if(!ids.has(c.to)){console.log('bad to:',c.to);bad++}}
console.log('bad refs:',bad);
const empty=j.nodes.filter(n=>!n.purposeInstructions||n.purposeInstructions.length<10).length;
console.log('nodes missing instructions:',empty);"
```

**Pass criteria:**
- `nodes.length === unique ids` (no duplicates).
- `bad refs === 0` (every from/to id exists).
- `nodes missing instructions === 0` for any node that's an actual agent (start
  nodes can have minimal text; everything else should have a real prompt).

**Also eyeball:**
- Every parallel fan-out reaches a merge (or terminates at multiple ends, intentionally).
- Every merge has at least 2 inputs from different upstreams.
- Every loop has both `loopDefinition` and at least one `stopCondition`.
- Every wait has a label that names *who* and *what*.
- Branch outputs are labeled clearly (top vs bottom semantics).

---

## 10. User preferences (Mustafa) — carry forward

These come from working sessions and override defaults.

- **Step-by-step.** Quality drops when rushing. One thing at a time.
- **Confirm scope before substantial work.** A short alignment beats a wrong full draft.
- **JSON > forked HTML.** Keep `canvas.html` untouched; deliver `<topic>.json`.
- **Multi-start when truly independent.** Don't force a single-start narrative
  when sub-pipelines run on different timelines or different owners.
- **`meta` block always.** Especially `independentBranchPoints` for sub-agent dispatch.
- **No sub-agents for data work.** Critical data cleaning, extraction, coding,
  and formatting are done directly. Sub-agents are for scouting, search, and
  writing where divergence is acceptable.
- **Cross-validate critical tasks** when feasible (Opus + GPT-5.4, compare).
- **Plain text for AI detectors.** Strip markdown formatting before sending text
  to detection tools.
- **Minimal code style** when scripts are involved: no classes, no type hints,
  dict payloads, section banners. Match the user's existing scripts.
- **Confirm before launching parallel forks** that consume real tokens/time.

---

## 11. Quick reference — canvas-compatible primitives table

```
generic    1in 1out   normal agent
human      1in 1out   active human task / input / decision / review
start      0in 1out   entry (multiple = multi-start)
end        1in 0out   exit
parallel   1in 3+out  fan-out (auto-grows)
merge      2+in 1out  fan-in (auto-grows)
branch     1in 2out   conditional split
loop       2in 2out   ports: in_1 entry, in_2 return, out_1 body, out_2 done
trycatch   1in 2out   ports: out_1 ok, out_2 error
wait       1in 1out   passive approval / timer / external-event gate
subflow    1in 1out   composition marker (no real nesting)
```

```
connection: { from, fromPort, to, toPort }   // ports are 1-based
```

---

## 12. When to update this file

Update this file at the end of any session where:
- We invented a new pattern that isn't here yet.
- A heuristic from §8 turned out to be wrong.
- A user preference changed or got refined.
- We encountered a canvas behavior that surprised us.

Keep the file tight. If a section grows past ~50 lines, split or compress.

---

## Reference examples (consult after initial ideation)

**When to use this section.** After the initial scoping conversation with the
user (§7 Steps 1–3 — deliverable, phases, single-start vs multi-start),
identify the closest pattern key and **read the matching example file
end-to-end** before sketching your own nodes. Each example is a concrete,
working demonstration of its pattern; anchoring against one cuts iteration
cycles vs. designing from primitives alone.

**How to read an example.** Look for: port wiring on the dominant primitive
(loop, trycatch, branch, parallel/merge), the level of detail in
`purposeInstructions`, how `meta.independentBranchPoints` /
`meta.iterativeLoops` / `meta.humanInTheLoop` get filled out, and the
node/phase count of a known-good shape.

Do not copy structure blindly — the user's intent always wins over the
example's shape. But a five-minute read of a matching example is cheaper
than three rounds of drift correction.

### Pattern → example map

All examples live under `workflows/examples/`. Sizes are nodes / connections.

| Pattern key (§1) | Example file | Size | What it demonstrates |
|---|---|---|---|
| `single-full` | `single-full_dinner-party.json` | 16 / 17 | Compact "one of each" — start, parallel, merge, loop, wait, end across 7 phases of a Saturday dinner party. |
| `single-loops` | `single-loops_monthly-dining.json` | 19 / 21 | Iteration-heavy: 3 loops + 3 wait gates over a one-month family meal plan with split owners. |
| `multi-islands` | `multi-islands_multi-platform-publishing.json` | 22 / 18 | Four genuinely independent chains (Twitter daily / LinkedIn weekly / Newsletter bi-weekly / Blog monthly), 4 starts → 4 ends, no shared merge. |
| `multi-ideation` | `multi-ideation_syllabus-redesign.json` | 15 / 12 | §4.8 in practice: three pedagogical lenses (constructivist / behaviorist / project-based) on the same syllabus, 3 starts → 3 ends, comparison off-canvas. |
| `multi-merge` (small) | `multi-merge_landing-page.json` | 19 / 18 | Three-start cross-functional collab (PM / design / copy) converging at a single merge before launch — minimum viable multi-merge shape. |
| `multi-merge` (large) | `multi-merge_ai-future-of-work-presentation.json` | 64 / 83 | Full-scale multi-merge: 6 starts, 5 phases, 7 parallels + 8 merges + a trycatch — read this when the project needs a major program shape. |
| `branch-decision` | `branch-decision_paper-submission.json` | 9 / 9 | Minimal binary branch (READY vs. REVISE) with rejoin at a merge before sign-off. |
| `trycatch-escalation` | `trycatch-escalation_grant-application.json` | 10 / 9 | NSF grant flow wrapped in a trycatch on funder decision — funded path activates, rejected path runs a postmortem and escalates out. |
| `subflow-composition` | `subflow-composition_course-launch.json` | 10 / 10 | Four `subflow` markers signaling "this step is its own workflow" without nesting — useful when chunks need their own JSON later. |
| `pipeline` (full) | `greenwashing.json` | 66 / 91 | Real working lit-review pipeline across 9 phases — the canonical big single-start with parallel fan-outs, loops, and a human-in-the-loop wait. |
| `pipeline` (compact) | `greenwashing-literature-review-multi-start.json` | 13 / 13 | Slim multi-start lit-review variant — useful as a starting point before scaling up to `greenwashing.json` shape. |
| `cop` (legacy reference) | `cop.json` | (existing) | Community-of-practice workflow kept as the original plugin reference example. |

### Picking which example to read

- **Pattern key obvious from filename convention (§1):** read that file directly.
- **Pattern keyish but you're between two:** read the smaller one first to
  understand the skeleton, then the larger if you need scale.
- **No clean match:** read `single-full_dinner-party.json` for the primitive
  vocabulary, then `greenwashing.json` for what a real pipeline looks like.

### After reading

- Sketch your own nodes following §7 Steps 4–7.
- If your design diverges substantially from the example you read, write a
  one-line note in `meta.note` explaining why — that's how this file (§12)
  learns new patterns.
