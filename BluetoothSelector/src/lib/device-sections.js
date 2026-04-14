export function buildDeviceSections (devices) {
  const connected = devices.filter(device => device.connected)
  const available = devices.filter(device => !device.connected)
  const sections = []

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

export function getDeviceSummaryLabel (devices) {
  if (devices.length === 0) {
    return '没有已配对设备'
  }

  const connectedCount = devices.filter(device => device.connected).length
  return `共 ${devices.length} 台设备，${connectedCount} 台已连接`
}
