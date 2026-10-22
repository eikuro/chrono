---
name: readme
type: index
description: Chrono index, repository notes, and reading order
---

# Chrono

Case studies of engineering judgement: where a boundary belongs, what a model
should refuse to cover, and what evidence makes a decision safe to build on.

Read Chrono online at <https://eikuro.github.io/chrono/>.

Posts are one Markdown file each under `posts/`.

- 2026-10-22 — [Seventeen observers, one standard](posts/2026-10-22-cie-1931-seventeen-observers/en.md)
  ([中文](posts/2026-10-22-cie-1931-seventeen-observers/zh.md)): the 1931 CIE
  colour-matching experiment as a case study in compressing deep research into a
  small, durable interface.

`One workspace, two shapes` is held back (`draft: true`) while its content is
polished; clear the flag to publish it again.

## Repository Notes

- A post is one Markdown file with a `translationKey`. Language variants of the
  same work share that key and carry `lang: en` or `lang: zh`; the archive lists
  one row per key and each variant links to its siblings. A post folder holds
  its language files and its figures together, so relative image paths stay
  local to the post.
- A folder under `posts/` whose name starts with an underscore is staging
  material: the collection loader skips it, so a raw draft cannot fail the
  schema or reach the archive.
- A finished post that needs more work carries `draft: true`. The schema defaults
  it to `false`, and `src/lib/posts.ts` is the single place that filters drafts
  out, so neither the archive nor a post route can publish one by omission.
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
