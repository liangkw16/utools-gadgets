const test = require('node:test')
const assert = require('node:assert/strict')

const { buildDistPluginManifest } = require('./plugin-manifest.cjs')

test('buildDistPluginManifest strips development config from distributed plugin metadata', () => {
  const sourceManifest = {
    main: 'index.html',
    preload: 'preload/services.js',
    development: {
      main: 'http://127.0.0.1:5173/index.html'
    },
    features: [
      {
        code: 'bluetooth',
        cmds: ['蓝牙']
      },
      {
        code: 'speaker',
        cmds: ['speaker']
      }
    ]
  }

  const distManifest = buildDistPluginManifest(sourceManifest)

  assert.equal(distManifest.development, undefined)
  assert.equal(distManifest.main, 'index.html')
  assert.deepEqual(distManifest.features, sourceManifest.features)
})
