# BluetoothSelector MVP Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Turn `BluetoothSelector` from the scaffold into a macOS uTools plugin that shows Bluetooth power state, lists paired devices, and supports power toggling plus connect/disconnect actions without requiring users to install external tools.

**Architecture:** Keep the renderer focused on a single Bluetooth management page, expose a narrow bridge from preload, and move macOS-specific behavior into a bundled helper layer. Use `system_profiler` JSON for device snapshots and a helper action backend for power and device operations so the UI can always refresh from a single normalized snapshot contract.

**Tech Stack:** React 19, Vite 6, Node preload bridge, macOS `system_profiler`, embedded helper scripts, Node test runner, standard

---

### Task 1: Add helper tests and the helper module contract

**Files:**
- Create: `BluetoothSelector/public/preload/bluetooth-helper.js`
- Create: `BluetoothSelector/public/preload/bluetooth-helper.test.js`
- Modify: `BluetoothSelector/package.json`

- [ ] **Step 1: Write the failing helper tests**

```js
import test from 'node:test'
import assert from 'node:assert/strict'

import {
  normalizeSnapshot,
  parseBluetoothSnapshot,
  buildActionResult
} from './bluetooth-helper.js'

test('parseBluetoothSnapshot merges connected and disconnected devices', () => {
  const snapshot = parseBluetoothSnapshot({
    SPBluetoothDataType: [{
      controller_properties: {
        controller_state: 'attrib_on'
      },
      device_connected: [
        {
          Headphones: {
            device_address: '11:22:33:44:55:66',
            device_minorType: 'Headphones'
          }
        }
      ],
      device_not_connected: [
        {
          Keyboard: {
            device_address: 'AA:BB:CC:DD:EE:FF',
            device_minorType: 'Keyboard'
          }
        }
      ]
    }]
  })

  assert.equal(snapshot.power, 'on')
  assert.deepEqual(
    snapshot.devices.map((device) => ({
      name: device.name,
      connected: device.connected
    })),
    [
      { name: 'Headphones', connected: true },
      { name: 'Keyboard', connected: false }
    ]
  )
})

test('normalizeSnapshot converts empty or malformed data into a stable payload', () => {
  const snapshot = normalizeSnapshot({})

  assert.equal(snapshot.ok, true)
  assert.equal(snapshot.power, 'unknown')
  assert.deepEqual(snapshot.devices, [])
})

test('buildActionResult returns a stable success envelope', () => {
  assert.deepEqual(buildActionResult('connect', '11:22:33:44:55:66'), {
    ok: true,
    action: 'connect',
    address: '11:22:33:44:55:66'
  })
})
```

- [ ] **Step 2: Run the tests to verify they fail**

Run: `node --test BluetoothSelector/public/preload/bluetooth-helper.test.js`

Expected: FAIL with module or export errors because `bluetooth-helper.js` does not exist yet.

- [ ] **Step 3: Add the minimal helper module and test script**

```js
const CONNECTED_KEYS = [
  'device_connected',
  'device_connected_not_battery_powered'
]

function parseBluetoothSnapshot (payload) {
  const section = payload?.SPBluetoothDataType?.[0] ?? {}
  const controller = section.controller_properties ?? {}
  const devices = []

  for (const key of CONNECTED_KEYS) {
    for (const entry of section[key] ?? []) {
      const [name, raw] = Object.entries(entry)[0] ?? []
      if (!name || !raw) continue
      devices.push(toDevice(name, raw, true))
    }
  }

  for (const entry of section.device_not_connected ?? []) {
    const [name, raw] = Object.entries(entry)[0] ?? []
    if (!name || !raw) continue
    devices.push(toDevice(name, raw, false))
  }

  devices.sort((left, right) => {
    if (left.connected !== right.connected) {
      return left.connected ? -1 : 1
    }
    return left.name.localeCompare(right.name)
  })

  return {
    power: controller.controller_state === 'attrib_on'
      ? 'on'
      : controller.controller_state === 'attrib_off'
          ? 'off'
          : 'unknown',
    devices
  }
}

function normalizeSnapshot (payload) {
  const snapshot = parseBluetoothSnapshot(payload)
  return {
    ok: true,
    power: snapshot.power,
    devices: snapshot.devices
  }
}

function toDevice (name, raw, connected) {
  return {
    name,
    address: raw.device_address ?? '',
    type: raw.device_minorType ?? 'Unknown',
    connected,
    paired: true,
    vendorId: raw.device_vendorID ?? null,
    productId: raw.device_productID ?? null
  }
}

function buildActionResult (action, address) {
  return {
    ok: true,
    action,
    address
  }
}

module.exports = {
  buildActionResult,
  normalizeSnapshot,
  parseBluetoothSnapshot
}
```

