// // // import React, { useState, useRef, useEffect } from 'react';
// // // import { useNavigate } from 'react-router-dom';
// // // import axios from 'axios';

// // // const api = axios.create({ baseURL: 'http://localhost:5000/api/employee/interview' });
// // // api.interceptors.request.use(cfg => {
// // //   cfg.headers.Authorization = `Bearer ${localStorage.getItem('token')}`;
// // //   return cfg;
// // // });

// // // const STEPS = { UPLOAD: 'upload', INTERVIEW: 'interview', RESULT: 'result' };

// // // export default function Interview() {
// // //   const navigate = useNavigate();
// // //   const [step, setStep] = useState(STEPS.UPLOAD);
// // //   const [resumeFile, setResumeFile] = useState(null);
// // //   const [loading, setLoading] = useState(false);
// // //   const [error, setError] = useState('');
// // //   const [session, setSession] = useState(null);         // { session_id, skills, first_question, total_questions }
// // //   const [currentQ, setCurrentQ] = useState(null);       // { q, topic, difficulty }
// // //   const [currentIndex, setCurrentIndex] = useState(0);
// // //   const [lastEval, setLastEval] = useState(null);
// // //   const [result, setResult] = useState(null);

// // //   // Voice
// // //   const [listening, setListening] = useState(false);
// // //   const [transcript, setTranscript] = useState('');
// // //   const [submitting, setSubmitting] = useState(false);
// // //   const recognitionRef = useRef(null);

// // //   // Setup Web Speech API
// // //   useEffect(() => {
// // //     const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
// // //     if (!SR) { setError('Your browser does not support voice recording. Use Chrome.'); return; }
// // //     const r = new SR();
// // //     r.continuous = true;
// // //     r.interimResults = true;
// // //     r.lang = 'en-US';
// // //     r.onresult = (e) => {
// // //       let final = '';
// // //       for (let i = e.resultIndex; i < e.results.length; i++) {
// // //         if (e.results[i].isFinal) final += e.results[i][0].transcript;
// // //       }
// // //       if (final) setTranscript(prev => (prev + ' ' + final).trim());
// // //     };
// // //     r.onend = () => setListening(false);
// // //     recognitionRef.current = r;
// // //     return () => r.abort();
// // //   }, []);

// // //   const startListening = () => {
// // //     setTranscript('');
// // //     setListening(true);
// // //     recognitionRef.current?.start();
// // //   };

// // //   const stopListening = () => {
// // //     setListening(false);
// // //     recognitionRef.current?.stop();
// // //   };

// // //   // Speak question aloud
// // //   const speakText = (text) => {
// // //     window.speechSynthesis?.cancel();
// // //     const u = new SpeechSynthesisUtterance(text);
// // //     u.rate = 0.95;
// // //     window.speechSynthesis?.speak(u);
// // //   };

// // //   const handleStart = async () => {
// // //     if (!resumeFile) return setError('Please upload your resume first');
// // //     setLoading(true);
// // //     setError('');
// // //     try {
// // //       const fd = new FormData();
// // //       fd.append('resume', resumeFile);
// // //       const { data } = await api.post('/start', fd);
// // //       setSession(data.data);
// // //       setCurrentQ(data.data.first_question);
// // //       setCurrentIndex(0);
// // //       setStep(STEPS.INTERVIEW);
// // //       setTimeout(() => speakText(data.data.first_question.q), 600);
// // //     } catch (e) {
// // //       setError(e.response?.data?.message || 'Failed to start interview');
// // //     }
// // //     setLoading(false);
// // //   };

// // //   const handleSubmitAnswer = async () => {
// // //     if (!transcript.trim()) return setError('Please speak your answer first');
// // //     setSubmitting(true);
// // //     setError('');
// // //     try {
// // //       const { data } = await api.post('/answer', {
// // //         session_id: session.session_id,
// // //         answer: transcript,
// // //         question_index: currentIndex
// // //       });
// // //       const d = data.data;
// // //       setLastEval(d.evaluation);
// // //       setTranscript('');
// // //       if (d.is_last) {
// // //         // Finish
// // //         const fin = await api.post('/finish', { session_id: session.session_id });
// // //         setResult(fin.data.data);
// // //         setStep(STEPS.RESULT);
// // //       } else {
// // //         setCurrentQ(d.next_question);
// // //         setCurrentIndex(d.next_index);
// // //         setTimeout(() => speakText(d.next_question.q), 800);
// // //       }
// // //     } catch (e) {
// // //       setError(e.response?.data?.message || 'Failed to submit answer');
// // //     }
// // //     setSubmitting(false);
// // //   };

// // //   // ── UPLOAD STEP ──
// // //   if (step === STEPS.UPLOAD) return (
// // //     <div className="page-content">
// // //       <div className="page-hero">
// // //         <h4 className="mb-1" style={{ color: 'black' }}>AI Interview Practice</h4>
// // //         <p className="text-muted mb-0">Upload your resume and get interviewed by AI based on your skills</p>
// // //       </div>
// // //       {error && <div className="alert alert-danger">{error}</div>}
// // //       <div style={{ maxWidth: 520, margin: '32px auto', background: 'var(--bs-body-bg)', borderRadius: 16, padding: 32, border: '1px solid var(--bs-border-color)' }}>
// // //         <div style={{ textAlign: 'center', marginBottom: 28 }}>
// // //           <div style={{ width: 64, height: 64, borderRadius: '50%', background: '#ede9fe', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
// // //             <i className="bi bi-mic-fill" style={{ fontSize: 28, color: '#7c3aed' }} />
// // //           </div>
// // //           <h5 style={{ fontWeight: 700 }}>How it works</h5>
// // //           <p className="text-muted" style={{ fontSize: 14 }}>AI reads your resume → generates skill-based questions → you answer by voice → AI scores you</p>
// // //         </div>
// // //         <label className="form-label fw-semibold">Upload Resume (PDF)</label>
// // //         <div
// // //           style={{ border: '2px dashed #c4b5fd', borderRadius: 12, padding: '32px 24px', textAlign: 'center', cursor: 'pointer', background: resumeFile ? '#f5f3ff' : 'transparent', marginBottom: 20 }}
// // //           onClick={() => document.getElementById('resume-upload').click()}
// // //         >
// // //           <i className="bi bi-file-earmark-pdf" style={{ fontSize: 32, color: resumeFile ? '#7c3aed' : '#9ca3af' }} />
// // //           <p style={{ margin: '8px 0 0', color: resumeFile ? '#7c3aed' : '#6b7280', fontSize: 14 }}>
// // //             {resumeFile ? resumeFile.name : 'Click to upload PDF'}
// // //           </p>
// // //           <input id="resume-upload" type="file" accept=".pdf" style={{ display: 'none' }} onChange={e => setResumeFile(e.target.files[0])} />
// // //         </div>
// // //         <button className="btn btn-primary w-100 rounded-pill" style={{ background: '#7c3aed', borderColor: '#7c3aed' }} onClick={handleStart} disabled={loading || !resumeFile}>
// // //           {loading ? <><span className="spinner-border spinner-border-sm me-2" />Analyzing resume...</> : <><i className="bi bi-play-fill me-2" />Start Interview</>}
// // //         </button>
// // //       </div>
// // //     </div>
// // //   );

// // //   // ── INTERVIEW STEP ──
// // //   if (step === STEPS.INTERVIEW) return (
// // //     <div className="page-content">
// // //       <div style={{ maxWidth: 680, margin: '0 auto' }}>
// // //         {/* Header */}
// // //         <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
// // //           <div>
// // //             <h5 style={{ fontWeight: 700, margin: 0 }}>Question {currentIndex + 1} of {session.total_questions}</h5>
// // //             <p className="text-muted" style={{ fontSize: 13, margin: 0 }}>Skills detected: {session.skills?.slice(0, 4).join(', ')}</p>
// // //           </div>
// // //           <div style={{ display: 'flex', gap: 6 }}>
// // //             {Array.from({ length: session.total_questions }).map((_, i) => (
// // //               <div key={i} style={{ width: 10, height: 10, borderRadius: '50%', background: i < currentIndex ? '#7c3aed' : i === currentIndex ? '#a78bfa' : '#e5e7eb' }} />
// // //             ))}
// // //           </div>
// // //         </div>

// // //         {error && <div className="alert alert-danger">{error}</div>}

// // //         {/* Question card */}
// // //         {currentQ && (
// // //           <div style={{ background: 'linear-gradient(135deg, #7c3aed 0%, #5b21b6 100%)', borderRadius: 16, padding: '28px 32px', marginBottom: 20, color: '#fff' }}>
// // //             <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
// // //               <div style={{ display: 'flex', gap: 8 }}>
// // //                 <span style={{ background: 'rgba(255,255,255,0.2)', borderRadius: 20, padding: '2px 12px', fontSize: 12 }}>{currentQ.topic}</span>
// // //                 <span style={{ background: 'rgba(255,255,255,0.15)', borderRadius: 20, padding: '2px 12px', fontSize: 12 }}>{currentQ.difficulty}</span>
// // //               </div>
// // //               <button onClick={() => speakText(currentQ.q)} style={{ background: 'rgba(255,255,255,0.2)', border: 'none', borderRadius: 8, padding: '4px 10px', color: '#fff', cursor: 'pointer', fontSize: 12 }}>
// // //                 <i className="bi bi-volume-up me-1" />Replay
// // //               </button>
// // //             </div>
// // //             <p style={{ fontSize: 17, fontWeight: 500, lineHeight: 1.6, margin: 0 }}>{currentQ.q}</p>
// // //           </div>
// // //         )}

// // //         {/* Last evaluation feedback */}
// // //         {lastEval && currentIndex > 0 && (
// // //           <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: 12, padding: '14px 18px', marginBottom: 16 }}>
// // //             <div style={{ fontWeight: 600, fontSize: 13, color: '#166534', marginBottom: 4 }}>
// // //               <i className="bi bi-check-circle-fill me-1" />Previous answer scored {lastEval.score}/10
// // //             </div>
// // //             <p style={{ fontSize: 13, color: '#374151', margin: 0 }}>{lastEval.feedback}</p>
// // //           </div>
// // //         )}

// // //         {/* Voice recorder */}
// // //         <div style={{ border: '1px solid #e5e7eb', borderRadius: 16, padding: 24, background: '#fafafa' }}>
// // //           <div style={{ textAlign: 'center', marginBottom: 16 }}>
// // //             <button
// // //               onClick={listening ? stopListening : startListening}
// // //               style={{
// // //                 width: 80, height: 80, borderRadius: '50%', border: 'none', cursor: 'pointer',
// // //                 background: listening ? '#fee2e2' : '#ede9fe',
// // //                 color: listening ? '#dc2626' : '#7c3aed',
// // //                 fontSize: 32, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto',
// // //                 boxShadow: listening ? '0 0 0 8px rgba(220,38,38,0.15)' : 'none',
// // //                 transition: 'all 0.2s'
// // //               }}
// // //             >
// // //               <i className={`bi bi-mic${listening ? '-fill' : ''}`} />
// // //             </button>
// // //             <p style={{ fontSize: 13, color: '#6b7280', marginTop: 10, marginBottom: 0 }}>
// // //               {listening ? 'Listening... click to stop' : 'Click to speak your answer'}
// // //             </p>
// // //           </div>

