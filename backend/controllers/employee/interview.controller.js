// // // // // // // // const db = require('../../config/db')
// // // // // // // // const pdfParse = require('pdf-parse/lib/pdf-parse.js')
// // // // // // // // const fs = require('fs')

// // // // // // // // const OPENROUTER_KEY = process.env.OPENROUTER_API_KEY
// // // // // // // // const MODEL = 'qwen/qwen3-8b:free'

// // // // // // // // async function callAI(messages, json = false) {
// // // // // // // //   const res = await fetch('https://openrouter.ai/api/v1/chat/completions', {
// // // // // // // //     method: 'POST',
// // // // // // // //     headers: {
// // // // // // // //       'Authorization': `Bearer ${OPENROUTER_KEY}`,
// // // // // // // //       'Content-Type': 'application/json',
// // // // // // // //       'HTTP-Referer': process.env.APP_URL || 'http://localhost:3000',
// // // // // // // //       'X-Title': 'Job Portal Interview'
// // // // // // // //     },
// // // // // // // //     body: JSON.stringify({
// // // // // // // //       model: MODEL,
// // // // // // // //       messages,
// // // // // // // //       temperature: 0.7,
// // // // // // // //       max_tokens: 1000
// // // // // // // //     })
// // // // // // // //   })

// // // // // // // //   const data = await res.json()

// // // // // // // //   // Log full error so we can see exactly what OpenRouter returns
// // // // // // // //   if (!res.ok) {
// // // // // // // //     console.error('OpenRouter error:', JSON.stringify(data, null, 2))
// // // // // // // //     throw new Error(data.error?.message || 'AI error')
// // // // // // // //   }

// // // // // // // //   // Some free models return choices but empty content
// // // // // // // //   const content = data.choices?.[0]?.message?.content
// // // // // // // //   if (!content) {
// // // // // // // //     console.error('Empty AI response:', JSON.stringify(data, null, 2))
// // // // // // // //     throw new Error('AI returned empty response')
// // // // // // // //   }

// // // // // // // //   return content
// // // // // // // // }

// // // // // // // // // POST /interview/start  (multipart: resume file + optional job_id)
// // // // // // // // const startInterview = async (req, res) => {
// // // // // // // //   try {
// // // // // // // //     const { job_id } = req.body
// // // // // // // //     if (!req.file) return res.status(400).json({ success: false, message: 'Resume required' })

// // // // // // // //     // 1. Parse resume PDF
// // // // // // // //     const buffer = fs.readFileSync(req.file.path)
// // // // // // // //     const parsed = await pdfParse(buffer)
// // // // // // // //     const resumeText = parsed.text.slice(0, 4000) // trim for token budget

// // // // // // // //     // 2. Extract skills via AI
// // // // // // // //     const extraction = await callAI([
// // // // // // // //       {
// // // // // // // //         role: 'user',
// // // // // // // //         content: `Extract technical skills, programming languages, frameworks, and years of experience from this resume. Reply ONLY with JSON like: {"skills":["React","Node.js"],"experience_years":3,"level":"mid"}
        
// // // // // // // // Resume:
// // // // // // // // ${resumeText}`
// // // // // // // //       }
// // // // // // // //     ], true)

// // // // // // // //     let parsed_skills = { skills: [], experience_years: 0, level: 'junior' }
// // // // // // // //     try { parsed_skills = JSON.parse(extraction) } catch {}

// // // // // // // //     // 3. Generate interview questions
// // // // // // // //     const qGen = await callAI([
// // // // // // // //       {
// // // // // // // //         role: 'user',
// // // // // // // //         content: `You are a technical interviewer. Generate exactly 5 interview questions for a candidate with these skills: ${parsed_skills.skills.join(', ')}. Experience level: ${parsed_skills.level}.

// // // // // // // // Mix: 2 technical depth questions, 2 practical/scenario questions, 1 behavioral question.
// // // // // // // // Reply ONLY with JSON: {"questions":[{"q":"...","topic":"React","difficulty":"medium"}]}`
// // // // // // // //       }
// // // // // // // //     ], true)

// // // // // // // //     let questions = []
// // // // // // // //     try { questions = JSON.parse(qGen).questions || [] } catch {}
// // // // // // // //     if (!questions.length) return res.status(500).json({ success: false, message: 'Failed to generate questions' })

// // // // // // // //     // 4. Save session
// // // // // // // //     const profile = await db.query('SELECT id FROM employee_profiles WHERE user_id = $1', [req.user.id])
// // // // // // // //     const result = await db.query(
// // // // // // // //       `INSERT INTO interview_sessions (user_id, job_id, resume_text, extracted_skills, questions)
// // // // // // // //        VALUES ($1, $2, $3, $4, $5) RETURNING id, questions, extracted_skills`,
// // // // // // // //       [req.user.id, job_id || null, resumeText, parsed_skills.skills, JSON.stringify(questions)]
// // // // // // // //     )

// // // // // // // //     const session = result.rows[0]
// // // // // // // //     res.json({
// // // // // // // //       success: true,
// // // // // // // //       data: {
// // // // // // // //         session_id: session.id,
// // // // // // // //         skills: session.extracted_skills,
// // // // // // // //         first_question: questions[0],
// // // // // // // //         total_questions: questions.length
// // // // // // // //       }
// // // // // // // //     })
// // // // // // // //   } catch (err) {
// // // // // // // //     console.error(err)
// // // // // // // //     res.status(500).json({ success: false, message: err.message || 'Failed to start interview' })
// // // // // // // //   }
// // // // // // // // }

// // // // // // // // // POST /interview/answer
// // // // // // // // const submitAnswer = async (req, res) => {
// // // // // // // //   try {
// // // // // // // //     const { session_id, answer, question_index } = req.body
// // // // // // // //     if (!session_id || !answer) return res.status(400).json({ success: false, message: 'Missing fields' })

// // // // // // // //     const sessionRes = await db.query('SELECT * FROM interview_sessions WHERE id = $1 AND user_id = $2', [session_id, req.user.id])
// // // // // // // //     if (!sessionRes.rows.length) return res.status(404).json({ success: false, message: 'Session not found' })

// // // // // // // //     const session = sessionRes.rows[0]
// // // // // // // //     const questions = session.questions
// // // // // // // //     const currentQ = questions[question_index]
// // // // // // // //     if (!currentQ) return res.status(400).json({ success: false, message: 'Invalid question index' })

// // // // // // // //     // Evaluate answer
// // // // // // // //     const evaluation = await callAI([
// // // // // // // //       {
// // // // // // // //         role: 'user',
// // // // // // // //         content: `You are a strict technical interviewer. Evaluate this answer.

// // // // // // // // Question: ${currentQ.q}
// // // // // // // // Topic: ${currentQ.topic}
// // // // // // // // Candidate Answer: ${answer}

// // // // // // // // Reply ONLY with JSON: {"score":7,"feedback":"Good explanation of X but missed Y","strengths":["..."],"gaps":["..."]}`
// // // // // // // //       }
// // // // // // // //     ], true)

// // // // // // // //     let evalResult = { score: 5, feedback: 'Answer recorded', strengths: [], gaps: [] }
// // // // // // // //     try { evalResult = JSON.parse(evaluation) } catch {}
// // // // // // // //     evalResult.score = Math.min(10, Math.max(0, parseInt(evalResult.score) || 5))

// // // // // // // //     // Append answer to session
// // // // // // // //     const answers = [...(session.answers || []), {
// // // // // // // //       question: currentQ.q,
// // // // // // // //       answer,
// // // // // // // //       score: evalResult.score,
// // // // // // // //       feedback: evalResult.feedback,
// // // // // // // //       strengths: evalResult.strengths,
// // // // // // // //       gaps: evalResult.gaps
// // // // // // // //     }]

// // // // // // // //     await db.query('UPDATE interview_sessions SET answers = $1 WHERE id = $2', [JSON.stringify(answers), session_id])

// // // // // // // //     const nextIndex = question_index + 1
// // // // // // // //     const hasMore = nextIndex < questions.length

// // // // // // // //     res.json({
// // // // // // // //       success: true,
// // // // // // // //       data: {
// // // // // // // //         evaluation: evalResult,
// // // // // // // //         next_question: hasMore ? questions[nextIndex] : null,
// // // // // // // //         next_index: hasMore ? nextIndex : null,
// // // // // // // //         is_last: !hasMore
// // // // // // // //       }
// // // // // // // //     })
// // // // // // // //   } catch (err) {
// // // // // // // //     console.error(err)
// // // // // // // //     res.status(500).json({ success: false, message: err.message || 'Failed to evaluate answer' })
// // // // // // // //   }
// // // // // // // // }

// // // // // // // // // POST /interview/finish
// // // // // // // // const finishInterview = async (req, res) => {
// // // // // // // //   try {
// // // // // // // //     const { session_id } = req.body
// // // // // // // //     const sessionRes = await db.query('SELECT * FROM interview_sessions WHERE id = $1 AND user_id = $2', [session_id, req.user.id])
// // // // // // // //     if (!sessionRes.rows.length) return res.status(404).json({ success: false, message: 'Session not found' })

// // // // // // // //     const session = sessionRes.rows[0]
// // // // // // // //     const answers = session.answers || []
// // // // // // // //     const avgScore = answers.length ? Math.round(answers.reduce((s, a) => s + a.score, 0) / answers.length) : 0
// // // // // // // //     const verdict = avgScore >= 6 ? 'shortlisted' : 'rejected'

// // // // // // // //     // Get overall AI summary
// // // // // // // //     const summary = await callAI([
// // // // // // // //       {
// // // // // // // //         role: 'user',
// // // // // // // //         content: `Summarize this technical interview. Skills tested: ${session.extracted_skills?.join(', ')}.
// // // // // // // // Scores per question: ${answers.map((a, i) => `Q${i+1}: ${a.score}/10`).join(', ')}.
// // // // // // // // Average: ${avgScore}/10.

// // // // // // // // Write a 2-3 sentence professional summary of the candidate's performance. Be direct and fair.`
// // // // // // // //       }
// // // // // // // //     ])

// // // // // // // //     await db.query(
// // // // // // // //       `UPDATE interview_sessions SET total_score = $1, verdict = $2, status = 'completed', completed_at = NOW() WHERE id = $3`,
// // // // // // // //       [avgScore, verdict, session_id]
// // // // // // // //     )

// // // // // // // //     res.json({
// // // // // // // //       success: true,
// // // // // // // //       data: {
// // // // // // // //         session_id,
// // // // // // // //         total_score: avgScore,
// // // // // // // //         verdict,
// // // // // // // //         summary,
// // // // // // // //         answers,
// // // // // // // //         skills_tested: session.extracted_skills
// // // // // // // //       }
// // // // // // // //     })
// // // // // // // //   } catch (err) {
// // // // // // // //     console.error(err)
// // // // // // // //     res.status(500).json({ success: false, message: err.message || 'Failed to finish interview' })
// // // // // // // //   }
// // // // // // // // }

// // // // // // // // // GET /interview/sessions  (list past sessions)
// // // // // // // // const getInterviewSessions = async (req, res) => {
// // // // // // // //   try {
// // // // // // // //     const result = await db.query(
// // // // // // // //       `SELECT id, extracted_skills, total_score, verdict, status, created_at, completed_at
// // // // // // // //        FROM interview_sessions WHERE user_id = $1 ORDER BY created_at DESC LIMIT 20`,
// // // // // // // //       [req.user.id]
// // // // // // // //     )
// // // // // // // //     res.json({ success: true, data: result.rows })
// // // // // // // //   } catch (err) {
// // // // // // // //     res.status(500).json({ success: false, message: 'Failed to fetch sessions' })
// // // // // // // //   }
// // // // // // // // }

// // // // // // // // // GET /interview/sessions/:id
// // // // // // // // const getInterviewSession = async (req, res) => {
// // // // // // // //   try {
// // // // // // // //     const result = await db.query(
// // // // // // // //       'SELECT * FROM interview_sessions WHERE id = $1 AND user_id = $2',
// // // // // // // //       [req.params.id, req.user.id]
// // // // // // // //     )
// // // // // // // //     if (!result.rows.length) return res.status(404).json({ success: false, message: 'Not found' })
// // // // // // // //     res.json({ success: true, data: result.rows[0] })
// // // // // // // //   } catch (err) {
// // // // // // // //     res.status(500).json({ success: false, message: 'Failed to fetch session' })
// // // // // // // //   }
// // // // // // // // }

// // // // // // // // module.exports = { startInterview, submitAnswer, finishInterview, getInterviewSessions, getInterviewSession }
// // // // // // // const db = require('../../config/db')
// // // // // // // const pdfParse = require('pdf-parse/lib/pdf-parse.js')
// // // // // // // const fs = require('fs')

// // // // // // // const OPENROUTER_KEY = process.env.OPENROUTER_API_KEY

// // // // // // // // Tries each model in order until one works
// // // // // // // const FREE_MODELS = [
// // // // // // //   'google/gemma-3-4b-it:free',
// // // // // // //   'qwen/qwen3-8b:free',
// // // // // // //   'meta-llama/llama-3.2-3b-instruct:free',
// // // // // // //   'microsoft/phi-3-mini-128k-instruct:free',
// // // // // // //   'deepseek/deepseek-r1-0528-qwen3-8b:free',
// // // // // // //   'tngtech/deepseek-r1t-chimera:free',
// // // // // // //   'mistralai/devstral-small:free',
// // // // // // // ]

// // // // // // // async function callAI(messages) {
// // // // // // //   let lastError = null

// // // // // // //   for (const model of FREE_MODELS) {
// // // // // // //     try {
// // // // // // //       console.log(`Trying model: ${model}`)

// // // // // // //       const res = await fetch('https://openrouter.ai/api/v1/chat/completions', {
// // // // // // //         method: 'POST',
// // // // // // //         headers: {
// // // // // // //           'Authorization': `Bearer ${OPENROUTER_KEY}`,
// // // // // // //           'Content-Type': 'application/json',
// // // // // // //           'HTTP-Referer': process.env.APP_URL || 'http://localhost:3000',
// // // // // // //           'X-Title': 'Job Portal Interview'
// // // // // // //         },
// // // // // // //         body: JSON.stringify({
// // // // // // //           model,
// // // // // // //           messages,
// // // // // // //           temperature: 0.3,
// // // // // // //           max_tokens: 1500
// // // // // // //         })
// // // // // // //       })

// // // // // // //       const data = await res.json()

// // // // // // //       if (!res.ok) {
// // // // // // //         const errMsg = data.error?.message || 'Unknown error'
// // // // // // //         console.warn(`Model ${model} failed: ${errMsg}`)
// // // // // // //         lastError = new Error(errMsg)
// // // // // // //         continue
// // // // // // //       }

// // // // // // //       let content = data.choices?.[0]?.message?.content || ''
// // // // // // //       content = content.replace(/<think>[\s\S]*?<\/think>/gi, '').trim()

// // // // // // //       if (!content) {
// // // // // // //         console.warn(`Model ${model} returned empty content`)
// // // // // // //         lastError = new Error('Empty response')
// // // // // // //         continue
// // // // // // //       }

// // // // // // //       console.log(`Success with model: ${model}`)
// // // // // // //       return content

// // // // // // //     } catch (err) {
// // // // // // //       console.warn(`Model ${model} threw error:`, err.message)
// // // // // // //       lastError = err
// // // // // // //       continue
// // // // // // //     }
// // // // // // //   }

// // // // // // //   throw new Error(`All models failed. Last error: ${lastError?.message}`)
// // // // // // // }

// // // // // // // // Safely extract JSON
// // // // // // // function extractJSON(text) {
// // // // // // //   try { return JSON.parse(text) } catch {}

// // // // // // //   const fenceMatch = text.match(/```(?:json)?\s*([\s\S]*?)```/)
// // // // // // //   if (fenceMatch) {
// // // // // // //     try { return JSON.parse(fenceMatch[1].trim()) } catch {}
// // // // // // //   }

// // // // // // //   const objMatch = text.match(/\{[\s\S]*\}/)
// // // // // // //   if (objMatch) {
// // // // // // //     try { return JSON.parse(objMatch[0]) } catch {}
// // // // // // //   }

// // // // // // //   return null
// // // // // // // }

// // // // // // // // ================= START INTERVIEW =================
// // // // // // // const startInterview = async (req, res) => {
// // // // // // //   try {
// // // // // // //     const { job_id } = req.body
// // // // // // //     if (!req.file) return res.status(400).json({ success: false, message: 'Resume required' })

// // // // // // //     const buffer = fs.readFileSync(req.file.path)
// // // // // // //     const parsed = await pdfParse(buffer)
// // // // // // //     const resumeText = parsed.text.slice(0, 3000)

// // // // // // //     if (!resumeText.trim()) {
// // // // // // //       return res.status(400).json({ success: false, message: 'Could not read PDF text.' })
// // // // // // //     }

// // // // // // //     console.log('Resume parsed, length:', resumeText.length)

