# CLAUDE.md — AI Assistant Guide for Agentes-

This file provides context and conventions for AI assistants (Claude, Copilot, etc.) working in this repository.

---

## Project Overview

**Agentes-** is a repository focused on AI agent development. This CLAUDE.md will be updated as the codebase evolves.

> Note: This repository is in early initialization. As code is added, this document should be updated to reflect the actual structure, stack, and conventions.

---

## Repository State

- **Status:** Newly initialized — no source code committed yet
- **Remote:** `pschiavoadm-gif/Agentes-`
- **Primary branch:** `main` (or `master`)

---

## Development Workflow

### Branching Convention

- Feature branches: `feature/<short-description>`
- Bug fixes: `fix/<short-description>`
- AI-assisted branches: `claude/<task-description>-<session-id>`
- Never push directly to `main` or `master` without a review

### Commit Messages

Use conventional commits format:

```
<type>(<scope>): <short summary>

[optional body]

[optional footer]
```

Types: `feat`, `fix`, `docs`, `refactor`, `test`, `chore`, `ci`

Examples:
- `feat(agents): add base agent class with tool execution loop`
- `fix(api): handle rate limit errors gracefully`
- `docs: update CLAUDE.md with project structure`

### Git Operations

```bash
# Always push with upstream tracking
git push -u origin <branch-name>

# Fetch specific branches rather than all
git fetch origin <branch-name>
```

---

## Code Conventions

### General

- Prefer clarity over brevity — code is read more than it is written
- Avoid premature abstractions; create helpers only when logic is reused 3+ times
- No commented-out code; use version control instead
- No unused imports or variables

### File Naming

| Context      | Convention              | Example                  |
|-------------|-------------------------|--------------------------|
| Python files | `snake_case.py`         | `base_agent.py`          |
| TypeScript   | `camelCase.ts`          | `agentRunner.ts`         |
| Components   | `PascalCase.tsx`        | `AgentCard.tsx`          |
| Config files | `kebab-case` or dotfile | `agent-config.yaml`      |
| Tests        | `<name>.test.*` or `test_<name>.*` | `test_agent.py` |

### Directory Layout (expected as project grows)

```
Agentes-/
├── CLAUDE.md           # This file
├── README.md           # Project overview for humans
├── .env.example        # Example environment variables (never commit .env)
├── src/                # Main source code
│   ├── agents/         # Agent definitions and logic
│   ├── tools/          # Tool implementations for agents
│   ├── models/         # Data models / schemas
│   └── utils/          # Shared utilities
├── tests/              # All tests, mirroring src/ structure
├── scripts/            # Dev and ops scripts
├── docs/               # Extended documentation
└── config/             # Configuration files
```

---

## Environment & Configuration

- **Never commit secrets** — use `.env` files locally, never tracked by git
- Copy `.env.example` to `.env` and populate values before running
- Use environment variables for all API keys, endpoints, and secrets
- Validate required environment variables at application startup

```bash
cp .env.example .env
# Edit .env with your values
```

---

## Testing

- All new functionality must have corresponding tests
- Tests live in `tests/` mirroring the `src/` directory structure
- Run tests before committing

```bash
# Python
pytest

# Node/TypeScript
npm test
# or
pnpm test
```

- Aim for meaningful coverage, not 100% line coverage at all costs
- Test behavior, not implementation details

---

## Security Practices

- No hardcoded credentials, API keys, or tokens anywhere in the codebase
- Validate all external input at system boundaries
- Avoid `eval()`, `exec()`, or dynamic code execution with untrusted input
- Be careful with agent tool permissions — apply least-privilege principle
- Never log sensitive data (API keys, user PII, auth tokens)

---

## AI Assistant Instructions

When working in this repository:

1. **Read before modifying** — always read a file before editing it
2. **Small, focused changes** — prefer narrow PRs over large refactors
3. **No unnecessary files** — don't create files that aren't needed
4. **Follow existing patterns** — match the style and conventions already present
5. **Update this file** — if you discover new conventions or structures, update CLAUDE.md
6. **Ask before destructive ops** — confirm before deleting files, force-pushing, or dropping data
7. **No over-engineering** — implement only what is explicitly requested

### What to do when the repo is empty

- Do not invent or scaffold a full application without explicit instruction
- Create only files the user has asked for
- If asked to "set up the project," clarify the desired stack and structure first

---

## Updating This File

This file should be updated whenever:

- A new language, framework, or major dependency is added
- Naming conventions or file structure changes
- New development workflows are established
- CI/CD pipelines are configured
- Environment variable requirements change

Keep entries concise and accurate. Outdated information is worse than no information.
