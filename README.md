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
| 2026-10-22 | [Seventeen observers, one standard](posts/2026-10-22-cie-1931-seventeen-observers/en.md) | The 1931 CIE colour-matching experiment as a case study in compressing deep research into a small, durable interface. Also in [Chinese](posts/2026-10-22-cie-1931-seventeen-observers/zh.md). |
| 2026-09-18 | [One workspace, two shapes](posts/2026-09-18-one-workspace-two-shapes.md) | How shared templates, Porter materialisation, and relative symlinks let this family of repositories open as one workspace or as any single member with identical tooling. |

## Repository Notes

- A post is one Markdown file with a `translationKey`. Language variants of the
  same work share that key and carry `lang: en` or `lang: zh`; the archive lists
  one row per key and each variant links to its siblings. A post folder holds
  its language files and its figures together, so relative image paths stay
  local to the post.
- A folder under `posts/` whose name starts with an underscore is staging
  material: the collection loader skips it, so a raw draft cannot fail the
  schema or reach the archive.
- This repository is a Porter consumer like its siblings: `porter.yaml`
  declares `config: ../tabjs` and links the shared spelling, lint, editor, and
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
