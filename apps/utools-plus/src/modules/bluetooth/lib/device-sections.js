import { getDeviceTypeLabel } from './device-labels.js'

export function buildDeviceSections (devices) {
  const options = arguments[1] ?? {}
  const favoriteSet = new Set(options.favorites ?? [])
  const recentActions = options.recentActions ?? {}
  const query = options.query?.trim().toLowerCase() ?? ''
  const filter = options.filter ?? 'all'
  const visibleDevices = devices
    .filter(device => matchesFilter(device, filter, favoriteSet))
    .filter(device => matchesQuery(device, query))
  const favoriteDevices = sortDevices(
    visibleDevices.filter(device => favoriteSet.has(device.address)),
    recentActions
  )
  const connected = sortDevices(
    visibleDevices.filter(device => device.connected && !favoriteSet.has(device.address)),
    recentActions
  )
  const available = sortDevices(
    visibleDevices.filter(device => !device.connected && !favoriteSet.has(device.address)),
    recentActions
  )
  const sections = []

  if (favoriteDevices.length > 0) {
    sections.push({
      key: 'favorites',
      title: '收藏设备',
      items: favoriteDevices
    })
  }

  if (connected.length > 0) {
    sections.push({
      key: 'connected',
      title: '已连接',
      items: connected
    })
  }

  if (available.length > 0) {
    sections.push({
      key: 'available',
      title: connected.length > 0 ? '其他设备' : '设备列表',
      items: available
    })
  }

  return sections
}

export function getDeviceSummaryLabel (devices, options = {}) {
  if (devices.length === 0) {
    return '没有已配对设备'
  }

  const connectedCount = devices.filter(device => device.connected).length
  const favoriteCount = options.favoriteCount ?? 0
  const parts = [`${devices.length} 台设备`, `${connectedCount} 已连接`]

  if (favoriteCount > 0) {
    parts.push(`${favoriteCount} 收藏`)
  }

  return parts.join('，')
}

function sortDevices (devices, recentActions) {
  return [...devices].sort((left, right) => {
    if (left.connected !== right.connected) {
      return left.connected ? -1 : 1
    }

    const leftRecent = recentActions[left.address] ?? 0
    const rightRecent = recentActions[right.address] ?? 0
    if (leftRecent !== rightRecent) {
      return rightRecent - leftRecent
    }

    return left.name.localeCompare(right.name, 'zh-Hans-CN')
  })
}

function matchesFilter (device, filter, favoriteSet) {
  if (filter === 'connected') {
    return device.connected
  }

  if (filter === 'favorites') {
    return favoriteSet.has(device.address)
  }

  return true
}

function matchesQuery (device, query) {
  if (!query) {
    return true
  }

  const haystack = [
    device.name,
    device.address,
    device.type,
    getDeviceTypeLabel(device.type)
  ]
    .filter(Boolean)
    .join(' ')
    .toLowerCase()

  return haystack.includes(query)
}
