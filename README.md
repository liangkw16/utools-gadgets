# utools-gadgets

`BluetoothSelector` is a macOS-focused [uTools](https://u.tools/) plugin project for managing Bluetooth connections. The goal is to help users quickly connect, disconnect, and switch Bluetooth devices from uTools, with a workflow similar to `toothpair` and Raycast's Bluetooth management extensions.

## Project Focus

- Target platform: macOS
- Product form: uTools plugin
- Main use case: fast Bluetooth device management from a launcher workflow
- Inspiration: `toothpair`, Raycast Bluetooth related extensions

## Current Status

The repository is currently in an early prototype stage.

The existing `BluetoothSelector/` codebase is still a Vite + React scaffold used to validate the uTools runtime and preload bridge. The current sample entries are:

- `hello`: shows the plugin enter payload
- `read`: reads a selected file through preload services
- `write`: writes text or image data into the downloads directory

These sample pages help verify the plugin shell, but they are not yet the final Bluetooth management experience.

## Planned Direction

The next iterations of `BluetoothSelector` will focus on turning the current scaffold into a practical Bluetooth utility for macOS users, including:

- listing commonly used or paired Bluetooth devices
- quick connect and disconnect actions
- turning Bluetooth on and off
- faster switching between known devices
- a lightweight interaction flow that fits uTools search and command entry

## Development

Requirements:

- Node.js 20+
- npm 10+
- uTools desktop app

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
