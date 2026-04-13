
import { useEffect, useRef, useCallback } from 'react'

export function useAntiCheat({
active = true,
maxWarnings = 3,
onViolation = () => {},
onAutoSubmit = () => {},
} = {}) {
const warningCount = useRef(0)
const isFullscreen = useRef(false)

const triggerViolation = useCallback((type) => {
if (!active) return
warningCount.current += 1
onViolation(type, warningCount.current)
if (warningCount.current >= maxWarnings) {
onAutoSubmit(type)
}
}, [active, maxWarnings, onViolation, onAutoSubmit])

useEffect(() => {
if (!active) return
const handleVisibility = () => {
if (document.hidden) triggerViolation('tab_switch')
}
document.addEventListener('visibilitychange', handleVisibility)
return () => document.removeEventListener('visibilitychange', handleVisibility)
}, [active, triggerViolation])

useEffect(() => {
if (!active) return
const handleBlur = () => triggerViolation('window_blur')
window.addEventListener('blur', handleBlur)
return () => window.removeEventListener('blur', handleBlur)
}, [active, triggerViolation])

useEffect(() => {
if (!active) return
const block = (e) => e.preventDefault()
document.addEventListener('contextmenu', block)
return () => document.removeEventListener('contextmenu', block)
}, [active])

useEffect(() => {
if (!active) return
const block = (e) => {
const forbidden = [
e.ctrlKey && e.key === 'c',
e.ctrlKey && e.key === 'v',
e.ctrlKey && e.key === 'x',
e.ctrlKey && e.key === 'a',
e.ctrlKey && e.key === 'p',
e.ctrlKey && e.shiftKey && ['i','j','c','k'].includes(e.key.toLowerCase()),
e.key === 'F12',
e.metaKey && e.key === 'c',
e.metaKey && e.key === 'v',
]
if (forbidden.some(Boolean)) {
e.preventDefault()
e.stopPropagation()
if (e.ctrlKey && e.key === 'v' || e.metaKey && e.key === 'v') {
triggerViolation('paste_attempt')
}
return false
}
}
document.addEventListener('keydown', block, true)
return () => document.removeEventListener('keydown', block, true)
}, [active, triggerViolation])

useEffect(() => {
if (!active) return
const block = (e) => {
e.preventDefault()
triggerViolation('paste_attempt')
}
document.addEventListener('paste', block)
return () => document.removeEventListener('paste', block)
}, [active, triggerViolation])

useEffect(() => {
if (!active) return
const block = (e) => e.preventDefault()
document.addEventListener('copy', block)
document.addEventListener('cut', block)
return () => {
document.removeEventListener('copy', block)
document.removeEventListener('cut', block)
}
}, [active])

useEffect(() => {
if (!active) return
const style = document.createElement('style')
style.id = 'anti-cheat-no-select'
style.textContent = `
body { user-select: none !important; -webkit-user-select: none !important; }
textarea, input[type="text"] { user-select: text !important; -webkit-user-select: text !important; }
`
document.head.appendChild(style)
return () => document.getElementById('anti-cheat-no-select')?.remove()
}, [active])

const requestFullscreen = useCallback(() => {
const el = document.documentElement
if (el.requestFullscreen) el.requestFullscreen()
else if (el.webkitRequestFullscreen) el.webkitRequestFullscreen()
isFullscreen.current = true
}, [])

useEffect(() => {
if (!active) return
const handleFsChange = () => {
const inFs = !!(document.fullscreenElement || document.webkitFullscreenElement)
if (!inFs && isFullscreen.current) {
triggerViolation('fullscreen_exit')
}
isFullscreen.current = inFs
}
document.addEventListener('fullscreenchange', handleFsChange)
document.addEventListener('webkitfullscreenchange', handleFsChange)
return () => {
document.removeEventListener('fullscreenchange', handleFsChange)
document.removeEventListener('webkitfullscreenchange', handleFsChange)
}
}, [active, triggerViolation])

useEffect(() => {
if (!active) return
let last = { w: window.outerWidth, h: window.outerHeight }
const interval = setInterval(() => {
const threshold = 160
const wDiff = window.outerWidth - window.innerWidth
const hDiff = window.outerHeight - window.innerHeight
if (wDiff > threshold || hDiff > threshold) {
triggerViolation('devtools_open')
}
}, 2000)
return () => clearInterval(interval)
}, [active, triggerViolation])

return { requestFullscreen, warningCount }
}