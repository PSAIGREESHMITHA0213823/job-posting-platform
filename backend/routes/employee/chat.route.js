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
    const { messages } = req.body

    if (!messages || !Array.isArray(messages)) {
      return res.status(400).json({ success: false, message: 'messages array is required' })
    }

    if (!OPENROUTER_API_KEY) {
      console.error('OPENROUTER_API_KEY is not set in .env')
      return res.status(500).json({ success: false, message: 'AI service not configured' })
    }

    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': process.env.FRONTEND_URL || 'http://localhost:3000',
        'X-Title': 'JobPortal Assistant',
      },
      body: JSON.stringify({
        model: MODEL,
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          ...messages,
        ],
        max_tokens: 512,
        temperature: 0.7,
      }),
    })

    const data = await response.json()

    if (!response.ok) {
      console.error('OpenRouter error:', data)
      return res.status(502).json({ success: false, message: data.error?.message || 'AI service error' })
    }

    const reply = data.choices?.[0]?.message?.content
    if (!reply) {
      return res.status(502).json({ success: false, message: 'Empty response from AI' })
    }

    res.json({ success: true, reply })
  } catch (err) {
    console.error('Chat handler error:', err)
    res.status(500).json({ success: false, message: 'Chat failed: ' + err.message })
  }
}

module.exports = chatHandler