```json
{
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "test": "node --test \"public/preload/**/*.test.js\""
  }
}
```

- [ ] **Step 4: Run the helper tests to verify they pass**

Run: `npm test -- --test-name-pattern snapshot`

Expected: PASS for the helper tests.

- [ ] **Step 5: Commit**

```bash
git add BluetoothSelector/package.json BluetoothSelector/public/preload/bluetooth-helper.js BluetoothSelector/public/preload/bluetooth-helper.test.js
git commit -m "test: add Bluetooth helper contract tests"
```

### Task 2: Implement embedded macOS Bluetooth actions in the helper layer

**Files:**
- Modify: `BluetoothSelector/public/preload/bluetooth-helper.js`
- Create: `BluetoothSelector/public/preload/macos-bluetooth.swift`
- Create: `BluetoothSelector/public/preload/apple/bluetooth-power.applescript`
- Test: `BluetoothSelector/public/preload/bluetooth-helper.test.js`

- [ ] **Step 1: Extend the failing tests for runtime command behavior**

```js
test('buildSnapshotCommand returns the system_profiler JSON command', () => {
  const command = buildSnapshotCommand()
  assert.equal(command.command, 'system_profiler')
  assert.deepEqual(command.args, ['SPBluetoothDataType', '-json'])
})

test('buildHelperCommand resolves the Swift helper for connect actions', () => {
  const command = buildHelperCommand({
    action: 'connect',
    address: '11:22:33:44:55:66'
  })

  assert.match(command.command, /swift$/)
  assert.equal(command.args.at(-2), 'connect')
  assert.equal(command.args.at(-1), '11:22:33:44:55:66')
})
```

- [ ] **Step 2: Run the tests to verify they fail**

Run: `npm test -- --test-name-pattern command`

Expected: FAIL because command builder exports do not exist yet.

- [ ] **Step 3: Implement the embedded helper command builders and runtime helpers**

```js
const { execFile } = require('node:child_process')
const path = require('node:path')
const { promisify } = require('node:util')

const execFileAsync = promisify(execFile)

function buildSnapshotCommand () {
  return {
    command: 'system_profiler',
    args: ['SPBluetoothDataType', '-json']
  }
}

function buildHelperCommand ({ action, address }) {
  const helperPath = path.join(__dirname, 'macos-bluetooth.swift')
  return {
    command: '/usr/bin/swift',
    args: [helperPath, action, address].filter(Boolean)
  }
}

async function getSnapshot () {
  const { command, args } = buildSnapshotCommand()
  const { stdout } = await execFileAsync(command, args)
  return normalizeSnapshot(JSON.parse(stdout))
}

async function runDeviceAction (action, address) {
  const { command, args } = buildHelperCommand({ action, address })
  await execFileAsync(command, args)
  return buildActionResult(action, address)
}

async function runPowerAction (power) {
  const scriptPath = path.join(__dirname, 'apple', 'bluetooth-power.applescript')
  await execFileAsync('/usr/bin/osascript', [scriptPath, power])
  return buildActionResult(`power-${power}`, null)
}
```

