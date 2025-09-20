#!/usr/bin/env bun

import type { Dirent } from 'node:fs'
import Bun from 'bun'
import { join } from 'pathe'
import { readDir } from '../utils'

async function typecheckTemplate(dirent: Dirent): Promise<void> {
  const templatePath = join(dirent.parentPath, dirent.name)

  console.log(`Typechecking "${templatePath}" template...`)

  const proc = Bun.spawn(
    ['bun', 'typecheck'],
    {
      cwd: templatePath,
      stdout: 'pipe',
      stderr: 'pipe',
    },
  )

  const exitCode = await proc.exited

  if (exitCode) {
    const [stderrText, stdoutText] = await Promise.all([
      proc.stderr ? new Response(proc.stderr).text() : Promise.resolve(''),
      proc.stdout ? new Response(proc.stdout).text() : Promise.resolve(''),
    ])

    const message = [stderrText, stdoutText].filter(Boolean).join('\n')

    console.group(`Error typechecking "${templatePath}" (exit ${exitCode}):`)
    if (message) {
      for (const line of message.split(/\r?\n/)) {
        console.error(line)
      }
    }
    else {
      console.error(
        'Process failed with no output. Consider setting stdout to "pipe" or "inherit" in Bun.spawn to capture stack traces.',
      )
    }
    console.groupEnd()
  }
  else {
    console.log(`"${templatePath}" is OK.`)
  }
}

async function main() {
  const dir = await readDir('templates', {
    withFileTypes: true,
  }) as Dirent[]

  const tasks: Promise<void>[] = []

  for (const dirent of dir) {
    if (!dirent.isDirectory())
      continue

    tasks.push(
      typecheckTemplate(dirent),
    )
  }

  try {
    await Promise.all(tasks)
    console.log('All typechecks completed.')
  }
  catch (error) {
    console.error('An error occurred during the typecheck:', error)
  }
}

main()
