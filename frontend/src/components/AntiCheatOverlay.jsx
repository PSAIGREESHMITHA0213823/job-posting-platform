import { useState, useCallback, useRef } from 'react'
import { useAntiCheat } from './useAntiCheat'

/* ─────────────────────────────────────────────────────────────────────────────
   AntiCheatOverlay
   Wrap your existing interview JSX with this component.

   Usage:
     <AntiCheatOverlay
       active={interviewStarted && !interviewFinished}
       maxWarnings={3}
       onAutoSubmit={() => handleFinishInterview()}
     >
       ... your existing interview UI ...
     </AntiCheatOverlay>
───────────────────────────────────────────────────────────────────────────── */

const VIOLATION_MESSAGES = {
  tab_switch:     { title: '⚠️ Tab Switch Detected',    body: 'You switched to another tab. This is not allowed during the interview.' },
  window_blur:    { title: '⚠️ Window Focus Lost',      body: 'You navigated away from the interview window.' },
  paste_attempt:  { title: '⚠️ Paste Blocked',          body: 'Copy-pasting is not allowed. Please type your answer.' },
  fullscreen_exit:{ title: '⚠️ Fullscreen Required',    body: 'You exited fullscreen mode. Please return to fullscreen to continue.' },
  devtools_open:  { title: '⚠️ DevTools Detected',      body: 'Browser developer tools are not allowed during the interview.' },
}

