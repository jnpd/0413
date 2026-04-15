# Claude Code Project Rules

## Skill Scope

Only use skills that exist inside this repository:

- `E:/demo0413/skills/`
- `E:/demo0413/.agents/skills/superpowers/`
- `E:/demo0413/.agents/skills/gstack/`
- `E:/demo0413/.agents/skills/gstack-*/`

Do not use user-level, home-directory, or other external skill directories for this project.

If a matching skill does not exist in the repository-local paths above, work directly from project docs and code. Do not fall back to external skills.

## Priority

1. `AGENTS.md`
2. `REPO_WIKI.md`
3. `docs/`
4. Repository-local skills

## Documentation Truth Rules

- Treat `docs/00-07` as the canonical project doc tree.
- Treat stale old path conventions as wrong unless they match the current `docs/` structure.
- When docs disagree with verified code or config, prefer verified code or config and write back the correction.
