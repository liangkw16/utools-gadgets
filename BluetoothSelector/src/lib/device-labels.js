export function getDeviceActionLabel (device) {
  return device.connected ? 'Disconnect' : 'Connect'
}

export function getDeviceTypeLabel (type) {
  return type || 'Bluetooth Device'
}

export function getPowerActionLabel (power) {
  if (power === 'on') return 'Turn Off'
  if (power === 'off') return 'Turn On'
  return 'Refresh'
}

export function getPowerDescription (power) {
  if (power === 'on') return 'Bluetooth is on'
  if (power === 'off') return 'Bluetooth is off'
  return 'Bluetooth status unavailable'
}

export function getConnectionStateLabel (connected) {
  return connected ? 'Connected' : 'Not Connected'
}