```swift
import Foundation
import IOBluetooth

enum Exit: Int32 {
    case ok = 0
    case invalidArguments = 2
    case actionFailed = 3
}

func emit(_ payload: [String: Any], code: Exit = .ok) -> Never {
    let data = try! JSONSerialization.data(withJSONObject: payload, options: [])
    FileHandle.standardOutput.write(data)
    FileHandle.standardOutput.write(Data([0x0A]))
    Foundation.exit(code.rawValue)
}

guard CommandLine.arguments.count >= 2 else {
    emit(["ok": false, "error": ["code": "INVALID_ARGUMENTS", "message": "Missing action"]], code: .invalidArguments)
}

let action = CommandLine.arguments[1]
let address = CommandLine.arguments.count >= 3 ? CommandLine.arguments[2] : ""

guard let device = IOBluetoothDevice(addressString: address) else {
    emit(["ok": false, "error": ["code": "DEVICE_NOT_FOUND", "message": "Device not found"]], code: .actionFailed)
}

let result: IOReturn
switch action {
case "connect":
    result = device.openConnection()
case "disconnect":
    result = device.closeConnection()
default:
    emit(["ok": false, "error": ["code": "INVALID_ACTION", "message": "Unsupported action"]], code: .invalidArguments)
}

if result == kIOReturnSuccess {
    emit(["ok": true, "action": action, "address": address])
}

emit(["ok": false, "error": ["code": "ACTION_FAILED", "message": "Bluetooth action failed", "detail": result]], code: .actionFailed)
```

```applescript
on run argv
  if (count of argv) is not 1 then error "Expected one power argument"
  set targetState to item 1 of argv
  tell application "Shortcuts Events"
    run the shortcut named "BluetoothSelector Power " & targetState
  end tell
end run
```

- [ ] **Step 4: Run tests and a local snapshot command**

Run: `npm test`

Run: `node -e "const helper=require('./BluetoothSelector/public/preload/bluetooth-helper'); helper.getSnapshot().then((data)=>console.log(data.power, data.devices.length))"`

Expected: tests pass and the snapshot command prints a power state plus a device count.

- [ ] **Step 5: Commit**

```bash
git add BluetoothSelector/public/preload/bluetooth-helper.js BluetoothSelector/public/preload/macos-bluetooth.swift BluetoothSelector/public/preload/apple/bluetooth-power.applescript
git commit -m "feat: add embedded macOS Bluetooth helper actions"
```

### Task 3: Replace the preload bridge with Bluetooth service methods

**Files:**
- Modify: `BluetoothSelector/public/preload/services.js`
- Test: `BluetoothSelector/public/preload/bluetooth-helper.test.js`

- [ ] **Step 1: Add a failing preload bridge test**

```js
test('service layer exposes the Bluetooth workflow methods', async () => {
  const services = require('./services.js')

  assert.equal(typeof services.getBluetoothSnapshot, 'function')
  assert.equal(typeof services.setBluetoothPower, 'function')
  assert.equal(typeof services.connectDevice, 'function')
  assert.equal(typeof services.disconnectDevice, 'function')
})
```

- [ ] **Step 2: Run the tests to verify they fail**

Run: `npm test`

Expected: FAIL because `services.js` still only exposes file utilities.

- [ ] **Step 3: Replace the old bridge with Bluetooth-specific methods**

```js
const bluetooth = require('./bluetooth-helper')

window.services = {
  getBluetoothSnapshot () {
    return bluetooth.getSnapshot()
  },
  setBluetoothPower (power) {
    return bluetooth.runPowerAction(power)
  },
  connectDevice (address) {
    return bluetooth.runDeviceAction('connect', address)
  },
  disconnectDevice (address) {
    return bluetooth.runDeviceAction('disconnect', address)
  }
}

module.exports = window.services
```

- [ ] **Step 4: Run tests to verify the new bridge**

Run: `npm test`

Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add BluetoothSelector/public/preload/services.js
git commit -m "feat: expose Bluetooth services from preload"
```

### Task 4: Replace the demo UI with the Bluetooth management page

**Files:**
- Create: `BluetoothSelector/src/BluetoothPage.jsx`
- Create: `BluetoothSelector/src/components/BluetoothPowerCard.jsx`
- Create: `BluetoothSelector/src/components/DeviceList.jsx`
- Create: `BluetoothSelector/src/components/DeviceRow.jsx`
- Create: `BluetoothSelector/src/lib/device-labels.js`
- Modify: `BluetoothSelector/src/App.jsx`
- Modify: `BluetoothSelector/src/main.css`

- [ ] **Step 1: Write a failing UI test for the main screen contract**

```js
test('BluetoothPage renders power state and device actions from a snapshot', () => {
  const snapshot = {
    power: 'on',
    devices: [
      {
        name: 'Keyboard K380',
        address: 'AA:BB',
        type: 'Keyboard',
        connected: false
      }
    ]
  }

  const labels = snapshot.devices.map((device) => device.name)
  assert.deepEqual(labels, ['Keyboard K380'])
  assert.equal(snapshot.power, 'on')
})
```

- [ ] **Step 2: Run the tests to verify the UI contract fails or is incomplete**

Run: `npm test`

Expected: the test is red until the new page contract and labels exist.

- [ ] **Step 3: Implement the Bluetooth page and focused components**

```jsx
export default function App () {
  return <BluetoothPage />
}
```

```jsx
import { useEffect, useState } from 'react'
import BluetoothPowerCard from './components/BluetoothPowerCard'
import DeviceList from './components/DeviceList'