export default function AntiCheatOverlay({ active, maxWarnings = 3, onAutoSubmit, children }) {
  const [warnings, setWarnings] = useState([])           // list of violation objects
  const [showModal, setShowModal] = useState(false)
  const [latestViolation, setLatestViolation] = useState(null)
  const [terminated, setTerminated] = useState(false)
  const [fullscreenRequested, setFullscreenRequested] = useState(false)
  const warningCountRef = useRef(0)

  const handleViolation = useCallback((type, count) => {
    warningCountRef.current = count
    const msg = VIOLATION_MESSAGES[type] || { title: '⚠️ Violation', body: 'An integrity violation was detected.' }
    const violation = { type, ...msg, count, time: new Date().toLocaleTimeString() }
    setWarnings(prev => [...prev, violation])
    setLatestViolation(violation)
    setShowModal(true)
  }, [])

  const handleAutoSubmit = useCallback((type) => {
    setTerminated(true)
    setShowModal(false)
    onAutoSubmit && onAutoSubmit(type)
  }, [onAutoSubmit])

  const { requestFullscreen } = useAntiCheat({
    active: active && !terminated,
    maxWarnings,
    onViolation: handleViolation,
    onAutoSubmit: handleAutoSubmit,
  })

  const enterFullscreen = () => {
    requestFullscreen()
    setFullscreenRequested(true)
  }

  const remaining = maxWarnings - warningCountRef.current

  // ── Terminated screen ──────────────────────────────────────────────────────
  if (terminated) {
    return (
      <div style={styles.terminatedScreen}>
        <div style={styles.terminatedCard}>
          <div style={styles.terminatedIcon}>🚫</div>
          <h2 style={styles.terminatedTitle}>Interview Terminated</h2>
          <p style={styles.terminatedText}>
            Your interview has been automatically submitted due to multiple integrity violations.
          </p>
          <div style={styles.violationLog}>
            <p style={styles.logTitle}>Violation Log</p>
            {warnings.map((w, i) => (
              <div key={i} style={styles.logItem}>
                <span style={styles.logTime}>{w.time}</span>
                <span style={styles.logType}>{w.title}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div style={{ position: 'relative' }}>

      {/* ── Fullscreen prompt (shown once at start) ── */}
      {active && !fullscreenRequested && (
        <div style={styles.fsPrompt}>
          <div style={styles.fsCard}>
            <div style={styles.fsIcon}>🖥️</div>
            <h3 style={styles.fsTitle}>Fullscreen Required</h3>
            <p style={styles.fsText}>
              This interview must be taken in fullscreen mode. Tab switching, copy-paste, and external searches are monitored.
            </p>
            <ul style={styles.ruleList}>
              <li>❌ No switching tabs or windows</li>
              <li>❌ No copy / paste</li>
              <li>❌ No right-clicking</li>
              <li>❌ No opening DevTools</li>
              <li>❌ No searching externally</li>
              <li>⚠️ {maxWarnings} violations = auto-submission</li>
            </ul>
            <button style={styles.fsBtn} onClick={enterFullscreen}>
              Enter Fullscreen & Start
            </button>
          </div>
        </div>
      )}

      {/* ── Warning strip at top ── */}
      {active && warnings.length > 0 && (
        <div style={{
          ...styles.warningStrip,
          background: remaining <= 1 ? '#7f1d1d' : '#78350f',
        }}>
          <span>⚠️ Integrity Warning: {warnings.length} violation{warnings.length > 1 ? 's' : ''} recorded</span>
          <span style={styles.warningRemaining}>
            {remaining > 0 ? `${remaining} warning${remaining > 1 ? 's' : ''} remaining before auto-submit` : 'Submitting…'}
          </span>
        </div>
      )}

      {/* ── Main content ── */}
      {children}

      {/* ── Violation modal ── */}
      {showModal && latestViolation && (
        <div style={styles.modalBackdrop}>
          <div style={styles.modal}>
            <div style={styles.modalIcon}>
              {latestViolation.type === 'paste_attempt' ? '📋' :
               latestViolation.type === 'fullscreen_exit' ? '🖥️' :
               latestViolation.type === 'devtools_open' ? '🔧' : '👁️'}
            </div>
            <h3 style={styles.modalTitle}>{latestViolation.title}</h3>
            <p style={styles.modalBody}>{latestViolation.body}</p>
            <div style={styles.modalCount}>
              Violation {latestViolation.count} of {maxWarnings}
            </div>
            <div style={styles.modalWarning}>
              {remaining > 0
                ? `You have ${remaining} warning${remaining > 1 ? 's' : ''} left. Another violation will auto-submit your interview.`
                : 'This was your final warning. Your interview is being submitted.'}
            </div>
            {latestViolation.type === 'fullscreen_exit' && (
              <button style={styles.fsBtn} onClick={() => { requestFullscreen(); setShowModal(false) }}>
                Return to Fullscreen
              </button>
            )}
            {latestViolation.type !== 'fullscreen_exit' && (
              <button style={styles.modalBtn} onClick={() => setShowModal(false)}>
                I Understand — Continue Interview
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

// ── Inline styles (no Tailwind dependency) ─────────────────────────────────
const styles = {
  terminatedScreen: {
    position: 'fixed', inset: 0, background: '#0f0f0f',
    display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999,
  },
  terminatedCard: {
    background: '#1a0000', border: '1px solid #7f1d1d', borderRadius: 16,
    padding: '48px 40px', maxWidth: 520, width: '90%', textAlign: 'center',
    boxShadow: '0 0 60px rgba(239,68,68,0.2)',
  },
  terminatedIcon: { fontSize: 56, marginBottom: 16 },
  terminatedTitle: { color: '#ef4444', fontSize: 28, fontWeight: 700, marginBottom: 12 },
  terminatedText: { color: '#fca5a5', fontSize: 16, marginBottom: 24, lineHeight: 1.6 },
  violationLog: {
    background: '#0f0000', borderRadius: 8, padding: 16, textAlign: 'left',
  },
  logTitle: { color: '#ef4444', fontWeight: 600, marginBottom: 8, fontSize: 13 },
  logItem: { display: 'flex', gap: 12, marginBottom: 6, fontSize: 13, color: '#fca5a5' },
  logTime: { color: '#9ca3af', minWidth: 70 },
  logType: { flex: 1 },

  fsPrompt: {
    position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.92)',
    display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9998,
  },
  fsCard: {
    background: '#111827', border: '1px solid #374151', borderRadius: 16,
    padding: '48px 40px', maxWidth: 520, width: '90%', textAlign: 'center',
  },
  fsIcon: { fontSize: 48, marginBottom: 16 },
  fsTitle: { color: '#f9fafb', fontSize: 24, fontWeight: 700, marginBottom: 12 },
  fsText: { color: '#9ca3af', fontSize: 15, marginBottom: 24, lineHeight: 1.6 },
  ruleList: {
    listStyle: 'none', padding: 0, margin: '0 0 28px',
    textAlign: 'left', display: 'inline-block',
  },
  fsBtn: {
    background: '#2563eb', color: '#fff', border: 'none',
    borderRadius: 8, padding: '12px 28px', fontSize: 15, fontWeight: 600,
    cursor: 'pointer', width: '100%',
  },

  warningStrip: {
    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
    padding: '10px 20px', color: '#fef3c7', fontSize: 13, fontWeight: 500,
  },
  warningRemaining: { color: '#fcd34d', fontWeight: 600 },

  modalBackdrop: {
    position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)',
    display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999,
  },
  modal: {
    background: '#111827', border: '1px solid #374151', borderRadius: 16,
    padding: '40px 36px', maxWidth: 440, width: '90%', textAlign: 'center',
    boxShadow: '0 25px 60px rgba(0,0,0,0.5)',
  },
  modalIcon: { fontSize: 44, marginBottom: 12 },
  modalTitle: { color: '#f9fafb', fontSize: 20, fontWeight: 700, marginBottom: 10 },
  modalBody: { color: '#9ca3af', fontSize: 14, marginBottom: 16, lineHeight: 1.6 },
  modalCount: {
    background: '#1f2937', borderRadius: 6, padding: '6px 14px',
    color: '#d1d5db', fontSize: 13, display: 'inline-block', marginBottom: 12,
  },
  modalWarning: {
    color: '#fbbf24', fontSize: 13, marginBottom: 24,
    background: '#1c1400', borderRadius: 6, padding: '10px 14px',
  },
  modalBtn: {
    background: '#374151', color: '#f9fafb', border: 'none',
    borderRadius: 8, padding: '11px 24px', fontSize: 14, fontWeight: 600,
    cursor: 'pointer', width: '100%',
  },
}