// // // // // // //     const extractionRaw = await callAI([
// // // // // // //       {
// // // // // // //         role: 'user',
// // // // // // //         content: `Extract technical skills from this resume and return ONLY JSON.

// // // // // // // Format: {"skills":["React"],"experience_years":2,"level":"junior"}

// // // // // // // Resume:
// // // // // // // ${resumeText}`
// // // // // // //       }
// // // // // // //     ])

// // // // // // //     let parsed_skills = { skills: ['JavaScript'], experience_years: 0, level: 'junior' }
// // // // // // //     const extracted = extractJSON(extractionRaw)
// // // // // // //     if (extracted?.skills) parsed_skills = extracted

// // // // // // //     const skillsList = parsed_skills.skills.slice(0, 6).join(', ')

// // // // // // //     const qGenRaw = await callAI([
// // // // // // //       {
// // // // // // //         role: 'user',
// // // // // // //         content: `Generate 5 interview questions.

// // // // // // // Return JSON:
// // // // // // // {"questions":[{"q":"Question"}]}`
// // // // // // //       }
// // // // // // //     ])

// // // // // // //     let questions = []
// // // // // // //     const qParsed = extractJSON(qGenRaw)
// // // // // // //     if (qParsed?.questions) questions = qParsed.questions

// // // // // // //     if (!questions.length) {
// // // // // // //       questions = [
// // // // // // //         { q: 'Tell me about yourself' },
// // // // // // //         { q: 'Explain your project' }
// // // // // // //       ]
// // // // // // //     }

// // // // // // //     const result = await db.query(
// // // // // // //       `INSERT INTO interview_sessions (user_id, job_id, resume_text, extracted_skills, questions)
// // // // // // //        VALUES ($1,$2,$3,$4,$5) RETURNING id,questions,extracted_skills`,
// // // // // // //       [req.user.id, job_id || null, resumeText, parsed_skills.skills, JSON.stringify(questions)]
// // // // // // //     )

// // // // // // //     const session = result.rows[0]

// // // // // // //     res.json({
// // // // // // //       success: true,
// // // // // // //       data: {
// // // // // // //         session_id: session.id,
// // // // // // //         skills: session.extracted_skills,
// // // // // // //         first_question: questions[0],
// // // // // // //         total_questions: questions.length
// // // // // // //       }
// // // // // // //     })
// // // // // // //   } catch (err) {
// // // // // // //     console.error(err)
// // // // // // //     res.status(500).json({ success: false, message: err.message })
// // // // // // //   }
// // // // // // // }

// // // // // // // // ================= SUBMIT ANSWER =================
// // // // // // // const submitAnswer = async (req, res) => {
// // // // // // //   try {
// // // // // // //     const { session_id, answer, question_index } = req.body

// // // // // // //     const sessionRes = await db.query(
// // // // // // //       'SELECT * FROM interview_sessions WHERE id=$1 AND user_id=$2',
// // // // // // //       [session_id, req.user.id]
// // // // // // //     )

// // // // // // //     const session = sessionRes.rows[0]
// // // // // // //     const questions = session.questions
// // // // // // //     const currentQ = questions[question_index]

// // // // // // //     const evalRaw = await callAI([
// // // // // // //       {
// // // // // // //         role: 'user',
// // // // // // //         content: `Evaluate answer and return JSON:
// // // // // // // {"score":7,"feedback":"Good"}`
// // // // // // //       }
// // // // // // //     ])

// // // // // // //     let evalResult = { score: 5, feedback: 'OK' }
// // // // // // //     const parsed = extractJSON(evalRaw)
// // // // // // //     if (parsed?.score) evalResult = parsed

// // // // // // //     const answers = [...(session.answers || []), {
// // // // // // //       question: currentQ.q,
// // // // // // //       answer,
// // // // // // //       score: evalResult.score
// // // // // // //     }]

// // // // // // //     await db.query(
// // // // // // //       'UPDATE interview_sessions SET answers=$1 WHERE id=$2',
// // // // // // //       [JSON.stringify(answers), session_id]
// // // // // // //     )

// // // // // // //     const nextIndex = question_index + 1

// // // // // // //     res.json({
// // // // // // //       success: true,
// // // // // // //       data: {
// // // // // // //         evaluation: evalResult,
// // // // // // //         next_question: questions[nextIndex] || null,
// // // // // // //         next_index: nextIndex
// // // // // // //       }
// // // // // // //     })
// // // // // // //   } catch (err) {
// // // // // // //     res.status(500).json({ success: false })
// // // // // // //   }
// // // // // // // }

// // // // // // // // ================= FINISH =================
// // // // // // // const finishInterview = async (req, res) => {
// // // // // // //   try {
// // // // // // //     const { session_id } = req.body

// // // // // // //     const sessionRes = await db.query(
// // // // // // //       'SELECT * FROM interview_sessions WHERE id=$1 AND user_id=$2',
// // // // // // //       [session_id, req.user.id]
// // // // // // //     )

// // // // // // //     const session = sessionRes.rows[0]
// // // // // // //     const answers = session.answers || []

// // // // // // //     const avgScore = answers.length
// // // // // // //       ? Math.round(answers.reduce((s, a) => s + (a.score || 0), 0) / answers.length)
// // // // // // //       : 0

// // // // // // //     const verdict = avgScore >= 6 ? 'shortlisted' : 'rejected'

// // // // // // //     res.json({
// // // // // // //       success: true,
// // // // // // //       data: { avgScore, verdict }
// // // // // // //     })
// // // // // // //   } catch (err) {
// // // // // // //     res.status(500).json({ success: false })
// // // // // // //   }
// // // // // // // }

// // // // // // // module.exports = {
// // // // // // //   startInterview,
// // // // // // //   submitAnswer,
// // // // // // //   finishInterview,
// // // // // // //   getInterviewSessions,
// // // // // // //   getInterviewSession
// // // // // // // }
// // // // // // const db = require('../../config/db')
// // // // // // const pdfParse = require('pdf-parse/lib/pdf-parse.js')
// // // // // // const fs = require('fs')

// // // // // // const OPENROUTER_KEY = process.env.OPENROUTER_API_KEY

// // // // // // // Single smart router - automatically picks any working free model
// // // // // // // Falls back to specific models only if the router itself fails
// // // // // // const FREE_MODELS = [
// // // // // //   'openrouter/free',                              // auto-picks any working free model
// // // // // //   'meta-llama/llama-4-scout:free',               // llama 4 - very reliable
// // // // // //   'meta-llama/llama-4-maverick:free',            // llama 4 larger
// // // // // //   'deepseek/deepseek-chat-v3-0324:free',         // deepseek v3
// // // // // //   'deepseek/deepseek-r1:free',                   // deepseek r1
// // // // // //   'nvidia/llama-3.1-nemotron-nano-8b-v1:free',  // nvidia nemotron
// // // // // //   'google/gemini-2.0-flash-exp:free',            // gemini flash exp
// // // // // // ]

// // // // // // async function callAI(messages) {
// // // // // //   let lastError = null

// // // // // //   for (const model of FREE_MODELS) {
// // // // // //     try {
// // // // // //       console.log(`Trying model: ${model}`)

// // // // // //       const res = await fetch('https://openrouter.ai/api/v1/chat/completions', {
// // // // // //         method: 'POST',
// // // // // //         headers: {
// // // // // //           'Authorization': `Bearer ${OPENROUTER_KEY}`,
// // // // // //           'Content-Type': 'application/json',
// // // // // //           'HTTP-Referer': process.env.APP_URL || 'http://localhost:3000',
// // // // // //           'X-Title': 'Job Portal Interview'
// // // // // //         },
// // // // // //         body: JSON.stringify({
// // // // // //           model,
// // // // // //           messages,
// // // // // //           temperature: 0.3,
// // // // // //           max_tokens: 1500
// // // // // //         })
// // // // // //       })

// // // // // //       const data = await res.json()

// // // // // //       if (!res.ok) {
// // // // // //         const errMsg = data.error?.message || 'Unknown error'
// // // // // //         console.warn(`Model ${model} failed: ${errMsg}`)
// // // // // //         lastError = new Error(errMsg)
// // // // // //         continue
// // // // // //       }

// // // // // //       let content = data.choices?.[0]?.message?.content || ''
// // // // // //       content = content.replace(/<think>[\s\S]*?<\/think>/gi, '').trim()

// // // // // //       if (!content) {
// // // // // //         console.warn(`Model ${model} returned empty content`)
// // // // // //         lastError = new Error('Empty response')
// // // // // //         continue
// // // // // //       }

// // // // // //       console.log(`Success with model: ${model}`)
// // // // // //       return content

// // // // // //     } catch (err) {
// // // // // //       console.warn(`Model ${model} threw error:`, err.message)
// // // // // //       lastError = err
// // // // // //       continue
// // // // // //     }
// // // // // //   }

// // // // // //   throw new Error(`All models failed. Last error: ${lastError?.message}`)
// // // // // // }

// // // // // // // Safely extract JSON
// // // // // // function extractJSON(text) {
// // // // // //   try { return JSON.parse(text) } catch {}

// // // // // //   const fenceMatch = text.match(/```(?:json)?\s*([\s\S]*?)```/)
// // // // // //   if (fenceMatch) {
// // // // // //     try { return JSON.parse(fenceMatch[1].trim()) } catch {}
// // // // // //   }

// // // // // //   const objMatch = text.match(/\{[\s\S]*\}/)
// // // // // //   if (objMatch) {
// // // // // //     try { return JSON.parse(objMatch[0]) } catch {}
// // // // // //   }

// // // // // //   return null
// // // // // // }

// // // // // // // ================= START INTERVIEW =================
// // // // // // const startInterview = async (req, res) => {
// // // // // //   try {
// // // // // //     const { job_id } = req.body
// // // // // //     if (!req.file) return res.status(400).json({ success: false, message: 'Resume required' })

// // // // // //     const buffer = fs.readFileSync(req.file.path)
// // // // // //     const parsed = await pdfParse(buffer)
// // // // // //     const resumeText = parsed.text.slice(0, 3000)

// // // // // //     if (!resumeText.trim()) {
// // // // // //       return res.status(400).json({ success: false, message: 'Could not read PDF text.' })
// // // // // //     }

// // // // // //     console.log('Resume parsed, length:', resumeText.length)

// // // // // //     const extractionRaw = await callAI([
// // // // // //       {
// // // // // //         role: 'user',
// // // // // //         content: `Extract technical skills from this resume and return ONLY JSON.

// // // // // // Format: {"skills":["React"],"experience_years":2,"level":"junior"}

// // // // // // Resume:
// // // // // // ${resumeText}`
// // // // // //       }
// // // // // //     ])

// // // // // //     let parsed_skills = { skills: ['JavaScript'], experience_years: 0, level: 'junior' }
// // // // // //     const extracted = extractJSON(extractionRaw)
// // // // // //     if (extracted?.skills) parsed_skills = extracted

// // // // // //     const skillsList = parsed_skills.skills.slice(0, 6).join(', ')

// // // // // //     const qGenRaw = await callAI([
// // // // // //       {
// // // // // //         role: 'user',
// // // // // //         content: `Generate 5 interview questions.

// // // // // // Return JSON:
// // // // // // {"questions":[{"q":"Question"}]}`
// // // // // //       }
// // // // // //     ])

// // // // // //     let questions = []
// // // // // //     const qParsed = extractJSON(qGenRaw)
// // // // // //     if (qParsed?.questions) questions = qParsed.questions

// // // // // //     if (!questions.length) {
// // // // // //       questions = [
// // // // // //         { q: 'Tell me about yourself' },
// // // // // //         { q: 'Explain your project' }
// // // // // //       ]
// // // // // //     }

// // // // // //     const result = await db.query(
// // // // // //       `INSERT INTO interview_sessions (user_id, job_id, resume_text, extracted_skills, questions)
// // // // // //        VALUES ($1,$2,$3,$4,$5) RETURNING id,questions,extracted_skills`,
// // // // // //       [req.user.id, job_id || null, resumeText, parsed_skills.skills, JSON.stringify(questions)]
// // // // // //     )

// // // // // //     const session = result.rows[0]

// // // // // //     res.json({
// // // // // //       success: true,
// // // // // //       data: {
// // // // // //         session_id: session.id,
// // // // // //         skills: session.extracted_skills,
// // // // // //         first_question: questions[0],
// // // // // //         total_questions: questions.length
// // // // // //       }
// // // // // //     })
// // // // // //   } catch (err) {
// // // // // //     console.error(err)
// // // // // //     res.status(500).json({ success: false, message: err.message })
// // // // // //   }
// // // // // // }

// // // // // // // ================= SUBMIT ANSWER =================
// // // // // // const submitAnswer = async (req, res) => {
// // // // // //   try {
// // // // // //     const { session_id, answer, question_index } = req.body

// // // // // //     const sessionRes = await db.query(
// // // // // //       'SELECT * FROM interview_sessions WHERE id=$1 AND user_id=$2',
// // // // // //       [session_id, req.user.id]
// // // // // //     )

// // // // // //     const session = sessionRes.rows[0]
// // // // // //     const questions = session.questions
// // // // // //     const currentQ = questions[question_index]

// // // // // //     const evalRaw = await callAI([
// // // // // //       {
// // // // // //         role: 'user',
// // // // // //         content: `Evaluate answer and return JSON:
// // // // // // {"score":7,"feedback":"Good"}`
// // // // // //       }
// // // // // //     ])

// // // // // //     let evalResult = { score: 5, feedback: 'OK' }
// // // // // //     const parsed = extractJSON(evalRaw)
// // // // // //     if (parsed?.score) evalResult = parsed

// // // // // //     const answers = [...(session.answers || []), {
// // // // // //       question: currentQ.q,
// // // // // //       answer,
// // // // // //       score: evalResult.score
// // // // // //     }]

// // // // // //     await db.query(
// // // // // //       'UPDATE interview_sessions SET answers=$1 WHERE id=$2',
// // // // // //       [JSON.stringify(answers), session_id]
// // // // // //     )

// // // // // //     const nextIndex = question_index + 1

// // // // // //     res.json({
// // // // // //       success: true,
// // // // // //       data: {
// // // // // //         evaluation: evalResult,
// // // // // //         next_question: questions[nextIndex] || null,
// // // // // //         next_index: nextIndex
// // // // // //       }
// // // // // //     })
// // // // // //   } catch (err) {
// // // // // //     res.status(500).json({ success: false })
// // // // // //   }
// // // // // // }

// // // // // // // ================= FINISH =================
// // // // // // const finishInterview = async (req, res) => {
// // // // // //   try {
// // // // // //     const { session_id } = req.body

// // // // // //     const sessionRes = await db.query(
// // // // // //       'SELECT * FROM interview_sessions WHERE id=$1 AND user_id=$2',
// // // // // //       [session_id, req.user.id]
// // // // // //     )

// // // // // //     const session = sessionRes.rows[0]
// // // // // //     const answers = session.answers || []

// // // // // //     const avgScore = answers.length
// // // // // //       ? Math.round(answers.reduce((s, a) => s + (a.score || 0), 0) / answers.length)
// // // // // //       : 0

// // // // // //     const verdict = avgScore >= 6 ? 'shortlisted' : 'rejected'

// // // // // //     res.json({
// // // // // //       success: true,
// // // // // //       data: { avgScore, verdict }
// // // // // //     })
// // // // // //   } catch (err) {
// // // // // //     res.status(500).json({ success: false })
// // // // // //   }
// // // // // // }

// // // // // // // ================= ADDED FUNCTIONS =================
// // // // // // const getInterviewSessions = async (req, res) => {
// // // // // //   try {
// // // // // //     const result = await db.query(
// // // // // //       `SELECT id, extracted_skills, total_score, verdict, status, created_at, completed_at
// // // // // //        FROM interview_sessions WHERE user_id = $1 ORDER BY created_at DESC LIMIT 20`,
// // // // // //       [req.user.id]
// // // // // //     )
// // // // // //     res.json({ success: true, data: result.rows })
// // // // // //   } catch (err) {
// // // // // //     res.status(500).json({ success: false, message: 'Failed to fetch sessions' })
// // // // // //   }
// // // // // // }

// // // // // // const getInterviewSession = async (req, res) => {
// // // // // //   try {
// // // // // //     const result = await db.query(
// // // // // //       'SELECT * FROM interview_sessions WHERE id = $1 AND user_id = $2',
// // // // // //       [req.params.id, req.user.id]
// // // // // //     )
// // // // // //     if (!result.rows.length) return res.status(404).json({ success: false, message: 'Not found' })
// // // // // //     res.json({ success: true, data: result.rows[0] })
// // // // // //   } catch (err) {
// // // // // //     res.status(500).json({ success: false, message: 'Failed to fetch session' })
// // // // // //   }
// // // // // // }

// // // // // // module.exports = {
// // // // // //   startInterview,
// // // // // //   submitAnswer,
// // // // // //   finishInterview,
// // // // // //   getInterviewSessions,
// // // // // //   getInterviewSession
// // // // // // }
// // // // // const db = require('../../config/db')
// // // // // const pdfParse = require('pdf-parse/lib/pdf-parse.js')
// // // // // const fs = require('fs')

