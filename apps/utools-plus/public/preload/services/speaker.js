const { execFile } = require('node:child_process')
const { promisify } = require('node:util')

const execFileAsync = promisify(execFile)
const OPEN = '/usr/bin/open'
const SOUND_SETTINGS_URLS = [
  'x-apple.systempreferences:com.apple.Sound-Settings.extension',
  'x-apple.systempreferences:com.apple.preference.sound'
]

function getSoundSettingsInvocationCandidates () {
  return SOUND_SETTINGS_URLS.map(url => ({
    command: OPEN,
    args: [url]
  }))
}

async function openSoundSettings (runner = execFileAsync) {
  assertMacOS()
  let lastError = null

  for (const invocation of getSoundSettingsInvocationCandidates()) {
    try {
      await runner(invocation.command, invocation.args)
      return {
        ok: true,
        action: 'open-sound-settings'
      }
    } catch (error) {
      lastError = error
    }
  }

  throw lastError ?? new Error('打开系统声音设置失败。')
}

function assertMacOS () {
  if (process.platform !== 'darwin') {
    throw new Error('uTools Plus only supports macOS')
  }
}

module.exports = {
  getSoundSettingsInvocationCandidates,
  openSoundSettings
}
