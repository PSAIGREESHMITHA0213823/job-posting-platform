// src/pages/ChatPage.jsx
// Save to: frontend/src/pages/ChatPage.jsx
//
// Add to each dashboard route:
//   Company:  <Route path="chat" element={<ChatPage />} />
//   Admin:    <Route path="chat" element={<ChatPage />} />
//   Employee: <Route path="chat" element={<ChatPage />} />
//
// Add nav link in each layout:
//   { path: '/company/chat', label: 'Chat', icon: <MessageCircle /> }

import React, { useEffect, useRef, useState, useCallback } from 'react'
import { useSearchParams } from 'react-router-dom'
import { io } from 'socket.io-client'
import axios from 'axios'
import { useAuth } from '../../context/AuthContext'

const SOCKET_URL = process.env.REACT_APP_SOCKET_URL || 'http://localhost:5000'
const API        = process.env.REACT_APP_API_URL    || 'http://localhost:5000/api'

// ── Constants ─────────────────────────────────────────────────────────────────
const ROLE_META = {
  admin:           { color: '#b45309', bg: '#fef3c7', label: 'Admin' },
  company_manager: { color: '#1558d6', bg: '#e8f0fe', label: 'Company' },
  employee:        { color: '#137333', bg: '#e6f4ea', label: 'Employee' },
}

const QUICK_REPLIES = ['Any issue?', 'Please check', 'Thanks', 'Noted', 'On it!', 'Will update soon']
const EMOJI_LIST    = ['👍','❤️','😂','😮','😢','🎉','🔥','👏','✅','💯','🙌','😍']

// ── Helpers ───────────────────────────────────────────────────────────────────
const timeStr = (ts) => {
  if (!ts) return ''
  const d = new Date(ts), now = new Date()
  const diff = now - d
  if (diff < 60000)    return 'just now'
  if (diff < 3600000)  return `${Math.floor(diff / 60000)} min`
  if (d.toDateString() === now.toDateString())
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  const y = new Date(now); y.setDate(now.getDate() - 1)
  if (d.toDateString() === y.toDateString()) return 'Yesterday'
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

const dateLabel = (ts) => {
  if (!ts) return ''
  const d = new Date(ts), now = new Date()
  const y = new Date(now); y.setDate(now.getDate() - 1)
  if (d.toDateString() === now.toDateString()) return 'Today'
  if (d.toDateString() === y.toDateString())   return 'Yesterday'
  return d.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })
}

const isImage  = (t) => t?.startsWith('image/')
const fileIcon = (t) => {
  if (isImage(t))          return '🖼️'
  if (t?.includes('pdf'))  return '📄'
  if (t?.includes('word')) return '📝'
  if (t?.includes('zip'))  return '🗜️'
  return '📎'
}

const getToken = () => localStorage.getItem('token') || sessionStorage.getItem('token')

// ── Avatar ────────────────────────────────────────────────────────────────────
const Avatar = ({ name, src, size = 36, online }) => {
  const [imgErr, setImgErr] = useState(false)
  const initials = (name || '?').split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase()
  const COLORS = ['#1a73e8','#0f9d58','#f4511e','#ab47bc','#00acc1','#e91e63','#ff7043','#43a047']
  const bg = COLORS[(name?.charCodeAt(0) || 0) % COLORS.length]
  const imgUrl = src?.startsWith('http') ? src : src ? `http://localhost:5000${src}` : null

  return (
    <div style={{ position: 'relative', flexShrink: 0 }}>
      <div style={{
        width: size, height: size, borderRadius: '50%',
        background: (imgUrl && !imgErr) ? 'transparent' : bg,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        color: '#fff', fontSize: size * 0.37, fontWeight: 600,
        overflow: 'hidden', border: '1px solid rgba(0,0,0,0.08)',
      }}>
        {imgUrl && !imgErr
          ? <img src={imgUrl} alt={name} style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              onError={() => setImgErr(true)} />
          : initials}
      </div>
      {online !== undefined && (
        <span style={{
          position: 'absolute', bottom: 1, right: 1,
          width: size * 0.3, height: size * 0.3,
          borderRadius: '50%', border: '2px solid #fff',
          background: online ? '#34a853' : '#9aa0a6',
        }} />
      )}
    </div>
  )
}

