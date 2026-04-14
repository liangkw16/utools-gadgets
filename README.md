# utools-gadgets

`BluetoothSelector` is a macOS-focused [uTools](https://u.tools/) plugin project for managing Bluetooth connections. The goal is to help users quickly connect, disconnect, and switch Bluetooth devices from uTools, with a workflow similar to `toothpair` and Raycast's Bluetooth management extensions.

## Project Focus

- Target platform: macOS
- Product form: uTools plugin
- Main use case: fast Bluetooth device management from a launcher workflow
- Inspiration: `toothpair`, Raycast Bluetooth related extensions

## Current Status

`BluetoothSelector/` is now an MVP plugin shell for macOS Bluetooth management inside uTools. The current implementation supports:

- reading the current Bluetooth controller state
- listing paired devices with connected and disconnected grouping
- turning Bluetooth on and off from the plugin UI
- connecting and disconnecting paired devices

The preload layer uses `system_profiler` text output as the snapshot source, a bundled Swift helper for device connect and disconnect, and an embedded Objective-C power helper that follows the same low-level approach used by `blueutil` for reliable Bluetooth power toggling on macOS.

## Planned Direction

The next iterations can build on the MVP with:

- device filtering and search
- favorite devices and quick actions
- recent devices and smarter switching flows
- richer status feedback for connection failures

## Development

Requirements:

- Node.js 20+
- npm 10+
- uTools desktop app
- macOS with Bluetooth enabled
- Xcode Command Line Tools for building the embedded helpers

Install dependencies:

```bash
cd BluetoothSelector
npm install
```

Start the local dev server:

```bash
cd BluetoothSelector
npm run dev
```

Build the plugin frontend:

```bash
cd BluetoothSelector
npm run build
```

## Repository Structure

```text
.
├── .github/workflows/ci.yml
├── BluetoothSelector/
└── README.md
```

## License

MIT
