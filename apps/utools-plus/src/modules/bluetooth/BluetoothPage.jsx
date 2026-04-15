import {
  useDeferredValue,
  useEffect,
  useEffectEvent,
  useRef,
  useState
} from 'react'
import BluetoothPowerCard from './components/BluetoothPowerCard'
import DeviceList from './components/DeviceList'
import {
  markDeviceUsed,
  readDevicePreferences,
  toggleFavoriteAddress,
  writeDevicePreferences
} from './lib/device-preferences.js'
import { formatLastUpdatedLabel } from './lib/device-labels.js'
import { translateBluetoothError } from './lib/error-messages.js'
import { getDeviceSummaryLabel } from './lib/device-sections.js'

const INITIAL_SNAPSHOT = {
  power: 'unknown',
  devices: []
}

export default function BluetoothPage ({ activationId = 0 }) {
  const searchInputRef = useRef(null)
  const [snapshot, setSnapshot] = useState(INITIAL_SNAPSHOT)
  const [preferences, setPreferences] = useState(() => readDevicePreferences())
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [busyAddress, setBusyAddress] = useState('')
  const [error, setError] = useState('')
  const [query, setQuery] = useState('')
  const [filter, setFilter] = useState('all')
  const [lastUpdatedAt, setLastUpdatedAt] = useState(null)
  const [statusMessage, setStatusMessage] = useState('')
  const deferredQuery = useDeferredValue(query)
  const favoriteCount = snapshot.devices.filter(device => preferences.favorites.includes(device.address)).length

  async function refresh ({ silent = false, announce = false } = {}) {
    if (!window.services?.bluetooth?.getBluetoothSnapshot) {
      setLoading(false)
      setRefreshing(false)
      setStatusMessage('')
      setError('请在 macOS 的 uTools 插件环境中使用。')
      return
    }

    if (silent) {
      setRefreshing(true)
    } else {
      setLoading(true)
    }

    setError('')

    try {
      const nextSnapshot = await window.services.bluetooth.getBluetoothSnapshot()
      setSnapshot(nextSnapshot)
      setLastUpdatedAt(Date.now())
      if (announce) {
        setStatusMessage('设备列表已更新')
      }
    } catch (err) {
      setStatusMessage('')
      setError(translateBluetoothError(err.message))
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  const focusSearchInput = useEffectEvent(() => {
    searchInputRef.current?.focus()
  })

  const handleActivation = useEffectEvent(() => {
    focusSearchInput()
    refresh({ silent: true })
  })

  const handleVisibilityRefresh = useEffectEvent(() => {
    if (!document.hidden) {
      refresh({ silent: true })
    }
  })

  const handleWindowFocus = useEffectEvent(() => {
    refresh({ silent: true })
  })

  useEffect(() => {
    refresh()

    document.addEventListener('visibilitychange', handleVisibilityRefresh)
    window.addEventListener('focus', handleWindowFocus)

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityRefresh)
      window.removeEventListener('focus', handleWindowFocus)
    }
  }, [])

  useEffect(() => {
    if (activationId > 0) {
      handleActivation()
    }
  }, [activationId])

  useEffect(() => {
    writeDevicePreferences(preferences)
  }, [preferences])

  useEffect(() => {
    if (!statusMessage) {
      return
    }

    const timeoutId = window.setTimeout(() => {
      setStatusMessage('')
    }, 3200)

    return () => {
      window.clearTimeout(timeoutId)
    }
  }, [statusMessage])

  async function handlePowerToggle (nextPower) {
    setBusyAddress('__power__')
    setError('')

    try {
      await window.services.bluetooth.setBluetoothPower(nextPower)
      const message = nextPower === 'on' ? '蓝牙已打开' : '蓝牙已关闭'
      setStatusMessage(message)
      notify(message)
      await refresh({ silent: true })
    } catch (err) {
      const message = translateBluetoothError(err.message)
      setStatusMessage('')
      setError(message)
      notify(message)
    } finally {
      setBusyAddress('')
    }
  }

  async function handleDeviceAction (device) {
    const action = device.connected ? 'disconnect' : 'connect'

    setBusyAddress(device.address)
    setError('')

    try {
      if (device.connected) {
        await window.services.bluetooth.disconnectDevice(device.address)
      } else {
        await window.services.bluetooth.connectDevice(device.address)
      }
      setPreferences(currentPreferences => markDeviceUsed(currentPreferences, device.address))
      const message = action === 'connect' ? `已连接 ${device.name}` : `已断开 ${device.name}`
      setStatusMessage(message)
      notify(message)
      await refresh({ silent: true })
    } catch (err) {
      const message = translateBluetoothError(err.message)
      setStatusMessage('')
      setError(message)
      notify(message)
    } finally {
      setBusyAddress('')
    }
  }

  function handleFavoriteToggle (device) {
    const nextFavoriteState = !preferences.favorites.includes(device.address)
    const message = nextFavoriteState ? `已收藏 ${device.name}` : `已取消收藏 ${device.name}`

    setPreferences(currentPreferences => toggleFavoriteAddress(currentPreferences, device.address))
    setStatusMessage(message)
  }

  async function handleOpenSettings () {
    if (!window.services?.bluetooth?.openBluetoothSettings) {
      const message = '当前无法打开系统蓝牙设置。'
      setError(message)
      notify(message)
      return
    }

    try {
      await window.services.bluetooth.openBluetoothSettings()
      const message = '已打开系统蓝牙设置'
      setStatusMessage(message)
      notify(message)
    } catch (err) {
      const message = translateBluetoothError(err.message) || '打开系统蓝牙设置失败。'
      setError(message)
      notify(message)
    }
  }

  return (
    <main className='page-shell'>
      <div className='page-frame'>
        <BluetoothPowerCard
          busy={busyAddress === '__power__'}
          feedback={statusMessage}
          lastUpdatedLabel={formatLastUpdatedLabel(lastUpdatedAt)}
          onOpenSettings={handleOpenSettings}
          onQueryChange={setQuery}
          onRefresh={() => refresh({ silent: true, announce: true })}
          onToggle={handlePowerToggle}
          power={snapshot.power}
          query={query}
          refreshing={refreshing}
          searchInputRef={searchInputRef}
          summary={getDeviceSummaryLabel(snapshot.devices, { favoriteCount })}
        />
        <DeviceList
          busyAddress={busyAddress}
          devices={snapshot.devices}
          error={error}
          favoriteAddresses={preferences.favorites}
          filter={filter}
          loading={loading}
          onDeviceAction={handleDeviceAction}
          onFavoriteToggle={handleFavoriteToggle}
          onOpenSettings={handleOpenSettings}
          power={snapshot.power}
          recentActions={preferences.recentActions}
          visibleQuery={deferredQuery}
        />
      </div>
    </main>
  )
}

function notify (message) {
  if (window.utools?.showNotification) {
    window.utools.showNotification(message)
  }
}
