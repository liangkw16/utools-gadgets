import test from 'node:test'
import assert from 'node:assert/strict'

import {
  buildDeviceSections,
  getDeviceSummaryLabel
} from './device-sections.js'

test('buildDeviceSections groups connected devices before available devices', () => {
  const sections = buildDeviceSections([
    { name: 'AirPods K', connected: false, address: '1' },
    { name: 'HUAWEI FreeClip', connected: true, address: '2' },
    { name: 'Keychron K3', connected: false, address: '3' }
  ])

  assert.deepEqual(sections, [
    {
      key: 'connected',
      title: '已连接',
      items: [{ name: 'HUAWEI FreeClip', connected: true, address: '2' }]
    },
    {
      key: 'available',
      title: '其他设备',
      items: [
        { name: 'AirPods K', connected: false, address: '1' },
        { name: 'Keychron K3', connected: false, address: '3' }
      ]
    }
  ])
})

test('getDeviceSummaryLabel formats compact Chinese summary copy', () => {
  assert.equal(getDeviceSummaryLabel([]), '没有已配对设备')
  assert.equal(getDeviceSummaryLabel([{ connected: true }, { connected: false }]), '共 2 台设备，1 台已连接')
})
