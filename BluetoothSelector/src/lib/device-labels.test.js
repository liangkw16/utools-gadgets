import test from 'node:test'
import assert from 'node:assert/strict'

import {
  getDeviceActionLabel,
  getDeviceTypeLabel,
  getPowerActionLabel
} from './device-labels.js'

test('getDeviceActionLabel maps connected state to the expected action', () => {
  assert.equal(getDeviceActionLabel({ connected: true }), 'Disconnect')
  assert.equal(getDeviceActionLabel({ connected: false }), 'Connect')
})

test('getPowerActionLabel maps the current power state to a toggle label', () => {
  assert.equal(getPowerActionLabel('on'), 'Turn Off')
  assert.equal(getPowerActionLabel('off'), 'Turn On')
  assert.equal(getPowerActionLabel('unknown'), 'Refresh')
})

test('getDeviceTypeLabel keeps useful minor type labels and falls back cleanly', () => {
  assert.equal(getDeviceTypeLabel('Magic Trackpad'), 'Magic Trackpad')
  assert.equal(getDeviceTypeLabel(''), 'Bluetooth Device')
})
