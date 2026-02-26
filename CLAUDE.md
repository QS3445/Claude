# CLAUDE.md

This file provides guidance for AI assistants (Claude and others) working with this repository. It captures the project structure, development workflows, and key conventions to follow.

---

## Repository Overview

**Repository:** QS3445/Claude
**Current state:** Freshly initialized project (as of 2026-02-26)
**Branch:** Development occurs on `claude/claude-md-*` branches; `master` is the primary integration branch.

This repository currently contains minimal scaffolding. As the project grows, update this file to reflect the actual codebase, stack, and workflows.

---

## Git Workflow

### Branch Naming
- AI-assisted branches follow the pattern: `claude/<task-slug>-<session-id>`
- Feature branches: `feature/<description>`
- Bug fixes: `fix/<description>`
- Always develop on the designated branch and never push directly to `master` without a PR.

### Commit Conventions
Write clear, imperative commit messages:
```
Add user authentication module
Fix null pointer in data parser
Update CLAUDE.md with project structure
```

Avoid vague messages like `fix stuff`, `WIP`, or `update`.

### Push Procedure
```bash
git push -u origin <branch-name>
```

If push fails due to network errors, retry with exponential backoff: 2s, 4s, 8s, 16s (max 4 retries).

### Pull Requests
- Open PRs against `master` (or the designated base branch for the task)
- Include a clear description of what changed and why
- Reference any related issues

---

## Project Structure

```
/
├── README.md       # Project title/overview
└── CLAUDE.md       # This file — AI assistant guidance
```

As the project grows, update this tree to reflect real directories (e.g., `src/`, `tests/`, `docs/`, `scripts/`).

---

## Development Setup

> This section should be updated once a tech stack is chosen.

**Steps to expect:**
1. Clone the repository
2. Install dependencies (e.g., `npm install`, `pip install -r requirements.txt`)
3. Copy any environment config (e.g., `cp .env.example .env`)
4. Run the development server or build

---

## Running Tests

> No test infrastructure exists yet. When added, document the commands here.

**Example (to fill in):**
```bash
# Run all tests
npm test

# Run with coverage
npm run test:coverage
```

---

## Linting and Formatting

> No linting configuration exists yet. When added, document the tools and commands here.

**Example (to fill in):**
```bash
# Check linting
npm run lint

# Auto-fix formatting
npm run format
```

---

## Conventions for AI Assistants

### General Principles
- **Read before editing.** Always read a file before modifying it.
- **Minimal changes.** Only make changes that are directly requested or clearly necessary.
- **No over-engineering.** Don't add abstractions, helpers, or error handling for scenarios that don't exist yet.
- **No unsolicited refactoring.** A bug fix does not need surrounding code cleaned up.
- **No new files unless necessary.** Prefer editing existing files over creating new ones.
- **No invented URLs.** Never generate or guess URLs; only use URLs explicitly provided.

### Security
- Never introduce command injection, XSS, SQL injection, or other OWASP Top 10 vulnerabilities.
- Validate input only at system boundaries (user input, external APIs); trust internal code.
- Do not commit secrets, credentials, or `.env` files.

### Code Style
- Follow the conventions already present in the file being edited.
- Do not add docstrings, comments, or type annotations to code you didn't change.
- Only add comments where the logic is not self-evident.

### Reversibility
- Prefer reversible, local actions (editing files, running tests).
- Ask for confirmation before destructive operations: deleting files/branches, force-pushing, resetting hard, dropping data.
- Never use `--no-verify` or skip hooks without explicit user permission.

### Communicating Progress
- Use the `TodoWrite` tool to track multi-step tasks.
- Mark tasks completed immediately after finishing — do not batch completions.
- Keep exactly one task `in_progress` at a time.

---

## Environment Variables

> No environment variables are defined yet. When added, document them here (never their values).

| Variable | Description | Required |
|----------|-------------|----------|
| *(none yet)* | | |

---

## CI/CD

> No CI/CD pipelines are configured yet. When added, document the pipeline stages here.

---

## Updating This File

This file should be kept current. Update it whenever:
- A new technology or framework is added to the stack
- The directory structure changes significantly
- New development workflows or tools are introduced
- Conventions are agreed upon or changed

The goal is that any AI assistant (or new team member) can read this file and get productive quickly.
