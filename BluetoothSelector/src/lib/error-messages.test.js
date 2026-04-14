import test from 'node:test'
import assert from 'node:assert/strict'

import { translateBluetoothError } from './error-messages.js'

test('translateBluetoothError maps known helper messages to Chinese copy', () => {
  assert.equal(translateBluetoothError('Failed to connect Bluetooth device'), '连接设备失败，请稍后重试。')
  assert.equal(translateBluetoothError('Bluetooth device not found'), '没有找到这个蓝牙设备。')
})

test('translateBluetoothError falls back cleanly for generic helper errors', () => {
  assert.equal(translateBluetoothError('Bluetooth power-on failed for controller'), '蓝牙操作失败，请稍后重试。')
  assert.equal(translateBluetoothError(''), '蓝牙操作失败，请稍后重试。')
})
