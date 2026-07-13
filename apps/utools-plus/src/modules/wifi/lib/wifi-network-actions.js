export function isConnectableWifiNetwork (network) {
  return Boolean(
    network?.ssid &&
    network.available !== false &&
    network.connected !== true
  )
}

export function requiresWifiPassword (network) {
  if (!isConnectableWifiNetwork(network) || network.known) {
    return false
  }

  const security = String(network.security ?? '').toLowerCase()

  if (!security || security === 'none' || security.includes('open') || security.includes('owe')) {
    return false
  }

  return true
}

export function getWifiNetworkActionLabel (network, connectingSsid = '') {
  if (network?.connected) return '已连接'
  if (network?.ssid && network.ssid === connectingSsid) return '连接中'
  return '连接'
}

export function getWifiNetworkListNotice (snapshot) {
  return snapshot?.networkNamesUnavailable
    ? 'macOS 未提供附近网络名称，当前仅显示已保存网络。'
    : ''
}

export function getWifiCurrentNetworkName (snapshot) {
  const ssid = String(snapshot?.current?.ssid ?? '').trim()

  if (ssid && ssid !== '当前网络' && !/^<\s*redacted\s*>$/i.test(ssid)) {
    return ssid
  }

  return snapshot?.current?.connected ? '已连接网络' : ''
}

export function getWifiConnectionErrorMessage (error) {
  const message = String(error?.message ?? error ?? '').toLowerCase()

  if (message.includes('-3905') || message.includes('password')) {
    return 'Wi-Fi 密码可能不正确。'
  }

  if (message.includes('could not be joined') || message.includes('failed to join')) {
    return '无法加入该 Wi-Fi 网络。'
  }

  if (message.includes('not found') || message.includes('no network')) {
    return '没有找到该 Wi-Fi 网络。'
  }

  return '切换 Wi-Fi 失败。'
}