// // // // // // ==================== API KEYS ====================
// // // // // const GROQ_KEY = process.env.GROQ_API_KEY
// // // // // const GEMINI_KEY = process.env.GEMINI_API_KEY
// // // // // const OPENROUTER_KEY = process.env.OPENROUTER_API_KEY

// // // // // // ==================== OPENROUTER FREE MODELS (fallback) ====================
// // // // // const FREE_MODELS = [
// // // // //   'openrouter/free',                              // auto-picks any working free model
// // // // //   'meta-llama/llama-4-scout:free',               // llama 4 - very reliable
// // // // //   'meta-llama/llama-4-maverick:free',            // llama 4 larger
// // // // //   'deepseek/deepseek-chat-v3-0324:free',         // deepseek v3
// // // // //   'deepseek/deepseek-r1:free',                   // deepseek r1
// // // // //   'nvidia/llama-3.1-nemotron-nano-8b-v1:free',  // nvidia nemotron
// // // // //   'google/gemini-2.0-flash-exp:free',            // gemini flash exp
// // // // // ]

// // // // // // ==================== PROVIDER-Specific HELPERS ====================
// // // // // async function callGroq(messages) {
// // // // //   const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
// // // // //     method: 'POST',
// // // // //     headers: {
// // // // //       'Authorization': `Bearer ${GROQ_KEY}`,
// // // // //       'Content-Type': 'application/json'
// // // // //     },
// // // // //     body: JSON.stringify({
// // // // //       model: 'llama-3.1-8b-instant',
// // // // //       messages,
// // // // //       temperature: 0.3,
// // // // //       max_tokens: 1500
// // // // //     })
// // // // //   })
// // // // //   const data = await res.json()
// // // // //   if (!res.ok) throw new Error(data.error?.message || 'Groq error')
// // // // //   const content = data.choices?.[0]?.message?.content || ''
// // // // //   if (!content) throw new Error('Empty Groq response')
// // // // //   return content
// // // // // }

// // // // // async function callGemini(messages) {
// // // // //   const contents = messages.map(m => ({
// // // // //     role: m.role === 'assistant' ? 'model' : 'user',
// // // // //     parts: [{ text: m.content }]
// // // // //   }))
// // // // //   const res = await fetch(
// // // // //     `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_KEY}`,
// // // // //     {
// // // // //       method: 'POST',
// // // // //       headers: { 'Content-Type': 'application/json' },
// // // // //       body: JSON.stringify({
// // // // //         contents,
// // // // //         generationConfig: { temperature: 0.3, maxOutputTokens: 1500 }
// // // // //       })
// // // // //     }
// // // // //   )
// // // // //   const data = await res.json()
// // // // //   if (!res.ok) throw new Error(data.error?.message || 'Gemini error')
// // // // //   const content = data.candidates?.[0]?.content?.parts?.[0]?.text || ''
// // // // //   if (!content) throw new Error('Empty Gemini response')
// // // // //   return content
// // // // // }

// // // // // async function callOpenRouter(messages) {
// // // // //   let lastError = null

// // // // //   for (const model of FREE_MODELS) {
// // // // //     try {
// // // // //       console.log(`Trying OpenRouter model: ${model}`)

// // // // //       const res = await fetch('https://openrouter.ai/api/v1/chat/completions', {
// // // // //         method: 'POST',
// // // // //         headers: {
// // // // //           'Authorization': `Bearer ${OPENROUTER_KEY}`,
// // // // //           'Content-Type': 'application/json',
// // // // //           'HTTP-Referer': process.env.APP_URL || 'http://localhost:3000',
// // // // //           'X-Title': 'Job Portal Interview'
// // // // //         },
// // // // //         body: JSON.stringify({
// // // // //           model,
// // // // //           messages,
// // // // //           temperature: 0.3,
// // // // //           max_tokens: 1500
// // // // //         })
// // // // //       })

// // // // //       const data = await res.json()

// // // // //       if (!res.ok) {
// // // // //         const errMsg = data.error?.message || 'Unknown error'
// // // // //         console.warn(`Model ${model} failed: ${errMsg}`)
// // // // //         lastError = new Error(errMsg)
// // // // //         continue
// // // // //       }

// // // // //       let content = data.choices?.[0]?.message?.content || ''
// // // // //       content = content.replace(/<think>[\s\S]*?<\/think>/gi, '').trim()

// // // // //       if (!content) {
// // // // //         console.warn(`Model ${model} returned empty content`)
// // // // //         lastError = new Error('Empty response')
// // // // //         continue
// // // // //       }

// // // // //       console.log(`Success with OpenRouter model: ${model}`)
// // // // //       return content

// // // // //     } catch (err) {
// // // // //       console.warn(`Model ${model} threw error:`, err.message)
// // // // //       lastError = err
// // // // //       continue
// // // // //     }
// // // // //   }

// // // // //   throw new Error(`All OpenRouter models failed. Last error: ${lastError?.message}`)
// // // // // }

// // // // // // ==================== MAIN callAI (Groq → Gemini → OpenRouter) ====================
// // // // // async function callAI(messages) {
// // // // //   // 1) Try Groq
// // // // //   if (GROQ_KEY) {
// // // // //     try {
// // // // //       console.log('Trying Groq...')
// // // // //       const result = await callGroq(messages)
// // // // //       console.log('Groq success')
// // // // //       return result
// // // // //     } catch (err) {
// // // // //       console.warn('Groq failed:', err.message)
// // // // //     }
// // // // //   }

// // // // //   // 2) Try Gemini
// // // // //   if (GEMINI_KEY) {
// // // // //     try {
// // // // //       console.log('Trying Gemini...')
// // // // //       const result = await callGemini(messages)
// // // // //       console.log('Gemini success')
// // // // //       return result
// // // // //     } catch (err) {
// // // // //       console.warn('Gemini failed:', err.message)
// // // // //     }
// // // // //   }

// // // // //   // 3) Fallback to OpenRouter free models
// // // // //   if (OPENROUTER_KEY) {
// // // // //     try {
// // // // //       console.log('Falling back to OpenRouter...')
// // // // //       const result = await callOpenRouter(messages)
// // // // //       console.log('OpenRouter success')
// // // // //       return result
// // // // //     } catch (err) {
// // // // //       console.warn('OpenRouter failed:', err.message)
// // // // //       throw err
// // // // //     }
// // // // //   }

// // // // //   throw new Error('No AI API keys configured. Set GROQ_API_KEY, GEMINI_API_KEY, or OPENROUTER_API_KEY in .env')
// // // // // }

// // // // // // ==================== HELPER: Extract JSON safely ====================
// // // // // function extractJSON(text) {
// // // // //   try { return JSON.parse(text) } catch {}

// // // // //   const fenceMatch = text.match(/```(?:json)?\s*([\s\S]*?)```/)
// // // // //   if (fenceMatch) {
// // // // //     try { return JSON.parse(fenceMatch[1].trim()) } catch {}
// // // // //   }

// // // // //   const objMatch = text.match(/\{[\s\S]*\}/)
// // // // //   if (objMatch) {
// // // // //     try { return JSON.parse(objMatch[0]) } catch {}
// // // // //   }

// // // // //   return null
// // // // // }

// // // // // // ==================== CONTROLLER FUNCTIONS (unchanged) ====================
// // // // // const startInterview = async (req, res) => {
// // // // //   try {
// // // // //     const { job_id } = req.body
// // // // //     if (!req.file) return res.status(400).json({ success: false, message: 'Resume required' })

// // // // //     const buffer = fs.readFileSync(req.file.path)
// // // // //     const parsed = await pdfParse(buffer)
// // // // //     const resumeText = parsed.text.slice(0, 3000)

// // // // //     if (!resumeText.trim()) {
// // // // //       return res.status(400).json({ success: false, message: 'Could not read PDF text.' })
// // // // //     }

// // // // //     console.log('Resume parsed, length:', resumeText.length)

// // // // //     const extractionRaw = await callAI([
// // // // //       {
// // // // //         role: 'user',
// // // // //         content: `Extract technical skills from this resume and return ONLY JSON.

// // // // // Format: {"skills":["React"],"experience_years":2,"level":"junior"}

// // // // // Resume:
// // // // // ${resumeText}`
// // // // //       }
// // // // //     ])

// // // // //     let parsed_skills = { skills: ['JavaScript'], experience_years: 0, level: 'junior' }
// // // // //     const extracted = extractJSON(extractionRaw)
// // // // //     if (extracted?.skills) parsed_skills = extracted

// // // // //     const skillsList = parsed_skills.skills.slice(0, 6).join(', ')

// // // // //     const qGenRaw = await callAI([
// // // // //       {
// // // // //         role: 'user',
// // // // //         content: `Generate 5 interview questions.

// // // // // Return JSON:
// // // // // {"questions":[{"q":"Question"}]}`
// // // // //       }
// // // // //     ])

// // // // //     let questions = []
// // // // //     const qParsed = extractJSON(qGenRaw)
// // // // //     if (qParsed?.questions) questions = qParsed.questions

// // // // //     if (!questions.length) {
// // // // //       questions = [
// // // // //         { q: 'Tell me about yourself' },
// // // // //         { q: 'Explain your project' }
// // // // //       ]
// // // // //     }

// // // // //     const result = await db.query(
// // // // //       `INSERT INTO interview_sessions (user_id, job_id, resume_text, extracted_skills, questions)
// // // // //        VALUES ($1,$2,$3,$4,$5) RETURNING id,questions,extracted_skills`,
// // // // //       [req.user.id, job_id || null, resumeText, parsed_skills.skills, JSON.stringify(questions)]
// // // // //     )

// // // // //     const session = result.rows[0]

// // // // //     res.json({
// // // // //       success: true,
// // // // //       data: {
// // // // //         session_id: session.id,
// // // // //         skills: session.extracted_skills,
// // // // //         first_question: questions[0],
// // // // //         total_questions: questions.length
// // // // //       }
// // // // //     })
// // // // //   } catch (err) {
// // // // //     console.error(err)
// // // // //     res.status(500).json({ success: false, message: err.message })
// // // // //   }
// // // // // }

// // // // // const submitAnswer = async (req, res) => {
// // // // //   try {
// // // // //     const { session_id, answer, question_index } = req.body

// // // // //     const sessionRes = await db.query(
// // // // //       'SELECT * FROM interview_sessions WHERE id=$1 AND user_id=$2',
// // // // //       [session_id, req.user.id]
// // // // //     )

// // // // //     const session = sessionRes.rows[0]
// // // // //     const questions = session.questions
// // // // //     const currentQ = questions[question_index]

// // // // //     const evalRaw = await callAI([
// // // // //       {
// // // // //         role: 'user',
// // // // //         content: `Evaluate answer and return JSON:
// // // // // {"score":7,"feedback":"Good"}`
// // // // //       }
// // // // //     ])

// // // // //     let evalResult = { score: 5, feedback: 'OK' }
// // // // //     const parsed = extractJSON(evalRaw)
// // // // //     if (parsed?.score) evalResult = parsed

// // // // //     const answers = [...(session.answers || []), {
// // // // //       question: currentQ.q,
// // // // //       answer,
// // // // //       score: evalResult.score
// // // // //     }]

// // // // //     await db.query(
// // // // //       'UPDATE interview_sessions SET answers=$1 WHERE id=$2',
// // // // //       [JSON.stringify(answers), session_id]
// // // // //     )

// // // // //     const nextIndex = question_index + 1

// // // // //     res.json({
// // // // //       success: true,
// // // // //       data: {
// // // // //         evaluation: evalResult,
// // // // //         next_question: questions[nextIndex] || null,
// // // // //         next_index: nextIndex
// // // // //       }
// // // // //     })
// // // // //   } catch (err) {
// // // // //     res.status(500).json({ success: false })
// // // // //   }
// // // // // }

// // // // // const finishInterview = async (req, res) => {
// // // // //   try {
// // // // //     const { session_id } = req.body

// // // // //     const sessionRes = await db.query(
// // // // //       'SELECT * FROM interview_sessions WHERE id=$1 AND user_id=$2',
// // // // //       [session_id, req.user.id]
// // // // //     )

// // // // //     const session = sessionRes.rows[0]
// // // // //     const answers = session.answers || []

// // // // //     const avgScore = answers.length
// // // // //       ? Math.round(answers.reduce((s, a) => s + (a.score || 0), 0) / answers.length)
// // // // //       : 0

// // // // //     const verdict = avgScore >= 6 ? 'shortlisted' : 'rejected'

// // // // //     res.json({
// // // // //       success: true,
// // // // //       data: { avgScore, verdict }
// // // // //     })
// // // // //   } catch (err) {
// // // // //     res.status(500).json({ success: false })
// // // // //   }
// // // // // }

// // // // // const getInterviewSessions = async (req, res) => {
// // // // //   try {
// // // // //     const result = await db.query(
// // // // //       `SELECT id, extracted_skills, total_score, verdict, status, created_at, completed_at
// // // // //        FROM interview_sessions WHERE user_id = $1 ORDER BY created_at DESC LIMIT 20`,
// // // // //       [req.user.id]
// // // // //     )
// // // // //     res.json({ success: true, data: result.rows })
// // // // //   } catch (err) {
// // // // //     res.status(500).json({ success: false, message: 'Failed to fetch sessions' })
// // // // //   }
// // // // // }

// // // // // const getInterviewSession = async (req, res) => {
// // // // //   try {
// // // // //     const result = await db.query(
// // // // //       'SELECT * FROM interview_sessions WHERE id = $1 AND user_id = $2',
// // // // //       [req.params.id, req.user.id]
// // // // //     )
// // // // //     if (!result.rows.length) return res.status(404).json({ success: false, message: 'Not found' })
// // // // //     res.json({ success: true, data: result.rows[0] })
// // // // //   } catch (err) {
// // // // //     res.status(500).json({ success: false, message: 'Failed to fetch session' })
// // // // //   }
// // // // // }

// // // // // module.exports = {
// // // // //   startInterview,
// // // // //   submitAnswer,
// // // // //   finishInterview,
// // // // //   getInterviewSessions,
// // // // //   getInterviewSession
// // // // // }
// // // // const db = require('../../config/db')
// // // // const pdfParse = require('pdf-parse/lib/pdf-parse.js')
// // // // const fs = require('fs')

// // // // // ==================== API KEYS ====================
// // // // const GROQ_KEY = process.env.GROQ_API_KEY
// // // // const GEMINI_KEY = process.env.GEMINI_API_KEY
// // // // const OPENROUTER_KEY = process.env.OPENROUTER_API_KEY

// // // // // ==================== OPENROUTER FREE MODELS (fallback) ====================
// // // // const FREE_MODELS = [
// // // //   'openrouter/free',
// // // //   'meta-llama/llama-4-scout:free',
// // // //   'meta-llama/llama-4-maverick:free',
// // // //   'deepseek/deepseek-chat-v3-0324:free',
// // // //   'deepseek/deepseek-r1:free',
// // // //   'nvidia/llama-3.1-nemotron-nano-8b-v1:free',
// // // //   'google/gemini-2.0-flash-exp:free',
// // // // ]

// // // // // ==================== PROVIDER HELPERS ====================
// // // // async function callGroq(messages) {
// // // //   const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
// // // //     method: 'POST',
// // // //     headers: {
// // // //       'Authorization': `Bearer ${GROQ_KEY}`,
// // // //       'Content-Type': 'application/json'
// // // //     },
// // // //     body: JSON.stringify({
// // // //       model: 'llama-3.1-8b-instant',
// // // //       messages,
// // // //       temperature: 0.3,
// // // //       max_tokens: 1500
// // // //     })
// // // //   })
// // // //   const data = await res.json()
// // // //   if (!res.ok) throw new Error(data.error?.message || 'Groq error')
// // // //   const content = data.choices?.[0]?.message?.content || ''
// // // //   if (!content) throw new Error('Empty Groq response')
// // // //   return content
// // // // }

// // // // async function callGemini(messages) {
// // // //   const contents = messages.map(m => ({
// // // //     role: m.role === 'assistant' ? 'model' : 'user',
// // // //     parts: [{ text: m.content }]
// // // //   }))
// // // //   const res = await fetch(
// // // //     `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_KEY}`,
// // // //     {
// // // //       method: 'POST',
// // // //       headers: { 'Content-Type': 'application/json' },
// // // //       body: JSON.stringify({
// // // //         contents,
// // // //         generationConfig: { temperature: 0.3, maxOutputTokens: 1500 }
// // // //       })
// // // //     }
// // // //   )
// // // //   const data = await res.json()
// // // //   if (!res.ok) throw new Error(data.error?.message || 'Gemini error')
// // // //   const content = data.candidates?.[0]?.content?.parts?.[0]?.text || ''
// // // //   if (!content) throw new Error('Empty Gemini response')
// // // //   return content
// // // // }

