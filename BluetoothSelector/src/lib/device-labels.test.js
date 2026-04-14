import test from 'node:test'
import assert from 'node:assert/strict'

import {
  getDeviceActionLabel,
  getDeviceTypeLabel,
  getPowerActionLabel,
  getPowerStateLabel
} from './device-labels.js'

test('getDeviceActionLabel maps connected state to the expected action', () => {
  assert.equal(getDeviceActionLabel({ connected: true }), '断开连接')
  assert.equal(getDeviceActionLabel({ connected: false }), '连接')
})

test('getPowerActionLabel maps the current power state to a toggle label', () => {
  assert.equal(getPowerActionLabel('on'), '关闭蓝牙')
  assert.equal(getPowerActionLabel('off'), '打开蓝牙')
  assert.equal(getPowerActionLabel('unknown'), '重新获取状态')
})

test('getDeviceTypeLabel keeps useful minor type labels and falls back cleanly', () => {
  assert.equal(getDeviceTypeLabel('Magic Trackpad'), '触控板')
  assert.equal(getDeviceTypeLabel('Headphones'), '耳机')
  assert.equal(getDeviceTypeLabel(''), '蓝牙设备')
})

test('getPowerStateLabel returns compact Chinese state copy', () => {
  assert.equal(getPowerStateLabel('on'), '已开启')
  assert.equal(getPowerStateLabel('off'), '已关闭')
  assert.equal(getPowerStateLabel('unknown'), '未就绪')
})