// ── Reaction Pill ─────────────────────────────────────────────────────────────
const ReactionPill = ({ emoji, users, myId, onClick }) => {
  const mine = users.some(u => u.user_id === myId)
  return (
    <button onClick={onClick} title={users.map(u => u.name).join(', ')} style={{
      display: 'inline-flex', alignItems: 'center', gap: 3,
      padding: '2px 8px', borderRadius: 12, fontSize: 12,
      border: `1px solid ${mine ? '#1a73e8' : '#dadce0'}`,
      background: mine ? '#e8f0fe' : '#f8f9fa',
      cursor: 'pointer', color: mine ? '#1a73e8' : '#3c4043', fontWeight: 600,
      transition: 'all .1s',
    }}>
      {emoji} <span style={{ fontSize: 11 }}>{users.length}</span>
    </button>
  )
}

// ── Main Component ────────────────────────────────────────────────────────────
const ChatPage = () => {
  const { user } = useAuth()
  const [searchParams, setSearchParams] = useSearchParams()

  const [users, setUsers]               = useState([])
  const [selectedUser, setSelectedUser] = useState(null)
  const [messages, setMessages]         = useState([])
  const [input, setInput]               = useState('')
  const [search, setSearch]             = useState('')
  const [msgSearch, setMsgSearch]       = useState('')
  const [msgSearchOpen, setMsgSearchOpen] = useState(false)
  const [connected, setConnected]       = useState(false)
  const [typing, setTyping]             = useState(false)
  const [onlineMap, setOnlineMap]       = useState({})
  const [uploading, setUploading]       = useState(false)
  const [replyTo, setReplyTo]           = useState(null)
  const [hoveredMsg, setHoveredMsg]     = useState(null)
  const [emojiFor, setEmojiFor]         = useState(null)
  const [loadingMsgs, setLoadingMsgs]   = useState(false)
  const [unreadMap, setUnreadMap]       = useState({})

  const socketRef   = useRef(null)
  const bottomRef   = useRef(null)
  const inputRef    = useRef(null)
  const fileRef     = useRef(null)
  const typingTimer = useRef(null)

  const myId = user?.id

  // ── Connect socket ────────────────────────────────────────────────────────
  useEffect(() => {
    if (!user) return
    const socket = io(SOCKET_URL, { transports: ['websocket'] })

    socket.on('connect', () => {
      setConnected(true)
      socket.emit('join', user.id)
      socket.emit('dm:register', user)
    })
    socket.on('disconnect', () => setConnected(false))

    socket.on('dm:message', (msg) => {
      // Only add if it belongs to current conversation
      setSelectedUser(prev => {
        if (prev && (msg.sender_id === prev.id || msg.receiver_id === prev.id)) {
          setMessages(m => [...m, msg])
          // mark read if we're the receiver
          if (msg.sender_id === prev.id) {
            socket.emit('dm:read', { sender_id: prev.id })
          }
        } else if (msg.sender_id !== user.id) {
          // Update unread count in sidebar
          setUnreadMap(u => ({ ...u, [msg.sender_id]: (u[msg.sender_id] || 0) + 1 }))
          setUsers(list => list.map(u =>
            u.id === msg.sender_id
              ? { ...u, last_message: msg.content, last_message_at: msg.created_at, unread_count: (u.unread_count || 0) + 1 }
              : u
          ))
        }
        return prev
      })
    })

    socket.on('dm:reactions_update', ({ message_id, reactions }) => {
      setMessages(prev => prev.map(m => m.id === message_id ? { ...m, reactions } : m))
    })

    socket.on('dm:typing', ({ from_user_id }) => {
      setSelectedUser(prev => {
        if (prev?.id === from_user_id) setTyping(true)
        return prev
      })
      clearTimeout(typingTimer.current)
      typingTimer.current = setTimeout(() => setTyping(false), 2500)
    })

    socket.on('dm:online', ({ user_id, online }) => {
      setOnlineMap(prev => ({ ...prev, [user_id]: online }))
    })

    socketRef.current = socket
    return () => { socket.disconnect(); clearTimeout(typingTimer.current) }
  }, [user])

  // ── Fetch users ───────────────────────────────────────────────────────────
  const fetchUsers = useCallback(async () => {
    try {
      const res = await axios.get(`${API}/direct-chat/users`, {
        headers: { Authorization: `Bearer ${getToken()}` }
      })
      const list = res.data.data || []
      setUsers(list)
      // Build unread map
      const um = {}
      list.forEach(u => { if (u.unread_count > 0) um[u.id] = u.unread_count })
      setUnreadMap(um)

      // Auto-select from URL param
      const uid = searchParams.get('user')
      if (uid) {
        const found = list.find(u => u.id === parseInt(uid))
        if (found) selectUser(found)
      }
    } catch (err) { console.error('[Chat] fetch users:', err) }
  }, [searchParams])

  useEffect(() => { fetchUsers() }, [fetchUsers])

  // ── Scroll to bottom ──────────────────────────────────────────────────────
  useEffect(() => {
    setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: 'smooth' }), 80)
  }, [messages])

  // ── Select user → load messages ───────────────────────────────────────────
  const selectUser = useCallback(async (u) => {
    setSelectedUser(u)
    setMessages([])
    setLoadingMsgs(true)
    setReplyTo(null)
    setSearchParams({ user: u.id })

    // Clear unread
    setUnreadMap(prev => ({ ...prev, [u.id]: 0 }))
    setUsers(list => list.map(l => l.id === u.id ? { ...l, unread_count: 0 } : l))
    socketRef.current?.emit('dm:read', { sender_id: u.id })

    try {
      const res = await axios.get(`${API}/direct-chat/messages/${u.id}`, {
        headers: { Authorization: `Bearer ${getToken()}` }
      })
      setMessages(res.data.data || [])
    } catch (err) { console.error('[Chat] fetch messages:', err) }
    finally { setLoadingMsgs(false); setTimeout(() => inputRef.current?.focus(), 100) }
  }, [setSearchParams])

  // ── Send message ──────────────────────────────────────────────────────────
  const send = (extra = {}) => {
    if (!selectedUser) return
    const content = input.trim()
    if (!content && !extra.file_url) return

    socketRef.current?.emit('dm:send', {
      receiver_id: selectedUser.id,
      content,
      sender: user,
      ...extra,
    })
    setInput('')
    setReplyTo(null)
    // Optimistic update sidebar
    setUsers(list => list.map(l =>
      l.id === selectedUser.id
        ? { ...l, last_message: content || extra.file_name, last_message_at: new Date().toISOString() }
        : l
    ))
  }

  const handleKey = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send() }
  }

  const handleTyping = () => {
    if (!selectedUser) return
    socketRef.current?.emit('dm:typing', { receiver_id: selectedUser.id, name: user?.name || user?.email })
  }

  // ── File upload ───────────────────────────────────────────────────────────
  const handleFile = async (e) => {
    const file = e.target.files[0]
    if (!file) return
    setUploading(true)
    try {
      const fd = new FormData()
      fd.append('file', file)
      const res = await axios.post(`${API}/direct-chat/upload`, fd, {
        headers: { Authorization: `Bearer ${getToken()}`, 'Content-Type': 'multipart/form-data' }
      })
      send({ file_url: res.data.file_url, file_name: res.data.file_name, file_type: res.data.file_type })
    } catch { alert('Upload failed') }
    finally { setUploading(false); e.target.value = '' }
  }

  // ── React ─────────────────────────────────────────────────────────────────
  const react = (messageId, emoji) => {
    if (!selectedUser) return
    socketRef.current?.emit('dm:react', { message_id: messageId, emoji, receiver_id: selectedUser.id, sender: user })
    setEmojiFor(null)
  }

  // ── Grouped messages ──────────────────────────────────────────────────────
  const filteredMsgs = msgSearch
    ? messages.filter(m => m.content?.toLowerCase().includes(msgSearch.toLowerCase()))
    : messages

  const grouped = filteredMsgs.reduce((acc, msg) => {
    const k = dateLabel(msg.created_at)
    if (!acc[k]) acc[k] = []
    acc[k].push(msg)
    return acc
  }, {})

  const groupReactions = (rx = []) =>
    rx.reduce((acc, r) => { if (!acc[r.emoji]) acc[r.emoji] = []; acc[r.emoji].push(r); return acc }, {})

  // ── Filtered users sidebar ────────────────────────────────────────────────
  const filteredUsers = users.filter(u =>
    !search ||
    u.name?.toLowerCase().includes(search.toLowerCase()) ||
    u.email?.toLowerCase().includes(search.toLowerCase())
  )

  const totalUnread = Object.values(unreadMap).reduce((a, b) => a + b, 0)

  return (
    <div style={{
      height: 'calc(100vh - 56px)',
      display: 'flex',
      background: '#fff',
      fontFamily: "'Google Sans','Segoe UI',sans-serif",
      overflow: 'hidden',
      border: '1px solid #e8eaed',
      borderRadius: 8,
    }}>
      <style>{`
        .chat-user-row:hover { background: #f1f3f4 !important; }
        .chat-user-row.active { background: #e8f0fe !important; }
        .chat-msg-row:hover .chat-toolbar { opacity:1!important; }
        .chat-toolbar { opacity:0; transition:opacity .15s; }
        .emoji-btn:hover { transform:scale(1.25); }
        ::-webkit-scrollbar { width:5px; height:5px; }
        ::-webkit-scrollbar-thumb { background:#dadce0; border-radius:3px; }
        .send-btn:hover { background:#1557d6 !important; }
        .quick-reply:hover { background:#e8f0fe !important; border-color:#1a73e8 !important; color:#1a73e8 !important; }
      `}</style>

      {/* ════════════════ LEFT SIDEBAR ════════════════ */}
      <div style={{
        width: 280, flexShrink: 0,
        borderRight: '1px solid #e8eaed',
        display: 'flex', flexDirection: 'column',
        background: '#fff',
      }}>

        {/* Sidebar header */}
        <div style={{ padding: '14px 16px 10px', borderBottom: '1px solid #e8eaed' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
            <span style={{ fontSize: 18, fontWeight: 700, color: '#1f1f1f', flex: 1 }}>
              Chat
            </span>
            {totalUnread > 0 && (
              <span style={{
                background: '#1a73e8', color: '#fff', borderRadius: 10,
                fontSize: 11, fontWeight: 700, padding: '2px 7px',
              }}>{totalUnread}</span>
            )}
            <span style={{
              width: 8, height: 8, borderRadius: '50%',
              background: connected ? '#34a853' : '#ea4335',
              display: 'inline-block',
            }} title={connected ? 'Connected' : 'Offline'} />
          </div>

          {/* Search */}
          <div style={{ position: 'relative' }}>
            <span style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: '#80868b', fontSize: 14 }}>🔍</span>
            <input value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Search people…"
              style={{
                width: '100%', padding: '7px 10px 7px 30px',
                borderRadius: 20, border: '1px solid #e8eaed',
                fontSize: 13, outline: 'none', background: '#f8f9fa',
                color: '#1f1f1f', boxSizing: 'border-box',
              }} />
          </div>
        </div>

        {/* Section: Direct Messages */}
        <div style={{ fontSize: 11, fontWeight: 700, color: '#80868b', padding: '10px 16px 4px', textTransform: 'uppercase', letterSpacing: '.8px' }}>
          Direct Messages
        </div>

        {/* User list */}
        <div style={{ flex: 1, overflowY: 'auto' }}>
          {filteredUsers.length === 0 && (
            <div style={{ padding: 24, textAlign: 'center', color: '#80868b', fontSize: 13 }}>
              {search ? 'No results' : 'No contacts yet'}
            </div>
          )}
          {filteredUsers.map(u => {
            const isSelected = selectedUser?.id === u.id
            const isOnline   = onlineMap[u.id] ?? false
            const unread     = unreadMap[u.id] || 0
            return (
              <div key={u.id}
                className={`chat-user-row${isSelected ? ' active' : ''}`}
                onClick={() => selectUser(u)}
                style={{
                  padding: '10px 14px', cursor: 'pointer',
                  display: 'flex', alignItems: 'center', gap: 10,
                  background: isSelected ? '#e8f0fe' : 'transparent',
                  borderLeft: isSelected ? '3px solid #1a73e8' : '3px solid transparent',
                  transition: 'all .1s',
                }}>
                <Avatar name={u.name || u.email} src={u.avatar_url} size={36} online={isOnline} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: 13, fontWeight: unread > 0 ? 700 : 500, color: '#1f1f1f', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 130 }}>
                      {u.name || u.email}
                    </span>
                    <span style={{ fontSize: 11, color: '#80868b', whiteSpace: 'nowrap', marginLeft: 4 }}>
                      {u.last_message_at ? timeStr(u.last_message_at) : ''}
                    </span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 2 }}>
                    <span style={{
                      fontSize: 12, color: unread > 0 ? '#1f1f1f' : '#80868b',
                      fontWeight: unread > 0 ? 600 : 400,
                      overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 150,
                    }}>
                      {u.last_message || (
                        <span style={{ fontStyle: 'italic' }}>
                          {ROLE_META[u.role]?.label || u.role}
                        </span>
                      )}
                    </span>
                    {unread > 0 && (
                      <span style={{
                        background: '#1a73e8', color: '#fff', borderRadius: '50%',
                        width: 18, height: 18, fontSize: 10, fontWeight: 700,
                        display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                      }}>{unread > 9 ? '9+' : unread}</span>
                    )}
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        {/* Bottom: current user */}
        <div style={{ padding: '10px 14px', borderTop: '1px solid #e8eaed', display: 'flex', alignItems: 'center', gap: 10 }}>
          <Avatar name={user?.name || user?.email} src={user?.avatar_url} size={32} online={true} />
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 12, fontWeight: 600, color: '#1f1f1f', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {user?.name || user?.email}
            </div>
            <div style={{ fontSize: 10, color: ROLE_META[user?.role]?.color || '#80868b', fontWeight: 700 }}>
              {ROLE_META[user?.role]?.label || user?.role}
            </div>
          </div>
        </div>
      </div>

      {/* ════════════════ CHAT AREA ════════════════ */}
      {selectedUser ? (
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>

          {/* Chat header */}
          <div style={{
            height: 58, padding: '0 18px',
            borderBottom: '1px solid #e8eaed',
            display: 'flex', alignItems: 'center', gap: 12,
            background: '#fff', flexShrink: 0,
          }}>
            <Avatar name={selectedUser.name || selectedUser.email} src={selectedUser.avatar_url}
              size={38} online={onlineMap[selectedUser.id]} />
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 15, fontWeight: 700, color: '#1f1f1f' }}>
                {selectedUser.name || selectedUser.email}
              </div>
              <div style={{ fontSize: 12, color: '#80868b', display: 'flex', alignItems: 'center', gap: 6 }}>
                <span style={{ padding: '1px 7px', borderRadius: 10, fontSize: 10, fontWeight: 700, background: ROLE_META[selectedUser.role]?.bg, color: ROLE_META[selectedUser.role]?.color }}>
                  {ROLE_META[selectedUser.role]?.label || selectedUser.role}
                </span>
                {onlineMap[selectedUser.id]
                  ? <span style={{ color: '#34a853' }}>● Active now</span>
                  : <span>● Offline</span>}
              </div>
            </div>

            {/* Msg search */}
            <button onClick={() => { setMsgSearchOpen(p => !p); setMsgSearch('') }} style={{
              background: 'none', border: 'none', cursor: 'pointer',
              color: msgSearchOpen ? '#1a73e8' : '#80868b', fontSize: 18, padding: 6, borderRadius: 4,
            }}>🔍</button>
          </div>

          {/* Msg search bar */}
          {msgSearchOpen && (
            <div style={{ padding: '6px 16px', background: '#f8f9fa', borderBottom: '1px solid #e8eaed' }}>
              <input autoFocus value={msgSearch} onChange={e => setMsgSearch(e.target.value)}
                placeholder="Search in conversation…"
                style={{ width: '100%', padding: '6px 12px', borderRadius: 8, border: '1px solid #dadce0', fontSize: 13, outline: 'none', boxSizing: 'border-box' }} />
            </div>
          )}

          {/* Messages */}
          <div style={{ flex: 1, overflowY: 'auto', padding: '10px 0', background: '#fff' }}
            onClick={() => setEmojiFor(null)}>

            {loadingMsgs ? (
              <div style={{ textAlign: 'center', padding: 40, color: '#80868b' }}>Loading…</div>
            ) : (
              <>
                {Object.entries(grouped).map(([date, msgs]) => (
                  <div key={date}>
                    {/* Date divider */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 20px' }}>
                      <div style={{ flex: 1, height: 1, background: '#e8eaed' }} />
                      <span style={{ fontSize: 11, color: '#80868b', fontWeight: 600, whiteSpace: 'nowrap' }}>{date}</span>
                      <div style={{ flex: 1, height: 1, background: '#e8eaed' }} />
                    </div>

                    {msgs.map((msg, i) => {
                      const isMe      = msg.sender_id === myId
                      const prev      = msgs[i - 1]
                      const sameUser  = prev && prev.sender_id === msg.sender_id &&
                                        (new Date(msg.created_at) - new Date(prev.created_at)) < 120000
                      const rxGroups  = groupReactions(msg.reactions)
                      const fileUrl   = msg.file_url?.startsWith('http')
                                          ? msg.file_url : `http://localhost:5000${msg.file_url}`

                      return (
                        <div key={msg.id}
                          className="chat-msg-row"
                          style={{
                            display: 'flex',
                            flexDirection: isMe ? 'row-reverse' : 'row',
                            padding: sameUser ? '2px 20px' : '8px 20px',
                            gap: 10, alignItems: 'flex-end', position: 'relative',
                          }}
                          onMouseEnter={() => setHoveredMsg(msg.id)}
                          onMouseLeave={() => setHoveredMsg(null)}>

                          {/* Avatar */}
                          <div style={{ width: 36, flexShrink: 0 }}>
                            {!sameUser && !isMe && (
                              <Avatar name={selectedUser.name || selectedUser.email}
                                src={selectedUser.avatar_url} size={36} />
                            )}
                          </div>

                          <div style={{ maxWidth: '65%', display: 'flex', flexDirection: 'column', alignItems: isMe ? 'flex-end' : 'flex-start' }}>
                            {/* Name + time */}
                            {!sameUser && !isMe && (
                              <div style={{ fontSize: 12, color: '#80868b', marginBottom: 3 }}>
                                <b style={{ color: '#1f1f1f' }}>{selectedUser.name || selectedUser.email}</b>
                                &nbsp;&nbsp;{timeStr(msg.created_at)}
                              </div>
                            )}
                            {!sameUser && isMe && (
                              <div style={{ fontSize: 12, color: '#80868b', marginBottom: 3, textAlign: 'right' }}>
                                {timeStr(msg.created_at)}
                              </div>
                            )}

                            {/* Bubble */}
                            {msg.content && (
                              <div style={{
                                padding: '9px 14px',
                                borderRadius: isMe ? '18px 18px 4px 18px' : '18px 18px 18px 4px',
                                background: isMe ? '#c2e7ff' : '#f1f3f4',
                                color: '#1f1f1f', fontSize: 14, lineHeight: 1.5,
                                wordBreak: 'break-word',
                                boxShadow: '0 1px 2px rgba(0,0,0,.06)',
                              }}>
                                {msg.content}
                              </div>
                            )}

                            {/* File */}
                            {msg.file_url && (
                              <div style={{ marginTop: msg.content ? 6 : 0 }}>
                                {isImage(msg.file_type) ? (
                                  <a href={fileUrl} target="_blank" rel="noreferrer">
                                    <img src={fileUrl} alt={msg.file_name}
                                      style={{ maxWidth: 240, maxHeight: 180, borderRadius: 12, cursor: 'pointer', border: '1px solid #e8eaed', display: 'block' }} />
                                  </a>
                                ) : (
                                  <a href={fileUrl} target="_blank" rel="noreferrer" style={{
                                    display: 'inline-flex', alignItems: 'center', gap: 8,
                                    padding: '10px 14px', background: isMe ? '#c2e7ff' : '#f1f3f4',
                                    borderRadius: 12, textDecoration: 'none', color: '#1f1f1f', fontSize: 13,
                                  }}>
                                    <span style={{ fontSize: 22 }}>{fileIcon(msg.file_type)}</span>
                                    <div>
                                      <div style={{ fontWeight: 600, fontSize: 12 }}>{msg.file_name}</div>
                                      <div style={{ fontSize: 10, color: '#80868b' }}>Click to open</div>
                                    </div>
                                  </a>
                                )}
                              </div>
                            )}

                            {/* Reactions */}
                            {Object.keys(rxGroups).length > 0 && (
                              <div style={{ display: 'flex', gap: 4, marginTop: 4, flexWrap: 'wrap' }}>
                                {Object.entries(rxGroups).map(([emoji, users]) => (
                                  <ReactionPill key={emoji} emoji={emoji} users={users} myId={myId}
                                    onClick={e => { e.stopPropagation(); react(msg.id, emoji) }} />
                                ))}
                              </div>
                            )}
                          </div>

                          {/* Hover toolbar */}
                          {hoveredMsg === msg.id && (
                            <div className="chat-toolbar"
                              style={{
                                position: 'absolute',
                                [isMe ? 'left' : 'right']: 60,
                                bottom: 8,
                                background: '#fff', border: '1px solid #e8eaed',
                                borderRadius: 20, display: 'flex', gap: 2,
                                padding: '3px 6px', boxShadow: '0 2px 8px rgba(0,0,0,.12)', zIndex: 10,
                              }}
                              onClick={e => e.stopPropagation()}>
                              {['👍','❤️','😂'].map(em => (
                                <button key={em} className="emoji-btn" onClick={() => react(msg.id, em)} style={{
                                  background: 'none', border: 'none', cursor: 'pointer',
                                  fontSize: 17, padding: '2px 3px', transition: 'transform .1s',
                                }}>{em}</button>
                              ))}
                              <button onClick={e => { e.stopPropagation(); setEmojiFor(emojiFor === msg.id ? null : msg.id) }} style={{
                                background: 'none', border: 'none', cursor: 'pointer',
                                fontSize: 12, padding: '2px 5px', color: '#5f6368',
                              }}>😊+</button>
                              <div style={{ width: 1, background: '#e8eaed', margin: '2px 4px' }} />
                              <button onClick={() => { setReplyTo(msg); inputRef.current?.focus() }} style={{
                                background: 'none', border: 'none', cursor: 'pointer',
                                fontSize: 12, padding: '2px 6px', color: '#5f6368',
                              }}>↩ Reply</button>
                            </div>
                          )}

                          {/* Emoji picker */}
                          {emojiFor === msg.id && (
                            <div style={{
                              position: 'absolute',
                              [isMe ? 'left' : 'right']: 60,
                              bottom: 36,
                              background: '#fff', border: '1px solid #e8eaed',
                              borderRadius: 12, padding: 10, zIndex: 20,
                              display: 'flex', flexWrap: 'wrap', gap: 4, width: 210,
                              boxShadow: '0 4px 20px rgba(0,0,0,.15)',
                            }} onClick={e => e.stopPropagation()}>
                              {EMOJI_LIST.map(em => (
                                <button key={em} className="emoji-btn" onClick={() => react(msg.id, em)} style={{
                                  background: 'none', border: 'none', cursor: 'pointer',
                                  fontSize: 22, padding: 4, borderRadius: 6, transition: 'transform .1s',
                                }}>{em}</button>
                              ))}
                            </div>
                          )}
                        </div>
                      )
                    })}
                  </div>
                ))}

                {/* Empty */}
                {filteredMsgs.length === 0 && !loadingMsgs && (
                  <div style={{ textAlign: 'center', padding: '60px 20px', color: '#80868b' }}>
                    <Avatar name={selectedUser.name || selectedUser.email} src={selectedUser.avatar_url} size={64} />
                    <div style={{ fontSize: 16, fontWeight: 600, marginTop: 14, color: '#1f1f1f' }}>
                      {selectedUser.name || selectedUser.email}
                    </div>
                    <div style={{ fontSize: 13, marginTop: 6 }}>
                      {msgSearch ? `No messages matching "${msgSearch}"` : 'Start a conversation!'}
                    </div>
                  </div>
                )}

                {/* Typing */}
                {typing && (
                  <div style={{ padding: '4px 20px 8px', display: 'flex', alignItems: 'center', gap: 10 }}>
                    <Avatar name={selectedUser.name} size={24} />
                    <div style={{
                      background: '#f1f3f4', borderRadius: '12px 12px 12px 4px',
                      padding: '8px 12px', display: 'flex', gap: 4, alignItems: 'center',
                    }}>
                      {[0,1,2].map(i => (
                        <span key={i} style={{
                          width: 6, height: 6, borderRadius: '50%', background: '#80868b',
                          display: 'inline-block',
                          animation: `tdot 1.2s ${i * .2}s infinite ease-in-out`,
                        }} />
                      ))}
                    </div>
                  </div>
                )}
                <div ref={bottomRef} />
              </>
            )}
          </div>

          {/* Quick replies */}
          {messages.length === 0 && !loadingMsgs && (
            <div style={{ padding: '6px 18px', display: 'flex', gap: 8, flexWrap: 'wrap', borderTop: '1px solid #f1f3f4' }}>
              {QUICK_REPLIES.map(qr => (
                <button key={qr} className="quick-reply" onClick={() => { setInput(qr); inputRef.current?.focus() }} style={{
                  padding: '5px 14px', borderRadius: 20, border: '1px solid #dadce0',
                  background: '#fff', cursor: 'pointer', fontSize: 13, color: '#3c4043',
                  transition: 'all .15s', fontFamily: 'inherit',
                }}>{qr}</button>
              ))}
            </div>
          )}

          {/* Reply preview */}
          {replyTo && (
            <div style={{
              padding: '6px 16px', background: '#e8f0fe',
              borderTop: '1px solid #c5d6f5',
              display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0,
            }}>
              <div style={{ flex: 1, borderLeft: '3px solid #1a73e8', paddingLeft: 8 }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: '#1a73e8' }}>
                  Replying to {replyTo.sender_id === myId ? 'yourself' : (selectedUser.name || selectedUser.email)}
                </div>
                <div style={{ fontSize: 12, color: '#3c4043', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 400 }}>
                  {replyTo.content || replyTo.file_name}
                </div>
              </div>
              <button onClick={() => setReplyTo(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#5f6368', fontSize: 18 }}>×</button>
            </div>
          )}

          {/* Input area */}
          <div style={{ padding: '10px 16px 14px', borderTop: '1px solid #e8eaed', background: '#fff', flexShrink: 0 }}>
            <div style={{
              border: '1px solid #dadce0', borderRadius: 24,
              background: '#f8f9fa', display: 'flex', alignItems: 'flex-end',
              transition: 'border-color .15s, box-shadow .15s',
            }}>
              <textarea
                ref={inputRef}
                value={input}
                onChange={e => { setInput(e.target.value); handleTyping() }}
                onKeyDown={handleKey}
                placeholder={`Message ${selectedUser.name || selectedUser.email}…`}
                rows={1}
                style={{
                  flex: 1, padding: '10px 14px', border: 'none', outline: 'none',
                  background: 'transparent', fontSize: 14, resize: 'none',
                  lineHeight: 1.5, maxHeight: 100, overflowY: 'auto',
                  fontFamily: 'inherit', color: '#1f1f1f',
                }}
              />

              {/* Attach */}
              <button onClick={() => fileRef.current?.click()} disabled={uploading} style={{
                background: 'none', border: 'none', cursor: 'pointer',
                color: '#80868b', fontSize: 18, padding: '8px 6px',
                opacity: uploading ? .5 : 1, transition: 'color .15s',
              }} title="Attach file">
                {uploading ? '⏳' : '📎'}
              </button>
              <input ref={fileRef} type="file" style={{ display: 'none' }} onChange={handleFile}
                accept="image/*,.pdf,.doc,.docx,.txt,.zip" />

              {/* Send */}
              <button onClick={() => send()} disabled={!input.trim()} className="send-btn" style={{
                background: input.trim() ? '#1a73e8' : 'transparent',
                border: 'none', borderRadius: '50%',
                width: 36, height: 36, margin: '6px 8px',
                cursor: input.trim() ? 'pointer' : 'not-allowed',
                color: input.trim() ? '#fff' : '#bdc1c6',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 16, flexShrink: 0, transition: 'all .15s',
              }}>➤</button>
            </div>
            <div style={{ fontSize: 11, color: '#80868b', marginTop: 4, paddingLeft: 14 }}>
              Enter to send · Shift+Enter for new line · 📎 attach files
            </div>
          </div>
        </div>
      ) : (
        /* ── No chat selected ── */
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: '#80868b', background: '#f8f9fa' }}>
          <div style={{ fontSize: 64, marginBottom: 20 }}>💬</div>
          <div style={{ fontSize: 22, fontWeight: 600, color: '#1f1f1f', marginBottom: 8 }}>
            Select a conversation
          </div>
          <div style={{ fontSize: 14, textAlign: 'center', maxWidth: 300 }}>
            Choose someone from the left to start chatting. Messages are private and real-time.
          </div>
        </div>
      )}

      <style>{`
        @keyframes tdot {
          0%,60%,100% { transform:translateY(0); opacity:.6; }
          30% { transform:translateY(-4px); opacity:1; }
        }
      `}</style>
    </div>
  )
}

export default ChatPage