// // // // async function callOpenRouter(messages) {
// // // //   let lastError = null
// // // //   for (const model of FREE_MODELS) {
// // // //     try {
// // // //       console.log(`Trying OpenRouter model: ${model}`)
// // // //       const res = await fetch('https://openrouter.ai/api/v1/chat/completions', {
// // // //         method: 'POST',
// // // //         headers: {
// // // //           'Authorization': `Bearer ${OPENROUTER_KEY}`,
// // // //           'Content-Type': 'application/json',
// // // //           'HTTP-Referer': process.env.APP_URL || 'http://localhost:3000',
// // // //           'X-Title': 'Job Portal Interview'
// // // //         },
// // // //         body: JSON.stringify({
// // // //           model,
// // // //           messages,
// // // //           temperature: 0.3,
// // // //           max_tokens: 1500
// // // //         })
// // // //       })
// // // //       const data = await res.json()
// // // //       if (!res.ok) {
// // // //         const errMsg = data.error?.message || 'Unknown error'
// // // //         console.warn(`Model ${model} failed: ${errMsg}`)
// // // //         lastError = new Error(errMsg)
// // // //         continue
// // // //       }
// // // //       let content = data.choices?.[0]?.message?.content || ''
// // // //       content = content.replace(/<think>[\s\S]*?<\/think>/gi, '').trim()
// // // //       if (!content) {
// // // //         console.warn(`Model ${model} returned empty content`)
// // // //         lastError = new Error('Empty response')
// // // //         continue
// // // //       }
// // // //       console.log(`Success with OpenRouter model: ${model}`)
// // // //       return content
// // // //     } catch (err) {
// // // //       console.warn(`Model ${model} threw error:`, err.message)
// // // //       lastError = err
// // // //       continue
// // // //     }
// // // //   }
// // // //   throw new Error(`All OpenRouter models failed. Last error: ${lastError?.message}`)
// // // // }

// // // // // ==================== MAIN callAI (Groq → Gemini → OpenRouter) ====================
// // // // async function callAI(messages) {
// // // //   if (GROQ_KEY) {
// // // //     try {
// // // //       console.log('Trying Groq...')
// // // //       const result = await callGroq(messages)
// // // //       console.log('Groq success')
// // // //       return result
// // // //     } catch (err) {
// // // //       console.warn('Groq failed:', err.message)
// // // //     }
// // // //   }
// // // //   if (GEMINI_KEY) {
// // // //     try {
// // // //       console.log('Trying Gemini...')
// // // //       const result = await callGemini(messages)
// // // //       console.log('Gemini success')
// // // //       return result
// // // //     } catch (err) {
// // // //       console.warn('Gemini failed:', err.message)
// // // //     }
// // // //   }
// // // //   if (OPENROUTER_KEY) {
// // // //     try {
// // // //       console.log('Falling back to OpenRouter...')
// // // //       const result = await callOpenRouter(messages)
// // // //       console.log('OpenRouter success')
// // // //       return result
// // // //     } catch (err) {
// // // //       console.warn('OpenRouter failed:', err.message)
// // // //       throw err
// // // //     }
// // // //   }
// // // //   throw new Error('No AI API keys configured. Set GROQ_API_KEY, GEMINI_API_KEY, or OPENROUTER_API_KEY in .env')
// // // // }

// // // // // ==================== JSON EXTRACTOR ====================
// // // // function extractJSON(text) {
// // // //   try { return JSON.parse(text) } catch {}
// // // //   const fenceMatch = text.match(/```(?:json)?\s*([\s\S]*?)```/)
// // // //   if (fenceMatch) {
// // // //     try { return JSON.parse(fenceMatch[1].trim()) } catch {}
// // // //   }
// // // //   const objMatch = text.match(/\{[\s\S]*\}/)
// // // //   if (objMatch) {
// // // //     try { return JSON.parse(objMatch[0]) } catch {}
// // // //   }
// // // //   return null
// // // // }

// // // // // ==================== START INTERVIEW ====================
// // // // const startInterview = async (req, res) => {
// // // //   try {
// // // //     const { job_id } = req.body
// // // //     if (!req.file) return res.status(400).json({ success: false, message: 'Resume required' })

// // // //     const buffer = fs.readFileSync(req.file.path)
// // // //     const parsed = await pdfParse(buffer)
// // // //     const resumeText = parsed.text.slice(0, 3000)

// // // //     if (!resumeText.trim()) {
// // // //       return res.status(400).json({ success: false, message: 'Could not read PDF text.' })
// // // //     }

// // // //     console.log('Resume parsed, length:', resumeText.length)

// // // //     // Extract skills and level
// // // //     const extractionRaw = await callAI([
// // // //       {
// // // //         role: 'user',
// // // //         content: `Extract technical skills from this resume and return ONLY JSON.

// // // // Format: {"skills":["React","Node.js"],"experience_years":2,"level":"junior"}

// // // // Resume:
// // // // ${resumeText}`
// // // //       }
// // // //     ])

// // // //     let parsed_skills = { skills: ['JavaScript'], experience_years: 0, level: 'junior' }
// // // //     const extracted = extractJSON(extractionRaw)
// // // //     if (extracted?.skills) parsed_skills = extracted

// // // //     const skillsList = parsed_skills.skills.slice(0, 6).join(', ')

// // // //     // Generate TECHNICAL questions based on extracted skills
// // // //     const qGenRaw = await callAI([
// // // //       {
// // // //         role: 'user',
// // // //         content: `You are a technical interviewer. Generate 5 TECHNICAL interview questions for a candidate with these skills: ${skillsList}.
// // // // The candidate's level is ${parsed_skills.level}.

// // // // Return ONLY valid JSON in this format:
// // // // {"questions":[{"q":"Your technical question here"}]}

// // // // Make sure questions test practical knowledge, problem-solving, and depth in the listed technologies.`
// // // //       }
// // // //     ])

// // // //     let questions = []
// // // //     const qParsed = extractJSON(qGenRaw)
// // // //     if (qParsed?.questions && Array.isArray(qParsed.questions) && qParsed.questions.length > 0) {
// // // //       questions = qParsed.questions
// // // //     }

// // // //     // Fallback technical questions if AI fails
// // // //     if (!questions.length) {
// // // //       questions = [
// // // //         { q: `Explain how you would use ${skillsList.split(',')[0]} to build a scalable web application.` },
// // // //         { q: `Describe a challenging technical problem you solved recently.` },
// // // //         { q: `What are the best practices for securing a REST API?` },
// // // //         { q: `How do you handle state management in a frontend application?` },
// // // //         { q: `Explain the difference between SQL and NoSQL databases with use cases.` }
// // // //       ]
// // // //     }

// // // //     const result = await db.query(
// // // //       `INSERT INTO interview_sessions (user_id, job_id, resume_text, extracted_skills, questions)
// // // //        VALUES ($1,$2,$3,$4,$5) RETURNING id,questions,extracted_skills`,
// // // //       [req.user.id, job_id || null, resumeText, parsed_skills.skills, JSON.stringify(questions)]
// // // //     )

// // // //     const session = result.rows[0]
// // // //     // Ensure questions are parsed
// // // //     const storedQuestions = typeof session.questions === 'string' ? JSON.parse(session.questions) : session.questions

// // // //     res.json({
// // // //       success: true,
// // // //       data: {
// // // //         session_id: session.id,
// // // //         skills: session.extracted_skills,
// // // //         first_question: storedQuestions[0],
// // // //         total_questions: storedQuestions.length
// // // //       }
// // // //     })
// // // //   } catch (err) {
// // // //     console.error(err)
// // // //     res.status(500).json({ success: false, message: err.message })
// // // //   }
// // // // }

// // // // // ==================== SUBMIT ANSWER ====================
// // // // const submitAnswer = async (req, res) => {
// // // //   try {
// // // //     const { session_id, answer, question_index } = req.body

// // // //     // Validate input
// // // //     if (session_id == null || answer == null || question_index == null) {
// // // //       return res.status(400).json({ success: false, message: 'Missing required fields' })
// // // //     }

// // // //     const sessionRes = await db.query(
// // // //       'SELECT * FROM interview_sessions WHERE id=$1 AND user_id=$2',
// // // //       [session_id, req.user.id]
// // // //     )

// // // //     if (sessionRes.rows.length === 0) {
// // // //       return res.status(404).json({ success: false, message: 'Session not found' })
// // // //     }

// // // //     const session = sessionRes.rows[0]

// // // //     // Parse questions if stored as string
// // // //     let questions = session.questions
// // // //     if (typeof questions === 'string') {
// // // //       try {
// // // //         questions = JSON.parse(questions)
// // // //       } catch (e) {
// // // //         console.error('Failed to parse questions JSON:', e)
// // // //         return res.status(500).json({ success: false, message: 'Invalid questions format' })
// // // //       }
// // // //     }

// // // //     // Validate index
// // // //     if (!Array.isArray(questions) || question_index >= questions.length) {
// // // //       return res.status(400).json({ success: false, message: 'Invalid question index' })
// // // //     }

// // // //     const currentQ = questions[question_index]
// // // //     if (!currentQ || !currentQ.q) {
// // // //       return res.status(400).json({ success: false, message: 'Question data corrupted' })
// // // //     }

// // // //     // Evaluate answer with technical context
// // // //     const skillsList = Array.isArray(session.extracted_skills) ? session.extracted_skills.join(', ') : 'general technical skills'

// // // //     const evalRaw = await callAI([
// // // //       {
// // // //         role: 'user',
// // // //         content: `You are a technical interviewer. Evaluate the candidate's answer to the following technical question.

// // // // Candidate's skills: ${skillsList}
// // // // Question: "${currentQ.q}"
// // // // Answer: "${answer}"

// // // // Return ONLY valid JSON with:
// // // // - "score": integer from 0 to 10 (10 = perfect technical answer)
// // // // - "feedback": short constructive feedback focusing on technical accuracy, clarity, and depth.

// // // // Example: {"score":7,"feedback":"Good understanding of closures, but could mention memory implications."}`
// // // //       }
// // // //     ])

// // // //     let evalResult = { score: 5, feedback: 'Answer received but could not be evaluated properly.' }
// // // //     const parsed = extractJSON(evalRaw)
// // // //     if (parsed && typeof parsed.score === 'number') {
// // // //       evalResult = { score: Math.min(10, Math.max(0, parsed.score)), feedback: parsed.feedback || evalResult.feedback }
// // // //     }

// // // //     // Store answer
// // // //     const answers = session.answers ? (typeof session.answers === 'string' ? JSON.parse(session.answers) : session.answers) : []
// // // //     answers.push({
// // // //       question: currentQ.q,
// // // //       answer,
// // // //       score: evalResult.score
// // // //     })

// // // //     await db.query(
// // // //       'UPDATE interview_sessions SET answers=$1 WHERE id=$2',
// // // //       [JSON.stringify(answers), session_id]
// // // //     )

// // // //     const nextIndex = question_index + 1
// // // //     const nextQuestion = nextIndex < questions.length ? questions[nextIndex] : null

// // // //     res.json({
// // // //       success: true,
// // // //       data: {
// // // //         evaluation: evalResult,
// // // //         next_question: nextQuestion,
// // // //         next_index: nextIndex
// // // //       }
// // // //     })
// // // //   } catch (err) {
// // // //     console.error('Submit answer error:', err)
// // // //     res.status(500).json({ success: false, message: err.message || 'Internal server error' })
// // // //   }
// // // // }

// // // // // ==================== FINISH INTERVIEW ====================
// // // // const finishInterview = async (req, res) => {
// // // //   try {
// // // //     const { session_id } = req.body
// // // //     if (!session_id) return res.status(400).json({ success: false, message: 'Session ID required' })

// // // //     const sessionRes = await db.query(
// // // //       'SELECT * FROM interview_sessions WHERE id=$1 AND user_id=$2',
// // // //       [session_id, req.user.id]
// // // //     )

// // // //     if (sessionRes.rows.length === 0) {
// // // //       return res.status(404).json({ success: false, message: 'Session not found' })
// // // //     }

// // // //     const session = sessionRes.rows[0]
// // // //     let answers = session.answers
// // // //     if (typeof answers === 'string') {
// // // //       try { answers = JSON.parse(answers) } catch { answers = [] }
// // // //     }
// // // //     if (!Array.isArray(answers)) answers = []

// // // //     const avgScore = answers.length
// // // //       ? Math.round(answers.reduce((s, a) => s + (a.score || 0), 0) / answers.length)
// // // //       : 0

// // // //     const verdict = avgScore >= 6 ? 'shortlisted' : 'rejected'

// // // //     await db.query(
// // // //       'UPDATE interview_sessions SET total_score=$1, verdict=$2, status=$3, completed_at=NOW() WHERE id=$4',
// // // //       [avgScore, verdict, 'completed', session_id]
// // // //     )

// // // //     res.json({
// // // //       success: true,
// // // //       data: { avgScore, verdict }
// // // //     })
// // // //   } catch (err) {
// // // //     console.error('Finish interview error:', err)
// // // //     res.status(500).json({ success: false, message: err.message })
// // // //   }
// // // // }

// // // // // ==================== GET SESSIONS ====================
// // // // const getInterviewSessions = async (req, res) => {
// // // //   try {
// // // //     const result = await db.query(
// // // //       `SELECT id, extracted_skills, total_score, verdict, status, created_at, completed_at
// // // //        FROM interview_sessions WHERE user_id = $1 ORDER BY created_at DESC LIMIT 20`,
// // // //       [req.user.id]
// // // //     )
// // // //     res.json({ success: true, data: result.rows })
// // // //   } catch (err) {
// // // //     console.error(err)
// // // //     res.status(500).json({ success: false, message: 'Failed to fetch sessions' })
// // // //   }
// // // // }

// // // // const getInterviewSession = async (req, res) => {
// // // //   try {
// // // //     const result = await db.query(
// // // //       'SELECT * FROM interview_sessions WHERE id = $1 AND user_id = $2',
// // // //       [req.params.id, req.user.id]
// // // //     )
// // // //     if (!result.rows.length) return res.status(404).json({ success: false, message: 'Not found' })
// // // //     // Parse JSON fields for client convenience
// // // //     const session = result.rows[0]
// // // //     if (session.questions && typeof session.questions === 'string') session.questions = JSON.parse(session.questions)
// // // //     if (session.answers && typeof session.answers === 'string') session.answers = JSON.parse(session.answers)
// // // //     res.json({ success: true, data: session })
// // // //   } catch (err) {
// // // //     console.error(err)
// // // //     res.status(500).json({ success: false, message: 'Failed to fetch session' })
// // // //   }
// // // // }

// // // // module.exports = {
// // // //   startInterview,
// // // //   submitAnswer,
// // // //   finishInterview,
// // // //   getInterviewSessions,
// // // //   getInterviewSession
// // // // }
// // // const db = require('../../config/db')
// // // const pdfParse = require('pdf-parse/lib/pdf-parse.js')
// // // const fs = require('fs')

// // // // ==================== API KEYS ====================
// // // const GROQ_KEY = process.env.GROQ_API_KEY
// // // const GEMINI_KEY = process.env.GEMINI_API_KEY
// // // const OPENROUTER_KEY = process.env.OPENROUTER_API_KEY

// // // // ==================== OPENROUTER FREE MODELS ====================
// // // const FREE_MODELS = [
// // //   'openrouter/free',
// // //   'meta-llama/llama-4-scout:free',
// // //   'meta-llama/llama-4-maverick:free',
// // //   'deepseek/deepseek-chat-v3-0324:free',
// // //   'deepseek/deepseek-r1:free',
// // //   'nvidia/llama-3.1-nemotron-nano-8b-v1:free',
// // //   'google/gemini-2.0-flash-exp:free',
// // // ]

// // // // ==================== PROVIDER HELPERS ====================
// // // async function callGroq(messages) {
// // //   const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
// // //     method: 'POST',
// // //     headers: {
// // //       'Authorization': `Bearer ${GROQ_KEY}`,
// // //       'Content-Type': 'application/json'
// // //     },
// // //     body: JSON.stringify({
// // //       model: 'llama-3.1-8b-instant',
// // //       messages,
// // //       temperature: 0.3,
// // //       max_tokens: 1500
// // //     })
// // //   })
// // //   const data = await res.json()
// // //   if (!res.ok) throw new Error(data.error?.message || 'Groq error')
// // //   const content = data.choices?.[0]?.message?.content || ''
// // //   if (!content) throw new Error('Empty Groq response')
// // //   return content
// // // }

// // // async function callGemini(messages) {
// // //   const contents = messages.map(m => ({
// // //     role: m.role === 'assistant' ? 'model' : 'user',
// // //     parts: [{ text: m.content }]
// // //   }))
// // //   const res = await fetch(
// // //     `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_KEY}`,
// // //     {
// // //       method: 'POST',
// // //       headers: { 'Content-Type': 'application/json' },
// // //       body: JSON.stringify({
// // //         contents,
// // //         generationConfig: { temperature: 0.3, maxOutputTokens: 1500 }
// // //       })
// // //     }
// // //   )
// // //   const data = await res.json()
// // //   if (!res.ok) throw new Error(data.error?.message || 'Gemini error')
// // //   const content = data.candidates?.[0]?.content?.parts?.[0]?.text || ''
// // //   if (!content) throw new Error('Empty Gemini response')
// // //   return content
// // // }

