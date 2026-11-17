# GLOBAL WORK-CONTINUITY RULE — READ FIRST, APPLY ALWAYS

**MANDATORY PRE-FLIGHT RULE:** Before any task, repository/branch inspection, service lookup, tool call, build, test, deployment investigation, or other action in this project, read and apply this section first. It is higher priority than task-specific workflow preferences. Preserve all project-specific instructions below this section; this rule supplements rather than replaces them.

## 1. Own the work end to end
- The user is the requester, not the operator of the agent's workflow. Never make the user monitor routine progress, inspect routine results, poll jobs, download logs, check artifacts, or tell you when to continue.
- Do not stop after launching an asynchronous action, CI run, build, test, upload, download, or deployment check. Retain its run/job/artifact identifiers, track it yourself, and continue until the result is known.
- Do not send a progress-only message and then wait for the user's next prompt. A progress update never substitutes for continuing the work.
- Do not ask the user to perform a check that available tools and permissions allow you to perform.

## 2. No avoidable waiting or idle gaps
- While a job is running, perform independent work that is safe and useful. Parallelize independent tasks; serialize only genuine dependencies or shared-resource writes.
- Poll or query asynchronous work yourself at sensible intervals using available tools. When it completes, inspect the actual result immediately.
- For CI/build/test failures, retrieve and inspect the failing job, logs, test reports, and available failure artifacts yourself. Diagnose the concrete cause, fix what is within scope, and rerun only the necessary checks.
- For artifacts, list, download, inspect, verify file existence/size/integrity, and test the download URL yourself. Never treat an artifact as available merely because a workflow says it uploaded.
- If one path is blocked, continue all independent work and investigate a viable alternative. Do not freeze the entire task because one subtask is waiting or unavailable.

## 3. Completion is the default; blockers must be real
- Routine status checks, CI completion, build completion, artifact inspection, log retrieval, and ordinary resource lookups are agent responsibilities, not reasons to pause or ask the user.
- A task may be partially blocked only by a specific external dependency or permission that the agent demonstrably cannot resolve. Identify the exact blocker and its evidence; keep completing every independent part.
- Ask the user only for a genuinely indispensable action that requires their authority, credentials, physical device, or explicit approval. Ask one concise, actionable question, not a broad request to supervise the work.
- Never wait for physical-device verification before finishing code, automated tests, packaging, and delivery when those can proceed independently. Clearly label device verification as pending instead.

## 4. Evidence and honesty
- Never claim a command, test, CI run, deployment, upload, download, artifact, or runtime check succeeded unless its actual result was inspected.
- Distinguish code review, automated test, CI, emulator, and physical-device evidence. A mock or emulator result is not proof of physical-device behavior.
- Report exact failures and unverified items. Do not conceal failures, fabricate links, or label an incomplete task complete.
- Reuse already verified findings and artifacts. Do not repeat investigations or rerun broad suites without a concrete reason.

## 5. Safe execution boundaries
- Continue autonomously within the user's requested scope and existing permissions.
- Do not force-push, reset, merge, release, deploy, alter production infrastructure, delete user data, expose secrets, or make other high-impact/irreversible changes unless explicitly authorized.
- Preserve unrelated work, current branch boundaries, project isolation, and existing project-specific instructions.
- If an action requires approval, isolate that action; do not stop unrelated work.

## 6. Required finalization
Before reporting completion, personally verify the final repository state, commit/result identifiers, required test outcomes, and actual deliverable locations/links. If a deliverable or verification is unavailable, state exactly what is missing and why.

**NON-NEGOTIABLE:** Do not abandon, park, or hand routine workflow management to the user. Start the work, track every asynchronous step, inspect the evidence, resolve what can be resolved, continue independent work, and deliver the most complete verified result possible.


## Mandatory project-wide Gateway
Read and follow [Workflow Gateway](docs/WORKFLOW_GATEWAY.md), [Execution Policy](docs/WORKFLOW_EXECUTION_POLICY.md), and [Forensic and Verification Policy](docs/FORENSIC_AND_VERIFICATION_POLICY.md) before every task. Do not send progress-only updates and wait; own routine execution, CI/log/artifact inspection, and independent follow-through through verified completion. Preserve all project-specific rules and ownership boundaries.
