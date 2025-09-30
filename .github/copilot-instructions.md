# Copilot Instructions

## Coding Style

- Always fix lint errors as the last task, only after all other tasks are completed.
- Use `bun run format [..file]` to format code or files.
- We are using ESLint: `@antfu/eslint-config` via `eslint.config.js`
  - two-space indent
  - single quotes
  - alphabetised imports with `perfectionist/sort-imports`
  - empty line before `return`
- Naming React components/Redux
  - slices use PascalCase
  - hooks/helpers/files use camelCase
  - config keys use UPPER_SNAKE_CASE

## Testing & Verification

- Do not merge Bun.env and process.env. Find where dotenv files are located,
  cd into that directory and run commands from there.
- Start with specific tests near changed code, then broaden.
- Don’t fix unrelated broken tests.

## Documentation or Comments

- Limit lines around 80 characters. Insert line breaks with correct indents so line
  stays between 80 characters.
- Be concise, use bullets.
- Use markdown formatting for code snippets and commands.
- Wrap commands, file paths, env vars, and code identifiers in backticks.
- Use tables in documentation whenever helpful.

## Response & Output Style

- Be concise and friendly; prioritize actionable guidance.
- Use what, why, and how to explain concepts.
- Include tips, gotchas, and common pitfalls; something that need to be aware of.
- Use bullets and short sections for scanability.
- Use tables whenever helpful.
- Use markdown formatting for code snippets and commands.
- Wrap commands, file paths, env vars, and code identifiers in backticks.
- Provide bash-ready commands in fenced blocks when giving steps.
- When editing code, prefer minimal diffs and preserve existing style.
- If you create multiple files or non-trivial code, include a short run/test snippet.