// // // async function callOpenRouter(messages) {
// // //   let lastError = null
// // //   for (const model of FREE_MODELS) {
// // //     try {
// // //       console.log(`Trying OpenRouter model: ${model}`)
// // //       const res = await fetch('https://openrouter.ai/api/v1/chat/completions', {
// // //         method: 'POST',
// // //         headers: {
// // //           'Authorization': `Bearer ${OPENROUTER_KEY}`,
// // //           'Content-Type': 'application/json',
// // //           'HTTP-Referer': process.env.APP_URL || 'http://localhost:3000',
// // //           'X-Title': 'Job Portal Interview'
// // //         },
// // //         body: JSON.stringify({
// // //           model,
// // //           messages,
// // //           temperature: 0.3,
// // //           max_tokens: 1500
// // //         })
// // //       })
// // //       const data = await res.json()
// // //       if (!res.ok) {
// // //         const errMsg = data.error?.message || 'Unknown error'
// // //         console.warn(`Model ${model} failed: ${errMsg}`)
// // //         lastError = new Error(errMsg)
// // //         continue
// // //       }
// // //       let content = data.choices?.[0]?.message?.content || ''
// // //       content = content.replace(/<think>[\s\S]*?<\/think>/gi, '').trim()
// // //       if (!content) {
// // //         console.warn(`Model ${model} returned empty content`)
// // //         lastError = new Error('Empty response')
// // //         continue
// // //       }
// // //       console.log(`Success with OpenRouter model: ${model}`)
// // //       return content
// // //     } catch (err) {
// // //       console.warn(`Model ${model} threw error:`, err.message)
// // //       lastError = err
// // //       continue
// // //     }
// // //   }
// // //   throw new Error(`All OpenRouter models failed. Last error: ${lastError?.message}`)
// // // }

// // // // ==================== MAIN callAI (Groq → Gemini → OpenRouter) ====================
// // // async function callAI(messages) {
// // //   if (GROQ_KEY) {
// // //     try {
// // //       console.log('Trying Groq...')
// // //       const result = await callGroq(messages)
// // //       console.log('Groq success')
// // //       return result
// // //     } catch (err) {
// // //       console.warn('Groq failed:', err.message)
// // //     }
// // //   }
// // //   if (GEMINI_KEY) {
// // //     try {
// // //       console.log('Trying Gemini...')
// // //       const result = await callGemini(messages)
// // //       console.log('Gemini success')
// // //       return result
// // //     } catch (err) {
// // //       console.warn('Gemini failed:', err.message)
// // //     }
// // //   }
// // //   if (OPENROUTER_KEY) {
// // //     try {
// // //       console.log('Falling back to OpenRouter...')
// // //       const result = await callOpenRouter(messages)
// // //       console.log('OpenRouter success')
// // //       return result
// // //     } catch (err) {
// // //       console.warn('OpenRouter failed:', err.message)
// // //       throw err
// // //     }
// // //   }
// // //   throw new Error('No AI API keys configured. Set GROQ_API_KEY, GEMINI_API_KEY, or OPENROUTER_API_KEY in .env')
// // // }

// // // // ==================== JSON EXTRACTOR ====================
// // // function extractJSON(text) {
// // //   try { return JSON.parse(text) } catch {}
// // //   const fenceMatch = text.match(/```(?:json)?\s*([\s\S]*?)```/)
// // //   if (fenceMatch) {
// // //     try { return JSON.parse(fenceMatch[1].trim()) } catch {}
// // //   }
// // //   const objMatch = text.match(/\{[\s\S]*\}/)
// // //   if (objMatch) {
// // //     try { return JSON.parse(objMatch[0]) } catch {}
// // //   }
// // //   return null
// // // }

// // // // ==================== START INTERVIEW ====================
// // // const startInterview = async (req, res) => {
// // //   try {
// // //     const { job_id } = req.body
// // //     if (!req.file) return res.status(400).json({ success: false, message: 'Resume required' })

// // //     const buffer = fs.readFileSync(req.file.path)
// // //     const parsed = await pdfParse(buffer)
// // //     const resumeText = parsed.text.slice(0, 3000)

// // //     if (!resumeText.trim()) {
// // //       return res.status(400).json({ success: false, message: 'Could not read PDF text.' })
// // //     }

// // //     console.log('Resume parsed, length:', resumeText.length)

// // //     // Extract skills
// // //     const extractionRaw = await callAI([
// // //       {
// // //         role: 'user',
// // //         content: `Extract technical skills from this resume and return ONLY JSON.

// // // Format: {"skills":["React","Node.js"],"experience_years":2,"level":"junior"}

// // // Resume:
// // // ${resumeText}`
// // //       }
// // //     ])

// // //     let parsed_skills = { skills: ['JavaScript'], experience_years: 0, level: 'junior' }
// // //     const extracted = extractJSON(extractionRaw)
// // //     if (extracted?.skills) parsed_skills = extracted

// // //     const skillsList = parsed_skills.skills.slice(0, 6).join(', ')

// // //     // Generate TECHNICAL questions – NO CODE, just concepts & scenarios
// // //     const qGenRaw = await callAI([
// // //       {
// // //         role: 'user',
// // //         content: `You are a technical interviewer. Generate 5 TECHNICAL interview questions for a candidate with skills: ${skillsList}. Level: ${parsed_skills.level}.

// // // IMPORTANT RULES:
// // // - Do NOT ask the candidate to write code.
// // // - Ask about concepts, design decisions, troubleshooting, best practices, or real-world scenarios.
// // // - Examples of good questions: "How would you debug a memory leak in a React app?" or "Explain how you would design a rate-limiting system for an API."
// // // - Avoid simple definitions like "What is Java?".

// // // Return ONLY valid JSON in this format:
// // // {"questions":[{"q":"Your technical scenario question here"}]}`
// // //       }
// // //     ])

// // //     let questions = []
// // //     const qParsed = extractJSON(qGenRaw)
// // //     if (qParsed?.questions && Array.isArray(qParsed.questions) && qParsed.questions.length > 0) {
// // //       questions = qParsed.questions
// // //     }

// // //     // Safe fallback questions (technical, no code)
// // //     if (!questions.length) {
// // //       questions = [
// // //         { q: `Explain a situation where you used ${skillsList.split(',')[0] || 'a technology'} to solve a performance problem.` },
// // //         { q: "How would you handle a sudden spike in traffic on a web application?" },
// // //         { q: "Describe your approach to debugging a production issue that you cannot reproduce locally." },
// // //         { q: "What trade-offs would you consider when choosing between SQL and NoSQL databases?" },
// // //         { q: "How do you ensure the security of user data in a full‑stack application?" }
// // //       ]
// // //     }

// // //     // Insert into DB
// // //     const result = await db.query(
// // //       `INSERT INTO interview_sessions (user_id, job_id, resume_text, extracted_skills, questions)
// // //        VALUES ($1,$2,$3,$4,$5) RETURNING id,questions,extracted_skills`,
// // //       [req.user.id, job_id || null, resumeText, parsed_skills.skills, JSON.stringify(questions)]
// // //     )

// // //     const session = result.rows[0]
// // //     // Ensure questions are parsed and valid
// // //     let storedQuestions = session.questions
// // //     if (typeof storedQuestions === 'string') {
// // //       try { storedQuestions = JSON.parse(storedQuestions) } catch { storedQuestions = questions }
// // //     }
// // //     if (!Array.isArray(storedQuestions) || storedQuestions.length === 0) {
// // //       storedQuestions = questions
// // //     }

// // //     const firstQ = storedQuestions[0] || { q: "Tell me about your technical background." }

// // //     res.json({
// // //       success: true,
// // //       data: {
// // //         session_id: session.id,
// // //         skills: session.extracted_skills,
// // //         first_question: firstQ,
// // //         total_questions: storedQuestions.length
// // //       }
// // //     })
// // //   } catch (err) {
// // //     console.error(err)
// // //     res.status(500).json({ success: false, message: err.message })
// // //   }
// // // }

// // // // ==================== SUBMIT ANSWER ====================
// // // const submitAnswer = async (req, res) => {
// // //   try {
// // //     const { session_id, answer, question_index } = req.body

// // //     if (session_id == null || answer == null || question_index == null) {
// // //       return res.status(400).json({ success: false, message: 'Missing required fields' })
// // //     }

// // //     const sessionRes = await db.query(
// // //       'SELECT * FROM interview_sessions WHERE id=$1 AND user_id=$2',
// // //       [session_id, req.user.id]
// // //     )

// // //     if (sessionRes.rows.length === 0) {
// // //       return res.status(404).json({ success: false, message: 'Session not found' })
// // //     }

// // //     const session = sessionRes.rows[0]

// // //     // Parse questions safely
// // //     let questions = session.questions
// // //     if (typeof questions === 'string') {
// // //       try { questions = JSON.parse(questions) } catch { questions = [] }
// // //     }
// // //     if (!Array.isArray(questions)) questions = []

// // //     if (question_index >= questions.length) {
// // //       return res.status(400).json({ success: false, message: 'Invalid question index' })
// // //     }

// // //     const currentQ = questions[question_index]
// // //     if (!currentQ || !currentQ.q) {
// // //       return res.status(400).json({ success: false, message: 'Question data is corrupted' })
// // //     }

// // //     const skillsList = Array.isArray(session.extracted_skills) ? session.extracted_skills.join(', ') : 'technical skills'

// // //     // Evaluate answer – focus on conceptual correctness
// // //     const evalRaw = await callAI([
// // //       {
// // //         role: 'user',
// // //         content: `You are a technical interviewer. Evaluate the candidate's answer to the following question.

// // // Candidate's skills: ${skillsList}
// // // Question: "${currentQ.q}"
// // // Answer: "${answer}"

// // // Return ONLY valid JSON with:
// // // - "score": integer from 0 to 10 (10 = excellent technical understanding, clear reasoning)
// // // - "feedback": short constructive feedback (2-3 sentences) focusing on technical accuracy and clarity.

// // // Example: {"score":7,"feedback":"Good explanation of caching strategies, but could mention cache invalidation methods."}`
// // //       }
// // //     ])

// // //     let evalResult = { score: 5, feedback: 'Answer received but could not be evaluated fully.' }
// // //     const parsed = extractJSON(evalRaw)
// // //     if (parsed && typeof parsed.score === 'number') {
// // //       evalResult = {
// // //         score: Math.min(10, Math.max(0, parsed.score)),
// // //         feedback: parsed.feedback || evalResult.feedback
// // //       }
// // //     }

// // //     // Store answer
// // //     let answers = session.answers
// // //     if (typeof answers === 'string') {
// // //       try { answers = JSON.parse(answers) } catch { answers = [] }
// // //     }
// // //     if (!Array.isArray(answers)) answers = []

// // //     answers.push({
// // //       question: currentQ.q,
// // //       answer,
// // //       score: evalResult.score
// // //     })

// // //     await db.query(
// // //       'UPDATE interview_sessions SET answers=$1 WHERE id=$2',
// // //       [JSON.stringify(answers), session_id]
// // //     )

// // //     const nextIndex = question_index + 1
// // //     const nextQuestion = nextIndex < questions.length ? questions[nextIndex] : null

// // //     res.json({
// // //       success: true,
// // //       data: {
// // //         evaluation: evalResult,
// // //         next_question: nextQuestion,
// // //         next_index: nextIndex
// // //       }
// // //     })
// // //   } catch (err) {
// // //     console.error('Submit answer error:', err)
// // //     res.status(500).json({ success: false, message: err.message || 'Internal server error' })
// // //   }
// // // }

// // // // ==================== FINISH INTERVIEW ====================
// // // const finishInterview = async (req, res) => {
// // //   try {
// // //     const { session_id } = req.body
// // //     if (!session_id) return res.status(400).json({ success: false, message: 'Session ID required' })

// // //     const sessionRes = await db.query(
// // //       'SELECT * FROM interview_sessions WHERE id=$1 AND user_id=$2',
// // //       [session_id, req.user.id]
// // //     )

// // //     if (sessionRes.rows.length === 0) {
// // //       return res.status(404).json({ success: false, message: 'Session not found' })
// // //     }

// // //     const session = sessionRes.rows[0]
// // //     let answers = session.answers
// // //     if (typeof answers === 'string') {
// // //       try { answers = JSON.parse(answers) } catch { answers = [] }
// // //     }
// // //     if (!Array.isArray(answers)) answers = []

// // //     const avgScore = answers.length
// // //       ? Math.round(answers.reduce((s, a) => s + (a.score || 0), 0) / answers.length)
// // //       : 0

// // //     const verdict = avgScore >= 6 ? 'shortlisted' : 'rejected'

// // //     await db.query(
// // //       'UPDATE interview_sessions SET total_score=$1, verdict=$2, status=$3, completed_at=NOW() WHERE id=$4',
// // //       [avgScore, verdict, 'completed', session_id]
// // //     )

// // //     res.json({
// // //       success: true,
// // //       data: { avgScore, verdict }
// // //     })
// // //   } catch (err) {
// // //     console.error('Finish interview error:', err)
// // //     res.status(500).json({ success: false, message: err.message })
// // //   }
// // // }

// // // // ==================== GET SESSIONS ====================
// // // const getInterviewSessions = async (req, res) => {
// // //   try {
// // //     const result = await db.query(
// // //       `SELECT id, extracted_skills, total_score, verdict, status, created_at, completed_at
// // //        FROM interview_sessions WHERE user_id = $1 ORDER BY created_at DESC LIMIT 20`,
// // //       [req.user.id]
// // //     )
// // //     res.json({ success: true, data: result.rows })
// // //   } catch (err) {
// // //     console.error(err)
// // //     res.status(500).json({ success: false, message: 'Failed to fetch sessions' })
// // //   }
// // // }

// // // const getInterviewSession = async (req, res) => {
// // //   try {
// // //     const result = await db.query(
// // //       'SELECT * FROM interview_sessions WHERE id = $1 AND user_id = $2',
// // //       [req.params.id, req.user.id]
// // //     )
// // //     if (!result.rows.length) return res.status(404).json({ success: false, message: 'Not found' })
// // //     const session = result.rows[0]
// // //     if (session.questions && typeof session.questions === 'string') session.questions = JSON.parse(session.questions)
// // //     if (session.answers && typeof session.answers === 'string') session.answers = JSON.parse(session.answers)
// // //     res.json({ success: true, data: session })
// // //   } catch (err) {
// // //     console.error(err)
// // //     res.status(500).json({ success: false, message: 'Failed to fetch session' })
// // //   }
// // // }

// // // module.exports = {
// // //   startInterview,
// // //   submitAnswer,
// // //   finishInterview,
// // //   getInterviewSessions,
// // //   getInterviewSession
// // // }
// // const db = require('../../config/db')
// // const pdfParse = require('pdf-parse/lib/pdf-parse.js')
// // const fs = require('fs')

// // // ==================== API KEYS ====================
// // const GROQ_KEY = process.env.GROQ_API_KEY
// // const GEMINI_KEY = process.env.GEMINI_API_KEY
// // const OPENROUTER_KEY = process.env.OPENROUTER_API_KEY

// // // ==================== OPENROUTER FREE MODELS ====================
// // const FREE_MODELS = [
// //   'meta-llama/llama-4-scout:free',
// //   'meta-llama/llama-4-maverick:free',
// //   'deepseek/deepseek-chat-v3-0324:free',
// //   'google/gemini-2.0-flash-exp:free',
// //   'nvidia/llama-3.1-nemotron-nano-8b-v1:free',
// // ]

// // // ==================== PROVIDER HELPERS ====================
// // async function callGroq(messages) {
// //   const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
// //     method: 'POST',
// //     headers: { 'Authorization': `Bearer ${GROQ_KEY}`, 'Content-Type': 'application/json' },
// //     body: JSON.stringify({ model: 'llama-3.1-8b-instant', messages, temperature: 0.3, max_tokens: 1500 })
// //   })
// //   const data = await res.json()
// //   if (!res.ok) throw new Error(data.error?.message || 'Groq error')
// //   const content = data.choices?.[0]?.message?.content?.trim()
// //   if (!content) throw new Error('Empty Groq response')
// //   return content
// // }

// // async function callGemini(messages) {
// //   // Gemini requires alternating user/model roles — merge consecutive same-role messages
// //   const contents = []
// //   for (const m of messages) {
// //     const role = m.role === 'assistant' ? 'model' : 'user'
// //     if (contents.length && contents[contents.length - 1].role === role) {
// //       contents[contents.length - 1].parts[0].text += '\n' + m.content
// //     } else {
// //       contents.push({ role, parts: [{ text: m.content }] })
// //     }
// //   }
// //   const res = await fetch(
// //     `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_KEY}`,
// //     {
// //       method: 'POST',
// //       headers: { 'Content-Type': 'application/json' },
// //       body: JSON.stringify({ contents, generationConfig: { temperature: 0.3, maxOutputTokens: 1500 } })
// //     }
// //   )
// //   const data = await res.json()
// //   if (!res.ok) throw new Error(data.error?.message || 'Gemini error')
// //   const content = data.candidates?.[0]?.content?.parts?.[0]?.text?.trim()
// //   if (!content) throw new Error('Empty Gemini response')
// //   return content
// // }

