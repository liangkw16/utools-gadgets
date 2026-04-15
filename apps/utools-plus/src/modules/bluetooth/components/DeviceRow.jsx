import {
  getConnectionStateLabel,
  getDeviceActionLabel,
  getDeviceIconLabel,
  getDeviceTypeLabel
} from '../lib/device-labels.js'

export default function DeviceRow ({
  busy,
  device,
  isFavorite,
  onAction,
  onFavoriteToggle,
  power
}) {
  const actionDisabled = busy || (power !== 'on' && !device.connected)

  return (
    <article className={`device-row ${device.connected ? 'device-row-connected' : ''}`}>
      <div className='device-leading'>
        <span className={`device-icon ${device.connected ? 'active' : ''}`}>
          {getDeviceIconLabel(device.type)}
        </span>

        <div className='device-main'>
          <div className='device-title-row'>
            <h2 className='device-name'>{device.name}</h2>
            <span className='device-type-inline'>{getDeviceTypeLabel(device.type)}</span>
          </div>

          <div className='device-meta-row'>
            {device.address && <code className='device-address'>{device.address}</code>}
          </div>
        </div>
      </div>

      <div className='device-trailing'>
        {device.connected && <span className='connection-pill connected'>{getConnectionStateLabel(true)}</span>}
        <button
          aria-label={isFavorite ? '取消收藏' : '收藏设备'}
          className={`favorite-icon-button ${isFavorite ? 'active' : ''}`}
          onClick={() => onFavoriteToggle(device)}
          title={isFavorite ? '取消收藏' : '收藏'}
          type='button'
        >
          {isFavorite ? '★' : '☆'}
        </button>
        <button
          className='primary-button row-action-button'
          disabled={actionDisabled}
          onClick={() => onAction(device)}
          type='button'
        >
          {busy ? (device.connected ? '断开中...' : '连接中...') : getDeviceActionLabel(device, power)}
        </button>
      </div>
    </article>
  )
}
