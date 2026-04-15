import test from 'node:test'
import assert from 'node:assert/strict'

import {
  DEVICE_PREFERENCES_STORAGE_KEY,
  markDeviceUsed,
  normalizeDevicePreferences,
  readDevicePreferences,
  toggleFavoriteAddress,
  writeDevicePreferences
} from './device-preferences.js'

test('normalizeDevicePreferences keeps only stable favorite and recent entries', () => {
  assert.deepEqual(
    normalizeDevicePreferences({
      favorites: ['54:D9:C6:C4:39:28', '', null, '54:D9:C6:C4:39:28', '74:15:F5:15:21:BF'],
      recentActions: {
        '54:D9:C6:C4:39:28': 100,
        '74:15:F5:15:21:BF': 'oops',
        '': 20
      }
    }),
    {
      favorites: ['54:D9:C6:C4:39:28', '74:15:F5:15:21:BF'],
      recentActions: {
        '54:D9:C6:C4:39:28': 100
      }
    }
  )
})

test('toggleFavoriteAddress adds and removes favorite addresses deterministically', () => {
  const added = toggleFavoriteAddress(
    { favorites: ['54:D9:C6:C4:39:28'], recentActions: {} },
    '74:15:F5:15:21:BF'
  )

  assert.deepEqual(added.favorites, ['54:D9:C6:C4:39:28', '74:15:F5:15:21:BF'])

  const removed = toggleFavoriteAddress(added, '54:D9:C6:C4:39:28')
  assert.deepEqual(removed.favorites, ['74:15:F5:15:21:BF'])
})

test('markDeviceUsed records the latest timestamp for the address', () => {
  assert.deepEqual(
    markDeviceUsed(
      {
        favorites: ['54:D9:C6:C4:39:28'],
        recentActions: { '74:15:F5:15:21:BF': 10 }
      },
      '54:D9:C6:C4:39:28',
      42
    ),
    {
      favorites: ['54:D9:C6:C4:39:28'],
      recentActions: {
        '74:15:F5:15:21:BF': 10,
        '54:D9:C6:C4:39:28': 42
      }
    }
  )
})

test('readDevicePreferences falls back cleanly when storage is empty or malformed', () => {
  const emptyStorage = {
    getItem () {
      return null
    }
  }
  const brokenStorage = {
    getItem () {
      return '{'
    }
  }

  assert.deepEqual(readDevicePreferences(emptyStorage), {
    favorites: [],
    recentActions: {}
  })
  assert.deepEqual(readDevicePreferences(brokenStorage), {
    favorites: [],
    recentActions: {}
  })
})

test('writeDevicePreferences saves normalized data under a stable key', () => {
  let writtenKey = ''
  let writtenValue = ''
  const storage = {
    setItem (key, value) {
      writtenKey = key
      writtenValue = value
    }
  }

  writeDevicePreferences({
    favorites: ['54:D9:C6:C4:39:28'],
    recentActions: { '54:D9:C6:C4:39:28': 99 }
  }, storage)

  assert.equal(writtenKey, DEVICE_PREFERENCES_STORAGE_KEY)
  assert.deepEqual(JSON.parse(writtenValue), {
    favorites: ['54:D9:C6:C4:39:28'],
    recentActions: { '54:D9:C6:C4:39:28': 99 }
  })
})