// // async function callOpenRouter(messages) {
// //   let lastError = null
// //   for (const model of FREE_MODELS) {
// //     try {
// //       const res = await fetch('https://openrouter.ai/api/v1/chat/completions', {
// //         method: 'POST',
// //         headers: {
// //           'Authorization': `Bearer ${OPENROUTER_KEY}`,
// //           'Content-Type': 'application/json',
// //           'HTTP-Referer': process.env.APP_URL || 'http://localhost:3000',
// //           'X-Title': 'Job Portal Interview'
// //         },
// //         body: JSON.stringify({ model, messages, temperature: 0.3, max_tokens: 1500 })
// //       })
// //       const data = await res.json()
// //       if (!res.ok) { lastError = new Error(data.error?.message || 'Unknown error'); continue }
// //       let content = data.choices?.[0]?.message?.content || ''
// //       content = content.replace(/<think>[\s\S]*?<\/think>/gi, '').trim()
// //       if (!content) { lastError = new Error('Empty response'); continue }
// //       return content
// //     } catch (err) {
// //       lastError = err
// //     }
// //   }
// //   throw new Error(`All OpenRouter models failed. Last: ${lastError?.message}`)
// // }

// // // ==================== MAIN callAI ====================
// // async function callAI(messages) {
// //   if (GROQ_KEY) {
// //     try { return await callGroq(messages) } catch (err) { console.warn('Groq failed:', err.message) }
// //   }
// //   if (GEMINI_KEY) {
// //     try { return await callGemini(messages) } catch (err) { console.warn('Gemini failed:', err.message) }
// //   }
// //   if (OPENROUTER_KEY) {
// //     return await callOpenRouter(messages)
// //   }
// //   throw new Error('No AI API keys configured.')
// // }

// // // ==================== JSON EXTRACTOR ====================
// // function extractJSON(text) {
// //   if (!text) return null
// //   // Strip markdown fences first
// //   const fenceMatch = text.match(/```(?:json)?\s*([\s\S]*?)```/)
// //   const cleaned = fenceMatch ? fenceMatch[1].trim() : text.trim()
// //   try { return JSON.parse(cleaned) } catch {}
// //   // Try to pull out first {...} block
// //   const objMatch = cleaned.match(/\{[\s\S]*\}/)
// //   if (objMatch) {
// //     try { return JSON.parse(objMatch[0]) } catch {}
// //   }
// //   return null
// // }

// // // ==================== SAFE JSON PARSE ====================
// // function safeParse(val) {
// //   if (!val) return null
// //   if (typeof val === 'object') return val
// //   try { return JSON.parse(val) } catch { return null }
// // }

// // // ==================== START INTERVIEW ====================
// // const startInterview = async (req, res) => {
// //   try {
// //     const { job_id } = req.body
// //     if (!req.file) return res.status(400).json({ success: false, message: 'Resume file is required' })

// //     const buffer = fs.readFileSync(req.file.path)
// //     const parsed = await pdfParse(buffer)
// //     const resumeText = parsed.text.slice(0, 3000).trim()

// //     if (!resumeText) {
// //       return res.status(400).json({ success: false, message: 'Could not extract text from the PDF. Please upload a text-based PDF.' })
// //     }

// //     // Step 1: Extract skills
// //     const extractionRaw = await callAI([
// //       {
// //         role: 'user',
// //         content: `You are a resume parser. Extract ONLY the technical skills, programming languages, frameworks, and tools from the resume below.

// // Return ONLY valid JSON — no explanation, no markdown, no extra text.
// // Format: {"skills":["React","Node.js","PostgreSQL"],"experience_years":2,"level":"junior"}
// // Level must be one of: "junior", "mid", "senior"

// // Resume:
// // ${resumeText}`
// //       }
// //     ])

// //     let parsed_skills = { skills: ['JavaScript'], experience_years: 1, level: 'junior' }
// //     const extracted = extractJSON(extractionRaw)
// //     if (extracted?.skills && Array.isArray(extracted.skills) && extracted.skills.length > 0) {
// //       parsed_skills = {
// //         skills: extracted.skills.slice(0, 8),
// //         experience_years: extracted.experience_years || 0,
// //         level: extracted.level || 'junior'
// //       }
// //     }

// //     const skillsList = parsed_skills.skills.join(', ')
// //     const level = parsed_skills.level

// //     // Step 2: Generate skill-specific technical questions
// //     const qGenRaw = await callAI([
// //       {
// //         role: 'user',
// //         content: `You are a senior technical interviewer conducting a ${level}-level interview.

// // The candidate's tech stack: ${skillsList}

// // Generate exactly 5 technical interview questions that:
// // - Are specific to the candidate's listed technologies (NOT generic)
// // - Test real understanding, not just definitions
// // - Include at least 1 coding/problem-solving scenario
// // - Include at least 1 system design or architecture question
// // - Avoid HR or behavioral questions entirely

// // Return ONLY valid JSON — no explanation, no markdown, no extra text.
// // Format: {"questions":[{"q":"Specific technical question here?","topic":"React","difficulty":"medium"}]}`
// //       }
// //     ])

// //     let questions = []
// //     const qParsed = extractJSON(qGenRaw)
// //     if (qParsed?.questions && Array.isArray(qParsed.questions) && qParsed.questions.length >= 3) {
// //       questions = qParsed.questions.map(q => ({ q: q.q || q.question, topic: q.topic || '', difficulty: q.difficulty || 'medium' })).filter(q => q.q)
// //     }

// //     // Fallback: skill-specific questions if AI response was bad
// //     if (questions.length < 3) {
// //       const topSkill = parsed_skills.skills[0] || 'JavaScript'
// //       const secondSkill = parsed_skills.skills[1] || 'Node.js'
// //       questions = [
// //         { q: `Explain the event loop in ${topSkill} and how it handles asynchronous operations. Give a concrete example.`, topic: topSkill, difficulty: 'medium' },
// //         { q: `You need to design a scalable REST API using ${secondSkill}. What architectural decisions would you make and why?`, topic: secondSkill, difficulty: 'hard' },
// //         { q: `In ${topSkill}, what is the difference between shallow copy and deep copy? Write a function that deep clones an object.`, topic: topSkill, difficulty: 'medium' },
// //         { q: `Describe a performance bottleneck you encountered in a ${topSkill} project and how you debugged and resolved it.`, topic: topSkill, difficulty: 'hard' },
// //         { q: `How do you handle authentication and authorization in a ${secondSkill} application? What security vulnerabilities should you guard against?`, topic: secondSkill, difficulty: 'medium' }
// //       ]
// //     }

// //     const result = await db.query(
// //       `INSERT INTO interview_sessions (user_id, job_id, resume_text, extracted_skills, questions)
// //        VALUES ($1,$2,$3,$4,$5) RETURNING id, questions, extracted_skills`,
// //       [req.user.id, job_id || null, resumeText, parsed_skills.skills, JSON.stringify(questions)]
// //     )

// //     const session = result.rows[0]
// //     const storedQuestions = safeParse(session.questions) || questions

// //     res.json({
// //       success: true,
// //       data: {
// //         session_id: session.id,
// //         skills: session.extracted_skills,
// //         level: parsed_skills.level,
// //         experience_years: parsed_skills.experience_years,
// //         first_question: storedQuestions[0],
// //         total_questions: storedQuestions.length
// //       }
// //     })
// //   } catch (err) {
// //     console.error('startInterview error:', err)
// //     res.status(500).json({ success: false, message: err.message || 'Failed to start interview' })
// //   }
// // }

// // // ==================== SUBMIT ANSWER ====================
// // const submitAnswer = async (req, res) => {
// //   try {
// //     const { session_id, answer, question_index } = req.body

// //     if (session_id == null || answer == null || question_index == null) {
// //       return res.status(400).json({ success: false, message: 'Missing required fields: session_id, answer, question_index' })
// //     }

// //     if (!answer.trim()) {
// //       return res.status(400).json({ success: false, message: 'Answer cannot be empty' })
// //     }

// //     const sessionRes = await db.query(
// //       'SELECT * FROM interview_sessions WHERE id=$1 AND user_id=$2',
// //       [session_id, req.user.id]
// //     )
// //     if (!sessionRes.rows.length) {
// //       return res.status(404).json({ success: false, message: 'Session not found' })
// //     }

// //     const session = sessionRes.rows[0]
// //     const questions = safeParse(session.questions)

// //     if (!Array.isArray(questions)) {
// //       return res.status(500).json({ success: false, message: 'Questions data is corrupted' })
// //     }
// //     if (question_index < 0 || question_index >= questions.length) {
// //       return res.status(400).json({ success: false, message: `Invalid question index: ${question_index}. Session has ${questions.length} questions.` })
// //     }

// //     const currentQ = questions[question_index]
// //     if (!currentQ?.q) {
// //       return res.status(500).json({ success: false, message: 'Question data is corrupted' })
// //     }

// //     const skillsList = Array.isArray(session.extracted_skills)
// //       ? session.extracted_skills.join(', ')
// //       : 'general programming'

// //     // Evaluate the answer with full context
// //     const evalRaw = await callAI([
// //       {
// //         role: 'user',
// //         content: `You are a strict technical interviewer evaluating a candidate's answer.

// // Candidate's tech stack: ${skillsList}
// // Question: "${currentQ.q}"
// // Topic: ${currentQ.topic || 'General'}
// // Difficulty: ${currentQ.difficulty || 'medium'}

// // Candidate's Answer: "${answer}"

// // Evaluate based on: technical accuracy, depth of knowledge, clarity, and completeness.

// // Return ONLY valid JSON — no explanation, no markdown, no extra text.
// // Format: {"score":7,"feedback":"Detailed constructive feedback here","strengths":["strength1"],"gaps":["gap1"]}`
// //       }
// //     ])

// //     let evalResult = { score: 5, feedback: 'Answer recorded. Unable to evaluate automatically.', strengths: [], gaps: [] }
// //     const evalParsed = extractJSON(evalRaw)
// //     if (evalParsed && typeof evalParsed.score === 'number') {
// //       evalResult = {
// //         score: Math.min(10, Math.max(0, Math.round(evalParsed.score))),
// //         feedback: evalParsed.feedback || evalResult.feedback,
// //         strengths: Array.isArray(evalParsed.strengths) ? evalParsed.strengths : [],
// //         gaps: Array.isArray(evalParsed.gaps) ? evalParsed.gaps : []
// //       }
// //     }

// //     // Append to answers array
// //     const existingAnswers = safeParse(session.answers) || []
// //     existingAnswers.push({
// //       question_index,
// //       question: currentQ.q,
// //       topic: currentQ.topic || '',
// //       answer: answer.trim(),
// //       score: evalResult.score,
// //       feedback: evalResult.feedback,
// //       strengths: evalResult.strengths,
// //       gaps: evalResult.gaps
// //     })

// //     await db.query(
// //       'UPDATE interview_sessions SET answers=$1 WHERE id=$2',
// //       [JSON.stringify(existingAnswers), session_id]
// //     )

// //     const nextIndex = question_index + 1
// //     // BUG FIX: Guard against null — only return next_question if it actually exists
// //     const nextQuestion = (nextIndex < questions.length) ? questions[nextIndex] : null
// //     const isLast = nextQuestion === null

// //     res.json({
// //       success: true,
// //       data: {
// //         evaluation: evalResult,
// //         next_question: nextQuestion,   // null when done — frontend must handle this
// //         next_index: nextIndex,
// //         is_complete: isLast,
// //         questions_answered: nextIndex,
// //         total_questions: questions.length
// //       }
// //     })
// //   } catch (err) {
// //     console.error('submitAnswer error:', err)
// //     res.status(500).json({ success: false, message: err.message || 'Failed to evaluate answer' })
// //   }
// // }

// // // ==================== FINISH INTERVIEW ====================
// // const finishInterview = async (req, res) => {
// //   try {
// //     const { session_id } = req.body
// //     if (!session_id) return res.status(400).json({ success: false, message: 'session_id is required' })

// //     const sessionRes = await db.query(
// //       'SELECT * FROM interview_sessions WHERE id=$1 AND user_id=$2',
// //       [session_id, req.user.id]
// //     )
// //     if (!sessionRes.rows.length) {
// //       return res.status(404).json({ success: false, message: 'Session not found' })
// //     }

// //     const session = sessionRes.rows[0]
// //     const answers = safeParse(session.answers) || []

// //     const avgScore = answers.length
// //       ? Math.round(answers.reduce((s, a) => s + (a.score || 0), 0) / answers.length)
// //       : 0

// //     const verdict = avgScore >= 7 ? 'shortlisted' : avgScore >= 5 ? 'maybe' : 'rejected'

// //     // Build per-topic breakdown
// //     const topicScores = {}
// //     for (const a of answers) {
// //       if (a.topic) {
// //         if (!topicScores[a.topic]) topicScores[a.topic] = []
// //         topicScores[a.topic].push(a.score)
// //       }
// //     }
// //     const topicBreakdown = Object.entries(topicScores).map(([topic, scores]) => ({
// //       topic,
// //       avg: Math.round(scores.reduce((s, v) => s + v, 0) / scores.length)
// //     }))

// //     // Generate AI summary
// //     let summary = `Candidate completed ${answers.length} technical questions with an average score of ${avgScore}/10.`
// //     try {
// //       const summaryRaw = await callAI([
// //         {
// //           role: 'user',
// //           content: `Summarize this technical interview performance in 3 sentences. Be direct and professional.

// // Skills tested: ${Array.isArray(session.extracted_skills) ? session.extracted_skills.join(', ') : 'N/A'}
// // Questions answered: ${answers.length}
// // Scores: ${answers.map((a, i) => `Q${i+1}(${a.topic||'General'}): ${a.score}/10`).join(', ')}
// // Average score: ${avgScore}/10
// // Verdict: ${verdict}

// // Write the summary:`
// //         }
// //       ])
// //       if (summaryRaw && summaryRaw.trim()) summary = summaryRaw.trim()
// //     } catch (e) {
// //       console.warn('Summary generation failed:', e.message)
// //     }

// //     await db.query(
// //       `UPDATE interview_sessions
// //        SET total_score=$1, verdict=$2, status='completed', completed_at=NOW()
// //        WHERE id=$3`,
// //       [avgScore, verdict, session_id]
// //     )

// //     res.json({
// //       success: true,
// //       data: {
// //         session_id,
// //         total_score: avgScore,
// //         verdict,
// //         summary,
// //         topic_breakdown: topicBreakdown,
// //         answers,
// //         skills_tested: session.extracted_skills,
// //         questions_answered: answers.length
// //       }
// //     })
// //   } catch (err) {
// //     console.error('finishInterview error:', err)
// //     res.status(500).json({ success: false, message: err.message || 'Failed to finish interview' })
// //   }
// // }

// // // ==================== GET SESSIONS ====================
// // const getInterviewSessions = async (req, res) => {
// //   try {
// //     const result = await db.query(
// //       `SELECT id, extracted_skills, total_score, verdict, status, created_at, completed_at
// //        FROM interview_sessions WHERE user_id=$1 ORDER BY created_at DESC LIMIT 20`,
// //       [req.user.id]
// //     )
// //     res.json({ success: true, data: result.rows })
// //   } catch (err) {
// //     console.error(err)
// //     res.status(500).json({ success: false, message: 'Failed to fetch sessions' })
// //   }
// // }

// // const getInterviewSession = async (req, res) => {
// //   try {
// //     const result = await db.query(
// //       'SELECT * FROM interview_sessions WHERE id=$1 AND user_id=$2',
// //       [req.params.id, req.user.id]
// //     )
// //     if (!result.rows.length) return res.status(404).json({ success: false, message: 'Not found' })
// //     const session = result.rows[0]
// //     session.questions = safeParse(session.questions)
// //     session.answers = safeParse(session.answers)
// //     res.json({ success: true, data: session })
// //   } catch (err) {
// //     console.error(err)
// //     res.status(500).json({ success: false, message: 'Failed to fetch session' })
// //   }
// // }

// // module.exports = {
// //   startInterview,
// //   submitAnswer,
// //   finishInterview,
// //   getInterviewSessions,
// //   getInterviewSession
// // }
// //working
// const db = require('../../config/db')
// const pdfParse = require('pdf-parse/lib/pdf-parse.js')
// const fs = require('fs')

// const GROQ_KEY = process.env.GROQ_API_KEY
// const GEMINI_KEY = process.env.GEMINI_API_KEY
// const OPENROUTER_KEY = process.env.OPENROUTER_API_KEY

// const FREE_MODELS = [
//   'meta-llama/llama-4-scout:free',
//   'meta-llama/llama-4-maverick:free',
//   'deepseek/deepseek-chat-v3-0324:free',
//   'google/gemini-2.0-flash-exp:free',
//   'nvidia/llama-3.1-nemotron-nano-8b-v1:free',
// ]

