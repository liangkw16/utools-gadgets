const test = require('node:test')
const assert = require('node:assert/strict')

const services = require('./services')

test('services exposes namespaced bluetooth and sound modules', () => {
  assert.equal(typeof services.bluetooth.openBluetoothSettings, 'function')
  assert.equal(typeof services.sound.openSoundSettings, 'function')
  assert.equal(typeof services.sound.getSoundSnapshot, 'function')
  assert.equal(typeof services.sound.setDefaultInputDevice, 'function')
  assert.equal(typeof services.sound.setDefaultOutputDevice, 'function')
  assert.equal(typeof services.sound.setOutputVolume, 'function')
  assert.equal(typeof services.sound.setInputVolume, 'function')
  assert.equal(typeof services.sound.setOutputMuted, 'function')
  assert.equal(typeof services.sound.setInputMuted, 'function')
})
