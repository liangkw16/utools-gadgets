const test = require('node:test')
const assert = require('node:assert/strict')
const fs = require('node:fs')
const path = require('node:path')

const deviceRowSource = fs.readFileSync(
  path.join(__dirname, '..', 'src', 'modules', 'bluetooth', 'components', 'DeviceRow.jsx'),
  'utf8'
)
const css = fs.readFileSync(path.join(__dirname, '..', 'src', 'main.css'), 'utf8')

test('device rows only render a connected status pill', () => {
  assert.equal(
    deviceRowSource.includes("device.connected && <span className='connection-pill connected'>"),
    true,
    'expected connected rows to render an explicit connected pill'
  )
  assert.equal(
    deviceRowSource.includes('idle'),
    false,
    'disconnected rows should not render a warning status pill'
  )
})

test('compact launcher layout keeps the row height tight', () => {
  assert.equal(
    css.includes('min-height: 52px;'),
    true,
    'device rows should stay compact enough to fit more results on screen'
  )
})

test('toolbar keeps search and controls on a shared desktop row', () => {
  assert.equal(
    css.includes('grid-template-columns: minmax(180px, 260px) minmax(0, 1fr) auto;'),
    true,
    'expected the toolbar to keep a shorter search field and inline controls on desktop widths'
  )
})

test('toolbar metadata stays on a single compact line on desktop', () => {
  assert.equal(
    css.includes('.toolbar-meta {\n  color: var(--text-secondary);\n  flex: 1 1 auto;\n  flex-wrap: nowrap;'),
    true,
    'toolbar metadata should avoid wrapping into an extra row on desktop widths'
  )
})

test('favorite control uses a borderless icon treatment by default', () => {
  assert.equal(
    css.includes('.favorite-icon-button {\n  background: transparent;'),
    true,
    'favorite control should look like a native lightweight icon button'
  )
})