// // ==================== PROVIDER HELPERS ====================
// async function callGroq(messages) {
//   const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
//     method: 'POST',
//     headers: { 'Authorization': `Bearer ${GROQ_KEY}`, 'Content-Type': 'application/json' },
//     body: JSON.stringify({ model: 'llama-3.1-8b-instant', messages, temperature: 0.3, max_tokens: 1500 })
//   })
//   const data = await res.json()
//   if (!res.ok) throw new Error(data.error?.message || 'Groq error')
//   const content = data.choices?.[0]?.message?.content?.trim()
//   if (!content) throw new Error('Empty Groq response')
//   return content
// }

// async function callGemini(messages) {
//   const contents = []
//   for (const m of messages) {
//     const role = m.role === 'assistant' ? 'model' : 'user'
//     if (contents.length && contents[contents.length - 1].role === role) {
//       contents[contents.length - 1].parts[0].text += '\n' + m.content
//     } else {
//       contents.push({ role, parts: [{ text: m.content }] })
//     }
//   }
//   const res = await fetch(
//     `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_KEY}`,
//     {
//       method: 'POST',
//       headers: { 'Content-Type': 'application/json' },
//       body: JSON.stringify({ contents, generationConfig: { temperature: 0.3, maxOutputTokens: 1500 } })
//     }
//   )
//   const data = await res.json()
//   if (!res.ok) throw new Error(data.error?.message || 'Gemini error')
//   const content = data.candidates?.[0]?.content?.parts?.[0]?.text?.trim()
//   if (!content) throw new Error('Empty Gemini response')
//   return content
// }

// async function callOpenRouter(messages) {
//   let lastError = null
//   for (const model of FREE_MODELS) {
//     try {
//       const res = await fetch('https://openrouter.ai/api/v1/chat/completions', {
//         method: 'POST',
//         headers: {
//           'Authorization': `Bearer ${OPENROUTER_KEY}`,
//           'Content-Type': 'application/json',
//           'HTTP-Referer': process.env.APP_URL || 'http://localhost:3000',
//           'X-Title': 'Job Portal Interview'
//         },
//         body: JSON.stringify({ model, messages, temperature: 0.3, max_tokens: 1500 })
//       })
//       const data = await res.json()
//       if (!res.ok) { lastError = new Error(data.error?.message || 'Unknown'); continue }
//       let content = data.choices?.[0]?.message?.content || ''
//       content = content.replace(/<think>[\s\S]*?<\/think>/gi, '').trim()
//       if (!content) { lastError = new Error('Empty'); continue }
//       return content
//     } catch (err) { lastError = err }
//   }
//   throw new Error(`All OpenRouter models failed: ${lastError?.message}`)
// }

// async function callAI(messages) {
//   if (GROQ_KEY) {
//     try { return await callGroq(messages) } catch (e) { console.warn('Groq failed:', e.message) }
//   }
//   if (GEMINI_KEY) {
//     try { return await callGemini(messages) } catch (e) { console.warn('Gemini failed:', e.message) }
//   }
//   if (OPENROUTER_KEY) return await callOpenRouter(messages)
//   throw new Error('No AI API keys configured.')
// }

// function extractJSON(text) {
//   if (!text) return null
//   const fenceMatch = text.match(/```(?:json)?\s*([\s\S]*?)```/)
//   const cleaned = fenceMatch ? fenceMatch[1].trim() : text.trim()
//   try { return JSON.parse(cleaned) } catch {}
//   const objMatch = cleaned.match(/\{[\s\S]*\}/)
//   if (objMatch) { try { return JSON.parse(objMatch[0]) } catch {} }
//   return null
// }

// function safeParse(val) {
//   if (!val) return null
//   if (typeof val === 'object') return val
//   try { return JSON.parse(val) } catch { return null }
// }

// // ==================== START INTERVIEW ====================
// const startInterview = async (req, res) => {
//   try {
//     const { job_id } = req.body
//     if (!req.file) return res.status(400).json({ success: false, message: 'Resume file is required' })

//     const buffer = fs.readFileSync(req.file.path)
//     const parsed = await pdfParse(buffer)
//     const resumeText = parsed.text.slice(0, 3000).trim()

//     if (!resumeText) {
//       return res.status(400).json({ success: false, message: 'Could not extract text from PDF. Please upload a text-based PDF.' })
//     }

//     // Step 1: Extract skills from resume
//     const extractionRaw = await callAI([{
//       role: 'user',
//       content: `You are a resume parser. Extract technical skills, programming languages, and frameworks from the resume below.

// Return ONLY valid JSON, no explanation, no markdown.
// Format: {"skills":["React","Node.js","MongoDB"],"experience_years":2,"level":"junior"}
// Level must be: "junior", "mid", or "senior"

// Resume:
// ${resumeText}`
//     }])

//     let parsed_skills = { skills: ['JavaScript'], experience_years: 1, level: 'junior' }
//     const extracted = extractJSON(extractionRaw)
//     if (extracted?.skills && Array.isArray(extracted.skills) && extracted.skills.length > 0) {
//       parsed_skills = {
//         skills: extracted.skills.slice(0, 8),
//         experience_years: extracted.experience_years || 0,
//         level: extracted.level || 'junior'
//       }
//     }

//     const skillsList = parsed_skills.skills.join(', ')
//     const level = parsed_skills.level

//     // Step 2: Generate 3 technical + 2 HR questions (NO code writing)
//     const qGenRaw = await callAI([{
//       role: 'user',
//       content: `You are a senior interviewer conducting a ${level}-level job interview.

// Candidate's tech stack: ${skillsList}

// Generate exactly 5 interview questions in this ORDER:
// - Question 1: Technical — ask the candidate to EXPLAIN or DESCRIBE a concept from their tech stack (e.g. "Tell me about React hooks and how you have used them in your projects")
// - Question 2: HR/Behavioral — ask about time management, priorities, or juggling multiple tasks (e.g. "If you have multiple tasks with the same deadline, how do you decide which one to do first?")
// - Question 3: Technical — ask about a specific technology they have used and HOW they implemented something real (e.g. "Tell me about a project where you used Node.js. What was your role and how did you handle the backend?")
// - Question 4: HR/Behavioral — ask about working under pressure, handling stress, or teamwork (e.g. "Tell me about a time when you were under a lot of pressure at work. How did you manage it?")
// - Question 5: Technical — ask about their experience with a specific tool, framework, or concept from their resume (e.g. "What is the difference between SQL and NoSQL? Which have you used and why did you choose it?")

// STRICT RULES:
// - Do NOT ask candidates to write any code
// - Do NOT ask them to code on screen
// - Ask for EXPLANATIONS, DEFINITIONS, and REAL EXPERIENCE only
// - Questions must feel like a real human interviewer is asking them
// - Keep questions conversational and clear

// Return ONLY valid JSON, no explanation, no markdown:
// {"questions":[{"q":"Your question here?","type":"technical","topic":"React"},{"q":"Your question here?","type":"hr","topic":"Time Management"}]}`
//     }])

//     let questions = []
//     const qParsed = extractJSON(qGenRaw)
//     if (qParsed?.questions && Array.isArray(qParsed.questions) && qParsed.questions.length >= 4) {
//       questions = qParsed.questions
//         .map(q => ({ q: q.q || q.question, type: q.type || 'technical', topic: q.topic || '' }))
//         .filter(q => q.q)
//         .slice(0, 5)
//     }

//     // Fallback questions if AI fails
//     if (questions.length < 4) {
//       const skill1 = parsed_skills.skills[0] || 'JavaScript'
//       const skill2 = parsed_skills.skills[1] || 'Node.js'
//       questions = [
//         { q: `Tell me about ${skill1} — what is it, and how have you used it in your projects?`, type: 'technical', topic: skill1 },
//         { q: `If you have multiple tasks with the same deadline, how do you decide which one to handle first? Can you give me an example from your experience?`, type: 'hr', topic: 'Prioritization' },
//         { q: `Tell me about a project where you used ${skill2}. What was your role and what specific features did you implement?`, type: 'technical', topic: skill2 },
//         { q: `Tell me about a time when you were under a lot of pressure at work or in a project. How did you manage your time and stay focused?`, type: 'hr', topic: 'Pressure Management' },
//         { q: `What is the difference between frontend and backend development? Which have you worked on more, and what tools did you use?`, type: 'technical', topic: 'General Tech' }
//       ]
//     }

//     const result = await db.query(
//       `INSERT INTO interview_sessions (user_id, job_id, resume_text, extracted_skills, questions)
//        VALUES ($1,$2,$3,$4,$5) RETURNING id, questions, extracted_skills`,
//       [req.user.id, job_id || null, resumeText, parsed_skills.skills, JSON.stringify(questions)]
//     )

//     const session = result.rows[0]
//     const storedQuestions = safeParse(session.questions) || questions

//     res.json({
//       success: true,
//       data: {
//         session_id: session.id,
//         skills: session.extracted_skills,
//         level: parsed_skills.level,
//         experience_years: parsed_skills.experience_years,
//         first_question: storedQuestions[0],
//         total_questions: storedQuestions.length
//       }
//     })
//   } catch (err) {
//     console.error('startInterview error:', err)
//     res.status(500).json({ success: false, message: err.message || 'Failed to start interview' })
//   }
// }

// // ==================== SUBMIT ANSWER ====================
// const submitAnswer = async (req, res) => {
//   try {
//     const { session_id, answer, question_index } = req.body

//     if (session_id == null || answer == null || question_index == null) {
//       return res.status(400).json({ success: false, message: 'Missing required fields' })
//     }
//     if (!answer.trim()) {
//       return res.status(400).json({ success: false, message: 'Answer cannot be empty' })
//     }

//     const sessionRes = await db.query(
//       'SELECT * FROM interview_sessions WHERE id=$1 AND user_id=$2',
//       [session_id, req.user.id]
//     )
//     if (!sessionRes.rows.length) {
//       return res.status(404).json({ success: false, message: 'Session not found' })
//     }

//     const session = sessionRes.rows[0]
//     const questions = safeParse(session.questions)

//     if (!Array.isArray(questions) || question_index >= questions.length) {
//       return res.status(400).json({ success: false, message: 'Invalid question index' })
//     }

//     const currentQ = questions[question_index]
//     if (!currentQ?.q) {
//       return res.status(500).json({ success: false, message: 'Question data corrupted' })
//     }

//     const isHR = currentQ.type === 'hr'

//     // Different evaluation prompt for HR vs Technical questions
//     const evalPrompt = isHR
//       ? `You are evaluating a candidate's answer to an HR behavioral interview question.

// Question: "${currentQ.q}"
// Candidate's Answer: "${answer}"

// Score the answer from 0 to 10 based on:
// - Did they give a specific real example? (not a vague generic answer)
// - Did they explain HOW they handled the situation?
// - Did they show good communication, maturity, and self-awareness?
// - Was the answer clear and well-structured?

// Return ONLY valid JSON, no explanation, no markdown:
// {"score":7,"feedback":"Constructive feedback here — what was good and what was missing","strengths":["Gave a real example","Explained their approach clearly"],"gaps":["Could mention the final outcome","Be more specific about the timeline"]}`
//       : `You are evaluating a candidate's answer to a technical interview question.

// Question: "${currentQ.q}"
// Topic: ${currentQ.topic || 'General'}
// Candidate's Answer: "${answer}"

// Score the answer from 0 to 10 based on:
// - Did they correctly explain the concept or technology?
// - Did they show real hands-on experience (not just theory)?
// - Did they give specific examples from their own work?
// - Was the explanation clear and accurate?

// Return ONLY valid JSON, no explanation, no markdown:
// {"score":7,"feedback":"Constructive feedback here — what was good and what was missing","strengths":["Good understanding of the concept","Gave a real project example"],"gaps":["Could explain more about performance considerations","Missing mention of error handling"]}`

//     const evalRaw = await callAI([{ role: 'user', content: evalPrompt }])

//     let evalResult = { score: 5, feedback: 'Answer recorded.', strengths: [], gaps: [] }
//     const evalParsed = extractJSON(evalRaw)
//     if (evalParsed && typeof evalParsed.score === 'number') {
//       evalResult = {
//         score: Math.min(10, Math.max(0, Math.round(evalParsed.score))),
//         feedback: evalParsed.feedback || evalResult.feedback,
//         strengths: Array.isArray(evalParsed.strengths) ? evalParsed.strengths : [],
//         gaps: Array.isArray(evalParsed.gaps) ? evalParsed.gaps : []
//       }
//     }

//     // Save answer
//     const existingAnswers = safeParse(session.answers) || []
//     existingAnswers.push({
//       question_index,
//       question: currentQ.q,
//       type: currentQ.type || 'technical',
//       topic: currentQ.topic || '',
//       answer: answer.trim(),
//       score: evalResult.score,
//       feedback: evalResult.feedback,
//       strengths: evalResult.strengths,
//       gaps: evalResult.gaps
//     })

//     await db.query(
//       'UPDATE interview_sessions SET answers=$1 WHERE id=$2',
//       [JSON.stringify(existingAnswers), session_id]
//     )

//     const nextIndex = question_index + 1
//     const nextQuestion = nextIndex < questions.length ? questions[nextIndex] : null
//     const isComplete = nextQuestion === null

//     res.json({
//       success: true,
//       data: {
//         evaluation: evalResult,
//         next_question: nextQuestion,
//         next_index: nextIndex,
//         is_complete: isComplete,
//         questions_answered: nextIndex,
//         total_questions: questions.length
//       }
//     })
//   } catch (err) {
//     console.error('submitAnswer error:', err)
//     res.status(500).json({ success: false, message: err.message || 'Failed to evaluate answer' })
//   }
// }

// // ==================== FINISH INTERVIEW ====================
// const finishInterview = async (req, res) => {
//   try {
//     const { session_id } = req.body
//     if (!session_id) return res.status(400).json({ success: false, message: 'session_id is required' })

//     const sessionRes = await db.query(
//       'SELECT * FROM interview_sessions WHERE id=$1 AND user_id=$2',
//       [session_id, req.user.id]
//     )
//     if (!sessionRes.rows.length) {
//       return res.status(404).json({ success: false, message: 'Session not found' })
//     }

//     const session = sessionRes.rows[0]
//     const answers = safeParse(session.answers) || []

//     // Separate technical and HR scores
//     const technicalAnswers = answers.filter(a => a.type === 'technical')
//     const hrAnswers = answers.filter(a => a.type === 'hr')

//     const techAvg = technicalAnswers.length
//       ? Math.round(technicalAnswers.reduce((s, a) => s + (a.score || 0), 0) / technicalAnswers.length)
//       : 0
//     const hrAvg = hrAnswers.length
//       ? Math.round(hrAnswers.reduce((s, a) => s + (a.score || 0), 0) / hrAnswers.length)
//       : 0

//     // Overall score: 60% technical, 40% HR
//     const overallScore = answers.length
//       ? Math.round(answers.reduce((s, a) => s + (a.score || 0), 0) / answers.length)
//       : 0

//     const verdict = overallScore >= 7 ? 'shortlisted' : overallScore >= 5 ? 'maybe' : 'rejected'

//     // AI summary
//     let summary = `The candidate answered ${answers.length} questions with an average score of ${overallScore}/10. Technical score: ${techAvg}/10. HR/Behavioral score: ${hrAvg}/10.`
//     try {
//       const summaryRaw = await callAI([{
//         role: 'user',
//         content: `Write a 2-3 sentence professional interview summary for a hiring manager.

// Candidate skills: ${Array.isArray(session.extracted_skills) ? session.extracted_skills.join(', ') : 'N/A'}
// Technical score: ${techAvg}/10
// HR/Behavioral score: ${hrAvg}/10
// Overall score: ${overallScore}/10
// Verdict: ${verdict}

// Be direct and honest. Mention both technical ability and communication/soft skills.`
//       }])
//       if (summaryRaw?.trim()) summary = summaryRaw.trim()
//     } catch (e) {
//       console.warn('Summary generation failed:', e.message)
//     }

//     await db.query(
//       `UPDATE interview_sessions SET total_score=$1, verdict=$2, status='completed', completed_at=NOW() WHERE id=$3`,
//       [overallScore, verdict, session_id]
//     )

//     res.json({
//       success: true,
//       data: {
//         session_id,
//         total_score: overallScore,
//         technical_score: techAvg,
//         hr_score: hrAvg,
//         verdict,
//         summary,
//         answers,
//         skills_tested: session.extracted_skills,
//         questions_answered: answers.length
//       }
//     })
//   } catch (err) {
//     console.error('finishInterview error:', err)
//     res.status(500).json({ success: false, message: err.message || 'Failed to finish interview' })
//   }
// }

// // ==================== GET SESSIONS ====================
// const getInterviewSessions = async (req, res) => {
//   try {
//     const result = await db.query(
//       `SELECT id, extracted_skills, total_score, verdict, status, created_at, completed_at
//        FROM interview_sessions WHERE user_id=$1 ORDER BY created_at DESC LIMIT 20`,
//       [req.user.id]
//     )
//     res.json({ success: true, data: result.rows })
//   } catch (err) {
//     console.error(err)
//     res.status(500).json({ success: false, message: 'Failed to fetch sessions' })
//   }
// }

