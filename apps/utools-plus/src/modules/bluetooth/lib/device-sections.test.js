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

test('buildDeviceSections promotes favorites and recent devices without duplication', () => {
  const sections = buildDeviceSections(
    [
      { name: 'AirPods K', connected: false, address: '1', type: 'Headphones' },
      { name: 'HUAWEI FreeClip', connected: true, address: '2', type: 'Headphones' },
      { name: 'Keychron K3', connected: false, address: '3', type: 'Keyboard' }
    ],
    {
      favorites: ['1'],
      recentActions: {
        '3': 20,
        '1': 10
      }
    }
  )

  assert.deepEqual(sections, [
    {
      key: 'favorites',
      title: '收藏设备',
      items: [{ name: 'AirPods K', connected: false, address: '1', type: 'Headphones' }]
    },
    {
      key: 'connected',
      title: '已连接',
      items: [{ name: 'HUAWEI FreeClip', connected: true, address: '2', type: 'Headphones' }]
    },
    {
      key: 'available',
      title: '其他设备',
      items: [{ name: 'Keychron K3', connected: false, address: '3', type: 'Keyboard' }]
    }
  ])
})

test('buildDeviceSections supports translated search and connected filtering', () => {
  const sections = buildDeviceSections(
    [
      { name: 'AirPods K', connected: false, address: '1', type: 'Headphones' },
      { name: 'Keychron K3', connected: true, address: '2', type: 'Keyboard' }
    ],
    {
      filter: 'connected',
      query: '键盘'
    }
  )

  assert.deepEqual(sections, [
    {
      key: 'connected',
      title: '已连接',
      items: [{ name: 'Keychron K3', connected: true, address: '2', type: 'Keyboard' }]
    }
  ])
})

test('getDeviceSummaryLabel formats compact Chinese summary copy', () => {
  assert.equal(getDeviceSummaryLabel([]), '没有已配对设备')
  assert.equal(getDeviceSummaryLabel([{ connected: true }, { connected: false }]), '2 台设备，1 已连接')
  assert.equal(
    getDeviceSummaryLabel([{ connected: true }, { connected: false }], { favoriteCount: 1 }),
    '2 台设备，1 已连接，1 收藏'
  )
})
