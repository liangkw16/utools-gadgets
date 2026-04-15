import DeviceRow from './DeviceRow'
import { buildDeviceSections } from '../lib/device-sections.js'
import { getEmptyStateCopy } from '../lib/device-labels.js'

export default function DeviceList ({
  busyAddress,
  devices,
  error,
  favoriteAddresses,
  filter,
  loading,
  onDeviceAction,
  onFavoriteToggle,
  onOpenSettings,
  power,
  recentActions,
  visibleQuery
}) {
  if (loading) {
    return <section className='list-panel empty-panel'>正在读取蓝牙设备...</section>
  }

  const favoriteCount = devices.filter(device => favoriteAddresses.includes(device.address)).length
  const sections = buildDeviceSections(devices, {
    favorites: favoriteAddresses,
    filter,
    query: visibleQuery,
    recentActions
  })
  const visibleCount = sections.reduce((total, section) => total + section.items.length, 0)
  const emptyState = getEmptyStateCopy({
    favoriteCount,
    filter,
    query: visibleQuery,
    totalCount: devices.length,
    visibleCount
  })

  return (
    <section className='list-panel'>
      {error && <div className='error-banner'>{error}</div>}

      {visibleCount === 0
        ? (
          <div className='empty-panel empty-panel-rich'>
            <div className='empty-copy'>
              <h3>{emptyState.title}</h3>
              <p>{emptyState.description}</p>
            </div>
            <button className='secondary-button empty-action' onClick={onOpenSettings} type='button'>打开系统蓝牙设置</button>
          </div>
          )
        : (
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
                      busy={busyAddress === device.address}
                      device={device}
                      isFavorite={favoriteAddresses.includes(device.address)}
                      key={device.address || device.name}
                      onAction={onDeviceAction}
                      onFavoriteToggle={onFavoriteToggle}
                      power={power}
                    />
                  ))}
                </div>
              </section>
            ))}
          </div>
          )}
    </section>
  )
}
