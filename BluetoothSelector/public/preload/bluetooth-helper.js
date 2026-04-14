const fs = require('node:fs')
const path = require('node:path')
const { execFile } = require('node:child_process')
const { promisify } = require('node:util')

const execFileAsync = promisify(execFile)

const SYSTEM_PROFILER = '/usr/sbin/system_profiler'
const SWIFT = '/usr/bin/swift'
const SYSTEM_BLUEUTIL_CANDIDATES = [
  '/opt/homebrew/bin/blueutil',
  '/usr/local/bin/blueutil'
]

function buildActionEnvelope (action, address) {
  return {
    ok: true,
    action,
    address
  }
}

function formatAddressForHelper (address) {
  return address.trim().replaceAll(':', '-').toLowerCase()
}

function parseSystemProfilerText (text) {
  const lines = text.split(/\r?\n/)
  const devices = []
  let currentDevice = null
  let currentSection = ''

  const powerMatch = text.match(/^\s*State:\s+(On|Off)\s*$/m)
  const power = powerMatch ? powerMatch[1].toLowerCase() : 'unknown'

  for (const line of lines) {
    const trimmed = line.trim()
    const indent = line.match(/^ */)?.[0].length ?? 0

    if (!trimmed) continue

    if (trimmed === 'Connected:') {
      flushDevice(devices, currentDevice)
      currentDevice = null
      currentSection = 'connected'
      continue
    }

    if (trimmed === 'Not Connected:') {
      flushDevice(devices, currentDevice)
      currentDevice = null
      currentSection = 'notConnected'
      continue
    }

    if (indent === 10 && trimmed.endsWith(':') && currentSection) {
      flushDevice(devices, currentDevice)
      currentDevice = {
        name: trimmed.slice(0, -1),
        address: '',
        type: 'Unknown',
        connected: currentSection === 'connected',
        paired: true,
        vendorId: null,
        productId: null
      }
      continue
    }

    if (indent >= 14 && currentDevice && trimmed.includes(':')) {
      const separatorIndex = trimmed.indexOf(':')
      const key = trimmed.slice(0, separatorIndex)
      const value = trimmed.slice(separatorIndex + 1).trim()

      if (key === 'Address') currentDevice.address = value
      if (key === 'Minor Type') currentDevice.type = value
      if (key === 'Vendor ID') currentDevice.vendorId = value
      if (key === 'Product ID') currentDevice.productId = value
    }
  }

  flushDevice(devices, currentDevice)

  devices.sort((left, right) => {
    if (left.connected !== right.connected) {
      return left.connected ? -1 : 1
    }

    return left.name.localeCompare(right.name)
  })

  return {
    ok: true,
    power,
    devices
  }
}

async function getBluetoothSnapshot () {
  assertMacOS()
  const { stdout } = await execFileAsync(SYSTEM_PROFILER, ['SPBluetoothDataType'])
  return parseSystemProfilerText(stdout)
}

async function connectDevice (address) {
  return runHelperAction('connect', address)
}

async function disconnectDevice (address) {
  return runHelperAction('disconnect', address)
}

async function setBluetoothPower (power) {
  if (!['on', 'off'].includes(power)) {
    throw new Error(`Unsupported Bluetooth power state: ${power}`)
  }

  return runHelperAction(`power-${power}`)
}

function resolveActionInvocation (action, address = '', exists = fs.existsSync) {
  if (action === 'power-on' || action === 'power-off') {
    return resolvePowerInvocation(action === 'power-on' ? 'on' : 'off', exists)
  }

  return {
    ...resolveHelperInvocation(action, address, exists),
    parser: 'json'
  }
}

function resolvePowerInvocation (power, exists = fs.existsSync) {
  const bundledPowerBinary = path.join(__dirname, 'bin', 'bluetooth-power')

  if (exists(bundledPowerBinary)) {
    return {
      command: bundledPowerBinary,
      args: [power],
      parser: 'json'
    }
  }

  for (const candidate of SYSTEM_BLUEUTIL_CANDIDATES) {
    if (exists(candidate)) {
      return {
        command: candidate,
        args: ['--power', power === 'on' ? '1' : '0'],
        parser: 'plain'
      }
    }
  }

  return {
    ...resolveHelperInvocation(`power-${power}`, '', exists),
    parser: 'json'
  }
}

function resolveHelperInvocation (action, address, exists = fs.existsSync) {
  const binaryPath = path.join(__dirname, 'bin', 'bluetooth-helper')
  const sourcePath = path.join(__dirname, 'native', 'bluetooth-helper.swift')
  const args = [action]

  if (address) {
    args.push(formatAddressForHelper(address))
  }

  if (exists(binaryPath)) {
    return { command: binaryPath, args }
  }

  if (exists(sourcePath)) {
    return { command: SWIFT, args: [sourcePath, ...args] }
  }

  throw new Error('Bluetooth helper is not available. Run `npm run build:helper` on macOS first.')
}

async function runHelperAction (action, address = '') {
  assertMacOS()
  const { command, args, parser } = resolveActionInvocation(action, address)

  try {
    const { stdout } = await execFileAsync(command, args)
    return parseHelperResponse(stdout, action, address, parser)
  } catch (error) {
    throw toActionError(error, action, address)
  }
}

function parseHelperResponse (stdout, action, address, parser = 'json') {
  if (parser !== 'json') {
    return buildActionEnvelope(action, address || null)
  }

  const response = safeParseJson(stdout)

  if (!response) {
    return buildActionEnvelope(action, address || null)
  }

  if (response.ok === false) {
    throw new Error(response.error?.message ?? `Bluetooth ${action} failed`)
  }

  return response
}

function toActionError (error, action, address) {
  const response = safeParseJson(error.stdout)

  if (response?.error?.message) {
    return new Error(response.error.message)
  }

  if (error.stderr) {
    return new Error(error.stderr.trim())
  }

  return new Error(`Bluetooth ${action} failed for ${address || 'controller'}`)
}

function safeParseJson (text) {
  if (!text || !text.trim()) return null

  try {
    return JSON.parse(text)
  } catch {
    return null
  }
}

function flushDevice (devices, device) {
  if (device) {
    devices.push(device)
  }
}

function assertMacOS () {
  if (process.platform !== 'darwin') {
    throw new Error('BluetoothSelector only supports macOS')
  }
}

module.exports = {
  buildActionEnvelope,
  connectDevice,
  disconnectDevice,
  formatAddressForHelper,
  getBluetoothSnapshot,
  parseSystemProfilerText,
  resolveActionInvocation,
  resolveHelperInvocation,
  resolvePowerInvocation,
  setBluetoothPower
}