// // //           {transcript && (
// // //             <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 10, padding: '12px 14px', marginBottom: 16, minHeight: 64 }}>
// // //               <p style={{ fontSize: 14, color: '#111827', margin: 0, lineHeight: 1.7 }}>{transcript}</p>
// // //             </div>
// // //           )}

// // //           <div style={{ display: 'flex', gap: 10 }}>
// // //             <button className="btn btn-outline-secondary rounded-pill flex-grow-1" onClick={() => setTranscript('')} disabled={!transcript}>
// // //               <i className="bi bi-trash me-1" />Clear
// // //             </button>
// // //             <button
// // //               className="btn rounded-pill flex-grow-1"
// // //               style={{ background: '#7c3aed', borderColor: '#7c3aed', color: '#fff' }}
// // //               onClick={handleSubmitAnswer}
// // //               disabled={submitting || !transcript.trim()}
// // //             >
// // //               {submitting ? <span className="spinner-border spinner-border-sm me-2" /> : <i className="bi bi-send me-2" />}
// // //               {submitting ? 'Evaluating...' : currentIndex + 1 === session.total_questions ? 'Finish Interview' : 'Submit & Next'}
// // //             </button>
// // //           </div>

// // //           <p style={{ fontSize: 12, color: '#9ca3af', textAlign: 'center', marginTop: 10, marginBottom: 0 }}>
// // //             You can also type your answer above if voice doesn't work
// // //           </p>
// // //           <textarea
// // //             className="form-control mt-2"
// // //             rows={2}
// // //             placeholder="Or type your answer here..."
// // //             value={transcript}
// // //             onChange={e => setTranscript(e.target.value)}
// // //             style={{ fontSize: 13 }}
// // //           />
// // //         </div>
// // //       </div>
// // //     </div>
// // //   );

// // //   // ── RESULT STEP ──
// // //   if (step === STEPS.RESULT && result) {
// // //     const isShortlisted = result.verdict === 'shortlisted';
// // //     return (
// // //       <div className="page-content">
// // //         <div style={{ maxWidth: 640, margin: '0 auto' }}>
// // //           <div style={{
// // //             background: isShortlisted ? 'linear-gradient(135deg, #059669, #047857)' : 'linear-gradient(135deg, #dc2626, #b91c1c)',
// // //             borderRadius: 20, padding: '36px 32px', textAlign: 'center', color: '#fff', marginBottom: 28
// // //           }}>
// // //             <div style={{ fontSize: 52, marginBottom: 12 }}>
// // //               {isShortlisted ? '🎉' : '📋'}
// // //             </div>
// // //             <h3 style={{ fontWeight: 700, margin: '0 0 8px' }}>
// // //               {isShortlisted ? 'Shortlisted!' : 'Not Selected'}
// // //             </h3>
// // //             <div style={{ fontSize: 48, fontWeight: 700, margin: '12px 0' }}>{result.total_score}<span style={{ fontSize: 24 }}>/10</span></div>
// // //             <p style={{ opacity: 0.9, margin: 0, lineHeight: 1.6 }}>{result.summary}</p>
// // //           </div>

// // //           {/* Skills tested */}
// // //           <div style={{ marginBottom: 20 }}>
// // //             <h6 style={{ fontWeight: 700, marginBottom: 12 }}>Skills Assessed</h6>
// // //             <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
// // //               {result.skills_tested?.map(s => (
// // //                 <span key={s} style={{ background: '#ede9fe', color: '#6d28d9', borderRadius: 20, padding: '4px 14px', fontSize: 13, fontWeight: 500 }}>{s}</span>
// // //               ))}
// // //             </div>
// // //           </div>

// // //           {/* Per-question breakdown */}
// // //           <h6 style={{ fontWeight: 700, marginBottom: 12 }}>Question Breakdown</h6>
// // //           {result.answers?.map((a, i) => (
// // //             <div key={i} style={{ border: '1px solid #e5e7eb', borderRadius: 12, padding: '16px 20px', marginBottom: 12 }}>
// // //               <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
// // //                 <span style={{ fontWeight: 600, fontSize: 14 }}>Q{i + 1}: {a.question?.slice(0, 60)}...</span>
// // //                 <span style={{
// // //                   fontWeight: 700, fontSize: 15, color: a.score >= 7 ? '#059669' : a.score >= 5 ? '#d97706' : '#dc2626'
// // //                 }}>{a.score}/10</span>
// // //               </div>
// // //               <p style={{ fontSize: 13, color: '#374151', margin: 0 }}>{a.feedback}</p>
// // //               {a.strengths?.length > 0 && (
// // //                 <p style={{ fontSize: 12, color: '#059669', margin: '6px 0 0' }}>✓ {a.strengths.join(' · ')}</p>
// // //               )}
// // //               {a.gaps?.length > 0 && (
// // //                 <p style={{ fontSize: 12, color: '#dc2626', margin: '4px 0 0' }}>✗ {a.gaps.join(' · ')}</p>
// // //               )}
// // //             </div>
// // //           ))}

// // //           <div style={{ display: 'flex', gap: 12, marginTop: 20 }}>
// // //             <button className="btn btn-outline-secondary rounded-pill flex-grow-1" onClick={() => { setStep(STEPS.UPLOAD); setResumeFile(null); setResult(null); setLastEval(null); }}>
// // //               <i className="bi bi-arrow-repeat me-2" />Try Again
// // //             </button>
// // //             <button className="btn btn-primary rounded-pill flex-grow-1" onClick={() => navigate('/jobs')}>
// // //               <i className="bi bi-briefcase me-2" />Browse Jobs
// // //             </button>
// // //           </div>
// // //         </div>
// // //       </div>
// // //     );
// // //   }

// // //   return null;
// // // }
// // import React, { useState, useRef, useEffect } from 'react';
// // import { useNavigate } from 'react-router-dom';
// // import axios from 'axios';

// // const api = axios.create({ baseURL: 'http://localhost:5000/api/employee/interview' });
// // api.interceptors.request.use(cfg => {
// //   cfg.headers.Authorization = `Bearer ${localStorage.getItem('token')}`;
// //   return cfg;
// // });

// // const STEPS = { UPLOAD: 'upload', INTERVIEW: 'interview', RESULT: 'result' };

// // export default function Interview() {
// //   const navigate = useNavigate();
// //   const [step, setStep] = useState(STEPS.UPLOAD);
// //   const [resumeFile, setResumeFile] = useState(null);
// //   const [loading, setLoading] = useState(false);
// //   const [error, setError] = useState('');
// //   const [session, setSession] = useState(null);
// //   const [currentQ, setCurrentQ] = useState(null);
// //   const [currentIndex, setCurrentIndex] = useState(0);
// //   const [lastEval, setLastEval] = useState(null);
// //   const [result, setResult] = useState(null);

// //   const [listening, setListening] = useState(false);
// //   const [transcript, setTranscript] = useState('');
// //   const [submitting, setSubmitting] = useState(false);
// //   const recognitionRef = useRef(null);

// //   useEffect(() => {
// //     const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
// //     if (!SR) { setError('Your browser does not support voice recording. Use Chrome.'); return; }
// //     const r = new SR();
// //     r.continuous = true;
// //     r.interimResults = true;
// //     r.lang = 'en-US';
// //     r.onresult = (e) => {
// //       let final = '';
// //       for (let i = e.resultIndex; i < e.results.length; i++) {
// //         if (e.results[i].isFinal) final += e.results[i][0].transcript;
// //       }
// //       if (final) setTranscript(prev => (prev + ' ' + final).trim());
// //     };
// //     r.onend = () => setListening(false);
// //     recognitionRef.current = r;
// //     return () => r.abort();
// //   }, []);

// //   const startListening = () => {
// //     setTranscript('');
// //     setListening(true);
// //     recognitionRef.current?.start();
// //   };

// //   const stopListening = () => {
// //     setListening(false);
// //     recognitionRef.current?.stop();
// //   };

// //   const speakText = (text) => {
// //     if (!text) return;
// //     window.speechSynthesis?.cancel();
// //     const u = new SpeechSynthesisUtterance(text);
// //     u.rate = 0.95;
// //     window.speechSynthesis?.speak(u);
// //   };

// //   const handleStart = async () => {
// //     if (!resumeFile) return setError('Please upload your resume first');
// //     setLoading(true);
// //     setError('');
// //     try {
// //       const fd = new FormData();
// //       fd.append('resume', resumeFile);
// //       const { data } = await api.post('/start', fd);
// //       setSession(data.data);
// //       setCurrentQ(data.data.first_question);
// //       setCurrentIndex(0);
// //       setStep(STEPS.INTERVIEW);
// //       // Safe: first_question is always present after /start
// //       setTimeout(() => speakText(data.data.first_question?.q), 600);
// //     } catch (e) {
// //       setError(e.response?.data?.message || 'Failed to start interview');
// //     }
// //     setLoading(false);
// //   };

// //   const handleSubmitAnswer = async () => {
// //     if (!transcript.trim()) return setError('Please speak or type your answer first');
// //     setSubmitting(true);
// //     setError('');
// //     try {
// //       const { data } = await api.post('/answer', {
// //         session_id: session.session_id,
// //         answer: transcript,
// //         question_index: currentIndex
// //       });
// //       const d = data.data;
// //       setLastEval(d.evaluation);
// //       setTranscript('');

// //       // ✅ FIX: use is_complete (new backend) OR is_last (old backend) — handles both
// //       const isFinished = d.is_complete || d.is_last || d.next_question === null || d.next_question === undefined;

// //       if (isFinished) {
// //         // All questions answered — fetch final result
// //         try {
// //           const fin = await api.post('/finish', { session_id: session.session_id });
// //           setResult(fin.data.data);
// //           setStep(STEPS.RESULT);
// //           window.speechSynthesis?.cancel();
// //         } catch (finErr) {
// //           setError(finErr.response?.data?.message || 'Failed to finish interview');
// //         }
// //       } else {
// //         // ✅ FIX: double-check next_question is not null before using it
// //         if (!d.next_question || !d.next_question.q) {
// //           setError('Unexpected error: next question missing. Please refresh and try again.');
// //           setSubmitting(false);
// //           return;
// //         }
// //         setCurrentQ(d.next_question);
// //         setCurrentIndex(d.next_index);
// //         // ✅ FIX: only speak if next_question exists
// //         setTimeout(() => speakText(d.next_question.q), 800);
// //       }
// //     } catch (e) {
// //       setError(e.response?.data?.message || 'Failed to submit answer');
// //     }
// //     setSubmitting(false);
// //   };

// //   const resetInterview = () => {
// //     setStep(STEPS.UPLOAD);
// //     setResumeFile(null);
// //     setResult(null);
// //     setLastEval(null);
// //     setSession(null);
// //     setCurrentQ(null);
// //     setCurrentIndex(0);
// //     setTranscript('');
// //     setError('');
// //     window.speechSynthesis?.cancel();
// //   };

