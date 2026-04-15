const test = require('node:test')
const assert = require('node:assert/strict')

const services = require('./services')

test('services exposes namespaced bluetooth and speaker modules', () => {
  assert.equal(typeof services.bluetooth.openBluetoothSettings, 'function')
  assert.equal(typeof services.speaker.openSoundSettings, 'function')
})
