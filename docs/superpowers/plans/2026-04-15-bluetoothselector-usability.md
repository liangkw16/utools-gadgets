# BluetoothSelector Usability Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make `BluetoothSelector` faster to use day-to-day by adding search, favorites, recent-device prioritization, clearer feedback, and a direct path into macOS Bluetooth Settings.

**Architecture:** Keep Bluetooth operations and rendering separated. Expand the renderer with lightweight persisted preferences and a richer device-list view model, while extending the preload bridge with a single Settings shortcut. Use pure helper modules for storage-safe normalization, filtering, and section building so behavior remains easy to test.

**Tech Stack:** React 19, Vite 6, Node preload bridge, localStorage, macOS `open`, Node test runner, standard

---

### Task 1: Add failing tests for device preferences and richer device sections

**Files:**
- Create: `BluetoothSelector/src/lib/device-preferences.js`
- Create: `BluetoothSelector/src/lib/device-preferences.test.js`
- Modify: `BluetoothSelector/src/lib/device-sections.js`
- Modify: `BluetoothSelector/src/lib/device-sections.test.js`

- [ ] **Step 1: Write the failing tests**
- [ ] **Step 2: Run the focused tests to verify they fail**
- [ ] **Step 3: Implement minimal preference helpers and section builder changes**
- [ ] **Step 4: Run the focused tests to verify they pass**
- [ ] **Step 5: Refactor names and keep outputs stable**

### Task 2: Add failing tests for new labels and the Bluetooth Settings bridge

**Files:**
- Modify: `BluetoothSelector/src/lib/device-labels.js`
- Modify: `BluetoothSelector/src/lib/device-labels.test.js`
- Modify: `BluetoothSelector/public/preload/services.js`

- [ ] **Step 1: Write failing tests for filter labels, empty-state copy, and the Settings bridge contract**
- [ ] **Step 2: Run the focused tests to verify they fail**
- [ ] **Step 3: Implement the minimal label helpers and preload bridge method**
- [ ] **Step 4: Run the focused tests to verify they pass**
- [ ] **Step 5: Refactor any duplicated copy helpers**

### Task 3: Wire the new state and interactions into the page

**Files:**
- Modify: `BluetoothSelector/src/BluetoothPage.jsx`
- Modify: `BluetoothSelector/src/components/BluetoothPowerCard.jsx`
- Modify: `BluetoothSelector/src/components/DeviceList.jsx`
- Modify: `BluetoothSelector/src/components/DeviceRow.jsx`

- [ ] **Step 1: Add the new state flow for query, filter, preferences, feedback, and last-updated timestamps**
- [ ] **Step 2: Connect successful actions to recent-use updates and transient feedback**
- [ ] **Step 3: Add the search field, filter chips, favorite action, and Settings shortcut UI**
- [ ] **Step 4: Verify the page still refreshes correctly after Bluetooth actions**
- [ ] **Step 5: Refactor props so row and list responsibilities stay focused**

### Task 4: Polish styling and empty states

**Files:**
- Modify: `BluetoothSelector/src/main.css`

- [ ] **Step 1: Tighten the page grid and panel hierarchy**
- [ ] **Step 2: Style the toolbar, chips, feedback note, and favorite control**
- [ ] **Step 3: Improve row balance, mobile-ish narrow widths, and empty-state presentation**
- [ ] **Step 4: Verify the updated layout stays readable in the uTools window**
- [ ] **Step 5: Remove any stale class rules from the previous layout**

### Task 5: Verify the full workflow

**Files:**
- Modify: `README.md`

- [ ] **Step 1: Run the full test suite and confirm all checks pass**
- [ ] **Step 2: Run the production build and confirm `dist/plugin.json` is generated cleanly**
- [ ] **Step 3: Update README usage notes for favorites, search, and Bluetooth Settings shortcut**
- [ ] **Step 4: Re-run tests and build after docs changes if needed**
- [ ] **Step 5: Summarize the user-visible improvements with file references**
