// // controllers/chatHandler.js
// const pool = require('../db/pool')

// const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY
// const MODEL = 'mistralai/mistral-7b-instruct-v0.1'

// const SYSTEM_PROMPT = `You are a helpful career assistant embedded in a job portal for employees.
// You help users with:
// - Finding the right jobs based on their skills and experience
// - Writing better cover letters and resumes
// - Understanding job descriptions
// - Preparing for interviews
// - Navigating the portal (browsing jobs, applying, saving jobs, updating profile, checking applications)
// - Career advice and salary negotiation tips

// Keep responses concise, friendly, and actionable. When users ask about portal features, guide them clearly.
// Portal features available: Browse Jobs, My Applications, Saved Jobs, My Profile, Notifications.`

// /**
//  * POST /api/chat
//  * Body: { messages: [{role, content}], sessionId?: number }
//  * Returns: { success, reply, sessionId }
//  */
// const chatHandler = async (req, res) => {
//   try {
//     const { messages, sessionId } = req.body
//     const employeeId = req.user?.id // from your auth middleware

//     if (!messages || !Array.isArray(messages)) {
//       return res.status(400).json({ success: false, message: 'messages array is required' })
//     }
//     if (!OPENROUTER_API_KEY) {
//       return res.status(500).json({ success: false, message: 'AI service not configured' })
//     }

//     // 1. Get or create a session
//     let activeSessionId = sessionId
//     if (!activeSessionId) {
//       const result = await pool.query(
//         `INSERT INTO chat_sessions (employee_id) VALUES ($1) RETURNING id`,
//         [employeeId]
//       )
//       activeSessionId = result.rows[0].id
//     }

//     // 2. Save the latest user message to DB
//     const lastUserMsg = messages[messages.length - 1]
//     if (lastUserMsg?.role === 'user') {
//       await pool.query(
//         `INSERT INTO chat_messages (session_id, employee_id, sender_role, content)
//          VALUES ($1, $2, 'user', $3)`,
//         [activeSessionId, employeeId, lastUserMsg.content]
//       )
//     }

//     // 3. Call OpenRouter AI
//     const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
//       method: 'POST',
//       headers: {
//         Authorization: `Bearer ${OPENROUTER_API_KEY}`,
//         'Content-Type': 'application/json',
//         'HTTP-Referer': process.env.FRONTEND_URL || 'http://localhost:3000',
//         'X-Title': 'JobPortal Assistant',
//       },
//       body: JSON.stringify({
//         model: MODEL,
//         messages: [{ role: 'system', content: SYSTEM_PROMPT }, ...messages],
//         max_tokens: 512,
//         temperature: 0.7,
//       }),
//     })

//     const data = await response.json()
//     if (!response.ok) {
//       return res.status(502).json({ success: false, message: data.error?.message || 'AI service error' })
//     }

//     const reply = data.choices?.[0]?.message?.content
//     if (!reply) {
//       return res.status(502).json({ success: false, message: 'Empty response from AI' })
//     }

//     // 4. Save assistant reply to DB
//     await pool.query(
//       `INSERT INTO chat_messages (session_id, sender_role, content)
//        VALUES ($1, 'assistant', $2)`,
//       [activeSessionId, reply]
//     )

//     res.json({ success: true, reply, sessionId: activeSessionId })
//   } catch (err) {
//     console.error('Chat handler error:', err)
//     res.status(500).json({ success: false, message: 'Chat failed: ' + err.message })
//   }
// }

// module.exports = chatHandler
const pool = require('../db/pool')

const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY
const MODEL = 'mistralai/mistral-7b-instruct-v0.1'

const SYSTEM_PROMPT = `You are a helpful career assistant embedded in a job portal for employees.
You help users with:
- Finding the right jobs based on their skills and experience
- Writing better cover letters and resumes
- Understanding job descriptions
- Preparing for interviews
- Navigating the portal (browsing jobs, applying, saving jobs, updating profile, checking applications)
- Career advice and salary negotiation tips

Keep responses concise, friendly, and actionable. When users ask about portal features, guide them clearly.
Portal features available: Browse Jobs, My Applications, Saved Jobs, My Profile, Notifications.`

const chatHandler = async (req, res) => {
  try {
    const { messages, sessionId } = req.body
    const employeeId = req.user?.id

    if (!employeeId) {
      return res.status(401).json({ success: false, message: 'Unauthorized' })
    }
    if (!messages || !Array.isArray(messages)) {
      return res.status(400).json({ success: false, message: 'messages array is required' })
    }
    if (!OPENROUTER_API_KEY) {
      return res.status(500).json({ success: false, message: 'AI service not configured' })
    }

    // 1. Get or create a session
    let activeSessionId = sessionId
    if (!activeSessionId) {
      const result = await pool.query(
        `INSERT INTO chat_sessions (employee_id) VALUES ($1) RETURNING id`,
        [employeeId]
      )
      activeSessionId = result.rows[0].id
    }

    // 2. Save the latest user message
    const lastUserMsg = messages[messages.length - 1]
    if (lastUserMsg?.role === 'user') {
      await pool.query(
        `INSERT INTO chat_messages (session_id, employee_id, sender_role, content)
         VALUES ($1, $2, 'user', $3)`,
        [activeSessionId, employeeId, lastUserMsg.content]
      )
    }

    // 3. Call OpenRouter AI
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${OPENROUTER_API_KEY}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': process.env.FRONTEND_URL || 'http://localhost:3000',
        'X-Title': 'JobPortal Assistant',
      },
      body: JSON.stringify({
        model: MODEL,
        messages: [{ role: 'system', content: SYSTEM_PROMPT }, ...messages],
        max_tokens: 512,
        temperature: 0.7,
      }),
    })

    const data = await response.json()
    if (!response.ok) {
      return res.status(502).json({ success: false, message: data.error?.message || 'AI service error' })
    }

    const reply = data.choices?.[0]?.message?.content
    if (!reply) {
      return res.status(502).json({ success: false, message: 'Empty response from AI' })
    }

    // 4. Save assistant reply
    await pool.query(
      `INSERT INTO chat_messages (session_id, sender_role, content) VALUES ($1, 'assistant', $2)`,
      [activeSessionId, reply]
    )

    res.json({ success: true, reply, sessionId: activeSessionId })
  } catch (err) {
    console.error('Chat handler error:', err)
    res.status(500).json({ success: false, message: 'Chat failed: ' + err.message })
  }
}

module.exports = chatHandler