// const getInterviewSession = async (req, res) => {
//   try {
//     const result = await db.query(
//       'SELECT * FROM interview_sessions WHERE id=$1 AND user_id=$2',
//       [req.params.id, req.user.id]
//     )
//     if (!result.rows.length) return res.status(404).json({ success: false, message: 'Not found' })
//     const session = result.rows[0]
//     session.questions = safeParse(session.questions)
//     session.answers = safeParse(session.answers)
//     res.json({ success: true, data: session })
//   } catch (err) {
//     console.error(err)
//     res.status(500).json({ success: false, message: 'Failed to fetch session' })
//   }
// }

// module.exports = {
//   startInterview,
//   submitAnswer,
//   finishInterview,
//   getInterviewSessions,
//   getInterviewSession
// }
const db = require('../../config/db')
const pdfParse = require('pdf-parse/lib/pdf-parse.js')
const fs = require('fs')

const GROQ_KEY = process.env.GROQ_API_KEY
const GEMINI_KEY = process.env.GEMINI_API_KEY
const OPENROUTER_KEY = process.env.OPENROUTER_API_KEY

// ✅ FIX 3: Removed dead nvidia endpoint, updated model list
const FREE_MODELS = [
  'meta-llama/llama-4-scout:free',
  'meta-llama/llama-4-maverick:free',
  'deepseek/deepseek-chat-v3-0324:free',
  'google/gemini-2.0-flash-exp:free',
  'mistralai/mistral-7b-instruct:free',
]

// ==================== PROVIDER HELPERS ====================
async function callGroq(messages) {
  // ✅ FIX 1: Truncate content to stay under 6000 TPM limit
  const safeMessages = messages.map(m => ({
    ...m,
    content: typeof m.content === 'string' ? m.content.slice(0, 2000) : m.content
  }))

  const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${GROQ_KEY}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ model: 'llama-3.1-8b-instant', messages: safeMessages, temperature: 0.3, max_tokens: 800 })
  })
  const data = await res.json()
  if (!res.ok) throw new Error(data.error?.message || 'Groq error')
  const content = data.choices?.[0]?.message?.content?.trim()
  if (!content) throw new Error('Empty Groq response')
  return content
}

async function callGemini(messages) {
  const contents = []
  for (const m of messages) {
    const role = m.role === 'assistant' ? 'model' : 'user'
    if (contents.length && contents[contents.length - 1].role === role) {
      contents[contents.length - 1].parts[0].text += '\n' + m.content
    } else {
      contents.push({ role, parts: [{ text: m.content }] })
    }
  }
  // ✅ FIX 2: Updated to gemini-2.0-flash (gemini-1.5-flash is deprecated)
  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_KEY}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ contents, generationConfig: { temperature: 0.3, maxOutputTokens: 1500 } })
    }
  )
  const data = await res.json()
  if (!res.ok) throw new Error(data.error?.message || 'Gemini error')
  const content = data.candidates?.[0]?.content?.parts?.[0]?.text?.trim()
  if (!content) throw new Error('Empty Gemini response')
  return content
}

async function callOpenRouter(messages) {
  let lastError = null
  for (const model of FREE_MODELS) {
    try {
      const res = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${OPENROUTER_KEY}`,
          'Content-Type': 'application/json',
          'HTTP-Referer': process.env.APP_URL || 'http://localhost:3000',
          'X-Title': 'Job Portal Interview'
        },
        body: JSON.stringify({ model, messages, temperature: 0.3, max_tokens: 1500 })
      })
      const data = await res.json()
      if (!res.ok) { lastError = new Error(data.error?.message || 'Unknown'); continue }
      let content = data.choices?.[0]?.message?.content || ''
      content = content.replace(/<think>[\s\S]*?<\/think>/gi, '').trim()
      if (!content) { lastError = new Error('Empty'); continue }
      return content
    } catch (err) { lastError = err }
  }
  throw new Error(`All OpenRouter models failed: ${lastError?.message}`)
}

async function callAI(messages) {
  if (GROQ_KEY) {
    try { return await callGroq(messages) } catch (e) { console.warn('Groq failed:', e.message) }
  }
  if (GEMINI_KEY) {
    try { return await callGemini(messages) } catch (e) { console.warn('Gemini failed:', e.message) }
  }
  if (OPENROUTER_KEY) return await callOpenRouter(messages)
  throw new Error('No AI API keys configured.')
}

function extractJSON(text) {
  if (!text) return null
  const fenceMatch = text.match(/```(?:json)?\s*([\s\S]*?)```/)
  const cleaned = fenceMatch ? fenceMatch[1].trim() : text.trim()
  try { return JSON.parse(cleaned) } catch {}
  const objMatch = cleaned.match(/\{[\s\S]*\}/)
  if (objMatch) { try { return JSON.parse(objMatch[0]) } catch {} }
  return null
}

function safeParse(val) {
  if (!val) return null
  if (typeof val === 'object') return val
  try { return JSON.parse(val) } catch { return null }
}

// ==================== START INTERVIEW ====================
const startInterview = async (req, res) => {
  try {
    const { job_id } = req.body
    if (!req.file) return res.status(400).json({ success: false, message: 'Resume file is required' })

    const buffer = fs.readFileSync(req.file.path)
    const parsed = await pdfParse(buffer)
    // ✅ FIX 1: Reduced from 3000 to 1500 chars to stay under Groq TPM limit
    const resumeText = parsed.text.slice(0, 1500).trim()

    if (!resumeText) {
      return res.status(400).json({ success: false, message: 'Could not extract text from PDF. Please upload a text-based PDF.' })
    }

    // Step 1: Extract skills from resume
    const extractionRaw = await callAI([{
      role: 'user',
      content: `Resume parser. Extract technical skills from resume below.

Return ONLY valid JSON, no explanation, no markdown.
Format: {"skills":["React","Node.js","MongoDB"],"experience_years":2,"level":"junior"}
Level must be: "junior", "mid", or "senior"

Resume:
${resumeText}`
    }])

    let parsed_skills = { skills: ['JavaScript'], experience_years: 1, level: 'junior' }
    const extracted = extractJSON(extractionRaw)
    if (extracted?.skills && Array.isArray(extracted.skills) && extracted.skills.length > 0) {
      parsed_skills = {
        skills: extracted.skills.slice(0, 8),
        experience_years: extracted.experience_years || 0,
        level: extracted.level || 'junior'
      }
    }

    const skillsList = parsed_skills.skills.join(', ')
    const level = parsed_skills.level

    // Step 2: Generate 3 technical + 2 HR questions (NO code writing)
    const qGenRaw = await callAI([{
      role: 'user',
      content: `Senior interviewer. ${level}-level interview. Candidate skills: ${skillsList}

Generate 5 interview questions:
Q1: Technical — explain a concept from their stack
Q2: HR — time management or priorities example
Q3: Technical — specific project experience with a tool they used
Q4: HR — handling pressure or teamwork example
Q5: Technical — compare or explain a technology choice

Rules:
- NO code writing questions
- Ask for explanations and real experiences only
- Conversational and clear

Return ONLY valid JSON:
{"questions":[{"q":"Question?","type":"technical","topic":"React"},{"q":"Question?","type":"hr","topic":"Time Management"}]}`
    }])

    let questions = []
    const qParsed = extractJSON(qGenRaw)
    if (qParsed?.questions && Array.isArray(qParsed.questions) && qParsed.questions.length >= 4) {
      questions = qParsed.questions
        .map(q => ({ q: q.q || q.question, type: q.type || 'technical', topic: q.topic || '' }))
        .filter(q => q.q)
        .slice(0, 5)
    }

    // Fallback questions if AI fails
    if (questions.length < 4) {
      const skill1 = parsed_skills.skills[0] || 'JavaScript'
      const skill2 = parsed_skills.skills[1] || 'Node.js'
      questions = [
        { q: `Tell me about ${skill1} — what is it, and how have you used it in your projects?`, type: 'technical', topic: skill1 },
        { q: `If you have multiple tasks with the same deadline, how do you decide which one to handle first? Can you give an example?`, type: 'hr', topic: 'Prioritization' },
        { q: `Tell me about a project where you used ${skill2}. What was your role and what features did you implement?`, type: 'technical', topic: skill2 },
        { q: `Tell me about a time when you were under pressure in a project. How did you manage your time and stay focused?`, type: 'hr', topic: 'Pressure Management' },
        { q: `What is the difference between frontend and backend development? Which have you worked on more and what tools did you use?`, type: 'technical', topic: 'General Tech' }
      ]
    }

    const result = await db.query(
      `INSERT INTO interview_sessions (user_id, job_id, resume_text, extracted_skills, questions)
       VALUES ($1,$2,$3,$4,$5) RETURNING id, questions, extracted_skills`,
      [req.user.id, job_id || null, resumeText, parsed_skills.skills, JSON.stringify(questions)]
    )

    const session = result.rows[0]
    const storedQuestions = safeParse(session.questions) || questions

    res.json({
      success: true,
      data: {
        session_id: session.id,
        skills: session.extracted_skills,
        level: parsed_skills.level,
        experience_years: parsed_skills.experience_years,
        first_question: storedQuestions[0],
        total_questions: storedQuestions.length
      }
    })
  } catch (err) {
    console.error('startInterview error:', err)
    res.status(500).json({ success: false, message: err.message || 'Failed to start interview' })
  }
}

// ==================== SUBMIT ANSWER ====================
const submitAnswer = async (req, res) => {
  try {
    const { session_id, answer, question_index } = req.body

    if (session_id == null || answer == null || question_index == null) {
      return res.status(400).json({ success: false, message: 'Missing required fields' })
    }
    if (!answer.trim()) {
      return res.status(400).json({ success: false, message: 'Answer cannot be empty' })
    }

    const sessionRes = await db.query(
      'SELECT * FROM interview_sessions WHERE id=$1 AND user_id=$2',
      [session_id, req.user.id]
    )
    if (!sessionRes.rows.length) {
      return res.status(404).json({ success: false, message: 'Session not found' })
    }

    const session = sessionRes.rows[0]
    const questions = safeParse(session.questions)

    if (!Array.isArray(questions) || question_index >= questions.length) {
      return res.status(400).json({ success: false, message: 'Invalid question index' })
    }

    const currentQ = questions[question_index]
    if (!currentQ?.q) {
      return res.status(500).json({ success: false, message: 'Question data corrupted' })
    }

    const isHR = currentQ.type === 'hr'

    const evalPrompt = isHR
      ? `Evaluate this HR interview answer. Score 0-10.

Question: "${currentQ.q}"
Answer: "${answer.slice(0, 500)}"

Score based on: specific example given, how they handled it, clarity, maturity.

Return ONLY valid JSON:
{"score":7,"feedback":"Feedback here","strengths":["strength1"],"gaps":["gap1"]}`
      : `Evaluate this technical interview answer. Score 0-10.

Question: "${currentQ.q}"
Topic: ${currentQ.topic || 'General'}
Answer: "${answer.slice(0, 500)}"

Score based on: correct explanation, real experience shown, specific examples, clarity.

Return ONLY valid JSON:
{"score":7,"feedback":"Feedback here","strengths":["strength1"],"gaps":["gap1"]}`

    const evalRaw = await callAI([{ role: 'user', content: evalPrompt }])

    let evalResult = { score: 5, feedback: 'Answer recorded.', strengths: [], gaps: [] }
    const evalParsed = extractJSON(evalRaw)
    if (evalParsed && typeof evalParsed.score === 'number') {
      evalResult = {
        score: Math.min(10, Math.max(0, Math.round(evalParsed.score))),
        feedback: evalParsed.feedback || evalResult.feedback,
        strengths: Array.isArray(evalParsed.strengths) ? evalParsed.strengths : [],
        gaps: Array.isArray(evalParsed.gaps) ? evalParsed.gaps : []
      }
    }

    const existingAnswers = safeParse(session.answers) || []
    existingAnswers.push({
      question_index,
      question: currentQ.q,
      type: currentQ.type || 'technical',
      topic: currentQ.topic || '',
      answer: answer.trim(),
      score: evalResult.score,
      feedback: evalResult.feedback,
      strengths: evalResult.strengths,
      gaps: evalResult.gaps
    })

    await db.query(
      'UPDATE interview_sessions SET answers=$1 WHERE id=$2',
      [JSON.stringify(existingAnswers), session_id]
    )

    const nextIndex = question_index + 1
    const nextQuestion = nextIndex < questions.length ? questions[nextIndex] : null
    const isComplete = nextQuestion === null

    res.json({
      success: true,
      data: {
        evaluation: evalResult,
        next_question: nextQuestion,
        next_index: nextIndex,
        is_complete: isComplete,
        questions_answered: nextIndex,
        total_questions: questions.length
      }
    })
  } catch (err) {
    console.error('submitAnswer error:', err)
    res.status(500).json({ success: false, message: err.message || 'Failed to evaluate answer' })
  }
}

// ==================== FINISH INTERVIEW ====================
const finishInterview = async (req, res) => {
  try {
    const { session_id } = req.body
    if (!session_id) return res.status(400).json({ success: false, message: 'session_id is required' })

    const sessionRes = await db.query(
      'SELECT * FROM interview_sessions WHERE id=$1 AND user_id=$2',
      [session_id, req.user.id]
    )
    if (!sessionRes.rows.length) {
      return res.status(404).json({ success: false, message: 'Session not found' })
    }

    const session = sessionRes.rows[0]
    const answers = safeParse(session.answers) || []

    const technicalAnswers = answers.filter(a => a.type === 'technical')
    const hrAnswers = answers.filter(a => a.type === 'hr')

    const techAvg = technicalAnswers.length
      ? Math.round(technicalAnswers.reduce((s, a) => s + (a.score || 0), 0) / technicalAnswers.length)
      : 0
    const hrAvg = hrAnswers.length
      ? Math.round(hrAnswers.reduce((s, a) => s + (a.score || 0), 0) / hrAnswers.length)
      : 0
    const overallScore = answers.length
      ? Math.round(answers.reduce((s, a) => s + (a.score || 0), 0) / answers.length)
      : 0

    const verdict = overallScore >= 7 ? 'shortlisted' : overallScore >= 5 ? 'maybe' : 'rejected'

    let summary = `Candidate answered ${answers.length} questions. Overall: ${overallScore}/10. Technical: ${techAvg}/10. HR: ${hrAvg}/10.`
    try {
      const summaryRaw = await callAI([{
        role: 'user',
        content: `Write a 2-3 sentence professional interview summary for a hiring manager.

Skills: ${Array.isArray(session.extracted_skills) ? session.extracted_skills.join(', ') : 'N/A'}
Technical score: ${techAvg}/10, HR score: ${hrAvg}/10, Overall: ${overallScore}/10, Verdict: ${verdict}

Be direct and honest about both technical ability and communication skills.`
      }])
      if (summaryRaw?.trim()) summary = summaryRaw.trim()
    } catch (e) {
      console.warn('Summary generation failed:', e.message)
    }

    await db.query(
      `UPDATE interview_sessions SET total_score=$1, verdict=$2, status='completed', completed_at=NOW() WHERE id=$3`,
      [overallScore, verdict, session_id]
    )

    res.json({
      success: true,
      data: {
        session_id,
        total_score: overallScore,
        technical_score: techAvg,
        hr_score: hrAvg,
        verdict,
        summary,
        answers,
        skills_tested: session.extracted_skills,
        questions_answered: answers.length
      }
    })
  } catch (err) {
    console.error('finishInterview error:', err)
    res.status(500).json({ success: false, message: err.message || 'Failed to finish interview' })
  }
}

// ==================== GET SESSIONS ====================
const getInterviewSessions = async (req, res) => {
  try {
    const result = await db.query(
      `SELECT id, extracted_skills, total_score, verdict, status, created_at, completed_at
       FROM interview_sessions WHERE user_id=$1 ORDER BY created_at DESC LIMIT 20`,
      [req.user.id]
    )
    res.json({ success: true, data: result.rows })
  } catch (err) {
    console.error(err)
    res.status(500).json({ success: false, message: 'Failed to fetch sessions' })
  }
}

const getInterviewSession = async (req, res) => {
  try {
    const result = await db.query(
      'SELECT * FROM interview_sessions WHERE id=$1 AND user_id=$2',
      [req.params.id, req.user.id]
    )
    if (!result.rows.length) return res.status(404).json({ success: false, message: 'Not found' })
    const session = result.rows[0]
    session.questions = safeParse(session.questions)
    session.answers = safeParse(session.answers)
    res.json({ success: true, data: session })
  } catch (err) {
    console.error(err)
    res.status(500).json({ success: false, message: 'Failed to fetch session' })
  }
}

module.exports = {
  startInterview,
  submitAnswer,
  finishInterview,
  getInterviewSessions,
  getInterviewSession
}