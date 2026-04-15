const DEVICE_TYPE_LABELS = {
  Headphones: '耳机',
  Headset: '耳麦',
  Keyboard: '键盘',
  Mouse: '鼠标',
  'Magic Trackpad': '触控板',
  Unknown: '蓝牙设备'
}

export function getDeviceActionLabel (device) {
  const power = arguments[1] ?? 'on'
  if (power !== 'on' && !device.connected) return '先打开蓝牙'
  return device.connected ? '断开连接' : '连接'
}

export function getDeviceTypeLabel (type) {
  return DEVICE_TYPE_LABELS[type] || type || '蓝牙设备'
}

export function getDeviceIconLabel (type) {
  if (type === 'Mouse') return '鼠'
  if (type === 'Keyboard') return '键'
  if (type === 'Headphones' || type === 'Headset') return '耳'
  if (type === 'Magic Trackpad') return '触'
  return '蓝'
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

export function getEmptyStateCopy ({
  favoriteCount = 0,
  filter = 'all',
  query = '',
  totalCount = 0,
  visibleCount = 0
}) {
  if (visibleCount > 0) {
    return {
      title: '',
      description: ''
    }
  }

  if (query) {
    return {
      title: '没有找到匹配的设备',
      description: '换个名称、类型或地址再试试。'
    }
  }

  if (filter === 'favorites' && favoriteCount === 0) {
    return {
      title: '还没有收藏设备',
      description: '点一下设备右侧的收藏按钮，常用设备会固定在顶部。'
    }
  }

  if (filter === 'connected') {
    return {
      title: '当前没有已连接设备',
      description: '连接成功的设备会显示在这里。'
    }
  }

  if (totalCount === 0) {
    return {
      title: '还没有已配对设备',
      description: '可以先到系统蓝牙设置里完成配对。'
    }
  }

  return {
    title: '暂时没有可显示的设备',
    description: '可以刷新一次，或者检查蓝牙状态。'
  }
}

export function formatLastUpdatedLabel (timestamp, now = Date.now()) {
  if (!timestamp) {
    return '尚未更新'
  }

  const diff = Math.max(0, now - timestamp)
  if (diff < 60_000) {
    return '刚刚更新'
  }

  const minutes = Math.floor(diff / 60_000)
  return `${minutes} 分钟前更新`
}
