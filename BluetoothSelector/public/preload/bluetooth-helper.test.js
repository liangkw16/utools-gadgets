const test = require('node:test')
const assert = require('node:assert/strict')
const path = require('node:path')

const {
  buildActionEnvelope,
  formatAddressForHelper,
  parseSystemProfilerText,
  resolveActionInvocation,
  resolvePowerInvocation
} = require('./bluetooth-helper')

const SAMPLE_TEXT = `Bluetooth:

      Bluetooth Controller:
          Address: 6C:7E:67:DD:00:B1
          State: On
          Chipset: BCM_4388
      Connected:
          HUAWEI FreeClip:
              Address: 54:D9:C6:C4:39:28
              Vendor ID: 0x027D
              Product ID: 0x4113
              Firmware Version: 0.12.8
              Minor Type: Headphones
      Not Connected:
          AirPods K:
              Address: 74:15:F5:15:21:BF
              Vendor ID: 0x004C
              Product ID: 0x2014
              Minor Type: Headphones
          Keyboard K380:
              Address: F4:73:35:98:F2:A9
              Vendor ID: 0x046D
              Product ID: 0xB342
              Minor Type: Keyboard
`

test('parseSystemProfilerText builds a stable Bluetooth snapshot', () => {
  const snapshot = parseSystemProfilerText(SAMPLE_TEXT)

  assert.deepEqual(snapshot, {
    ok: true,
    power: 'on',
    devices: [
      {
        name: 'HUAWEI FreeClip',
        address: '54:D9:C6:C4:39:28',
        type: 'Headphones',
        connected: true,
        paired: true,
        vendorId: '0x027D',
        productId: '0x4113'
      },
      {
        name: 'AirPods K',
        address: '74:15:F5:15:21:BF',
        type: 'Headphones',
        connected: false,
        paired: true,
        vendorId: '0x004C',
        productId: '0x2014'
      },
      {
        name: 'Keyboard K380',
        address: 'F4:73:35:98:F2:A9',
        type: 'Keyboard',
        connected: false,
        paired: true,
        vendorId: '0x046D',
        productId: '0xB342'
      }
    ]
  })
})

test('parseSystemProfilerText tolerates empty input', () => {
  assert.deepEqual(parseSystemProfilerText(''), {
    ok: true,
    power: 'unknown',
    devices: []
  })
})

test('formatAddressForHelper normalizes separators for IOBluetoothDevice', () => {
  assert.equal(formatAddressForHelper('54:D9:C6:C4:39:28'), '54-d9-c6-c4-39-28')
  assert.equal(formatAddressForHelper('54-d9-c6-c4-39-28'), '54-d9-c6-c4-39-28')
})

test('buildActionEnvelope returns a stable success payload', () => {
  assert.deepEqual(buildActionEnvelope('connect', '54:D9:C6:C4:39:28'), {
    ok: true,
    action: 'connect',
    address: '54:D9:C6:C4:39:28'
  })
})

test('resolvePowerInvocation prefers the bundled power helper', () => {
  const bundledPowerHelper = path.join(__dirname, 'bin', 'bluetooth-power')
  const invocation = resolvePowerInvocation('on', candidate => candidate === bundledPowerHelper)

  assert.deepEqual(invocation, {
    command: bundledPowerHelper,
    args: ['on'],
    parser: 'json'
  })
})

test('resolvePowerInvocation falls back to blueutil when available', () => {
  const invocation = resolvePowerInvocation('off', candidate => candidate === '/opt/homebrew/bin/blueutil')

  assert.deepEqual(invocation, {
    command: '/opt/homebrew/bin/blueutil',
    args: ['--power', '0'],
    parser: 'plain'
  })
})

test('resolveActionInvocation keeps connect actions on the device helper', () => {
  const helperSource = path.join(__dirname, 'native', 'bluetooth-helper.swift')
  const invocation = resolveActionInvocation(
    'connect',
    '54:D9:C6:C4:39:28',
    candidate => candidate === helperSource
  )

  assert.equal(invocation.command, '/usr/bin/swift')
  assert.deepEqual(invocation.args, [
    helperSource,
    'connect',
    '54-d9-c6-c4-39-28'
  ])
  assert.equal(invocation.parser, 'json')
})