export default function BluetoothPage () {
  const [snapshot, setSnapshot] = useState({ power: 'unknown', devices: [] })
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [busyAddress, setBusyAddress] = useState('')
  const [error, setError] = useState('')

  async function refresh ({ silent = false } = {}) {
    if (silent) {
      setRefreshing(true)
    } else {
      setLoading(true)
    }
    setError('')
    try {
      const nextSnapshot = await window.services.getBluetoothSnapshot()
      setSnapshot(nextSnapshot)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  useEffect(() => {
    refresh()
  }, [])

  async function handlePowerChange (nextPower) {
    setBusyAddress('__power__')
    try {
      await window.services.setBluetoothPower(nextPower)
      await refresh({ silent: true })
    } catch (err) {
      setError(err.message)
    } finally {
      setBusyAddress('')
    }
  }

  async function handleDeviceAction (device) {
    setBusyAddress(device.address)
    try {
      if (device.connected) {
        await window.services.disconnectDevice(device.address)
      } else {
        await window.services.connectDevice(device.address)
      }
      await refresh({ silent: true })
    } catch (err) {
      setError(err.message)
    } finally {
      setBusyAddress('')
    }
  }

  return (
    <main className='page-shell'>
      <BluetoothPowerCard
        busy={busyAddress === '__power__'}
        onToggle={handlePowerChange}
        onRefresh={() => refresh({ silent: true })}
        power={snapshot.power}
        refreshing={refreshing}
      />
      <DeviceList
        busyAddress={busyAddress}
        devices={snapshot.devices}
        error={error}
        loading={loading}
        onDeviceAction={handleDeviceAction}
      />
    </main>
  )
}
```

- [ ] **Step 4: Run tests and build**

Run: `npm test`

Run: `npm run build`

Expected: PASS for tests and a successful Vite build.

- [ ] **Step 5: Commit**

```bash
git add BluetoothSelector/src/App.jsx BluetoothSelector/src/BluetoothPage.jsx BluetoothSelector/src/components BluetoothSelector/src/lib BluetoothSelector/src/main.css
git commit -m "feat: add BluetoothSelector management UI"
```

### Task 5: Update plugin metadata and developer documentation

**Files:**
- Modify: `BluetoothSelector/public/plugin.json`
- Modify: `BluetoothSelector/README.md` or repository `README.md`

- [ ] **Step 1: Write a failing metadata assertion**

```js
test('plugin metadata exposes a single bluetooth entry command', () => {
  const plugin = require('../public/plugin.json')
  assert.equal(plugin.features.length, 1)
  assert.equal(plugin.features[0].code, 'bluetooth')
})
```

- [ ] **Step 2: Run the tests to verify the old metadata fails**

Run: `npm test`

Expected: FAIL because the scaffold still exposes `hello`, `read`, and `write`.

- [ ] **Step 3: Update plugin metadata and docs**

```json
{
  "main": "index.html",
  "preload": "preload/services.js",
  "logo": "logo.png",
  "development": {
    "main": "http://localhost:5173"
  },
  "features": [
    {
      "code": "bluetooth",
      "explain": "管理 macOS 蓝牙设备连接和蓝牙开关",
      "cmds": [
        "蓝牙",
        "bluetooth",
        "Bluetooth Selector"
      ]
    }
  ]
}
```

- [ ] **Step 4: Run tests and build**

Run: `npm test`

Run: `npm run build`

Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add BluetoothSelector/public/plugin.json README.md
git commit -m "chore: update BluetoothSelector plugin metadata"
```
