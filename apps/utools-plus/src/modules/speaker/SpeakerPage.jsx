import { useEffect, useState } from 'react'

export default function SpeakerPage ({ activationId = 0 }) {
  const [feedback, setFeedback] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  useEffect(() => {
    if (activationId > 0) {
      setFeedback('')
      setError('')
    }
  }, [activationId])

  async function handleOpenSettings () {
    if (!window.services?.speaker?.openSoundSettings) {
      setError('当前无法打开系统声音设置。')
      return
    }

    setBusy(true)
    setError('')

    try {
      await window.services.speaker.openSoundSettings()
      setFeedback('已打开系统声音设置')
      notify('已打开系统声音设置')
    } catch (err) {
      const message = err?.message || '打开系统声音设置失败。'
      setError(message)
      notify(message)
    } finally {
      setBusy(false)
    }
  }

  return (
    <main className='page-shell'>
      <div className='page-frame'>
        <section className='feature-panel'>
          <div className='feature-copy'>
            <span className='feature-kicker'>SPEAKER</span>
            <h1>输出设备</h1>
            <p>扬声器模块已经预留。下一步会接入系统输出设备列表、快速切换和常用设备偏好。</p>
          </div>

          {feedback && <div className='info-banner'>{feedback}</div>}
          {error && <div className='error-banner'>{error}</div>}

          <div className='feature-actions'>
            <button
              className='primary-button feature-action-button'
              disabled={busy}
              onClick={handleOpenSettings}
              type='button'
            >
              {busy ? '打开中...' : '打开系统声音设置'}
            </button>
          </div>
        </section>
      </div>
    </main>
  )
}

function notify (message) {
  if (window.utools?.showNotification) {
    window.utools.showNotification(message)
  }
}
