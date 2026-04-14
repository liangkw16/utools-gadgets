import Foundation
import IOBluetooth

enum ExitCode: Int32 {
    case ok = 0
    case invalidArguments = 2
    case actionFailed = 3
}

func emit(_ payload: [String: Any], code: ExitCode = .ok) -> Never {
    let data = try! JSONSerialization.data(withJSONObject: payload, options: [])
    FileHandle.standardOutput.write(data)
    FileHandle.standardOutput.write(Data([0x0A]))
    Foundation.exit(code.rawValue)
}

func emitSuccess(action: String, address: String? = nil) -> Never {
    var payload: [String: Any] = [
        "ok": true,
        "action": action
    ]

    if let address {
        payload["address"] = address
    }

    emit(payload)
}

func emitFailure(code: String, message: String, detail: Int32? = nil, exitCode: ExitCode = .actionFailed) -> Never {
    var error: [String: Any] = [
        "code": code,
        "message": message
    ]

    if let detail {
        error["detail"] = detail
    }

    emit([
        "ok": false,
        "error": error
    ], code: exitCode)
}

func currentPowerState() -> BluetoothHCIPowerState? {
    IOBluetoothHostController.default()?.powerState
}

func waitForPowerState(_ expected: BluetoothHCIPowerState, timeoutSeconds: TimeInterval) -> Bool {
    let deadline = Date().addingTimeInterval(timeoutSeconds)

    while Date() < deadline {
        if currentPowerState() == expected {
            return true
        }

        usleep(200_000)
    }

    return currentPowerState() == expected
}

func setBluetoothPower(_ poweredOn: Bool) -> Never {
    let desiredState = poweredOn ? kBluetoothHCIPowerStateON : kBluetoothHCIPowerStateOFF

    guard let currentState = currentPowerState() else {
        emitFailure(code: "HOST_UNAVAILABLE", message: "Bluetooth controller not available")
    }

    if currentState == desiredState {
        emitSuccess(action: poweredOn ? "power-on" : "power-off")
    }

    guard let preferencesClass = NSClassFromString("IOBluetoothPreferences") as? NSObject.Type else {
        emitFailure(code: "POWER_BACKEND_UNAVAILABLE", message: "Bluetooth power backend unavailable")
    }

    let preferences = preferencesClass.init()
    let selector = NSSelectorFromString("setPoweredOn:")

    guard preferences.responds(to: selector) else {
        emitFailure(code: "POWER_BACKEND_UNAVAILABLE", message: "Bluetooth power selector unavailable")
    }

    _ = preferences.perform(selector, with: NSNumber(value: poweredOn))

    if waitForPowerState(desiredState, timeoutSeconds: 5) {
        emitSuccess(action: poweredOn ? "power-on" : "power-off")
    }

    emitFailure(code: "POWER_CHANGE_FAILED", message: "Failed to update Bluetooth power state")
}

func normalizeAddress(_ address: String) -> String {
    address.replacingOccurrences(of: ":", with: "-").lowercased()
}

func resolveDevice(address: String) -> IOBluetoothDevice? {
    let candidates = [
        address,
        normalizeAddress(address),
        address.replacingOccurrences(of: "-", with: ":").uppercased()
    ]

    for candidate in candidates {
        if let device = IOBluetoothDevice(addressString: candidate) {
            return device
        }
    }

    return nil
}

func waitForConnection(_ device: IOBluetoothDevice, expected: Bool, timeoutSeconds: TimeInterval) -> Bool {
    let deadline = Date().addingTimeInterval(timeoutSeconds)

    while Date() < deadline {
        if device.isConnected() == expected {
            return true
        }

        usleep(300_000)
    }

    return device.isConnected() == expected
}

func connectDevice(_ address: String) -> Never {
    guard let device = resolveDevice(address: address) else {
        emitFailure(code: "DEVICE_NOT_FOUND", message: "Bluetooth device not found")
    }

    if !device.isPaired() {
        emitFailure(code: "DEVICE_NOT_PAIRED", message: "Bluetooth device is not paired")
    }

    if currentPowerState() != kBluetoothHCIPowerStateON {
        setBluetoothPower(true)
    }

    if device.isConnected() {
        emitSuccess(action: "connect", address: device.addressString)
    }

    let result = device.openConnection()

    if result != kIOReturnSuccess {
        emitFailure(code: "CONNECT_FAILED", message: "Failed to connect Bluetooth device", detail: result)
    }

    if waitForConnection(device, expected: true, timeoutSeconds: 6) {
        emitSuccess(action: "connect", address: device.addressString)
    }

    emitFailure(code: "CONNECT_TIMEOUT", message: "Bluetooth device did not report connected state in time")
}

func disconnectDevice(_ address: String) -> Never {
    guard let device = resolveDevice(address: address) else {
        emitFailure(code: "DEVICE_NOT_FOUND", message: "Bluetooth device not found")
    }

    if !device.isConnected() {
        emitSuccess(action: "disconnect", address: device.addressString)
    }

    var lastResult = kIOReturnSuccess
    var attempts = 0

    while attempts < 10 && device.isConnected() {
        lastResult = device.closeConnection()
        usleep(500_000)
        attempts += 1
    }

    if lastResult != kIOReturnSuccess {
        emitFailure(code: "DISCONNECT_FAILED", message: "Failed to disconnect Bluetooth device", detail: lastResult)
    }

    if waitForConnection(device, expected: false, timeoutSeconds: 4) {
        emitSuccess(action: "disconnect", address: device.addressString)
    }

    emitFailure(code: "DISCONNECT_TIMEOUT", message: "Bluetooth device did not disconnect in time")
}

guard CommandLine.arguments.count >= 2 else {
    emitFailure(code: "INVALID_ARGUMENTS", message: "Missing helper action", exitCode: .invalidArguments)
}

let action = CommandLine.arguments[1]

switch action {
case "power-on":
    setBluetoothPower(true)
case "power-off":
    setBluetoothPower(false)
case "connect":
    guard CommandLine.arguments.count >= 3 else {
        emitFailure(code: "INVALID_ARGUMENTS", message: "Missing Bluetooth device address", exitCode: .invalidArguments)
    }
    connectDevice(CommandLine.arguments[2])
case "disconnect":
    guard CommandLine.arguments.count >= 3 else {
        emitFailure(code: "INVALID_ARGUMENTS", message: "Missing Bluetooth device address", exitCode: .invalidArguments)
    }
    disconnectDevice(CommandLine.arguments[2])
default:
    emitFailure(code: "INVALID_ACTION", message: "Unsupported helper action: \(action)", exitCode: .invalidArguments)
}
