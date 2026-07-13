const fs = require('node:fs')
const path = require('node:path')
const { spawnSync } = require('node:child_process')

const projectRoot = path.resolve(__dirname, '..')
const outputDir = path.join(projectRoot, 'public', 'preload', 'bin')
const macOSArchitectures = ['arm64', 'x86_64']
const macOSDeploymentTarget = '10.15'
const builds = [
  {
    label: 'bluetooth-helper',
    kind: 'swift',
    sourcePath: path.join(projectRoot, 'public', 'preload', 'native', 'bluetooth-helper.swift'),
    outputPath: path.join(outputDir, 'bluetooth-helper'),
    frameworks: ['Foundation', 'IOBluetooth']
  },
  {
    label: 'sound-helper',
    kind: 'swift',
    sourcePath: path.join(projectRoot, 'public', 'preload', 'native', 'sound-helper.swift'),
    outputPath: path.join(outputDir, 'sound-helper'),
    frameworks: ['CoreAudio', 'Foundation']
  },
  {
    label: 'wifi-helper',
    kind: 'swift',
    sourcePath: path.join(projectRoot, 'public', 'preload', 'native', 'wifi-helper.swift'),
    outputPath: path.join(outputDir, 'wifi-helper'),
    frameworks: ['CoreWLAN', 'Foundation']
  },
  {
    label: 'bluetooth-power',
    kind: 'objective-c',
    sourcePath: path.join(projectRoot, 'public', 'preload', 'native', 'bluetooth-power.m'),
    outputPath: path.join(outputDir, 'bluetooth-power'),
    frameworks: ['Foundation', 'IOBluetooth']
  }
]

function createBuildPlan ({ kind, sourcePath, outputPath, frameworks = [] }) {
  const frameworkArgs = frameworks.flatMap(framework => ['-framework', framework])
  const signStep = {
    command: '/usr/bin/codesign',
    args: ['--force', '--sign', '-', outputPath]
  }

  if (kind === 'swift') {
    const temporaryPaths = macOSArchitectures.map(architecture => `${outputPath}.${architecture}`)
    const compileSteps = macOSArchitectures.map((architecture, index) => ({
      command: '/usr/bin/xcrun',
      args: [
        'swiftc',
        '-O',
        '-target',
        `${architecture}-apple-macosx${macOSDeploymentTarget}`,
        sourcePath,
        ...frameworkArgs,
        '-o',
        temporaryPaths[index]
      ]
    }))

    return {
      steps: [
        ...compileSteps,
        {
          command: '/usr/bin/lipo',
          args: ['-create', ...temporaryPaths, '-output', outputPath]
        },
        signStep
      ],
      temporaryPaths
    }
  }

  if (kind === 'objective-c') {
    return {
      steps: [
        {
          command: '/usr/bin/cc',
          args: [
            '-Wall',
            '-Wextra',
            '-Werror',
            '-arch',
            'arm64',
            '-arch',
            'x86_64',
            `-mmacosx-version-min=${macOSDeploymentTarget}`,
            ...frameworkArgs,
            sourcePath,
            '-o',
            outputPath
          ]
        },
        signStep
      ],
      temporaryPaths: []
    }
  }

  throw new Error(`Unsupported native helper kind: ${kind}`)
}

function runBuildStep ({ command, args }) {
  const result = spawnSync(command, args, { stdio: 'inherit' })

  if (result.status !== 0) {
    const error = new Error(`Native helper command failed: ${command}`)
    error.exitCode = result.status ?? 1
    throw error
  }
}

function buildHelper (build) {
  if (!fs.existsSync(build.sourcePath)) {
    console.warn(`[build-helper] ${build.label} source not found, skipping build`)
    return
  }

  const plan = createBuildPlan(build)
  fs.rmSync(build.outputPath, { force: true })

  try {
    for (const step of plan.steps) {
      runBuildStep(step)
    }
  } finally {
    for (const temporaryPath of plan.temporaryPaths) {
      fs.rmSync(temporaryPath, { force: true })
    }
  }

  fs.chmodSync(build.outputPath, 0o755)
  console.log(`[build-helper] Built ${build.outputPath}`)
}

function main () {
  if (process.platform !== 'darwin') {
    console.log('[build-helper] Skipping helper build on non-macOS platform')
    return
  }

  fs.mkdirSync(outputDir, { recursive: true })

  try {
    for (const build of builds) {
      buildHelper(build)
    }
  } catch (error) {
    process.exit(error.exitCode ?? 1)
  }
}

if (require.main === module) {
  main()
}

module.exports = {
  createBuildPlan
}