// //   // ── UPLOAD STEP ──
// //   if (step === STEPS.UPLOAD) return (
// //     <div className="page-content">
// //       <div className="page-hero">
// //         <h4 className="mb-1" style={{ color: 'black' }}>AI Interview Practice</h4>
// //         <p className="text-muted mb-0">Upload your resume and get interviewed by AI based on your skills</p>
// //       </div>
// //       {error && <div className="alert alert-danger">{error}</div>}
// //       <div style={{ maxWidth: 520, margin: '32px auto', background: 'var(--bs-body-bg)', borderRadius: 16, padding: 32, border: '1px solid var(--bs-border-color)' }}>
// //         <div style={{ textAlign: 'center', marginBottom: 28 }}>
// //           <div style={{ width: 64, height: 64, borderRadius: '50%', background: '#ede9fe', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
// //             <i className="bi bi-mic-fill" style={{ fontSize: 28, color: '#7c3aed' }} />
// //           </div>
// //           <h5 style={{ fontWeight: 700 }}>How it works</h5>
// //           <p className="text-muted" style={{ fontSize: 14 }}>AI reads your resume → generates skill-based technical questions → you answer by voice → AI scores you</p>
// //         </div>
// //         <label className="form-label fw-semibold">Upload Resume (PDF)</label>
// //         <div
// //           style={{ border: '2px dashed #c4b5fd', borderRadius: 12, padding: '32px 24px', textAlign: 'center', cursor: 'pointer', background: resumeFile ? '#f5f3ff' : 'transparent', marginBottom: 20 }}
// //           onClick={() => document.getElementById('resume-upload').click()}
// //         >
// //           <i className="bi bi-file-earmark-pdf" style={{ fontSize: 32, color: resumeFile ? '#7c3aed' : '#9ca3af' }} />
// //           <p style={{ margin: '8px 0 0', color: resumeFile ? '#7c3aed' : '#6b7280', fontSize: 14 }}>
// //             {resumeFile ? resumeFile.name : 'Click to upload PDF'}
// //           </p>
// //           <input id="resume-upload" type="file" accept=".pdf" style={{ display: 'none' }} onChange={e => setResumeFile(e.target.files[0])} />
// //         </div>
// //         <button
// //           className="btn btn-primary w-100 rounded-pill"
// //           style={{ background: '#7c3aed', borderColor: '#7c3aed' }}
// //           onClick={handleStart}
// //           disabled={loading || !resumeFile}
// //         >
// //           {loading
// //             ? <><span className="spinner-border spinner-border-sm me-2" />Analyzing resume...</>
// //             : <><i className="bi bi-play-fill me-2" />Start Interview</>}
// //         </button>
// //       </div>
// //     </div>
// //   );

// //   // ── INTERVIEW STEP ──
// //   if (step === STEPS.INTERVIEW) return (
// //     <div className="page-content">
// //       <div style={{ maxWidth: 680, margin: '0 auto' }}>
// //         {/* Header */}
// //         <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
// //           <div>
// //             <h5 style={{ fontWeight: 700, margin: 0 }}>Question {currentIndex + 1} of {session?.total_questions}</h5>
// //             <p className="text-muted" style={{ fontSize: 13, margin: 0 }}>Skills: {session?.skills?.slice(0, 4).join(', ')}</p>
// //           </div>
// //           <div style={{ display: 'flex', gap: 6 }}>
// //             {Array.from({ length: session?.total_questions || 0 }).map((_, i) => (
// //               <div key={i} style={{
// //                 width: 10, height: 10, borderRadius: '50%',
// //                 background: i < currentIndex ? '#7c3aed' : i === currentIndex ? '#a78bfa' : '#e5e7eb'
// //               }} />
// //             ))}
// //           </div>
// //         </div>

// //         {error && <div className="alert alert-danger">{error}</div>}

// //         {/* Question card — ✅ only render if currentQ exists */}
// //         {currentQ && currentQ.q ? (
// //           <div style={{ background: 'linear-gradient(135deg, #7c3aed 0%, #5b21b6 100%)', borderRadius: 16, padding: '28px 32px', marginBottom: 20, color: '#fff' }}>
// //             <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
// //               <div style={{ display: 'flex', gap: 8 }}>
// //                 {currentQ.topic && (
// //                   <span style={{ background: 'rgba(255,255,255,0.2)', borderRadius: 20, padding: '2px 12px', fontSize: 12 }}>{currentQ.topic}</span>
// //                 )}
// //                 {currentQ.difficulty && (
// //                   <span style={{ background: 'rgba(255,255,255,0.15)', borderRadius: 20, padding: '2px 12px', fontSize: 12 }}>{currentQ.difficulty}</span>
// //                 )}
// //               </div>
// //               <button onClick={() => speakText(currentQ.q)} style={{ background: 'rgba(255,255,255,0.2)', border: 'none', borderRadius: 8, padding: '4px 10px', color: '#fff', cursor: 'pointer', fontSize: 12 }}>
// //                 <i className="bi bi-volume-up me-1" />Replay
// //               </button>
// //             </div>
// //             <p style={{ fontSize: 17, fontWeight: 500, lineHeight: 1.6, margin: 0 }}>{currentQ.q}</p>
// //           </div>
// //         ) : (
// //           <div style={{ textAlign: 'center', padding: 40 }}>
// //             <span className="spinner-border" style={{ color: '#7c3aed' }} />
// //             <p className="text-muted mt-3">Loading question...</p>
// //           </div>
// //         )}

// //         {/* Previous answer feedback */}
// //         {lastEval && currentIndex > 0 && (
// //           <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: 12, padding: '14px 18px', marginBottom: 16 }}>
// //             <div style={{ fontWeight: 600, fontSize: 13, color: '#166534', marginBottom: 4 }}>
// //               <i className="bi bi-check-circle-fill me-1" />Previous answer scored {lastEval.score}/10
// //             </div>
// //             <p style={{ fontSize: 13, color: '#374151', margin: 0 }}>{lastEval.feedback}</p>
// //             {lastEval.strengths?.length > 0 && (
// //               <p style={{ fontSize: 12, color: '#059669', margin: '4px 0 0' }}>✓ {lastEval.strengths.join(' · ')}</p>
// //             )}
// //             {lastEval.gaps?.length > 0 && (
// //               <p style={{ fontSize: 12, color: '#dc2626', margin: '2px 0 0' }}>✗ {lastEval.gaps.join(' · ')}</p>
// //             )}
// //           </div>
// //         )}

// //         {/* Voice recorder */}
// //         <div style={{ border: '1px solid #e5e7eb', borderRadius: 16, padding: 24, background: '#fafafa' }}>
// //           <div style={{ textAlign: 'center', marginBottom: 16 }}>
// //             <button
// //               onClick={listening ? stopListening : startListening}
// //               disabled={submitting}
// //               style={{
// //                 width: 80, height: 80, borderRadius: '50%', border: 'none', cursor: submitting ? 'not-allowed' : 'pointer',
// //                 background: listening ? '#fee2e2' : '#ede9fe',
// //                 color: listening ? '#dc2626' : '#7c3aed',
// //                 fontSize: 32, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto',
// //                 boxShadow: listening ? '0 0 0 8px rgba(220,38,38,0.15)' : 'none',
// //                 transition: 'all 0.2s'
// //               }}
// //             >
// //               <i className={`bi bi-mic${listening ? '-fill' : ''}`} />
// //             </button>
// //             <p style={{ fontSize: 13, color: '#6b7280', marginTop: 10, marginBottom: 0 }}>
// //               {listening ? 'Listening... click to stop' : 'Click to speak your answer'}
// //             </p>
// //           </div>

// //           {transcript && (
// //             <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 10, padding: '12px 14px', marginBottom: 16, minHeight: 64 }}>
// //               <p style={{ fontSize: 14, color: '#111827', margin: 0, lineHeight: 1.7 }}>{transcript}</p>
// //             </div>
// //           )}

// //           <textarea
// //             className="form-control mb-3"
// //             rows={3}
// //             placeholder="Or type your answer here..."
// //             value={transcript}
// //             onChange={e => setTranscript(e.target.value)}
// //             style={{ fontSize: 13 }}
// //             disabled={submitting}
// //           />

// //           <div style={{ display: 'flex', gap: 10 }}>
// //             <button
// //               className="btn btn-outline-secondary rounded-pill"
// //               onClick={() => setTranscript('')}
// //               disabled={!transcript || submitting}
// //             >
// //               <i className="bi bi-trash me-1" />Clear
// //             </button>
// //             <button
// //               className="btn rounded-pill flex-grow-1"
// //               style={{ background: '#7c3aed', borderColor: '#7c3aed', color: '#fff' }}
// //               onClick={handleSubmitAnswer}
// //               disabled={submitting || !transcript.trim()}
// //             >
// //               {submitting
// //                 ? <><span className="spinner-border spinner-border-sm me-2" />Evaluating...</>
// //                 : <><i className="bi bi-send me-2" />{currentIndex + 1 === session?.total_questions ? 'Finish Interview' : 'Submit & Next'}</>}
// //             </button>
// //           </div>
// //         </div>
// //       </div>
// //     </div>
// //   );

// //   // ── RESULT STEP ──
// //   if (step === STEPS.RESULT && result) {
// //     const isShortlisted = result.verdict === 'shortlisted';
// //     const isMaybe = result.verdict === 'maybe';
// //     const gradients = {
// //       shortlisted: 'linear-gradient(135deg, #059669, #047857)',
// //       maybe: 'linear-gradient(135deg, #d97706, #b45309)',
// //       rejected: 'linear-gradient(135deg, #dc2626, #b91c1c)',
// //     };
// //     const emojis = { shortlisted: '🎉', maybe: '📊', rejected: '📋' };
// //     const labels = { shortlisted: 'Shortlisted!', maybe: 'Borderline', rejected: 'Not Selected' };

// //     return (
// //       <div className="page-content">
// //         <div style={{ maxWidth: 640, margin: '0 auto' }}>
// //           {/* Score card */}
// //           <div style={{
// //             background: gradients[result.verdict] || gradients.rejected,
// //             borderRadius: 20, padding: '36px 32px', textAlign: 'center', color: '#fff', marginBottom: 28
// //           }}>
// //             <div style={{ fontSize: 52, marginBottom: 12 }}>{emojis[result.verdict] || '📋'}</div>
// //             <h3 style={{ fontWeight: 700, margin: '0 0 8px' }}>{labels[result.verdict] || result.verdict}</h3>
// //             <div style={{ fontSize: 48, fontWeight: 700, margin: '12px 0' }}>
// //               {result.total_score ?? result.avgScore}<span style={{ fontSize: 24 }}>/10</span>
// //             </div>
// //             {result.summary && <p style={{ opacity: 0.9, margin: 0, lineHeight: 1.6 }}>{result.summary}</p>}
// //           </div>

// //           {/* Skills tested */}
// //           {result.skills_tested?.length > 0 && (
// //             <div style={{ marginBottom: 20 }}>
// //               <h6 style={{ fontWeight: 700, marginBottom: 12 }}>Skills Assessed</h6>
// //               <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
// //                 {result.skills_tested.map(s => (
// //                   <span key={s} style={{ background: '#ede9fe', color: '#6d28d9', borderRadius: 20, padding: '4px 14px', fontSize: 13, fontWeight: 500 }}>{s}</span>
// //                 ))}
// //               </div>
// //             </div>
// //           )}

