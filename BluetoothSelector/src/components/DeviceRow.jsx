import {
  getConnectionStateLabel,
  getDeviceActionLabel,
  getDeviceTypeLabel
} from '../lib/device-labels'

export default function DeviceRow ({ busy, device, onAction }) {
  return (
    <article className='device-row'>
      <div className='device-main'>
        <div className='device-title-row'>
          <h2 className='device-name'>{device.name}</h2>
          <span className={`connection-pill ${device.connected ? 'connected' : 'idle'}`}>
            {getConnectionStateLabel(device.connected)}
          </span>
        </div>
        <div className='device-meta-row'>
          <span className='device-type'>{getDeviceTypeLabel(device.type)}</span>
          <span className='device-dot'>·</span>
          <code className='device-address'>{device.address}</code>
        </div>
      </div>

      <button
        className='primary-button'
        disabled={busy}
        onClick={() => onAction(device)}
        type='button'
      >
        {busy ? '处理中...' : getDeviceActionLabel(device)}
      </button>
    </article>
  )
}
