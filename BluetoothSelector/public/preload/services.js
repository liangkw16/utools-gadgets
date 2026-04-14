const bluetooth = require('./bluetooth-helper')

const hostWindow = globalThis.window ?? globalThis

hostWindow.services = {
  getBluetoothSnapshot () {
    return bluetooth.getBluetoothSnapshot()
  },
  setBluetoothPower (power) {
    return bluetooth.setBluetoothPower(power)
  },
  connectDevice (address) {
    return bluetooth.connectDevice(address)
  },
  disconnectDevice (address) {
    return bluetooth.disconnectDevice(address)
  }
}

module.exports = hostWindow.services
