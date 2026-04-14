import DeviceRow from './DeviceRow'
import {
  buildDeviceSections,
  getDeviceSummaryLabel
} from '../lib/device-sections'

export default function DeviceList ({
  busyAddress,
  devices,
  error,
  loading,
  onDeviceAction
}) {
  if (loading) {
    return <section className='panel empty-panel'>正在读取蓝牙设备...</section>
  }

  const sections = buildDeviceSections(devices)

  return (
    <section className='panel'>
      <div className='panel-header'>
        <div>
          <p className='eyebrow'>设备列表</p>
          <h2>已配对设备</h2>
          <p className='muted'>{getDeviceSummaryLabel(devices)}</p>
        </div>
      </div>

      {error && <div className='error-banner'>{error}</div>}

      {devices.length === 0 && (
        <div className='empty-panel'>这台 Mac 里还没有可用的已配对设备。</div>
      )}

      <div className='section-stack'>
        {sections.map((section) => (
          <section className='device-section' key={section.key}>
            <div className='device-section-header'>
              <h3>{section.title}</h3>
              <span className='section-count'>{section.items.length}</span>
            </div>
            <div className='device-list'>
              {section.items.map((device) => (
                <DeviceRow
                  key={device.address || device.name}
                  busy={busyAddress === device.address}
                  device={device}
                  onAction={onDeviceAction}
                />
              ))}
            </div>
          </section>
        ))}
      </div>
    </section>
  )
}
