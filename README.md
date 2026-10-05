---
name: readme
type: index
description: Chrono index, repository notes, and reading order
---

# Workspace Chrono

Engineering write-ups about how this workspace is built and operated: the
architecture decisions behind its boundaries, the tooling that materialises
configuration, and the practices that keep a family of independent
repositories consistent.

Read Chrono online at <https://organisation.github.io/chrono/>.

Posts are one Markdown file each under `posts/`.

| Date | Post | Summary |
| --- | --- | --- |
| 2026-09-18 | [One workspace, two shapes](posts/2026-09-18-one-workspace-two-shapes.md) | How shared templates, Porter materialisation, and relative symlinks let this family of repositories open as one workspace or as any single member with identical tooling. |

## Repository Notes

- This repository is a Porter consumer like its siblings: `porter.yaml`
  declares `config: ../jsmap` and links the shared spelling, lint, editor, and
  VS Code configuration; `agents: ../.agents` mounts the shared agent tree.
  Materialise with `porter config`; check for drift with `porter config --dry`.
- Cross-repository links in posts assume the workspace checkout, where
  every member repository sits beside this one.
- Spelling and lint use the shared configuration; run `cspell` and
  `markdownlint-cli2` over changed Markdown before committing.

## Local development

Install the pinned Node.js toolchain with `corepack pnpm install`, then use:

```console
pnpm run dev
pnpm run build
pnpm run preview
```

Astro reads Markdown posts from `posts/`, builds the home page and individual
post pages, and emits a static site in `dist/` for GitHub Pages.
