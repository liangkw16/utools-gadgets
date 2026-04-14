# utools-gadgets

A public repository for small [uTools](https://u.tools/) gadgets and plugin experiments.

## Current Contents

- `BluetoothSelector/`: a Vite + React based uTools plugin project scaffold.

## BluetoothSelector

The current project includes several sample entry flows to validate the uTools plugin runtime:

- `hello`: shows the plugin enter payload
- `read`: reads a selected file through preload services
- `write`: writes text or image data into the downloads directory

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
