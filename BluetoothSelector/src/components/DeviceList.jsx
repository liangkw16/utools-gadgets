import DeviceRow from './DeviceRow'

export default function DeviceList ({
  busyAddress,
  devices,
  error,
  loading,
  onDeviceAction
}) {
  if (loading) {
    return <section className='panel empty-panel'>Loading Bluetooth devices...</section>
  }

  return (
    <section className='panel'>
      <div className='panel-header'>
        <div>
          <p className='eyebrow'>Paired Devices</p>
          <h2>Available devices</h2>
        </div>
        <p className='muted'>{devices.length} paired</p>
      </div>

      {error && <div className='error-banner'>{error}</div>}

      {devices.length === 0 && (
        <div className='empty-panel'>No paired Bluetooth devices were found on this Mac.</div>
      )}

      <div className='device-list'>
        {devices.map((device) => (
          <DeviceRow
            key={device.address || device.name}
            busy={busyAddress === device.address}
            device={device}
            onAction={onDeviceAction}
          />
        ))}
      </div>
    </section>
  )
}
