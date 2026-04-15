const fs = require('node:fs')
const path = require('node:path')
const { spawn, spawnSync } = require('node:child_process')

function getHelperWatchPaths (projectRoot) {
  return [
    path.join(projectRoot, 'public', 'preload', 'native'),
    path.join(projectRoot, 'scripts', 'build-helper.cjs')
  ]
}

function getNpmCommand () {
  return process.platform === 'win32' ? 'npm.cmd' : 'npm'
}

function runBuildHelper (projectRoot, reason = 'startup') {
  console.log(`[dev:utools] Building native helpers (${reason})`)
  const result = spawnSync(
    getNpmCommand(),
    ['run', 'build:helper'],
    {
      cwd: projectRoot,
      stdio: 'inherit'
    }
  )

  if (result.status !== 0) {
    throw new Error(`Native helper build failed during ${reason}`)
  }
}

function startViteDevServer (projectRoot) {
  return spawn(
    getNpmCommand(),
    ['run', 'dev:web'],
    {
      cwd: projectRoot,
      stdio: 'inherit'
    }
  )
}

function main () {
  const projectRoot = path.resolve(__dirname, '..')
  const watchTargets = getHelperWatchPaths(projectRoot)

  runBuildHelper(projectRoot)

  const viteProcess = startViteDevServer(projectRoot)
  const watchers = []
  let rebuildTimer = null
  let rebuilding = false
  let queuedReason = ''

  console.log('[dev:utools] Using public/plugin.json for uTools hot reload')
  console.log('[dev:utools] Reopen the plugin in uTools after changing preload files or plugin metadata')

  function scheduleRebuild (reason) {
    queuedReason = reason
    clearTimeout(rebuildTimer)
    rebuildTimer = setTimeout(() => {
      if (rebuilding) return

      rebuilding = true

      try {
        runBuildHelper(projectRoot, queuedReason)
      } catch (error) {
        console.error(`[dev:utools] ${error.message}`)
      } finally {
        rebuilding = false
      }
    }, 160)
  }

  for (const target of watchTargets) {
    if (!fs.existsSync(target)) continue

    const watcher = fs.watch(
      target,
      {
        recursive: fs.statSync(target).isDirectory()
      },
      (_eventType, filename) => {
        const label = filename ? `${path.basename(target)}/${filename}` : path.basename(target)
        scheduleRebuild(label)
      }
    )

    watchers.push(watcher)
  }

  function cleanup (exitCode = 0) {
    clearTimeout(rebuildTimer)
    for (const watcher of watchers) watcher.close()
    if (!viteProcess.killed) viteProcess.kill('SIGTERM')
    process.exit(exitCode)
  }

  viteProcess.on('exit', code => {
    cleanup(code ?? 0)
  })

  process.on('SIGINT', () => cleanup(0))
  process.on('SIGTERM', () => cleanup(0))
}

if (require.main === module) {
  main()
}

module.exports = {
  getHelperWatchPaths
}
