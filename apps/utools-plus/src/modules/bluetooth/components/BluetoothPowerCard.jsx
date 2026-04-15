import {
  getPowerActionLabel,
  getPowerStateLabel
} from '../lib/device-labels.js'

export default function BluetoothPowerCard ({
  busy,
  feedback,
  lastUpdatedLabel,
  onOpenSettings,
  onQueryChange,
  onRefresh,
  onToggle,
  power,
  query,
  refreshing,
  searchInputRef,
  summary
}) {
  const actionLabel = getPowerActionLabel(power)
  const metaNote = feedback || lastUpdatedLabel

  function handlePrimaryAction () {
    if (power === 'unknown') {
      onRefresh()
      return
    }

    onToggle(power === 'on' ? 'off' : 'on')
  }

  return (
    <section className='toolbar-shell'>
      <div className='toolbar-layout'>
        <div className='search-shell'>
          <input
            className='search-input search-input-main'
            aria-label='搜索蓝牙设备'
            onChange={(event) => onQueryChange(event.target.value)}
            placeholder='搜索设备...'
            ref={searchInputRef}
            type='search'
            value={query}
          />
        </div>

        <div className='toolbar-meta'>
          <span className={`status-chip status-${power}`}>{getPowerStateLabel(power)}</span>
          <span className='toolbar-summary' title={summary}>{summary}</span>
          {metaNote && (
            <>
              <span aria-hidden='true' className='toolbar-divider'>·</span>
              <span className={feedback ? 'toolbar-feedback' : 'subtle-note'} title={metaNote}>
                {metaNote}
              </span>
            </>
          )}
        </div>

        <div className='toolbar-actions'>
          <button
            className='ghost-button toolbar-button'
            disabled={busy || refreshing}
            onClick={onRefresh}
            type='button'
          >
            {refreshing ? '刷新中' : '刷新'}
          </button>
          <button
            className='secondary-button toolbar-button'
            onClick={onOpenSettings}
            type='button'
          >
            设置
          </button>
          <button
            className='primary-button toolbar-button'
            disabled={busy}
            onClick={handlePrimaryAction}
            type='button'
          >
            {busy ? '处理中' : actionLabel}
          </button>
        </div>
      </div>
    </section>
  )
}
