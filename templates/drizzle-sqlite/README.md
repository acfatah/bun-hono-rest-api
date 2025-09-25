# Hono RESTful API with bun runtime

<p>
  <a href="https://bun.sh">
    <img
      alt="bun.sh"
      src="https://img.shields.io/badge/Bun-%23000000.svg?style=flat-square&logo=bun&logoColor=white"></a>
  <a href="https://github.com/antfu/eslint-config">
    <img
      alt="Code Style"
      src="https://antfu.me/badge-code-style.svg"></a>
</p>

RESTful API boilerplate using [Hono](https://hono.dev), running on [bun](https://bun.sh), preinstalled with [Drizzle ORM](https://orm.drizzle.team) (sqlite).

## Usage

1. Update and install dependencies

```bash
bun update --latest
```

2. Initialize git,

```bash
git init
```

3. Include the `.vscode` directory in your repository to ensure consistent settings for all developers. Use git add -f `.vscode` to force add it, bypassing any ignore rules.

```bash
git add -f .vscode
```

4. Initialize `simple-git-hooks`,

```bash
rm -rf .git/hooks && bunx --bun simple-git-hooks
```

5. Create initial commit

```bash
git commit -m --no-verify "Initial commit"
```

To start development, run:

```bash
bun run dev
```

then open http://localhost:3000.

> !IMPORTANT
> You need to run `bun db:generate` for the first time to generate drizzle files,
> assuming you already have the schema files.
