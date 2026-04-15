const bluetooth = require('../bluetooth-helper')

module.exports = {
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
  },
  openBluetoothSettings () {
    return bluetooth.openBluetoothSettings()
  }
}
