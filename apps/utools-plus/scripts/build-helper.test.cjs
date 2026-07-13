const test = require('node:test')
const assert = require('node:assert/strict')

const { createBuildPlan } = require('./build-helper.cjs')

test('Swift helper build plan supports Intel and Apple Silicon Macs', () => {
  const plan = createBuildPlan({
    kind: 'swift',
    sourcePath: '/tmp/helper.swift',
    outputPath: '/tmp/helper',
    frameworks: ['Foundation']
  })

  assert.deepEqual(plan.steps, [
    {
      command: '/usr/bin/xcrun',
      args: [
        'swiftc',
        '-O',
        '-target',
        'arm64-apple-macosx10.15',
        '/tmp/helper.swift',
        '-framework',
        'Foundation',
        '-o',
        '/tmp/helper.arm64'
      ]
    },
    {
      command: '/usr/bin/xcrun',
      args: [
        'swiftc',
        '-O',
        '-target',
        'x86_64-apple-macosx10.15',
        '/tmp/helper.swift',
        '-framework',
        'Foundation',
        '-o',
        '/tmp/helper.x86_64'
      ]
    },
    {
      command: '/usr/bin/lipo',
      args: [
        '-create',
        '/tmp/helper.arm64',
        '/tmp/helper.x86_64',
        '-output',
        '/tmp/helper'
      ]
    },
    {
      command: '/usr/bin/codesign',
      args: ['--force', '--sign', '-', '/tmp/helper']
    }
  ])
  assert.deepEqual(plan.temporaryPaths, [
    '/tmp/helper.arm64',
    '/tmp/helper.x86_64'
  ])
})

test('Objective-C helper build plan supports Intel and Apple Silicon Macs', () => {
  const plan = createBuildPlan({
    kind: 'objective-c',
    sourcePath: '/tmp/helper.m',
    outputPath: '/tmp/helper',
    frameworks: ['Foundation', 'IOBluetooth']
  })

  assert.deepEqual(plan.steps, [
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
        '-mmacosx-version-min=10.15',
        '-framework',
        'Foundation',
        '-framework',
        'IOBluetooth',
        '/tmp/helper.m',
        '-o',
        '/tmp/helper'
      ]
    },
    {
      command: '/usr/bin/codesign',
      args: ['--force', '--sign', '-', '/tmp/helper']
    }
  ])
  assert.deepEqual(plan.temporaryPaths, [])
})
