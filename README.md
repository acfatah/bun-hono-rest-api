# Hono RESTful API Boilerplate or Template with Bun Runtime

<p>
  <a href="https://bun.sh">
    <img
      alt="bun.sh"
      src="https://img.shields.io/badge/Bun-%23000000.svg?style=flat-square&logo=bun&logoColor=white"></a>
  <a href="https://github.com/antfu/eslint-config">
    <img
      alt="Code Style"
      src="https://antfu.me/badge-code-style.svg"></a>
  <a href="https://github.com/acfatah/bun-hono-rest-api/commits/main">
  <img
    alt="GitHub last commit (by committer)"
    src="https://img.shields.io/github/last-commit/acfatah/bun-hono-rest-api?display_timestamp=committer&style=flat-square"></a>
</p>

This repository offers RESTful API boilerplates or templates for [Hono](https://hono.dev), running on the [Bun](https://bun.sh) runtime.

## Usage

To create a project using this template, make a new directory with your chosen project name, navigate into it, then run the following command:

```bash
bunx --bun tiged acfatah/bun-hono-rest-api/templates/starter
```

Afterwards, you can update and install the latest dependencies with:

```bash
bun update --latest
```

Look under the `templates` directory to see the other available templates.
Replace `/starter` with the template that you want to use.

## Post-install Scripts

By default, `bun` will block all post-install scripts, including `simple-git-hooks`.

To list all blocked scripts, you can run:

```bash
bun pm unstrusted
```

To execute them, run

```bash
bun pm trust --all
```

Alternatively, you can specify each package name individually.
