# BluetoothSelector Usability Design

Date: 2026-04-15
Status: Approved by user direction
Project: `BluetoothSelector`

## Summary

This iteration focuses on making `BluetoothSelector` feel like a daily utility instead of a functional prototype.

The plugin will keep the current Bluetooth power and connect/disconnect capabilities, while improving the workflow around them:

- find a device quickly through search and focused filters
- keep common devices within reach through favorites and recent-use sorting
- make action results easier to trust through clearer busy, success, and refresh feedback
- improve page hierarchy so the most important information is obvious at a glance
- provide a direct escape hatch into macOS Bluetooth Settings when pairing or troubleshooting is needed

## Goals

- reduce the number of scans needed before users can find the right device
- reduce repeat friction for users who switch between the same few devices every day
- make it obvious when the plugin is busy, fresh, stale, or blocked
- keep the layout visually tidy in uTools window sizes without returning to the previous over-designed look

## Non-Goals

- pairing new devices inside the plugin
- background Bluetooth automation outside the page lifecycle
- per-device battery widgets in this iteration
- advanced device-specific flows for AirPods or vendor-specific hardware

## User Experience

### Primary Workflow

When the plugin opens, the user should immediately see:

- whether Bluetooth is on
- how many devices are connected
- a search field ready for narrowing the list
- favorite devices pinned near the top when they exist
- the most recently used devices promoted within their sections

### Search and Filters

The device list panel will gain:

- a search field that matches device name, type label, and Bluetooth address
- lightweight scope chips for `全部`, `已连接`, and `收藏`

These controls must work together so users can, for example, search only within favorites or only within connected devices.

### Favorites and Recent Use

Each device row will gain a small star action.

- starred devices appear in a dedicated `收藏设备` section
- successful connect or disconnect actions update the device's recent-use timestamp
- within the non-favorite sections, recent devices sort ahead of untouched devices

Preferences are local-only and persist across plugin launches.

### Feedback and Recovery

The top area and list area will more clearly communicate state:

- the page shows when the snapshot was last refreshed
- successful actions surface as a small status note in addition to the existing uTools notification
- while an action is running, only the affected control becomes busy
- when the device list is empty or the user needs to pair new hardware, the page offers a direct button to open macOS Bluetooth Settings

### Visual Direction

The page should feel closer to a focused macOS utility sheet:

- tighter spacing and clearer alignment
- stronger grouping between control tools and device content
- softer surfaces with restrained color accents
- row-level hierarchy that prioritizes device name and status before metadata

## Architecture

### Renderer State

`BluetoothPage` will manage:

- the live Bluetooth snapshot
- list query text
- active filter chip
- persisted device preferences
- transient action feedback with last-updated timestamp

The page remains the orchestrator, while filtering and ordering logic should live in focused library helpers.

### Device Preferences

A new client-side helper module will normalize and persist device preferences in browser storage:

- `favorites`: array of Bluetooth addresses
- `recentActions`: map of Bluetooth address to timestamp

The module must tolerate malformed or missing storage data and fall back cleanly.

### Device View Model

The existing device section helper will expand from simple grouping into a view-model builder that:

- applies the active filter and search query
- creates `收藏设备`, `已连接`, and `其他设备` sections without duplicates
- sorts favorites and recent devices predictably
- exposes compact summary counts for the toolbar copy

### Settings Bridge

The preload bridge will expose a single `openBluetoothSettings` method backed by macOS `open`, keeping renderer code free of shell details.

## Testing

This iteration will keep TDD discipline by adding or extending pure-function tests for:

- device preference normalization and updates
- search/filter/favorites/recent section building
- new summary and status labels
- preload bridge behavior for the Bluetooth Settings shortcut where practical

Manual verification will cover:

- build output for the plugin
- hot-reload dev workflow
- successful rendering of the updated layout in uTools

## Success Criteria

- users can narrow the list to a target device in one or two interactions
- common devices stay easy to reach across launches
- action state is clearer without visually overwhelming the page
- the plugin still builds cleanly and keeps existing Bluetooth actions working
