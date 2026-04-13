
const pool = require('../db/pool')

const contactAdmin = async (req, res) => {
try {
const { sessionId, message } = req.body
const employeeId = req.user?.id

if (!employeeId) {
return res.status(401).json({ success: false, message: 'Unauthorized' })
}
if (!message?.trim()) {
return res.status(400).json({ success: false, message: 'Message is required' })
}

let activeSessionId = sessionId

if (activeSessionId) {
const session = await pool.query(
`SELECT * FROM chat_sessions WHERE id = $1 AND employee_id = $2`,
[activeSessionId, employeeId]
)
if (session.rows.length === 0) {
return res.status(403).json({ success: false, message: 'Session not found or unauthorized' })
}
} else {
const result = await pool.query(
`INSERT INTO chat_sessions (employee_id, status) VALUES ($1, 'waiting_admin') RETURNING id`,
[employeeId]
)
activeSessionId = result.rows[0].id
}

await pool.query(
`UPDATE chat_sessions SET status = 'waiting_admin', updated_at = NOW() WHERE id = $1`,
[activeSessionId]
)

await pool.query(
`INSERT INTO chat_messages (session_id, employee_id, sender_role, content)
VALUES ($1, $2, 'user', $3)`,
[activeSessionId, employeeId, message.trim()]
)

await pool.query(
`INSERT INTO chat_messages (session_id, sender_role, content)
VALUES ($1, 'assistant', $2)`,
[activeSessionId, '🔔 Employee has requested admin support. Please review this conversation.']
)

res.json({
success: true,
sessionId: activeSessionId,
message: 'Admin has been notified. We will get back to you soon.',
})
} catch (err) {
console.error('Contact admin error:', err)
res.status(500).json({ success: false, message: 'Failed to contact admin: ' + err.message })
}
}

const getAllSessions = async (req, res) => {
try {
const { status } = req.query

let query = `
SELECT
cs.id,
cs.employee_id,
cs.status,
cs.created_at,
cs.updated_at,
u.name AS employee_name,
u.email AS employee_email,
(
SELECT COUNT(*) FROM chat_messages cm WHERE cm.session_id = cs.id
) AS message_count,
(
SELECT cm2.content
FROM chat_messages cm2
WHERE cm2.session_id = cs.id
ORDER BY cm2.created_at DESC
LIMIT 1
) AS last_message
FROM chat_sessions cs
LEFT JOIN users u ON u.id = cs.employee_id
`
const params = []

if (status) {
query += ` WHERE cs.status = $1`
params.push(status)
}

query += ` ORDER BY cs.updated_at DESC`

const result = await pool.query(query, params)
res.json({ success: true, sessions: result.rows })
} catch (err) {
console.error('Get sessions error:', err)
res.status(500).json({ success: false, message: err.message })
}
}

const getSessionMessages = async (req, res) => {
try {
const { sessionId } = req.params

const session = await pool.query(
`SELECT cs.*, u.name AS employee_name, u.email AS employee_email
FROM chat_sessions cs
LEFT JOIN users u ON u.id = cs.employee_id
WHERE cs.id = $1`,
[sessionId]
)
if (session.rows.length === 0) {
return res.status(404).json({ success: false, message: 'Session not found' })
}

const messages = await pool.query(
`SELECT * FROM chat_messages WHERE session_id = $1 ORDER BY created_at ASC`,
[sessionId]
)

res.json({
success: true,
session: session.rows[0],
messages: messages.rows,
})
} catch (err) {
console.error('Get session messages error:', err)
res.status(500).json({ success: false, message: err.message })
}
}

const updateSessionStatus = async (req, res) => {
try {
const { sessionId } = req.params
const { status } = req.body

const allowed = ['open', 'waiting_admin', 'resolved', 'closed']
if (!allowed.includes(status)) {
return res.status(400).json({ success: false, message: 'Invalid status' })
}

await pool.query(
`UPDATE chat_sessions SET status = $1, updated_at = NOW() WHERE id = $2`,
[status, sessionId]
)
res.json({ success: true, message: `Session marked as ${status}` })
} catch (err) {
res.status(500).json({ success: false, message: err.message })
}
}

module.exports = { contactAdmin, getAllSessions, getSessionMessages, updateSessionStatus }