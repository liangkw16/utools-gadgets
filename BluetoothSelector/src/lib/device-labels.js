const DEVICE_TYPE_LABELS = {
  Headphones: '耳机',
  Headset: '耳麦',
  Keyboard: '键盘',
  Mouse: '鼠标',
  'Magic Trackpad': '触控板',
  Unknown: '蓝牙设备'
}

export function getDeviceActionLabel (device) {
  return device.connected ? '断开连接' : '连接'
}

export function getDeviceTypeLabel (type) {
  return DEVICE_TYPE_LABELS[type] || type || '蓝牙设备'
}

export function getPowerActionLabel (power) {
  if (power === 'on') return '关闭蓝牙'
  if (power === 'off') return '打开蓝牙'
  return '重新获取状态'
}

export function getPowerDescription (power) {
  if (power === 'on') return '蓝牙已开启'
  if (power === 'off') return '蓝牙已关闭'
  return '暂时无法读取蓝牙状态'
}

export function getPowerStateLabel (power) {
  if (power === 'on') return '已开启'
  if (power === 'off') return '已关闭'
  return '未就绪'
}

export function getConnectionStateLabel (connected) {
  return connected ? '已连接' : '未连接'
}
