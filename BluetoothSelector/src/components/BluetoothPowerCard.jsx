import {
  getPowerActionLabel,
  getPowerDescription
} from '../lib/device-labels'

export default function BluetoothPowerCard ({
  busy,
  onRefresh,
  onToggle,
  power,
  refreshing
}) {
  const actionLabel = getPowerActionLabel(power)

  function handlePrimaryAction () {
    if (power === 'unknown') {
      onRefresh()
      return
    }

    onToggle(power === 'on' ? 'off' : 'on')
  }

  return (
    <section className='power-card'>
      <div>
        <p className='eyebrow'>Controller</p>
        <h1>Bluetooth Selector</h1>
        <p className='muted'>{getPowerDescription(power)}</p>
      </div>

      <div className='power-actions'>
        <span className={`status-chip status-${power}`}>{power}</span>
        <button
          className='secondary-button'
          disabled={busy || refreshing}
          onClick={onRefresh}
          type='button'
        >
          {refreshing ? 'Refreshing...' : 'Refresh'}
        </button>
        <button
          className='primary-button'
          disabled={busy}
          onClick={handlePrimaryAction}
          type='button'
        >
          {busy ? 'Working...' : actionLabel}
        </button>
      </div>
    </section>
  )
}
