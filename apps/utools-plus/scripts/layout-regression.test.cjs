const test = require('node:test')
const assert = require('node:assert/strict')
const fs = require('node:fs')
const path = require('node:path')

const css = fs.readFileSync(path.join(__dirname, '..', 'src', 'main.css'), 'utf8')

test('medium-width layout keeps device rows out of the stacked mobile rule', () => {
  const mediumBreakpointBlock = css.match(/@media \(max-width: 920px\) \{[\s\S]*?\n\}/)

  assert.ok(mediumBreakpointBlock, 'expected a medium-width media query block')
  assert.equal(
    mediumBreakpointBlock[0].includes('.device-row'),
    false,
    'device rows should stay compact at medium widths'
  )
  assert.equal(
    mediumBreakpointBlock[0].includes('.primary-button'),
    false,
    'primary action buttons should not be forced full width at medium widths'
  )
})

test('compact-width toolbar no longer falls back to a three-row single-column stack', () => {
  const narrowBreakpointBlock = css.match(/@media \(max-width: 560px\) \{[\s\S]*?\n\}/)

  assert.ok(narrowBreakpointBlock, 'expected a narrow-width media query block')
  assert.equal(
    narrowBreakpointBlock[0].includes('.toolbar-layout'),
    false,
    'toolbar should stay in the shared search-plus-actions layout instead of collapsing to one column'
  )
  assert.equal(
    narrowBreakpointBlock[0].includes('width: 100%'),
    false,
    'toolbar actions should not stretch into a dedicated full-width row at narrow widths'
  )
})
