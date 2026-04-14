const test = require('node:test')
const assert = require('node:assert/strict')

const plugin = require('../plugin.json')

test('plugin metadata exposes a single bluetooth command entry', () => {
  assert.equal(plugin.pluginName, '蓝牙设备')
  assert.equal(plugin.platform[0], 'darwin')
  assert.equal(plugin.features.length, 1)
  assert.equal(plugin.features[0].code, 'bluetooth')
  assert.deepEqual(plugin.features[0].cmds, [
    '蓝牙',
    'bluetooth',
    'Bluetooth Selector'
  ])
})
