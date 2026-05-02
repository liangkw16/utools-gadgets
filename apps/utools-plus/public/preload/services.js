const bluetooth = require('./services/bluetooth')
const sound = require('./services/sound')

const hostWindow = globalThis.window ?? globalThis

hostWindow.services = {
  bluetooth,
  sound
}

module.exports = hostWindow.services
