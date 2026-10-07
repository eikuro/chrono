---
name: One Workspace, Two Shapes
type: post
date: 2026-09-18
description: How one authored copy of every shared file, a configuration compiler, and relative symlinks give a family of independent repositories the consistency of a monorepo and the boundaries of separate components — whichever folder is open.
---

<!-- cspell:ignore coveragerc pyproject pyrightconfig pytest venv -->

# One Workspace, Two Shapes

The workspace can be opened as the single parent folder that holds every
repository, or as any one repository on its own. Both shapes give the same
spelling, formatting, linting, task recipes, editor settings, and agent
configuration — because none of those is configured per repository or per
window. This post describes the machinery: what is authored once, how it is
materialised, and where the boundaries sit.

## Neither a monorepo nor a pile of repositories

A monorepo centralises what we want centralised: one checkout, atomic
cross-component changes, one set of shared defaults, one place to look. It also
centralises what we do not want centralised: pipeline triggers, caches, merge
queues, release coordination, and incident blast radius — and it makes every
agent task start with a relevance decision about a repository-wide graph.

Per-component repositories give explicit owners, isolated releases and
pipelines, and agent work that starts from the component that owns the change.
We took that model and accepted that cross-component work pays an explicit
contract and integration cost. The reasoning and its reopen condition are in
[pymap's decision log](../../pymap/specs/DECISIONS.md#independent-component-repositories-instead-of-a-monorepo)
and [its vision](../../pymap/specs/VISION.md#why-multi-repositories-not-a-monorepo).

What that decision left open is the consistency bill. A dozen repositories each
need a Ruff configuration, a pytest configuration, an editor configuration,
spelling dictionaries, commit hooks, task recipes, and agent instructions. Copy
them by hand and you rebuild the monorepo's worst property — copies that drift
— without any of its benefits.

## One authored copy of everything shared

Three repositories hold the shared material, each file written once:

| Shared surface | Authored in |
| --- | --- |
| Python project configuration — `ruff.toml`, `pyrightconfig.json`, `pytest.ini`, `.coveragerc`, canonical `pyproject.toml` groups — and the `just` recipes | `pymap/` |
| Node.js and VS Code extension configuration, including the editor settings fragments | `jsmap/` |
| Agent instructions, skills, workflows, hooks, and MCP wiring | [`.agents/`](../../.agents/README.md) |

None of them is a runtime dependency. A consumer never imports the template,
and nothing in production requires the template checkout to exist; the
distribution test is that each repository can be cloned, installed, tested, and
released alone ([repository boundaries](../../atlas/WORKSPACE.md#repository-boundaries)).
The template is a build-time input, provided by the operator as a local
checkout beside its consumers.

## Porter materialises, symlinks share

Each consumer declares what it wants from the template in its own
`porter.yaml`: its identity, the template it reads (`config: ../pymap`), and
the declared operations. Porter plans the result, writes atomically, and
reports drift instead of silently repairing it; `porter config --dry` is the
read-only gate and exits non-zero when a repository has fallen out of sync
([manifest compilation](../../porter/specs/FEATURES.md#manifest-compilation)).
Ownership is one-way: a change intended for every repository goes in the
template; a change for one repository goes in its manifest. Generated output is
never hand-edited.

| Operation | Typical outputs | Why it is the right shape |
| --- | --- | --- |
| `symlink` | `.editorconfig`, `.cspell/`, `cspell.config.yaml`, `.markdownlint.yaml`, `.pre-commit-config.yaml`, `.vscode/` | The bytes are identical everywhere and should stay one physical copy; a dictionary entry or a settings change lands in every repository at once. |
| `copy` | `ruff.toml`, `pyrightconfig.json`, `pytest.ini`, `.coveragerc`, `.python-version`, `Dockerfile`, `.gitattributes` | The destination must be a real file. Git never reads a symlinked `.gitattributes`, and a clean checkout should carry the materialised form. |
| `merge` | `pyproject.toml` | Local values (`uv add` results) survive, the template's canonical groups propagate, and an explicit overlay wins ([structured merge](../../porter/specs/FEATURES.md#structured-merge)). |
| `append` | Stable text blocks, added exactly once | A consumer-owned file needs one managed region and no rewrites. |
| Managed `.gitignore` | Template rules above `# Repo-specific Entries`, consumer rules below; Porter records its symlink destinations below the boundary | One rule has one home — shared or repository-specific ([managed `.gitignore`](../../porter/specs/FEATURES.md#managed-gitignore-updates)). |
| `agents` | `AGENTS.md`, `.claude`, `.codex`, `.mcp.json`, `.github/copilot-instructions.md`, `tmp/serena`, `tmp/codebase-memory` | The shared agent tree is mounted, not copied, so one edit lands everywhere ([dedicated agent links](../../porter/specs/FEATURES.md#dedicated-agent-links)). |

The links are materialised on each machine and are not committed: a link
describes local layout, and its target lives in the template checkout. What a
clone receives is the committed output — `pyproject.toml`, `ruff.toml`,
`pytest.ini`, `pyrightconfig.json`, `Dockerfile`, `.gitignore`, `justfile` —
and `porter config` materialises the local view around it.

## Agents ride the same rails

The agent configuration is one tree, mounted into every consumer with
`agents: ../.agents`. Instructions, skills, workflows, hooks, MCP server
declarations, and the editor integration arrive as relative links, so a change
to a skill or a hook is in effect in every repository immediately, in either
workspace shape. Per-repository facts stay per-repository: Porter generates
each `.serena/project.yml` from the manifest's `languages` list, so symbol
tooling knows which language servers this repository needs, and the MCP
configuration binds servers to `${workspaceFolder}` — whichever folder is
open, the servers follow.

## The two shapes

| | Parent folder open | One member open |
| --- | --- | --- |
| VS Code root | The workspace directory, with every repository as a directory | The repository itself |
| Search and references | One index over every repository; Copilot `@`-references reach each member | One component |
| Tooling | Shared links resolve once at the root; the repeated mounts inside members are hidden from the Explorer, search, and the file watcher | The same link files resolve for this repository |
| Runtime | No workspace-level environment; each member keeps its own `.venv` and lock | This repository's `.venv` and lock |
| Agent scope | The whole workspace graph, for work that crosses a contract | The component — its graph, its checks, its tests |

Both shapes load the same editor configuration: a member's `.vscode` is itself
a link to the shared settings inventory, and the parent root composes the same
fragments explicitly — importing `pymap`'s and `jsmap`'s settings files — to
add only what is true of the root itself: workspace-wide hiding of the
duplicated member mounts, and no Python language server, since the root owns no
environment. Consumers type-check from their own environments.

The parent shape is deliberately not a multi-root `.code-workspace`. One root
means one meaning for every path, glob, and configuration lookup; a multi-root
file gives each root its own meaning. The five concrete failures that rule out
multi-root — glob anchoring, Copilot references, agent-configuration loading,
gitignore-based hiding, and extension reloads — are recorded in the
[workspace decision](../../atlas/DECISIONS.md#never-open-workspace-as-a-multi-root-vs-code-workspace).

The switch between shapes is just which folder opens. Nothing inside a
repository changes, because nothing was ever configured for a window.
Dependencies follow the same principle as configuration: the uv cache holds one
stored copy of each package and each repository's environment is a view onto
it, so libraries are shared without sharing an environment
([repo-independent `.venv`](../../pymap/specs/DECISIONS.md#keep-repo-independent-venv-not-a-shared-uv-workspace)).

## What keeps the shapes honest

- **One drift gate.** `porter config --dry` answers "is this repository in sync
  with its declared sources?" for every repository, in either shape, without
  writing. It is a property of the repository, not of the window.
- **One owner per file.** A shared default is edited in the template; a
  repository-specific value is edited in its manifest; generated output is
  edited nowhere. The `.gitignore` boundary turns "where does this rule
  belong?" into a mechanical question with one answer.
- **Committed outputs, local links.** Reproducibility comes from committed
  output; convenience comes from local links. A clean checkout can build and
  test, and the full workspace view is one command away.
- **Explicit edges.** Cross-repository links, like cross-repository changes,
  assume the workspace checkout and say so. No repository's release depends on
  a sibling's presence.

## What it costs

- The template checkout must exist beside the consumers. Porter never clones,
  fetches, or pins it; transport and revision are the operator's decision.
- Tools that refuse symlinks force a copy exception. "Link everything" is not
  the rule; "link where the tool allows it, copy where the artifact must be
  real" is. `.gitattributes` is the canonical counterexample.
- A shared edit is cross-cutting by design. Changing a dictionary or a settings
  fragment changes every consumer at its next `porter config` — that is the
  point, but it means shared edits deserve a workspace-wide dry run.
- The links are machine state, not history. A fresh clone has the committed
  outputs and needs the template plus one command for the full local
  experience.

## The result

Monorepo manners with micro-repository boundaries. In the editor the workspace
reads as one tree — one search, cross-references, one set of commands, one
configuration. In git, CI, and release it is still independent repositories
with independent pipelines and isolated failures, and each agent task can stay
bounded to the component that owns the change. The switch between the two
views is a folder choice, because the consistency never lived in the window in
the first place.
