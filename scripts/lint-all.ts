#!/usr/bin/env bun

import type { Dirent } from 'node:fs'
import Bun from 'bun'
import process from 'node:process'
import { join } from 'pathe'
import { readDir } from './utils'

const TARGET_DIRS = ['templates']
const LINT_SCRIPT = 'lint'
const FORMAT_SCRIPT = 'format'

const args = Bun.argv.slice(2)
const fix = args.includes('--fix')
const staged = args.includes('--staged')

/** Script names that can be used to lint an app. */
type LintScript
  = | typeof LINT_SCRIPT
    | typeof FORMAT_SCRIPT
    | `${typeof LINT_SCRIPT}:staged`
    | `${typeof FORMAT_SCRIPT}:staged`

/**
 * Lints a single application directory by spawning a Bun process to run the specified lint script.
 */
async function lintApp(
  dirent: Dirent,
  scriptName: LintScript,
): Promise<void> {
  const debug = args.includes('--debug')

  const path = join(dirent.parentPath, dirent.name)
  console.log(`Linting "${path}" using script "${scriptName}"`)

  const runArgs = ['bun', 'run', scriptName]
  const extraArgs: string[] = []

  if (debug)
    extraArgs.push('--debug')

  if (extraArgs.length > 0)
    runArgs.push('--', ...extraArgs)

  const proc = Bun.spawn(runArgs, {
    cwd: path,
    // Avoid pipe backpressure by inheriting stdio
    stdout: 'inherit',
    stderr: 'inherit',
  })

  const timeoutMs = Number(process.env.LINT_TIMEOUT_MS ?? 10 * 60 * 1000)
  let timedOut = false
  const timer = setTimeout(() => {
    timedOut = true
    try {
      proc.kill()
    }
    catch {}
  }, timeoutMs)

  const exitCode = await proc.exited.finally(() => clearTimeout(timer))

  if (timedOut) {
    console.error(`Linting "${path}" timed out after ${timeoutMs}ms and was killed.`)

    return
  }

  if (exitCode) {
    console.error(`Error linting "${path}" (exit ${exitCode}). See output above.`)
  }
  else {
    console.log(`"${path}" is OK.`)
  }
}

async function getScriptNameIfExists(appPath: string): Promise<LintScript | null> {
  try {
    const pkgFile = Bun.file(join(appPath, 'package.json'))
    const pkgFileExists = await pkgFile.exists()

    if (!pkgFileExists)
      return null

    const raw = await pkgFile.json() as Record<string, unknown>
    if (typeof raw !== 'object' || raw === null)
      return null

    const scripts = (raw as { scripts?: Record<string, string> }).scripts
    if (!scripts || typeof scripts !== 'object')
      return null

    const desired = ((fix ? FORMAT_SCRIPT : LINT_SCRIPT) + (staged ? ':staged' : '')) as LintScript
    const scriptValue = scripts[desired]

    if (
      scriptValue === undefined
      || typeof scriptValue !== 'string'
      || scriptValue.trim().length === 0
    ) {
      return null
    }

    return desired
  }
  catch {
    return null
  }
}

async function main() {
  for (const targetDir of TARGET_DIRS) {
    const dir = await readDir(targetDir, {
      withFileTypes: true,
    })

    for (const dirent of dir) {
      if (!dirent.isDirectory())
        continue

      // skip _ directory
      if (dirent.name === '_')
        continue

      const appPath = join(dirent.parentPath, dirent.name)
      const scriptName = await getScriptNameIfExists(appPath)

      if (!scriptName) {
        console.log(`Skipping "${appPath}": no ${fix ? 'format' : 'lint'} script in package.json`)
        continue
      }

      try {
        await lintApp(dirent, scriptName)
      }
      catch (error) {
        console.error(`Unexpected error while linting "${appPath}":`, error)
      }
    }
  }

  console.log('All linting completed.')
}

void main()
