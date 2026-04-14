import { useEffect, useState } from 'react'
import BluetoothPowerCard from './components/BluetoothPowerCard'
import DeviceList from './components/DeviceList'

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
      setError('Bluetooth services are only available inside uTools on macOS.')
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
      setError(err.message)
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
      notify(`Bluetooth turned ${nextPower}`)
      await refresh({ silent: true })
    } catch (err) {
      setError(err.message)
      notify(err.message)
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
      notify(`${capitalize(action)}ed ${device.name}`)
      await refresh({ silent: true })
    } catch (err) {
      setError(err.message)
      notify(err.message)
    } finally {
      setBusyAddress('')
    }
  }

  return (
    <main className='page-shell'>
      <BluetoothPowerCard
        busy={busyAddress === '__power__'}
        onRefresh={() => refresh({ silent: true })}
        onToggle={handlePowerToggle}
        power={snapshot.power}
        refreshing={refreshing}
      />
      <DeviceList
        busyAddress={busyAddress}
        devices={snapshot.devices}
        error={error}
        loading={loading}
        onDeviceAction={handleDeviceAction}
      />
    </main>
  )
}

function notify (message) {
  if (window.utools?.showNotification) {
    window.utools.showNotification(message)
  }
}

function capitalize (value) {
  return value.charAt(0).toUpperCase() + value.slice(1)
}