// //           {/* Topic breakdown */}
// //           {result.topic_breakdown?.length > 0 && (
// //             <div style={{ marginBottom: 20 }}>
// //               <h6 style={{ fontWeight: 700, marginBottom: 12 }}>Score by Topic</h6>
// //               <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
// //                 {result.topic_breakdown.map(t => (
// //                   <div key={t.topic} style={{ background: '#f3f4f6', borderRadius: 10, padding: '8px 16px', fontSize: 13 }}>
// //                     <strong>{t.topic}</strong>: <span style={{ color: t.avg >= 7 ? '#059669' : t.avg >= 5 ? '#d97706' : '#dc2626' }}>{t.avg}/10</span>
// //                   </div>
// //                 ))}
// //               </div>
// //             </div>
// //           )}

// //           {/* Per-question breakdown */}
// //           {result.answers?.length > 0 && (
// //             <>
// //               <h6 style={{ fontWeight: 700, marginBottom: 12 }}>Question Breakdown</h6>
// //               {result.answers.map((a, i) => (
// //                 <div key={i} style={{ border: '1px solid #e5e7eb', borderRadius: 12, padding: '16px 20px', marginBottom: 12 }}>
// //                   <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
// //                     <span style={{ fontWeight: 600, fontSize: 14, flex: 1, paddingRight: 12 }}>
// //                       Q{i + 1}: {a.question?.length > 70 ? a.question.slice(0, 70) + '...' : a.question}
// //                     </span>
// //                     <span style={{
// //                       fontWeight: 700, fontSize: 15, flexShrink: 0,
// //                       color: a.score >= 7 ? '#059669' : a.score >= 5 ? '#d97706' : '#dc2626'
// //                     }}>{a.score}/10</span>
// //                   </div>
// //                   <p style={{ fontSize: 13, color: '#374151', margin: 0 }}>{a.feedback}</p>
// //                   {a.strengths?.length > 0 && (
// //                     <p style={{ fontSize: 12, color: '#059669', margin: '6px 0 0' }}>✓ {a.strengths.join(' · ')}</p>
// //                   )}
// //                   {a.gaps?.length > 0 && (
// //                     <p style={{ fontSize: 12, color: '#dc2626', margin: '4px 0 0' }}>✗ {a.gaps.join(' · ')}</p>
// //                   )}
// //                 </div>
// //               ))}
// //             </>
// //           )}

// //           <div style={{ display: 'flex', gap: 12, marginTop: 20 }}>
// //             <button className="btn btn-outline-secondary rounded-pill flex-grow-1" onClick={resetInterview}>
// //               <i className="bi bi-arrow-repeat me-2" />Try Again
// //             </button>
// //             <button className="btn btn-primary rounded-pill flex-grow-1" onClick={() => navigate('/jobs')}>
// //               <i className="bi bi-briefcase me-2" />Browse Jobs
// //             </button>
// //           </div>
// //         </div>
// //       </div>
// //     );
// //   }

// //   return null;
// // }
// import React, { useState, useRef, useEffect } from 'react';
// import { useNavigate } from 'react-router-dom';
// import axios from 'axios';

// const api = axios.create({ baseURL: 'http://localhost:5000/api/employee/interview' });
// api.interceptors.request.use(cfg => {
//   cfg.headers.Authorization = `Bearer ${localStorage.getItem('token')}`;
//   return cfg;
// });

// const STEPS = { UPLOAD: 'upload', INTERVIEW: 'interview', RESULT: 'result' };

// export default function Interview() {
//   const navigate = useNavigate();
//   const [step, setStep] = useState(STEPS.UPLOAD);
//   const [resumeFile, setResumeFile] = useState(null);
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState('');
//   const [session, setSession] = useState(null);
//   const [currentQ, setCurrentQ] = useState(null);
//   const [currentIndex, setCurrentIndex] = useState(0);
//   const [lastEval, setLastEval] = useState(null);
//   const [result, setResult] = useState(null);
//   const [listening, setListening] = useState(false);
//   const [transcript, setTranscript] = useState('');
//   const [submitting, setSubmitting] = useState(false);
//   const recognitionRef = useRef(null);

//   useEffect(() => {
//     const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
//     if (!SR) { setError('Voice not supported. Please use Chrome or type your answer below.'); return; }
//     const r = new SR();
//     r.continuous = true;
//     r.interimResults = true;
//     r.lang = 'en-US';
//     r.onresult = (e) => {
//       let final = '';
//       for (let i = e.resultIndex; i < e.results.length; i++) {
//         if (e.results[i].isFinal) final += e.results[i][0].transcript;
//       }
//       if (final) setTranscript(prev => (prev + ' ' + final).trim());
//     };
//     r.onend = () => setListening(false);
//     recognitionRef.current = r;
//     return () => r.abort();
//   }, []);

//   const startListening = () => { setTranscript(''); setListening(true); recognitionRef.current?.start(); };
//   const stopListening = () => { setListening(false); recognitionRef.current?.stop(); };

//   const speakText = (text) => {
//     if (!text) return;
//     window.speechSynthesis?.cancel();
//     const u = new SpeechSynthesisUtterance(text);
//     u.rate = 0.9;
//     window.speechSynthesis?.speak(u);
//   };

//   const handleStart = async () => {
//     if (!resumeFile) return setError('Please upload your resume first');
//     setLoading(true); setError('');
//     try {
//       const fd = new FormData();
//       fd.append('resume', resumeFile);
//       const { data } = await api.post('/start', fd);
//       setSession(data.data);
//       setCurrentQ(data.data.first_question);
//       setCurrentIndex(0);
//       setStep(STEPS.INTERVIEW);
//       setTimeout(() => speakText(data.data.first_question?.q), 600);
//     } catch (e) {
//       setError(e.response?.data?.message || 'Failed to start interview');
//     }
//     setLoading(false);
//   };

//   const handleSubmitAnswer = async () => {
//     if (!transcript.trim()) return setError('Please speak or type your answer first');
//     setSubmitting(true); setError('');
//     try {
//       const { data } = await api.post('/answer', {
//         session_id: session.session_id,
//         answer: transcript,
//         question_index: currentIndex
//       });
//       const d = data.data;
//       setLastEval(d.evaluation);
//       setTranscript('');

//       // ✅ Safe null check — handles both is_complete and null next_question
//       const isFinished = d.is_complete || !d.next_question || !d.next_question.q;

//       if (isFinished) {
//         try {
//           const fin = await api.post('/finish', { session_id: session.session_id });
//           setResult(fin.data.data);
//           setStep(STEPS.RESULT);
//           window.speechSynthesis?.cancel();
//         } catch (finErr) {
//           setError(finErr.response?.data?.message || 'Failed to finish interview');
//         }
//       } else {
//         setCurrentQ(d.next_question);
//         setCurrentIndex(d.next_index);
//         setTimeout(() => speakText(d.next_question.q), 800);
//       }
//     } catch (e) {
//       setError(e.response?.data?.message || 'Failed to submit answer');
//     }
//     setSubmitting(false);
//   };

//   const resetInterview = () => {
//     setStep(STEPS.UPLOAD); setResumeFile(null); setResult(null);
//     setLastEval(null); setSession(null); setCurrentQ(null);
//     setCurrentIndex(0); setTranscript(''); setError('');
//     window.speechSynthesis?.cancel();
//   };

//   // ── UPLOAD STEP ──
//   if (step === STEPS.UPLOAD) return (
//     <div className="page-content">
//       <div className="page-hero">
//         <h4 className="mb-1" style={{ color: 'black' }}>AI Interview Practice</h4>
//         <p className="text-muted mb-0">Upload your resume — AI will ask you 3 technical + 2 HR questions based on your skills</p>
//       </div>
//       {error && <div className="alert alert-warning">{error}</div>}
//       <div style={{ maxWidth: 520, margin: '32px auto', background: 'var(--bs-body-bg)', borderRadius: 16, padding: 32, border: '1px solid var(--bs-border-color)' }}>
//         <div style={{ textAlign: 'center', marginBottom: 24 }}>
//           <div style={{ width: 64, height: 64, borderRadius: '50%', background: '#ede9fe', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
//             <i className="bi bi-mic-fill" style={{ fontSize: 28, color: '#7c3aed' }} />
//           </div>
//           <h5 style={{ fontWeight: 700 }}>How it works</h5>
//         </div>
//         <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 24 }}>
//           {[
//             { icon: '📄', text: 'AI reads your resume and finds your tech skills' },
//             { icon: '💻', text: '3 Technical questions — explain concepts, definitions, what you have built' },
//             { icon: '🧠', text: '2 HR questions — time management, pressure, priorities, teamwork' },
//             { icon: '🎤', text: 'Answer by voice or typing — no code writing at all' },
//             { icon: '🏆', text: 'Get a score out of 10 with detailed feedback' },
//           ].map((item, i) => (
//             <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '8px 12px', background: '#f9fafb', borderRadius: 10, fontSize: 14 }}>
//               <span style={{ fontSize: 20 }}>{item.icon}</span>
//               <span style={{ color: '#374151' }}>{item.text}</span>
//             </div>
//           ))}
//         </div>

//         <label className="form-label fw-semibold">Upload Resume (PDF)</label>
//         <div
//           style={{ border: '2px dashed #c4b5fd', borderRadius: 12, padding: '28px 24px', textAlign: 'center', cursor: 'pointer', background: resumeFile ? '#f5f3ff' : 'transparent', marginBottom: 20 }}
//           onClick={() => document.getElementById('resume-upload').click()}
//         >
//           <i className="bi bi-file-earmark-pdf" style={{ fontSize: 32, color: resumeFile ? '#7c3aed' : '#9ca3af' }} />
//           <p style={{ margin: '8px 0 0', color: resumeFile ? '#7c3aed' : '#6b7280', fontSize: 14 }}>
//             {resumeFile ? `✓ ${resumeFile.name}` : 'Click to upload your PDF resume'}
//           </p>
//           <input id="resume-upload" type="file" accept=".pdf" style={{ display: 'none' }} onChange={e => setResumeFile(e.target.files[0])} />
//         </div>
//         <button
//           className="btn btn-primary w-100 rounded-pill"
//           style={{ background: '#7c3aed', borderColor: '#7c3aed', padding: '12px' }}
//           onClick={handleStart}
//           disabled={loading || !resumeFile}
//         >
//           {loading
//             ? <><span className="spinner-border spinner-border-sm me-2" />Analyzing your resume...</>
//             : <><i className="bi bi-play-fill me-2" />Start Interview</>}
//         </button>
//       </div>
//     </div>
//   );

//   // ── INTERVIEW STEP ──
//   if (step === STEPS.INTERVIEW) {
//     const isHRQuestion = currentQ?.type === 'hr';
//     return (
//       <div className="page-content">
//         <div style={{ maxWidth: 680, margin: '0 auto' }}>

