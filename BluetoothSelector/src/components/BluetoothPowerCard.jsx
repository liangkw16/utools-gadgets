import {
  getPowerActionLabel,
  getPowerDescription,
  getPowerStateLabel
} from '../lib/device-labels'

export default function BluetoothPowerCard ({
  busy,
  onRefresh,
  onToggle,
  power,
  refreshing,
  summary
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
      <div className='power-copy'>
        <p className='eyebrow'>蓝牙状态</p>
        <div className='power-heading-row'>
          <h1>{getPowerDescription(power)}</h1>
          <span className={`status-chip status-${power}`}>{getPowerStateLabel(power)}</span>
        </div>
        <p className='muted'>{summary}</p>
      </div>

      <div className='power-actions'>
        <button
          className='secondary-button'
          disabled={busy || refreshing}
          onClick={onRefresh}
          type='button'
        >
          {refreshing ? '刷新中...' : '刷新'}
        </button>
        <button
          className='ghost-button'
          disabled={busy}
          onClick={handlePrimaryAction}
          type='button'
        >
          {busy ? '处理中...' : actionLabel}
        </button>
      </div>
    </section>
  )
}
