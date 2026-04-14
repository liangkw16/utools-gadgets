import {
  getConnectionStateLabel,
  getDeviceActionLabel,
  getDeviceTypeLabel
} from '../lib/device-labels'

export default function DeviceRow ({ busy, device, onAction }) {
  return (
    <article className='device-row'>
      <div className='device-copy'>
        <div className='device-title-row'>
          <h2>{device.name}</h2>
          <span className={`connection-pill ${device.connected ? 'connected' : 'idle'}`}>
            {getConnectionStateLabel(device.connected)}
          </span>
        </div>
        <p className='muted'>{getDeviceTypeLabel(device.type)}</p>
        <code>{device.address}</code>
      </div>

      <button
        className='primary-button'
        disabled={busy}
        onClick={() => onAction(device)}
        type='button'
      >
        {busy ? 'Working...' : getDeviceActionLabel(device)}
      </button>
    </article>
  )
}
