export const DEVICE_PREFERENCES_STORAGE_KEY = 'utools-plus/bluetooth-device-preferences'

const EMPTY_PREFERENCES = Object.freeze({
  favorites: [],
  recentActions: {}
})

export function normalizeDevicePreferences (input) {
  const favorites = []
  const recentActions = {}

  for (const address of input?.favorites ?? []) {
    if (typeof address !== 'string') continue
    const normalizedAddress = address.trim()
    if (!normalizedAddress || favorites.includes(normalizedAddress)) continue
    favorites.push(normalizedAddress)
  }

  for (const [address, timestamp] of Object.entries(input?.recentActions ?? {})) {
    const normalizedAddress = address.trim()
    if (!normalizedAddress || !Number.isFinite(timestamp)) continue
    recentActions[normalizedAddress] = timestamp
  }

  return {
    favorites,
    recentActions
  }
}

export function readDevicePreferences (storage = globalThis.localStorage) {
  if (!storage?.getItem) {
    return EMPTY_PREFERENCES
  }

  try {
    const value = storage.getItem(DEVICE_PREFERENCES_STORAGE_KEY)
    if (!value) {
      return EMPTY_PREFERENCES
    }

    return normalizeDevicePreferences(JSON.parse(value))
  } catch {
    return EMPTY_PREFERENCES
  }
}

export function writeDevicePreferences (preferences, storage = globalThis.localStorage) {
  if (!storage?.setItem) {
    return normalizeDevicePreferences(preferences)
  }

  const normalized = normalizeDevicePreferences(preferences)
  storage.setItem(DEVICE_PREFERENCES_STORAGE_KEY, JSON.stringify(normalized))
  return normalized
}

export function toggleFavoriteAddress (preferences, address) {
  const normalized = normalizeDevicePreferences(preferences)
  const nextAddress = address.trim()

  if (!nextAddress) {
    return normalized
  }

  const favorites = normalized.favorites.includes(nextAddress)
    ? normalized.favorites.filter(item => item !== nextAddress)
    : [...normalized.favorites, nextAddress]

  return {
    favorites,
    recentActions: { ...normalized.recentActions }
  }
}

export function markDeviceUsed (preferences, address, timestamp = Date.now()) {
  const normalized = normalizeDevicePreferences(preferences)
  const nextAddress = address.trim()

  if (!nextAddress || !Number.isFinite(timestamp)) {
    return normalized
  }

  return {
    favorites: [...normalized.favorites],
    recentActions: {
      ...normalized.recentActions,
      [nextAddress]: timestamp
    }
  }
}