//           {/* Progress */}
//           <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
//             <div>
//               <h5 style={{ fontWeight: 700, margin: 0 }}>Question {currentIndex + 1} of {session?.total_questions}</h5>
//               <p className="text-muted" style={{ fontSize: 13, margin: 0 }}>Skills: {session?.skills?.slice(0, 4).join(', ')}</p>
//             </div>
//             <div style={{ display: 'flex', gap: 6 }}>
//               {Array.from({ length: session?.total_questions || 0 }).map((_, i) => (
//                 <div key={i} style={{
//                   width: 12, height: 12, borderRadius: '50%',
//                   background: i < currentIndex ? '#7c3aed' : i === currentIndex ? '#a78bfa' : '#e5e7eb'
//                 }} />
//               ))}
//             </div>
//           </div>

//           {error && <div className="alert alert-danger">{error}</div>}

//           {/* Question card */}
//           {currentQ?.q ? (
//             <div style={{
//               background: isHRQuestion
//                 ? 'linear-gradient(135deg, #d97706 0%, #b45309 100%)'
//                 : 'linear-gradient(135deg, #7c3aed 0%, #5b21b6 100%)',
//               borderRadius: 16, padding: '28px 32px', marginBottom: 20, color: '#fff'
//             }}>
//               <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 14 }}>
//                 <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
//                   <span style={{ background: 'rgba(255,255,255,0.25)', borderRadius: 20, padding: '3px 14px', fontSize: 12, fontWeight: 700 }}>
//                     {isHRQuestion ? '🧠 HR / Behavioral' : '💻 Technical'}
//                   </span>
//                   {currentQ.topic && (
//                     <span style={{ background: 'rgba(255,255,255,0.15)', borderRadius: 20, padding: '3px 12px', fontSize: 12 }}>
//                       {currentQ.topic}
//                     </span>
//                   )}
//                 </div>
//                 <button
//                   onClick={() => speakText(currentQ.q)}
//                   style={{ background: 'rgba(255,255,255,0.2)', border: 'none', borderRadius: 8, padding: '4px 10px', color: '#fff', cursor: 'pointer', fontSize: 12, flexShrink: 0 }}
//                 >
//                   <i className="bi bi-volume-up me-1" />Replay
//                 </button>
//               </div>
//               <p style={{ fontSize: 17, fontWeight: 500, lineHeight: 1.7, margin: 0 }}>{currentQ.q}</p>
//               <p style={{ fontSize: 12, opacity: 0.75, margin: '14px 0 0' }}>
//                 {isHRQuestion
//                   ? '💡 Give a real example from your experience — explain the situation, what you did, and the result.'
//                   : '💡 Explain in your own words — mention how you have used this in real projects.'}
//               </p>
//             </div>
//           ) : (
//             <div style={{ textAlign: 'center', padding: 40 }}>
//               <span className="spinner-border" style={{ color: '#7c3aed' }} />
//             </div>
//           )}

//           {/* Last eval feedback */}
//           {lastEval && currentIndex > 0 && (
//             <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: 12, padding: '14px 18px', marginBottom: 16 }}>
//               <div style={{ fontWeight: 600, fontSize: 13, color: '#166534', marginBottom: 4 }}>
//                 <i className="bi bi-check-circle-fill me-1" />Previous answer scored {lastEval.score}/10
//               </div>
//               <p style={{ fontSize: 13, color: '#374151', margin: 0 }}>{lastEval.feedback}</p>
//               {lastEval.strengths?.length > 0 && <p style={{ fontSize: 12, color: '#059669', margin: '4px 0 0' }}>✓ {lastEval.strengths.join(' · ')}</p>}
//               {lastEval.gaps?.length > 0 && <p style={{ fontSize: 12, color: '#dc2626', margin: '2px 0 0' }}>✗ {lastEval.gaps.join(' · ')}</p>}
//             </div>
//           )}

//           {/* Answer area */}
//           <div style={{ border: '1px solid #e5e7eb', borderRadius: 16, padding: 24, background: '#fafafa' }}>
//             <div style={{ textAlign: 'center', marginBottom: 16 }}>
//               <button
//                 onClick={listening ? stopListening : startListening}
//                 disabled={submitting}
//                 style={{
//                   width: 80, height: 80, borderRadius: '50%', border: 'none',
//                   cursor: submitting ? 'not-allowed' : 'pointer',
//                   background: listening ? '#fee2e2' : '#ede9fe',
//                   color: listening ? '#dc2626' : '#7c3aed',
//                   fontSize: 32, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto',
//                   boxShadow: listening ? '0 0 0 10px rgba(220,38,38,0.12)' : 'none',
//                   transition: 'all 0.2s'
//                 }}
//               >
//                 <i className={`bi bi-mic${listening ? '-fill' : ''}`} />
//               </button>
//               <p style={{ fontSize: 13, color: '#6b7280', marginTop: 10, marginBottom: 0 }}>
//                 {listening ? '🔴 Listening... click to stop' : 'Click mic to speak, or type your answer below'}
//               </p>
//             </div>

//             <textarea
//               className="form-control mb-3"
//               rows={4}
//               placeholder={isHRQuestion
//                 ? 'Tell me about a real situation from your experience...'
//                 : 'Explain the concept and how you have used it in your projects...'}
//               value={transcript}
//               onChange={e => setTranscript(e.target.value)}
//               style={{ fontSize: 14, lineHeight: 1.7 }}
//               disabled={submitting}
//             />

//             <div style={{ display: 'flex', gap: 10 }}>
//               <button className="btn btn-outline-secondary rounded-pill" onClick={() => setTranscript('')} disabled={!transcript || submitting}>
//                 <i className="bi bi-trash me-1" />Clear
//               </button>
//               <button
//                 className="btn rounded-pill flex-grow-1"
//                 style={{ background: '#7c3aed', borderColor: '#7c3aed', color: '#fff' }}
//                 onClick={handleSubmitAnswer}
//                 disabled={submitting || !transcript.trim()}
//               >
//                 {submitting
//                   ? <><span className="spinner-border spinner-border-sm me-2" />Evaluating...</>
//                   : <><i className="bi bi-send me-2" />{currentIndex + 1 === session?.total_questions ? 'Finish Interview' : 'Submit & Next'}</>}
//               </button>
//             </div>
//           </div>
//         </div>
//       </div>
//     );
//   }

//   // ── RESULT STEP ──
//   if (step === STEPS.RESULT && result) {
//     const verdictConfig = {
//       shortlisted: { gradient: 'linear-gradient(135deg,#059669,#047857)', emoji: '🎉', label: 'Shortlisted!' },
//       maybe: { gradient: 'linear-gradient(135deg,#d97706,#b45309)', emoji: '📊', label: 'Borderline' },
//       rejected: { gradient: 'linear-gradient(135deg,#dc2626,#b91c1c)', emoji: '📋', label: 'Not Selected' },
//     };
//     const vc = verdictConfig[result.verdict] || verdictConfig.rejected;

//     return (
//       <div className="page-content">
//         <div style={{ maxWidth: 660, margin: '0 auto' }}>

//           {/* Overall score */}
//           <div style={{ background: vc.gradient, borderRadius: 20, padding: '36px 32px', textAlign: 'center', color: '#fff', marginBottom: 24 }}>
//             <div style={{ fontSize: 52, marginBottom: 8 }}>{vc.emoji}</div>
//             <h3 style={{ fontWeight: 700, margin: '0 0 4px' }}>{vc.label}</h3>
//             <div style={{ fontSize: 48, fontWeight: 700, margin: '8px 0' }}>
//               {result.total_score}<span style={{ fontSize: 20, opacity: 0.8 }}>/10</span>
//             </div>
//             {result.summary && <p style={{ opacity: 0.88, margin: '12px 0 0', lineHeight: 1.6, fontSize: 14 }}>{result.summary}</p>}
//           </div>

//           {/* Technical vs HR breakdown */}
//           <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 20 }}>
//             <div style={{ background: '#ede9fe', borderRadius: 14, padding: '18px 20px', textAlign: 'center' }}>
//               <div style={{ fontSize: 11, color: '#6d28d9', fontWeight: 700, marginBottom: 4, textTransform: 'uppercase', letterSpacing: 1 }}>💻 Technical</div>
//               <div style={{ fontSize: 34, fontWeight: 800, color: '#5b21b6' }}>
//                 {result.technical_score ?? '—'}<span style={{ fontSize: 16, opacity: 0.7 }}>/10</span>
//               </div>
//               <div style={{ fontSize: 12, color: '#7c3aed', marginTop: 2 }}>3 questions</div>
//             </div>
//             <div style={{ background: '#fef3c7', borderRadius: 14, padding: '18px 20px', textAlign: 'center' }}>
//               <div style={{ fontSize: 11, color: '#92400e', fontWeight: 700, marginBottom: 4, textTransform: 'uppercase', letterSpacing: 1 }}>🧠 HR / Behavioral</div>
//               <div style={{ fontSize: 34, fontWeight: 800, color: '#b45309' }}>
//                 {result.hr_score ?? '—'}<span style={{ fontSize: 16, opacity: 0.7 }}>/10</span>
//               </div>
//               <div style={{ fontSize: 12, color: '#d97706', marginTop: 2 }}>2 questions</div>
//             </div>
//           </div>

//           {/* Skills assessed */}
//           {result.skills_tested?.length > 0 && (
//             <div style={{ marginBottom: 20 }}>
//               <h6 style={{ fontWeight: 700, marginBottom: 10 }}>Skills Assessed</h6>
//               <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
//                 {result.skills_tested.map(s => (
//                   <span key={s} style={{ background: '#ede9fe', color: '#6d28d9', borderRadius: 20, padding: '4px 14px', fontSize: 13, fontWeight: 500 }}>{s}</span>
//                 ))}
//               </div>
//             </div>
//           )}

//           {/* Question-by-question breakdown */}
//           {result.answers?.length > 0 && (
//             <>
//               <h6 style={{ fontWeight: 700, marginBottom: 12 }}>Full Breakdown</h6>
//               {result.answers.map((a, i) => (
//                 <div key={i} style={{ border: '1px solid #e5e7eb', borderRadius: 12, padding: '16px 20px', marginBottom: 12 }}>
//                   <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8, gap: 10 }}>
//                     <div style={{ flex: 1 }}>
//                       <span style={{
//                         fontSize: 11, fontWeight: 700, borderRadius: 20, padding: '2px 10px', marginRight: 8,
//                         background: a.type === 'hr' ? '#fef3c7' : '#ede9fe',
//                         color: a.type === 'hr' ? '#92400e' : '#5b21b6'
//                       }}>
//                         {a.type === 'hr' ? '🧠 HR' : '💻 Technical'}
//                       </span>
//                       <span style={{ fontSize: 13, fontWeight: 600 }}>
//                         Q{i + 1}: {a.question?.length > 65 ? a.question.slice(0, 65) + '...' : a.question}
//                       </span>
//                     </div>
//                     <span style={{
//                       fontWeight: 700, fontSize: 16, flexShrink: 0,
//                       color: a.score >= 7 ? '#059669' : a.score >= 5 ? '#d97706' : '#dc2626'
//                     }}>{a.score}/10</span>
//                   </div>
//                   <p style={{ fontSize: 13, color: '#374151', margin: 0 }}>{a.feedback}</p>
//                   {a.strengths?.length > 0 && <p style={{ fontSize: 12, color: '#059669', margin: '6px 0 0' }}>✓ {a.strengths.join(' · ')}</p>}
//                   {a.gaps?.length > 0 && <p style={{ fontSize: 12, color: '#dc2626', margin: '4px 0 0' }}>✗ {a.gaps.join(' · ')}</p>}
//                 </div>
//               ))}
//             </>
//           )}

