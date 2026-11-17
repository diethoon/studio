# WORKFLOW GATEWAY — REQUIRED PROCEDURE

Applies to every task and branch. Read root AGENTS.md, then all three linked policy documents and relevant nested instructions. Preserve repository-specific build, release, platform, and ownership rules.

## Mandatory preflight
Confirm repository, branch, remote, remote HEAD, local HEAD/divergence, working-tree changes, recent commits, PRs/issues/workflows, handoff notes, nested instructions, task scope, prohibited paths, ownership, and permissions. Record a baseline. Never overwrite uncommitted or another agent's work.

## Evidence and change control
Record claim → evidence/source → confidence/status → action. Preserve original failure evidence before changes. Establish expected behavior independently from authoritative contracts. Make the smallest root-cause fix. No unrelated refactors, force-push, destructive reset, unauthorized merge, release, deployment, production mutation, or secret exposure.

## Completion
Investigate → independently derive expected behavior → implement → focused tests → integration/CI → build/package → retrieve and inspect artifacts → verify final repository state → report. Track async work and parallelize independent tasks. Never leave jobs untracked.

## Exceptions
For genuine credential, permission, quota, hardware, or approval blockers, name exact evidence; finish independent work and do not delegate checks available to the agent.
