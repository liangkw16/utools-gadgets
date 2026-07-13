const test = require('node:test')
const assert = require('node:assert/strict')
const fs = require('node:fs')
const path = require('node:path')

const nativeHelperFiles = [
  'bluetooth-helper.js',
  'sound-helper.js',
  'wifi-helper.js'
]

test('native helpers use the Electron ASAR-aware child_process module', () => {
  for (const filename of nativeHelperFiles) {
    const source = fs.readFileSync(path.join(__dirname, filename), 'utf8')

    assert.match(source, /require\('child_process'\)/, filename)
    assert.doesNotMatch(source, /require\('node:child_process'\)/, filename)
  }
})