//           <div style={{ display: 'flex', gap: 12, marginTop: 24 }}>
//             <button className="btn btn-outline-secondary rounded-pill flex-grow-1" onClick={resetInterview}>
//               <i className="bi bi-arrow-repeat me-2" />Try Again
//             </button>
//             <button className="btn btn-primary rounded-pill flex-grow-1" onClick={() => navigate('/jobs')}>
//               <i className="bi bi-briefcase me-2" />Browse Jobs
//             </button>
//           </div>
//         </div>
//       </div>
//     );
//   }

//   return null;
// }
import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const api = axios.create({ baseURL: 'http://localhost:5000/api/employee/interview' });
api.interceptors.request.use(cfg => {
  cfg.headers.Authorization = `Bearer ${localStorage.getItem('token')}`;
  return cfg;
});

const STEPS = { UPLOAD: 'upload', INTERVIEW: 'interview', RESULT: 'result' };
const MAX_WARNINGS = 3;

// ══════════════════════════════════════════════════════════
//  ANTI-CHEAT HOOK
// ══════════════════════════════════════════════════════════
function useAntiCheat({ active, onViolation, onAutoSubmit }) {
  const warningCount = useRef(0);

  const trigger = useCallback((type) => {
    if (!active) return;
    warningCount.current += 1;
    onViolation(type, warningCount.current);
    if (warningCount.current >= MAX_WARNINGS) onAutoSubmit(type);
  }, [active, onViolation, onAutoSubmit]);

  // Tab switch
  useEffect(() => {
    if (!active) return;
    const fn = () => { if (document.hidden) trigger('tab_switch'); };
    document.addEventListener('visibilitychange', fn);
    return () => document.removeEventListener('visibilitychange', fn);
  }, [active, trigger]);

  // Window blur
  useEffect(() => {
    if (!active) return;
    const fn = () => trigger('window_blur');
    window.addEventListener('blur', fn);
    return () => window.removeEventListener('blur', fn);
  }, [active, trigger]);

  // Right-click
  useEffect(() => {
    if (!active) return;
    const fn = (e) => e.preventDefault();
    document.addEventListener('contextmenu', fn);
    return () => document.removeEventListener('contextmenu', fn);
  }, [active]);

  // Copy / cut
  useEffect(() => {
    if (!active) return;
    const fn = (e) => e.preventDefault();
    document.addEventListener('copy', fn);
    document.addEventListener('cut', fn);
    return () => { document.removeEventListener('copy', fn); document.removeEventListener('cut', fn); };
  }, [active]);

  // Paste
  useEffect(() => {
    if (!active) return;
    const fn = (e) => { e.preventDefault(); trigger('paste_attempt'); };
    document.addEventListener('paste', fn);
    return () => document.removeEventListener('paste', fn);
  }, [active, trigger]);

  // Keyboard shortcuts
  useEffect(() => {
    if (!active) return;
    const fn = (e) => {
      const blocked = [
        (e.ctrlKey || e.metaKey) && ['c','v','x','a','p','u','s'].includes(e.key.toLowerCase()),
        e.ctrlKey && e.shiftKey && ['i','j','c','k'].includes(e.key.toLowerCase()),
        e.key === 'F12',
      ];
      if (blocked.some(Boolean)) {
        e.preventDefault(); e.stopPropagation();
        if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'v') trigger('paste_attempt');
      }
    };
    document.addEventListener('keydown', fn, true);
    return () => document.removeEventListener('keydown', fn, true);
  }, [active, trigger]);

  // Disable text selection (allow inside textarea/input)
  useEffect(() => {
    if (!active) return;
    const style = document.createElement('style');
    style.id = '__ac_style';
    style.textContent = `
      body { user-select:none!important; -webkit-user-select:none!important; }
      textarea, input { user-select:text!important; -webkit-user-select:text!important; }
    `;
    document.head.appendChild(style);
    return () => document.getElementById('__ac_style')?.remove();
  }, [active]);

  // Fullscreen exit detection
  useEffect(() => {
    if (!active) return;
    let wasFullscreen = false;
    const fn = () => {
      const inFs = !!(document.fullscreenElement || document.webkitFullscreenElement);
      if (!inFs && wasFullscreen) trigger('fullscreen_exit');
      wasFullscreen = inFs;
    };
    document.addEventListener('fullscreenchange', fn);
    document.addEventListener('webkitfullscreenchange', fn);
    return () => {
      document.removeEventListener('fullscreenchange', fn);
      document.removeEventListener('webkitfullscreenchange', fn);
    };
  }, [active, trigger]);

  // DevTools heuristic
  useEffect(() => {
    if (!active) return;
    const id = setInterval(() => {
      if (window.outerWidth - window.innerWidth > 160 || window.outerHeight - window.innerHeight > 160) {
        trigger('devtools_open');
      }
    }, 3000);
    return () => clearInterval(id);
  }, [active, trigger]);

  const requestFullscreen = useCallback(() => {
    const el = document.documentElement;
    if (el.requestFullscreen) el.requestFullscreen();
    else if (el.webkitRequestFullscreen) el.webkitRequestFullscreen();
  }, []);

  return { requestFullscreen };
}

// ══════════════════════════════════════════════════════════
//  VIOLATION MODAL
// ══════════════════════════════════════════════════════════
const VIOLATION_INFO = {
  tab_switch:      { icon: '👁️', title: 'Tab Switch Detected',   body: 'You switched to another tab. This is strictly not allowed.' },
  window_blur:     { icon: '🪟', title: 'Window Focus Lost',      body: 'You navigated away from the interview window.' },
  paste_attempt:   { icon: '📋', title: 'Paste Blocked',          body: 'Copy-pasting is not allowed. Please type your answer manually.' },
  fullscreen_exit: { icon: '🖥️', title: 'Fullscreen Required',    body: 'You exited fullscreen. Please return to fullscreen to continue.' },
  devtools_open:   { icon: '🔧', title: 'DevTools Detected',      body: 'Browser developer tools are not allowed during the interview.' },
};

