const test = require('node:test')
const assert = require('node:assert/strict')

const plugin = require('../plugin.json')

test('plugin metadata exposes switchboard commands', () => {
  assert.equal(plugin.pluginName, 'uTools Plus')
  assert.equal(plugin.platform[0], 'darwin')
  assert.equal(plugin.features.length, 2)
  assert.equal(plugin.features[0].code, 'bluetooth')
  assert.deepEqual(plugin.features[0].cmds, [
    '蓝牙',
    'bluetooth',
    'Bluetooth'
  ])
  assert.equal(plugin.features[1].code, 'speaker')
  assert.deepEqual(plugin.features[1].cmds, [
    '扬声器',
    'speaker',
    '输出设备'
  ])
})
