const test = require('node:test')
const assert = require('node:assert/strict')
const path = require('node:path')

const { getHelperWatchPaths } = require('./dev-utools.cjs')

test('getHelperWatchPaths returns helper sources and build script targets', () => {
  const root = '/tmp/bluetooth-selector'

  assert.deepEqual(getHelperWatchPaths(root), [
    path.join(root, 'public', 'preload', 'native'),
    path.join(root, 'scripts', 'build-helper.cjs')
  ])
})
