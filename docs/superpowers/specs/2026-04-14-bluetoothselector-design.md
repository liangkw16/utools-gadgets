# BluetoothSelector Design

Date: 2026-04-14
Status: Proposed
Project: `BluetoothSelector`

## Summary

`BluetoothSelector` will be a macOS-focused uTools plugin for managing already paired Bluetooth devices.

The first release will support:

- viewing Bluetooth power state
- toggling Bluetooth on and off
- listing paired devices with connection status
- connecting a disconnected device
- disconnecting a connected device

The plugin will ship with its own native helper so users do not need to install `blueutil` or any other external dependency.

## Goals

- make common Bluetooth actions available from uTools in a single lightweight page
- keep the setup experience dependency-free for end users
- support the common launcher workflow: open plugin, inspect state, click to act, leave
- keep the backend swappable so the plugin can improve device compatibility over time

## Non-Goals

- pairing new Bluetooth devices in v1
- scanning for nearby unpaired devices in v1
- battery widgets, recent devices, favorites, or search shortcuts in v1
- Windows or Linux support
- deep device-specific workflows such as AirPods-only special handling

## User Experience

### Entry

The plugin will expose a single visible feature, for example `bluetooth` / `蓝牙`, which opens the management page.

### Main Screen

The main page will show:

- a Bluetooth power card at the top
- a refresh action
- a scrollable list of already paired devices

Each device row will display:

- device name
- device type when known, such as headphones, keyboard, or mouse
- device address
- connection state
- the primary action button: `Connect` or `Disconnect`

### Interaction Rules

- if Bluetooth is off, the page still renders and clearly shows that state
- when Bluetooth is turned on, the plugin refreshes device data automatically
- actions are optimistic only in the loading state, not in final state
- after every successful action, the plugin refreshes the snapshot from the helper
- failed actions show a clear error toast and keep the previous snapshot visible

## Architecture

### Overview

The implementation will use three layers:

1. React UI inside `BluetoothSelector/src`
2. preload bridge inside `BluetoothSelector/public/preload/services.js`
3. bundled native helper inside a new helper directory in `BluetoothSelector`

### React UI

The React app owns:

- page rendering
- loading and error states
- action buttons
- refresh flow
- mapping helper responses into human-friendly UI labels

The current demo routes (`hello`, `read`, `write`) will be replaced by a single Bluetooth management flow.

### Preload Bridge

The preload bridge owns:

- exposing a minimal safe API on `window.services`
- invoking the native helper with command arguments
- parsing JSON responses
- normalizing helper failures into front-end friendly errors

The renderer will not directly spawn shell commands.

### Bundled Native Helper

The helper will be packaged with the plugin and invoked by the preload bridge.

The helper will provide a stable JSON-based command surface:

- `snapshot`
- `power on`
- `power off`
- `connect <address>`
- `disconnect <address>`

The helper will print machine-readable JSON to stdout and non-zero exit codes on failure.

## Backend Strategy

### Snapshot Backend

The helper will use `system_profiler SPBluetoothDataType -json` to read Bluetooth controller state and paired device information.

Reasoning:

- it is available on macOS by default
- it returns structured JSON
- it already exposes the controller power state and grouped device lists
- it avoids fragile text scraping for device discovery

The helper will normalize connected and disconnected devices into a single device list sorted by:

1. connected first
2. then alphabetical by device name

### Action Backend

The first implementation will use an automation-backed action backend wrapped inside the bundled helper.

This means the helper is still embedded and dependency-free for users, but internally it may use AppleScript or JXA driven control paths to:

- toggle Bluetooth power
- connect a paired device
- disconnect a connected device

Reasoning:

- this satisfies the product requirement that everything ships inside the plugin
- public macOS tooling is good at reading Bluetooth state, but direct control paths are more limited and inconsistent
- existing launcher plugins such as Raycast Toothpick also rely on AppleScript-backed behavior for out-of-the-box support

The helper must keep the control backend behind a single command interface so later versions can replace the internal action implementation without rewriting the UI.

## Data Contract

The `snapshot` command will return a shape equivalent to:

```json
{
  "ok": true,
  "power": "on",
  "devices": [
    {
      "name": "HUAWEI FreeClip",
      "address": "54:D9:C6:C4:39:28",
      "type": "Headphones",
      "connected": true,
      "paired": true,
      "vendorId": "0x027D",
      "productId": "0x4113"
    }
  ]
}
```

Action commands will return:

```json
{
  "ok": true,
  "action": "connect",
  "address": "54:D9:C6:C4:39:28"
}
```

Failures will return:

```json
{
  "ok": false,
  "error": {
    "code": "ACTION_FAILED",
    "message": "Failed to connect device"
  }
}
```

## UI Components

The v1 UI will be split into focused pieces:

- `BluetoothPage`: page container and data loading orchestration
- `BluetoothPowerCard`: top-level controller status and toggle action
- `DeviceList`: list rendering, empty state, refresh state
- `DeviceRow`: device metadata and connect/disconnect action

This keeps the page testable and avoids pushing all behavior into `App.jsx`.

## State Flow

On plugin enter:

1. UI requests `snapshot`
2. preload calls helper
3. helper returns controller state and device list
4. UI renders the result

On toggle power:

1. UI disables the toggle control
2. preload invokes helper action
3. after success, UI immediately requests a fresh `snapshot`
4. updated snapshot replaces old state

On connect or disconnect:

1. UI marks the target row as busy
2. preload invokes helper action with the device address
3. after success, UI requests a fresh `snapshot`
4. updated snapshot replaces old state

## Error Handling

The plugin will explicitly handle these cases:

- helper binary missing or not executable
- helper command timeout
- Bluetooth off while device action is requested
- device not found in latest snapshot
- automation permission or system control failure
- malformed helper output

User-facing behavior:

- keep the last good snapshot on screen
- show a concise error toast or inline message
- allow manual refresh after failure

Developer-facing behavior:

- include stderr details in preload-side logs
- normalize low-level errors into stable front-end error codes

## Testing Strategy

### Front-End

- component tests for power card, device rows, and empty state rendering
- service mocking tests for loading, success, and failure transitions

### Integration

- preload tests for helper invocation and JSON parsing
- helper contract tests for `snapshot` and action responses

### Manual Validation

On a macOS machine with paired devices:

- Bluetooth on with at least one connected device
- Bluetooth on with only disconnected devices
- Bluetooth off
- connect a disconnected device
- disconnect a connected device
- toggle Bluetooth off and back on
- failure path when the helper returns an error

## Risks And Mitigations

### Automation Fragility

Risk:
AppleScript or JXA based Bluetooth control may vary by macOS version or device type.

Mitigation:

- keep the action backend isolated inside the helper
- return explicit error codes instead of leaking raw script failures
- design the UI around refresh-after-action instead of assuming success state

### Device Compatibility Drift

Risk:
different classes of devices may behave differently when reconnecting.

Mitigation:

- prefer address-based operations over name-only actions
- keep normalized raw metadata available for future diagnostics
- add structured helper logging for unsupported device cases

## Delivery Scope For V1

V1 is complete when:

- the plugin opens from a visible Bluetooth command
- it shows Bluetooth power state
- it lists paired devices
- it can toggle Bluetooth power
- it can connect and disconnect paired devices
- it handles failures without breaking the page

## Deferred Work

The following items are intentionally deferred:

- favorites and quick commands
- search-first launcher interactions
- battery display
- recent device ranking
- pairing and discovery
- richer filtering by device class
