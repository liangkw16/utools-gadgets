import test from 'node:test'
import assert from 'node:assert/strict'

import {
  formatLastUpdatedLabel,
  getDeviceActionLabel,
  getDeviceIconLabel,
  getEmptyStateCopy,
  getDeviceTypeLabel,
  getPowerActionLabel,
  getPowerStateLabel
} from './device-labels.js'

test('getDeviceActionLabel maps connected state to the expected action', () => {
  assert.equal(getDeviceActionLabel({ connected: true }), '断开连接')
  assert.equal(getDeviceActionLabel({ connected: false }), '连接')
  assert.equal(getDeviceActionLabel({ connected: false }, 'off'), '先打开蓝牙')
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

test('getDeviceIconLabel returns compact glyph labels for common device types', () => {
  assert.equal(getDeviceIconLabel('Mouse'), '鼠')
  assert.equal(getDeviceIconLabel('Keyboard'), '键')
  assert.equal(getDeviceIconLabel('Headphones'), '耳')
  assert.equal(getDeviceIconLabel('Magic Trackpad'), '触')
  assert.equal(getDeviceIconLabel('Unknown'), '蓝')
})

test('getPowerStateLabel returns compact Chinese state copy', () => {
  assert.equal(getPowerStateLabel('on'), '已开启')
  assert.equal(getPowerStateLabel('off'), '已关闭')
  assert.equal(getPowerStateLabel('unknown'), '未就绪')
})

test('getEmptyStateCopy returns targeted empty messages for common cases', () => {
  assert.deepEqual(
    getEmptyStateCopy({ query: 'airpods', visibleCount: 0, favoriteCount: 1, filter: 'all', totalCount: 2 }),
    {
      title: '没有找到匹配的设备',
      description: '换个名称、类型或地址再试试。'
    }
  )

  assert.deepEqual(
    getEmptyStateCopy({ query: '', visibleCount: 0, favoriteCount: 0, filter: 'favorites', totalCount: 2 }),
    {
      title: '还没有收藏设备',
      description: '点一下设备右侧的收藏按钮，常用设备会固定在顶部。'
    }
  )
})

test('formatLastUpdatedLabel renders friendly refresh timing', () => {
  assert.equal(formatLastUpdatedLabel(null), '尚未更新')
  assert.equal(formatLastUpdatedLabel(95_000, 100_000), '刚刚更新')
  assert.equal(formatLastUpdatedLabel(180_000, 300_000), '2 分钟前更新')
})
