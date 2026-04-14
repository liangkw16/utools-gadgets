import { useEffect, useState } from 'react'
import BluetoothPowerCard from './components/BluetoothPowerCard'
import DeviceList from './components/DeviceList'
import { translateBluetoothError } from './lib/error-messages'
import { getDeviceSummaryLabel } from './lib/device-sections'

const INITIAL_SNAPSHOT = {
  power: 'unknown',
  devices: []
}

export default function BluetoothPage () {
  const [snapshot, setSnapshot] = useState(INITIAL_SNAPSHOT)
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [busyAddress, setBusyAddress] = useState('')
  const [error, setError] = useState('')

  async function refresh ({ silent = false } = {}) {
    if (!window.services?.getBluetoothSnapshot) {
      setLoading(false)
      setRefreshing(false)
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
      const nextSnapshot = await window.services.getBluetoothSnapshot()
      setSnapshot(nextSnapshot)
    } catch (err) {
      setError(translateBluetoothError(err.message))
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  useEffect(() => {
    refresh()

    if (!window.utools?.onPluginEnter) {
      return
    }

    window.utools.onPluginEnter(() => {
      refresh({ silent: true })
    })
  }, [])

  async function handlePowerToggle (nextPower) {
    setBusyAddress('__power__')
    setError('')

    try {
      await window.services.setBluetoothPower(nextPower)
      notify(nextPower === 'on' ? '蓝牙已打开' : '蓝牙已关闭')
      await refresh({ silent: true })
    } catch (err) {
      const message = translateBluetoothError(err.message)
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
        await window.services.disconnectDevice(device.address)
      } else {
        await window.services.connectDevice(device.address)
      }
      notify(action === 'connect' ? `已连接 ${device.name}` : `已断开 ${device.name}`)
      await refresh({ silent: true })
    } catch (err) {
      const message = translateBluetoothError(err.message)
      setError(message)
      notify(message)
    } finally {
      setBusyAddress('')
    }
  }

  return (
    <main className='page-shell'>
      <div className='page-frame'>
        <BluetoothPowerCard
          busy={busyAddress === '__power__'}
          onRefresh={() => refresh({ silent: true })}
          onToggle={handlePowerToggle}
          power={snapshot.power}
          refreshing={refreshing}
          summary={getDeviceSummaryLabel(snapshot.devices)}
        />
        <DeviceList
          busyAddress={busyAddress}
          devices={snapshot.devices}
          error={error}
          loading={loading}
          onDeviceAction={handleDeviceAction}
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
