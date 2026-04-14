const ERROR_MESSAGE_MAP = {
  'Bluetooth services are only available inside uTools on macOS.': '请在 macOS 的 uTools 插件环境中使用。',
  'Bluetooth controller not available': '当前无法访问蓝牙控制器。',
  'Bluetooth power backend unavailable': '当前系统不支持直接切换蓝牙电源。',
  'Bluetooth power selector unavailable': '当前系统不支持直接切换蓝牙电源。',
  'Failed to update Bluetooth power state': '蓝牙开关切换失败，请稍后重试。',
  'Bluetooth device not found': '没有找到这个蓝牙设备。',
  'Bluetooth device is not paired': '这个设备还没有在系统里完成配对。',
  'Failed to connect Bluetooth device': '连接设备失败，请稍后重试。',
  'Bluetooth device did not report connected state in time': '设备连接超时，请稍后再试。',
  'Failed to disconnect Bluetooth device': '断开设备失败，请稍后重试。',
  'Bluetooth device did not disconnect in time': '断开设备超时，请稍后再试。'
}

export function translateBluetoothError (message) {
  if (!message) {
    return '蓝牙操作失败，请稍后重试。'
  }

  if (ERROR_MESSAGE_MAP[message]) {
    return ERROR_MESSAGE_MAP[message]
  }

  if (message.startsWith('Unsupported Bluetooth power state')) {
    return '不支持的蓝牙状态参数。'
  }

  if (message.startsWith('Bluetooth ') && message.includes(' failed for ')) {
    return '蓝牙操作失败，请稍后重试。'
  }

  return message
}
