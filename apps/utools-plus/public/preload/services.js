const bluetooth = require('./services/bluetooth')
const speaker = require('./services/speaker')

const hostWindow = globalThis.window ?? globalThis

hostWindow.services = {
  bluetooth,
  speaker
}

module.exports = hostWindow.services