function ViolationModal({ violation, count, onClose, onFullscreen }) {
  if (!violation) return null;
  const info = VIOLATION_INFO[violation] || { icon: '⚠️', title: 'Violation', body: 'An integrity violation was detected.' };
  const remaining = MAX_WARNINGS - count;

  return (
    <div style={{
      position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.82)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999
    }}>
      <div style={{
        background: '#111827', border: '1px solid #374151', borderRadius: 18,
        padding: '40px 36px', maxWidth: 420, width: '90%', textAlign: 'center',
        boxShadow: '0 30px 80px rgba(0,0,0,0.6)'
      }}>
        <div style={{ fontSize: 48, marginBottom: 12 }}>{info.icon}</div>
        <h4 style={{ color: '#f87171', fontWeight: 700, marginBottom: 8 }}>{info.title}</h4>
        <p style={{ color: '#9ca3af', fontSize: 14, lineHeight: 1.6, marginBottom: 16 }}>{info.body}</p>
        <div style={{
          background: '#1f2937', borderRadius: 8, padding: '8px 16px',
          color: '#d1d5db', fontSize: 13, marginBottom: 12, display: 'inline-block'
        }}>
          Warning {count} of {MAX_WARNINGS}
        </div>
        <div style={{
          color: remaining > 0 ? '#fbbf24' : '#f87171', fontSize: 13,
          background: remaining > 0 ? '#1c1400' : '#1a0000',
          borderRadius: 8, padding: '10px 14px', marginBottom: 24
        }}>
          {remaining > 0
            ? `⚠️ ${remaining} warning${remaining > 1 ? 's' : ''} left before your interview is auto-submitted.`
            : '🚫 This was your final warning. Your interview is being submitted now.'}
        </div>
        {violation === 'fullscreen_exit' ? (
          <button onClick={onFullscreen} style={btnStyle('#2563eb')}>🖥️ Return to Fullscreen</button>
        ) : (
          <button onClick={onClose} style={btnStyle('#374151')}>I Understand — Continue</button>
        )}
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════
//  TERMINATED SCREEN
// ══════════════════════════════════════════════════════════
function TerminatedScreen({ violations }) {
  return (
    <div style={{
      position: 'fixed', inset: 0, background: '#0a0a0a',
      display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999
    }}>
      <div style={{
        background: '#1a0000', border: '1px solid #7f1d1d', borderRadius: 18,
        padding: '48px 40px', maxWidth: 500, width: '90%', textAlign: 'center',
        boxShadow: '0 0 80px rgba(239,68,68,0.15)'
      }}>
        <div style={{ fontSize: 60, marginBottom: 16 }}>🚫</div>
        <h3 style={{ color: '#ef4444', fontWeight: 700, marginBottom: 10 }}>Interview Terminated</h3>
        <p style={{ color: '#fca5a5', fontSize: 15, lineHeight: 1.6, marginBottom: 24 }}>
          Your interview has been automatically submitted due to {MAX_WARNINGS} integrity violations.
        </p>
        <div style={{ background: '#0f0000', borderRadius: 10, padding: 16, textAlign: 'left' }}>
          <p style={{ color: '#ef4444', fontWeight: 600, fontSize: 13, marginBottom: 10 }}>Violation Log</p>
          {violations.map((v, i) => {
            const info = VIOLATION_INFO[v.type] || { icon: '⚠️', title: v.type };
            return (
              <div key={i} style={{ display: 'flex', gap: 10, marginBottom: 6, fontSize: 13, color: '#fca5a5' }}>
                <span style={{ color: '#6b7280', minWidth: 64 }}>{v.time}</span>
                <span>{info.icon} {info.title}</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function btnStyle(bg) {
  return {
    background: bg, color: '#fff', border: 'none', borderRadius: 8,
    padding: '11px 24px', fontSize: 14, fontWeight: 600, cursor: 'pointer', width: '100%'
  };
}

// ══════════════════════════════════════════════════════════
//  FULLSCREEN GATE
// ══════════════════════════════════════════════════════════
function FullscreenGate({ onEnter }) {
  return (
    <div style={{
      position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.93)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9998
    }}>
      <div style={{
        background: '#111827', border: '1px solid #374151', borderRadius: 18,
        padding: '48px 40px', maxWidth: 500, width: '90%', textAlign: 'center'
      }}>
        <div style={{ fontSize: 52, marginBottom: 16 }}>🖥️</div>
        <h3 style={{ color: '#f9fafb', fontWeight: 700, marginBottom: 10 }}>Fullscreen Mode Required</h3>
        <p style={{ color: '#9ca3af', fontSize: 14, lineHeight: 1.6, marginBottom: 24 }}>
          This interview is monitored for integrity. The following are strictly prohibited:
        </p>
        <div style={{ textAlign: 'left', marginBottom: 28 }}>
          {[
            '❌ Switching tabs or windows',
            '❌ Copy / paste of any kind',
            '❌ Right-clicking anywhere',
            '❌ Opening browser DevTools',
            '❌ Exiting fullscreen mode',
            `⚠️ ${MAX_WARNINGS} violations = automatic submission`,
          ].map((r, i) => (
            <div key={i} style={{
              background: '#1f2937', borderRadius: 8, padding: '10px 14px',
              marginBottom: 8, color: '#d1d5db', fontSize: 14
            }}>{r}</div>
          ))}
        </div>
        <button onClick={onEnter} style={btnStyle('#7c3aed')}>
          ▶ Enter Fullscreen & Begin Interview
        </button>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════
//  MAIN INTERVIEW COMPONENT
// ══════════════════════════════════════════════════════════
export default function Interview() {
  const navigate = useNavigate();
  const [step, setStep] = useState(STEPS.UPLOAD);
  const [resumeFile, setResumeFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [session, setSession] = useState(null);
  const [currentQ, setCurrentQ] = useState(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [lastEval, setLastEval] = useState(null);
  const [result, setResult] = useState(null);
  const [listening, setListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const recognitionRef = useRef(null);

  // ── Anti-cheat state ──
  const [fsRequested, setFsRequested] = useState(false);
  const [terminated, setTerminated] = useState(false);
  const [violations, setViolations] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [latestViolation, setLatestViolation] = useState(null);
  const [latestCount, setLatestCount] = useState(0);
  const warningCountRef = useRef(0);

  const isInterviewLive = step === STEPS.INTERVIEW && fsRequested && !terminated;

  const handleViolation = useCallback((type, count) => {
    warningCountRef.current = count;
    const v = { type, time: new Date().toLocaleTimeString() };
    setViolations(prev => [...prev, v]);
    setLatestViolation(type);
    setLatestCount(count);
    setShowModal(true);
  }, []);

  const handleAutoSubmit = useCallback(async (type) => {
    setTerminated(true);
    setShowModal(false);
    window.speechSynthesis?.cancel();
    if (session?.session_id) {
      try {
        const fin = await api.post('/finish', { session_id: session.session_id });
        setResult(fin.data.data);
        setStep(STEPS.RESULT);
      } catch (_) {}
    }
  }, [session]);

  const { requestFullscreen } = useAntiCheat({
    active: isInterviewLive,
    onViolation: handleViolation,
    onAutoSubmit: handleAutoSubmit,
  });

  const enterFullscreen = () => {
    requestFullscreen();
    setFsRequested(true);
  };

  // ── Speech recognition ──
  useEffect(() => {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) { setError('Voice not supported. Use Chrome or type your answer below.'); return; }
    const r = new SR();
    r.continuous = true; r.interimResults = true; r.lang = 'en-US';
    r.onresult = (e) => {
      let final = '';
      for (let i = e.resultIndex; i < e.results.length; i++) {
        if (e.results[i].isFinal) final += e.results[i][0].transcript;
      }
      if (final) setTranscript(prev => (prev + ' ' + final).trim());
    };
    r.onend = () => setListening(false);
    recognitionRef.current = r;
    return () => r.abort();
  }, []);

  const startListening = () => { setTranscript(''); setListening(true); recognitionRef.current?.start(); };
  const stopListening = () => { setListening(false); recognitionRef.current?.stop(); };

  const speakText = (text) => {
    if (!text) return;
    window.speechSynthesis?.cancel();
    const u = new SpeechSynthesisUtterance(text);
    u.rate = 0.9;
    window.speechSynthesis?.speak(u);
  };

  const handleStart = async () => {
    if (!resumeFile) return setError('Please upload your resume first');
    setLoading(true); setError('');
    try {
      const fd = new FormData();
      fd.append('resume', resumeFile);
      const { data } = await api.post('/start', fd);
      setSession(data.data);
      setCurrentQ(data.data.first_question);
      setCurrentIndex(0);
      setStep(STEPS.INTERVIEW);
      setTimeout(() => speakText(data.data.first_question?.q), 600);
    } catch (e) {
      setError(e.response?.data?.message || 'Failed to start interview');
    }
    setLoading(false);
  };

  const handleSubmitAnswer = async () => {
    if (!transcript.trim()) return setError('Please speak or type your answer first');
    setSubmitting(true); setError('');
    try {
      const { data } = await api.post('/answer', {
        session_id: session.session_id,
        answer: transcript,
        question_index: currentIndex
      });
      const d = data.data;
      setLastEval(d.evaluation);
      setTranscript('');
      const isFinished = d.is_complete || !d.next_question || !d.next_question.q;
      if (isFinished) {
        try {
          const fin = await api.post('/finish', { session_id: session.session_id });
          setResult(fin.data.data);
          setStep(STEPS.RESULT);
          window.speechSynthesis?.cancel();
        } catch (finErr) {
          setError(finErr.response?.data?.message || 'Failed to finish interview');
        }
      } else {
        setCurrentQ(d.next_question);
        setCurrentIndex(d.next_index);
        setTimeout(() => speakText(d.next_question.q), 800);
      }
    } catch (e) {
      setError(e.response?.data?.message || 'Failed to submit answer');
    }
    setSubmitting(false);
  };

  const resetInterview = () => {
    setStep(STEPS.UPLOAD); setResumeFile(null); setResult(null);
    setLastEval(null); setSession(null); setCurrentQ(null);
    setCurrentIndex(0); setTranscript(''); setError('');
    setFsRequested(false); setTerminated(false);
    setViolations([]); setShowModal(false);
    warningCountRef.current = 0;
    window.speechSynthesis?.cancel();
  };

  // ══════════════════════════════════════════════════════
  //  UPLOAD STEP
  // ══════════════════════════════════════════════════════
  if (step === STEPS.UPLOAD) return (
    <div className="page-content">
      <div className="page-hero">
        <h4 className="mb-1" style={{ color: 'black' }}>AI Interview Practice</h4>
        <p className="text-muted mb-0">Upload your resume — AI will ask 3 technical + 2 HR questions based on your skills</p>
      </div>
      {error && <div className="alert alert-warning">{error}</div>}
      <div style={{ maxWidth: 520, margin: '32px auto', background: 'var(--bs-body-bg)', borderRadius: 16, padding: 32, border: '1px solid var(--bs-border-color)' }}>
        <div style={{ textAlign: 'center', marginBottom: 24 }}>
          <div style={{ width: 64, height: 64, borderRadius: '50%', background: '#ede9fe', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
            <i className="bi bi-mic-fill" style={{ fontSize: 28, color: '#7c3aed' }} />
          </div>
          <h5 style={{ fontWeight: 700 }}>How it works</h5>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 24 }}>
          {[
            { icon: '📄', text: 'AI reads your resume and finds your tech skills' },
            { icon: '💻', text: '3 Technical questions — explain concepts and what you have built' },
            { icon: '🧠', text: '2 HR questions — time management, pressure, teamwork' },
            { icon: '🎤', text: 'Answer by voice or typing — no code writing at all' },
            { icon: '🔒', text: 'Anti-cheat: no tab switching, copy-paste, or external searches' },
            { icon: '🏆', text: 'Get a score out of 10 with detailed feedback' },
          ].map((item, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '8px 12px', background: '#f9fafb', borderRadius: 10, fontSize: 14 }}>
              <span style={{ fontSize: 20 }}>{item.icon}</span>
              <span style={{ color: '#374151' }}>{item.text}</span>
            </div>
          ))}
        </div>
        <label className="form-label fw-semibold">Upload Resume (PDF)</label>
        <div
          style={{ border: '2px dashed #c4b5fd', borderRadius: 12, padding: '28px 24px', textAlign: 'center', cursor: 'pointer', background: resumeFile ? '#f5f3ff' : 'transparent', marginBottom: 20 }}
          onClick={() => document.getElementById('resume-upload').click()}
        >
          <i className="bi bi-file-earmark-pdf" style={{ fontSize: 32, color: resumeFile ? '#7c3aed' : '#9ca3af' }} />
          <p style={{ margin: '8px 0 0', color: resumeFile ? '#7c3aed' : '#6b7280', fontSize: 14 }}>
            {resumeFile ? `✓ ${resumeFile.name}` : 'Click to upload your PDF resume'}
          </p>
          <input id="resume-upload" type="file" accept=".pdf" style={{ display: 'none' }} onChange={e => setResumeFile(e.target.files[0])} />
        </div>
        <button
          className="btn btn-primary w-100 rounded-pill"
          style={{ background: '#7c3aed', borderColor: '#7c3aed', padding: '12px' }}
          onClick={handleStart}
          disabled={loading || !resumeFile}
        >
          {loading
            ? <><span className="spinner-border spinner-border-sm me-2" />Analyzing your resume...</>
            : <><i className="bi bi-play-fill me-2" />Start Interview</>}
        </button>
      </div>
    </div>
  );

  // ══════════════════════════════════════════════════════
  //  INTERVIEW STEP
  // ══════════════════════════════════════════════════════
  if (step === STEPS.INTERVIEW) {
    const isHRQuestion = currentQ?.type === 'hr';

    return (
      <>
        {/* Terminated overlay */}
        {terminated && <TerminatedScreen violations={violations} />}

        {/* Fullscreen gate — shown once before interview begins */}
        {!fsRequested && !terminated && (
          <FullscreenGate onEnter={enterFullscreen} />
        )}

        {/* Violation modal */}
        {showModal && !terminated && (
          <ViolationModal
            violation={latestViolation}
            count={latestCount}
            onClose={() => setShowModal(false)}
            onFullscreen={() => { requestFullscreen(); setShowModal(false); }}
          />
        )}

        {/* Warning strip */}
        {fsRequested && violations.length > 0 && !terminated && (
          <div style={{
            position: 'fixed', top: 0, left: 0, right: 0, zIndex: 9000,
            background: warningCountRef.current >= MAX_WARNINGS - 1 ? '#7f1d1d' : '#78350f',
            padding: '8px 20px', display: 'flex', justifyContent: 'space-between',
            alignItems: 'center', color: '#fef3c7', fontSize: 13, fontWeight: 500
          }}>
            <span>⚠️ {violations.length} integrity violation{violations.length > 1 ? 's' : ''} recorded</span>
            <span style={{ color: '#fcd34d', fontWeight: 700 }}>
              {MAX_WARNINGS - warningCountRef.current} warning{MAX_WARNINGS - warningCountRef.current !== 1 ? 's' : ''} remaining
            </span>
          </div>
        )}

        {/* Main interview UI */}
        <div className="page-content" style={{ paddingTop: violations.length > 0 && fsRequested ? 48 : undefined }}>
          <div style={{ maxWidth: 680, margin: '0 auto' }}>

            {/* Progress */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
              <div>
                <h5 style={{ fontWeight: 700, margin: 0 }}>Question {currentIndex + 1} of {session?.total_questions}</h5>
                <p className="text-muted" style={{ fontSize: 13, margin: 0 }}>Skills: {session?.skills?.slice(0, 4).join(', ')}</p>
              </div>
              <div style={{ display: 'flex', gap: 6 }}>
                {Array.from({ length: session?.total_questions || 0 }).map((_, i) => (
                  <div key={i} style={{
                    width: 12, height: 12, borderRadius: '50%',
                    background: i < currentIndex ? '#7c3aed' : i === currentIndex ? '#a78bfa' : '#e5e7eb'
                  }} />
                ))}
              </div>
            </div>

            {error && <div className="alert alert-danger">{error}</div>}

            {/* Question card */}
            {currentQ?.q ? (
              <div style={{
                background: isHRQuestion
                  ? 'linear-gradient(135deg,#d97706,#b45309)'
                  : 'linear-gradient(135deg,#7c3aed,#5b21b6)',
                borderRadius: 16, padding: '28px 32px', marginBottom: 20, color: '#fff'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 14 }}>
                  <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                    <span style={{ background: 'rgba(255,255,255,0.25)', borderRadius: 20, padding: '3px 14px', fontSize: 12, fontWeight: 700 }}>
                      {isHRQuestion ? '🧠 HR / Behavioral' : '💻 Technical'}
                    </span>
                    {currentQ.topic && (
                      <span style={{ background: 'rgba(255,255,255,0.15)', borderRadius: 20, padding: '3px 12px', fontSize: 12 }}>
                        {currentQ.topic}
                      </span>
                    )}
                  </div>
                  <button
                    onClick={() => speakText(currentQ.q)}
                    style={{ background: 'rgba(255,255,255,0.2)', border: 'none', borderRadius: 8, padding: '4px 10px', color: '#fff', cursor: 'pointer', fontSize: 12, flexShrink: 0 }}
                  >
                    <i className="bi bi-volume-up me-1" />Replay
                  </button>
                </div>
                <p style={{ fontSize: 17, fontWeight: 500, lineHeight: 1.7, margin: 0 }}>{currentQ.q}</p>
                <p style={{ fontSize: 12, opacity: 0.75, margin: '14px 0 0' }}>
                  {isHRQuestion
                    ? '💡 Give a real example — explain the situation, what you did, and the result.'
                    : '💡 Explain in your own words and mention how you used this in real projects.'}
                </p>
              </div>
            ) : (
              <div style={{ textAlign: 'center', padding: 40 }}>
                <span className="spinner-border" style={{ color: '#7c3aed' }} />
              </div>
            )}

            {/* Previous eval */}
            {lastEval && currentIndex > 0 && (
              <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: 12, padding: '14px 18px', marginBottom: 16 }}>
                <div style={{ fontWeight: 600, fontSize: 13, color: '#166534', marginBottom: 4 }}>
                  <i className="bi bi-check-circle-fill me-1" />Previous answer scored {lastEval.score}/10
                </div>
                <p style={{ fontSize: 13, color: '#374151', margin: 0 }}>{lastEval.feedback}</p>
                {lastEval.strengths?.length > 0 && <p style={{ fontSize: 12, color: '#059669', margin: '4px 0 0' }}>✓ {lastEval.strengths.join(' · ')}</p>}
                {lastEval.gaps?.length > 0 && <p style={{ fontSize: 12, color: '#dc2626', margin: '2px 0 0' }}>✗ {lastEval.gaps.join(' · ')}</p>}
              </div>
            )}

            {/* Answer area */}
            <div style={{ border: '1px solid #e5e7eb', borderRadius: 16, padding: 24, background: '#fafafa' }}>
              <div style={{ textAlign: 'center', marginBottom: 16 }}>
                <button
                  onClick={listening ? stopListening : startListening}
                  disabled={submitting}
                  style={{
                    width: 80, height: 80, borderRadius: '50%', border: 'none',
                    cursor: submitting ? 'not-allowed' : 'pointer',
                    background: listening ? '#fee2e2' : '#ede9fe',
                    color: listening ? '#dc2626' : '#7c3aed',
                    fontSize: 32, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto',
                    boxShadow: listening ? '0 0 0 10px rgba(220,38,38,0.12)' : 'none',
                    transition: 'all 0.2s'
                  }}
                >
                  <i className={`bi bi-mic${listening ? '-fill' : ''}`} />
                </button>
                <p style={{ fontSize: 13, color: '#6b7280', marginTop: 10, marginBottom: 0 }}>
                  {listening ? '🔴 Listening... click to stop' : 'Click mic to speak, or type your answer below'}
                </p>
              </div>

              <textarea
                className="form-control mb-3"
                rows={4}
                placeholder={isHRQuestion
                  ? 'Tell me about a real situation from your experience...'
                  : 'Explain the concept and how you used it in your projects...'}
                value={transcript}
                onChange={e => setTranscript(e.target.value)}
                style={{ fontSize: 14, lineHeight: 1.7 }}
                disabled={submitting}
                onPaste={e => e.preventDefault()}
              />

              <div style={{ display: 'flex', gap: 10 }}>
                <button className="btn btn-outline-secondary rounded-pill" onClick={() => setTranscript('')} disabled={!transcript || submitting}>
                  <i className="bi bi-trash me-1" />Clear
                </button>
                <button
                  className="btn rounded-pill flex-grow-1"
                  style={{ background: '#7c3aed', borderColor: '#7c3aed', color: '#fff' }}
                  onClick={handleSubmitAnswer}
                  disabled={submitting || !transcript.trim()}
                >
                  {submitting
                    ? <><span className="spinner-border spinner-border-sm me-2" />Evaluating...</>
                    : <><i className="bi bi-send me-2" />{currentIndex + 1 === session?.total_questions ? 'Finish Interview' : 'Submit & Next'}</>}
                </button>
              </div>
            </div>
          </div>
        </div>
      </>
    );
  }

  // ══════════════════════════════════════════════════════
  //  RESULT STEP
  // ══════════════════════════════════════════════════════
  if (step === STEPS.RESULT && result) {
    const verdictConfig = {
      shortlisted: { gradient: 'linear-gradient(135deg,#059669,#047857)', emoji: '🎉', label: 'Shortlisted!' },
      maybe:       { gradient: 'linear-gradient(135deg,#d97706,#b45309)', emoji: '📊', label: 'Borderline' },
      rejected:    { gradient: 'linear-gradient(135deg,#dc2626,#b91c1c)', emoji: '📋', label: 'Not Selected' },
    };
    const vc = verdictConfig[result.verdict] || verdictConfig.rejected;

    return (
      <div className="page-content">
        <div style={{ maxWidth: 660, margin: '0 auto' }}>

          {/* Violation summary banner if terminated */}
          {terminated && (
            <div style={{ background: '#7f1d1d', borderRadius: 12, padding: '14px 20px', marginBottom: 20, color: '#fca5a5', fontSize: 14 }}>
              🚫 This interview was auto-submitted after {MAX_WARNINGS} integrity violations.
            </div>
          )}

          <div style={{ background: vc.gradient, borderRadius: 20, padding: '36px 32px', textAlign: 'center', color: '#fff', marginBottom: 24 }}>
            <div style={{ fontSize: 52, marginBottom: 8 }}>{vc.emoji}</div>
            <h3 style={{ fontWeight: 700, margin: '0 0 4px' }}>{vc.label}</h3>
            <div style={{ fontSize: 48, fontWeight: 700, margin: '8px 0' }}>
              {result.total_score}<span style={{ fontSize: 20, opacity: 0.8 }}>/10</span>
            </div>
            {result.summary && <p style={{ opacity: 0.88, margin: '12px 0 0', lineHeight: 1.6, fontSize: 14 }}>{result.summary}</p>}
          </div>

          {/* Technical vs HR */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 20 }}>
            <div style={{ background: '#ede9fe', borderRadius: 14, padding: '18px 20px', textAlign: 'center' }}>
              <div style={{ fontSize: 11, color: '#6d28d9', fontWeight: 700, marginBottom: 4, textTransform: 'uppercase', letterSpacing: 1 }}>💻 Technical</div>
              <div style={{ fontSize: 34, fontWeight: 800, color: '#5b21b6' }}>{result.technical_score ?? '—'}<span style={{ fontSize: 16, opacity: 0.7 }}>/10</span></div>
              <div style={{ fontSize: 12, color: '#7c3aed', marginTop: 2 }}>3 questions</div>
            </div>
            <div style={{ background: '#fef3c7', borderRadius: 14, padding: '18px 20px', textAlign: 'center' }}>
              <div style={{ fontSize: 11, color: '#92400e', fontWeight: 700, marginBottom: 4, textTransform: 'uppercase', letterSpacing: 1 }}>🧠 HR / Behavioral</div>
              <div style={{ fontSize: 34, fontWeight: 800, color: '#b45309' }}>{result.hr_score ?? '—'}<span style={{ fontSize: 16, opacity: 0.7 }}>/10</span></div>
              <div style={{ fontSize: 12, color: '#d97706', marginTop: 2 }}>2 questions</div>
            </div>
          </div>

          {/* Skills */}
          {result.skills_tested?.length > 0 && (
            <div style={{ marginBottom: 20 }}>
              <h6 style={{ fontWeight: 700, marginBottom: 10 }}>Skills Assessed</h6>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                {result.skills_tested.map(s => (
                  <span key={s} style={{ background: '#ede9fe', color: '#6d28d9', borderRadius: 20, padding: '4px 14px', fontSize: 13, fontWeight: 500 }}>{s}</span>
                ))}
              </div>
            </div>
          )}

          {/* Per-question breakdown */}
          {result.answers?.length > 0 && (
            <>
              <h6 style={{ fontWeight: 700, marginBottom: 12 }}>Full Breakdown</h6>
              {result.answers.map((a, i) => (
                <div key={i} style={{ border: '1px solid #e5e7eb', borderRadius: 12, padding: '16px 20px', marginBottom: 12 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8, gap: 10 }}>
                    <div style={{ flex: 1 }}>
                      <span style={{
                        fontSize: 11, fontWeight: 700, borderRadius: 20, padding: '2px 10px', marginRight: 8,
                        background: a.type === 'hr' ? '#fef3c7' : '#ede9fe',
                        color: a.type === 'hr' ? '#92400e' : '#5b21b6'
                      }}>
                        {a.type === 'hr' ? '🧠 HR' : '💻 Technical'}
                      </span>
                      <span style={{ fontSize: 13, fontWeight: 600 }}>
                        Q{i + 1}: {a.question?.length > 65 ? a.question.slice(0, 65) + '...' : a.question}
                      </span>
                    </div>
                    <span style={{
                      fontWeight: 700, fontSize: 16, flexShrink: 0,
                      color: a.score >= 7 ? '#059669' : a.score >= 5 ? '#d97706' : '#dc2626'
                    }}>{a.score}/10</span>
                  </div>
                  <p style={{ fontSize: 13, color: '#374151', margin: 0 }}>{a.feedback}</p>
                  {a.strengths?.length > 0 && <p style={{ fontSize: 12, color: '#059669', margin: '6px 0 0' }}>✓ {a.strengths.join(' · ')}</p>}
                  {a.gaps?.length > 0 && <p style={{ fontSize: 12, color: '#dc2626', margin: '4px 0 0' }}>✗ {a.gaps.join(' · ')}</p>}
                </div>
              ))}
            </>
          )}

          <div style={{ display: 'flex', gap: 12, marginTop: 24 }}>
            <button className="btn btn-outline-secondary rounded-pill flex-grow-1" onClick={resetInterview}>
              <i className="bi bi-arrow-repeat me-2" />Try Again
            </button>
            <button className="btn btn-primary rounded-pill flex-grow-1" onClick={() => navigate('/jobs')}>
              <i className="bi bi-briefcase me-2" />Browse Jobs
            </button>
          </div>
        </div>
      </div>
    );
  }

  return null;
}