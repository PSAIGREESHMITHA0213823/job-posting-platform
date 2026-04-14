// import React, { useEffect, useRef, useState, useCallback } from 'react'
// import { useSearchParams } from 'react-router-dom'
// import { io } from 'socket.io-client'
// import axios from 'axios'
// import { useAuth } from '../../context/AuthContext'

// const SOCKET_URL = process.env.REACT_APP_SOCKET_URL || 'http://localhost:5000'
// const API        = process.env.REACT_APP_API_URL    || 'http://localhost:5000/api'

// const ROLE_META = {
//   admin:           { color: '#b45309', bg: '#fef3c7', label: 'Admin' },
//   company_manager: { color: '#1558d6', bg: '#e8f0fe', label: 'Company' },
//   employee:        { color: '#137333', bg: '#e6f4ea', label: 'Employee' },
// }

// const QUICK_REPLIES = ['Any issue?', 'Please check', 'Thanks', 'Noted', 'On it!', 'Will update soon']
// const EMOJI_LIST    = ['👍','❤️','😂','😮','😢','🎉','🔥','👏','✅','💯','🙌','😍']

// const timeStr = (ts) => {
//   if (!ts) return ''
//   const d = new Date(ts), now = new Date()
//   const diff = now - d
//   if (diff < 60000)    return 'just now'
//   if (diff < 3600000)  return `${Math.floor(diff / 60000)} min`
//   if (d.toDateString() === now.toDateString())
//     return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
//   const y = new Date(now); y.setDate(now.getDate() - 1)
//   if (d.toDateString() === y.toDateString()) return 'Yesterday'
//   return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
// }

// const dateLabel = (ts) => {
//   if (!ts) return ''
//   const d = new Date(ts), now = new Date()
//   const y = new Date(now); y.setDate(now.getDate() - 1)
//   if (d.toDateString() === now.toDateString()) return 'Today'
//   if (d.toDateString() === y.toDateString())   return 'Yesterday'
//   return d.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })
// }

// const isImage  = (t) => t?.startsWith('image/')
// const fileIcon = (t) => {
//   if (isImage(t))          return '🖼️'
//   if (t?.includes('pdf'))  return '📄'
//   if (t?.includes('word')) return '📝'
//   if (t?.includes('zip'))  return '🗜️'
//   return '📎'
// }

// const getToken = () => localStorage.getItem('token') || sessionStorage.getItem('token')

// const Avatar = ({ name, src, size = 36, online }) => {
//   const [imgErr, setImgErr] = useState(false)
//   const initials = (name || '?').split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase()
//   const COLORS = ['#1a73e8','#0f9d58','#f4511e','#ab47bc','#00acc1','#e91e63','#ff7043','#43a047']
//   const bg = COLORS[(name?.charCodeAt(0) || 0) % COLORS.length]
//   const imgUrl = src?.startsWith('http') ? src : src ? `http://localhost:5000${src}` : null

//   return (
//     <div style={{ position: 'relative', flexShrink: 0 }}>
//       <div style={{
//         width: size, height: size, borderRadius: '50%',
//         background: (imgUrl && !imgErr) ? 'transparent' : bg,
//         display: 'flex', alignItems: 'center', justifyContent: 'center',
//         color: '#fff', fontSize: size * 0.37, fontWeight: 600,
//         overflow: 'hidden', border: '1px solid rgba(0,0,0,0.08)',
//       }}>
//         {imgUrl && !imgErr
//           ? <img src={imgUrl} alt={name} style={{ width: '100%', height: '100%', objectFit: 'cover' }}
//               onError={() => setImgErr(true)} />
//           : initials}
//       </div>
//       {online !== undefined && (
//         <span style={{
//           position: 'absolute', bottom: 1, right: 1,
//           width: size * 0.3, height: size * 0.3,
//           borderRadius: '50%', border: '2px solid #fff',
//           background: online ? '#34a853' : '#9aa0a6',
//         }} />
//       )}
//     </div>
//   )
// }

// const ReactionPill = ({ emoji, users, myId, onClick }) => {
//   const mine = users.some(u => u.user_id === myId)
//   return (
//     <button onClick={onClick} title={users.map(u => u.name).join(', ')} style={{
//       display: 'inline-flex', alignItems: 'center', gap: 3,
//       padding: '2px 8px', borderRadius: 12, fontSize: 12,
//       border: `1px solid ${mine ? '#1a73e8' : '#dadce0'}`,
//       background: mine ? '#e8f0fe' : '#f8f9fa',
//       cursor: 'pointer', color: mine ? '#1a73e8' : '#3c4043', fontWeight: 600,
//       transition: 'all .1s',
//     }}>
//       {emoji} <span style={{ fontSize: 11 }}>{users.length}</span>
//     </button>
//   )
// }

// const ChatPage = () => {
//   const { user } = useAuth()
//   const [searchParams, setSearchParams] = useSearchParams()

//   const [chats, setChats]                 = useState([]) // Combined chats (users + groups)
//   const [selectedChat, setSelectedChat]   = useState(null)
//   const [messages, setMessages]           = useState([])
//   const [input, setInput]                 = useState('')
//   const [search, setSearch]               = useState('')
//   const [msgSearch, setMsgSearch]         = useState('')
//   const [msgSearchOpen, setMsgSearchOpen] = useState(false)
//   const [connected, setConnected]         = useState(false)
//   const [typing, setTyping]               = useState(false)
//   const [onlineMap, setOnlineMap]         = useState({})
//   const [uploading, setUploading]         = useState(false)
//   const [replyTo, setReplyTo]             = useState(null)
//   const [hoveredMsg, setHoveredMsg]       = useState(null)
//   const [emojiFor, setEmojiFor]           = useState(null)
//   const [loadingMsgs, setLoadingMsgs]     = useState(false)
//   const [unreadMap, setUnreadMap]         = useState({})
//   const [showDeleteMenu, setShowDeleteMenu] = useState(null)
//   const [scrollToBottom, setScrollToBottom] = useState(true)
  
//   // Group creation modal states
//   const [showCreateGroup, setShowCreateGroup] = useState(false)
//   const [newGroupName, setNewGroupName] = useState('')
//   const [selectedMembers, setSelectedMembers] = useState([])
//   const [allUsers, setAllUsers] = useState([])
//   const [creatingGroup, setCreatingGroup] = useState(false)

//   const socketRef   = useRef(null)
//   const bottomRef   = useRef(null)
//   const messagesContainerRef = useRef(null)
//   const inputRef    = useRef(null)
//   const fileRef     = useRef(null)
//   const typingTimer      = useRef(null)
//   const selectedChatRef  = useRef(null)

//   const myId = user?.id

//   // Auto-scroll to bottom when new messages arrive
//   useEffect(() => {
//     if (scrollToBottom && bottomRef.current) {
//       bottomRef.current.scrollIntoView({ behavior: 'smooth' })
//     }
//   }, [messages, scrollToBottom])

//   const handleScroll = () => {
//     if (messagesContainerRef.current) {
//       const { scrollTop, scrollHeight, clientHeight } = messagesContainerRef.current
//       const isAtBottom = scrollHeight - scrollTop - clientHeight < 50
//       setScrollToBottom(isAtBottom)
//     }
//   }

//   // Sort chats by last message time
//   const sortChatsByLastMessage = (chatsList) => {
//     return [...chatsList].sort((a, b) => {
//       const timeA = a.last_message_at ? new Date(a.last_message_at) : new Date(0)
//       const timeB = b.last_message_at ? new Date(b.last_message_at) : new Date(0)
//       return timeB - timeA
//     })
//   }

//   // ── Connect socket ────────────────────────────────────────────────────────
//   useEffect(() => {
//     if (!user) return
//     const socket = io(SOCKET_URL, { transports: ['websocket'] })

//     socket.on('connect', () => {
//       setConnected(true)
//       socket.emit('join', user.id)
//       socket.emit('dm:register', user)
//     })
//     socket.on('disconnect', () => setConnected(false))

//     // Handle direct messages
//     socket.on('dm:message', (msg) => {
//       const current = selectedChatRef.current
//       if (current && current.type === 'direct' && (String(msg.sender_id) === String(current.id) || String(msg.receiver_id) === String(current.id))) {
//         setMessages(m => {
//           if (m.some(x => x.id === msg.id)) return m
//           return [...m, msg]
//         })
//         if (String(msg.sender_id) === String(current.id)) {
//           socket.emit('dm:read', { sender_id: current.id })
//           setUnreadMap(prev => ({ ...prev, [current.id]: 0 }))
//         }
//         setScrollToBottom(true)
//       } else {
//         setUnreadMap(prev => ({ ...prev, [msg.sender_id]: (prev[msg.sender_id] || 0) + 1 }))
//         setChats(prev => {
//           const updated = prev.map(chat => {
//             if (chat.type === 'direct' && chat.id === msg.sender_id) {
//               return { ...chat, last_message: msg.content, last_message_at: msg.created_at, unread_count: (chat.unread_count || 0) + 1 }
//             }
//             return chat
//           })
//           return sortChatsByLastMessage(updated)
//         })
//       }
//     })

//     // Handle group messages
//     socket.on('group:message', (msg) => {
//       const current = selectedChatRef.current
//       if (current && current.type === 'group' && current.id === msg.group_id) {
//         setMessages(m => {
//           if (m.some(x => x.id === msg.id)) return m
//           return [...m, msg]
//         })
//         setScrollToBottom(true)
//       }
//       // Update chat list
//       setChats(prev => {
//         const updated = prev.map(chat => {
//           if (chat.type === 'group' && chat.id === msg.group_id) {
//             return { ...chat, last_message: msg.content, last_message_at: msg.created_at }
//           }
//           return chat
//         })
//         return sortChatsByLastMessage(updated)
//       })
//     })

//     socket.on('dm:reactions_update', ({ message_id, reactions }) => {
//       setMessages(prev => prev.map(m => m.id === message_id ? { ...m, reactions } : m))
//     })

//     socket.on('group:reactions_update', ({ message_id, reactions }) => {
//       setMessages(prev => prev.map(m => m.id === message_id ? { ...m, reactions } : m))
//     })

//     socket.on('dm:message_deleted_for_everyone', ({ message_id, content }) => {
//       setMessages(prev => prev.map(m => m.id === message_id ? { ...m, content, is_deleted_for_everyone: true } : m))
//     })

//     socket.on('group:message_deleted', ({ message_id }) => {
//       setMessages(prev => prev.map(m => m.id === message_id ? { ...m, content: 'This message was deleted', is_deleted_for_everyone: true } : m))
//     })

//     socket.on('dm:typing', ({ from_user_id, name }) => {
//       if (selectedChatRef.current?.type === 'direct' && selectedChatRef.current?.id === from_user_id) {
//         setTyping(true)
//         clearTimeout(typingTimer.current)
//         typingTimer.current = setTimeout(() => setTyping(false), 2000)
//       }
//     })

//     socket.on('group:typing', ({ name }) => {
//       if (selectedChatRef.current?.type === 'group') {
//         setTyping(true)
//         clearTimeout(typingTimer.current)
//         typingTimer.current = setTimeout(() => setTyping(false), 2000)
//       }
//     })

//     socket.on('dm:online', ({ user_id, online }) => {
//       setOnlineMap(prev => ({ ...prev, [user_id]: online }))
//     })

//     socketRef.current = socket
//     return () => { socket.disconnect(); clearTimeout(typingTimer.current) }
//   }, [user])

//   // ── Fetch all chats (users + groups) ──────────────────────────────────────
//   const fetchAllChats = useCallback(async () => {
//     try {
//       // Fetch users for DMs
//       const usersRes = await axios.get(`${API}/direct-chat/users`, {
//         headers: { Authorization: `Bearer ${getToken()}` }
//       })
//       const usersList = (usersRes.data.data || []).map(u => ({ ...u, type: 'direct' }))
      
//       // Fetch groups
//       const groupsRes = await axios.get(`${API}/direct-chat/groups`, {
//         headers: { Authorization: `Bearer ${getToken()}` }
//       })
//       const groupsList = (groupsRes.data.data || []).map(g => ({ ...g, type: 'group' }))
      
//       const allChats = sortChatsByLastMessage([...usersList, ...groupsList])
//       setChats(allChats)
      
//       const um = {}
//       allChats.forEach(chat => { if (chat.unread_count > 0) um[chat.id] = chat.unread_count })
//       setUnreadMap(um)

//       const uid = searchParams.get('user')
//       if (uid) {
//         const found = allChats.find(chat => chat.id === uid)
//         if (found) selectChat(found)
//       }
//     } catch (err) { console.error('[Chat] fetch chats error:', err) }
//   }, [searchParams])

//   // ── Fetch all users for group creation ────────────────────────────────────
//   const fetchAllUsers = useCallback(async () => {
//     try {
//       const res = await axios.get(`${API}/direct-chat/users`, {
//         headers: { Authorization: `Bearer ${getToken()}` }
//       })
//       setAllUsers(res.data.data || [])
//     } catch (err) { console.error('[Chat] fetch users error:', err) }
//   }, [])

//   useEffect(() => { fetchAllChats() }, [fetchAllChats])
//   useEffect(() => { fetchAllUsers() }, [])

//   // ── Select chat (user or group) → load messages ───────────────────────────
//   const selectChat = useCallback(async (chat) => {
//     setSelectedChat(chat)
//     selectedChatRef.current = chat
//     setMessages([])
//     setLoadingMsgs(true)
//     setReplyTo(null)
//     setSearchParams({ user: chat.id, type: chat.type })
//     setTyping(false)
//     setScrollToBottom(true)

//     setUnreadMap(prev => ({ ...prev, [chat.id]: 0 }))
//     setChats(prev => {
//       const updated = prev.map(c => c.id === chat.id ? { ...c, unread_count: 0 } : c)
//       return sortChatsByLastMessage(updated)
//     })

//     try {
//       let url
//       if (chat.type === 'direct') {
//         url = `${API}/direct-chat/messages/${chat.id}`
//         socketRef.current?.emit('dm:read', { sender_id: chat.id })
//         socketRef.current?.emit('group:leave', { group_id: selectedChatRef.current?.id })
//       } else {
//         url = `${API}/direct-chat/groups/${chat.id}/messages`
//         socketRef.current?.emit('group:join', { group_id: chat.id, user })
//       }
      
//       const res = await axios.get(url, {
//         headers: { Authorization: `Bearer ${getToken()}` }
//       })
//       setMessages(res.data.data || [])
//     } catch (err) { console.error('[Chat] fetch messages:', err) }
//     finally { setLoadingMsgs(false); setTimeout(() => inputRef.current?.focus(), 100) }
//   }, [setSearchParams, user])

//   // ── Send message (DM or Group) ────────────────────────────────────────────
//   const send = (extra = {}) => {
//     if (!selectedChat) return
//     const content = input.trim()
//     if (!content && !extra.file_url) return

//     if (selectedChat.type === 'direct') {
//       socketRef.current?.emit('dm:send', {
//         receiver_id: selectedChat.id,
//         content,
//         sender: user,
//         ...extra,
//       })
//     } else {
//       socketRef.current?.emit('group:send', {
//         group_id: selectedChat.id,
//         content,
//         file_url: extra.file_url,
//         file_name: extra.file_name,
//         file_type: extra.file_type,
//         sender: user,
//       })
//     }
    
//     setInput('')
//     setReplyTo(null)
    
//     setChats(prev => {
//       const updated = prev.map(chat =>
//         chat.id === selectedChat.id
//           ? { ...chat, last_message: content || extra.file_name, last_message_at: new Date().toISOString(), unread_count: 0 }
//           : chat
//       )
//       return sortChatsByLastMessage(updated)
//     })
//   }

//   // ── Create New Group ──────────────────────────────────────────────────────
//   const createGroup = async () => {
//     if (!newGroupName.trim() || selectedMembers.length === 0) {
//       alert('Please enter group name and select at least one member')
//       return
//     }

//     setCreatingGroup(true)
//     try {
//       const response = await axios.post(`${API}/direct-chat/groups`, {
//         name: newGroupName,
//         description: '',
//         member_ids: selectedMembers
//       }, {
//         headers: { Authorization: `Bearer ${getToken()}` }
//       })

//       if (response.data.success) {
//         setShowCreateGroup(false)
//         setNewGroupName('')
//         setSelectedMembers([])
//         fetchAllChats() // Refresh chat list
//       }
//     } catch (err) {
//       console.error('[Chat] create group error:', err)
//       alert('Failed to create group')
//     } finally {
//       setCreatingGroup(false)
//     }
//   }

//   // ── Delete for Me (DM only) ────────────────────────────────────────────────
//   const deleteForMe = async (messageId, otherUserId) => {
//     try {
//       const response = await axios.delete(`${API}/direct-chat/messages/${messageId}/for-me`, {
//         headers: { Authorization: `Bearer ${getToken()}` }
//       })
//       if (response.data.success) {
//         setMessages(prev => prev.filter(m => m.id !== messageId))
//         socketRef.current?.emit('dm:delete_for_me', { message_id: messageId, receiver_id: otherUserId, sender: user })
//       }
//     } catch (err) { console.error(err); alert('Failed to delete message') }
//     setShowDeleteMenu(null)
//   }

//   // ── Delete for Everyone (DM only) ──────────────────────────────────────────
//   const deleteForEveryone = async (messageId) => {
//     const confirm = window.confirm('⚠️ Delete this message for everyone? This action cannot be undone.')
//     if (!confirm) return

//     try {
//       const response = await axios.delete(`${API}/direct-chat/messages/${messageId}/for-everyone`, {
//         headers: { Authorization: `Bearer ${getToken()}` }
//       })
//       if (response.data.success) {
//         setMessages(prev => prev.map(m => m.id === messageId ? { ...m, content: 'This message was deleted', is_deleted_for_everyone: true } : m))
//         socketRef.current?.emit('dm:delete_for_everyone', { message_id: messageId, receiver_id: selectedChat?.id, sender: user })
//       }
//     } catch (err) { console.error(err); alert('Failed to delete message') }
//     setShowDeleteMenu(null)
//   }

//   const handleKey = (e) => {
//     if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send() }
//   }

//   const handleTyping = () => {
//     if (!selectedChat) return
//     if (selectedChat.type === 'direct') {
//       socketRef.current?.emit('dm:typing', { receiver_id: selectedChat.id, name: user?.email })
//     } else {
//       socketRef.current?.emit('group:typing', { group_id: selectedChat.id, name: user?.email })
//     }
//   }

//   // ── File upload ───────────────────────────────────────────────────────────
//   const handleFile = async (e) => {
//     const file = e.target.files[0]
//     if (!file) return
//     setUploading(true)
//     try {
//       const fd = new FormData()
//       fd.append('file', file)
//       const res = await axios.post(`${API}/direct-chat/upload`, fd, {
//         headers: { Authorization: `Bearer ${getToken()}`, 'Content-Type': 'multipart/form-data' }
//       })
//       send({ file_url: res.data.file_url, file_name: res.data.file_name, file_type: res.data.file_type })
//     } catch { alert('Upload failed') }
//     finally { setUploading(false); e.target.value = '' }
//   }

//   // ── React ─────────────────────────────────────────────────────────────────
//   const react = (messageId, emoji) => {
//     if (!selectedChat) return
//     if (selectedChat.type === 'direct') {
//       socketRef.current?.emit('dm:react', { message_id: messageId, emoji, receiver_id: selectedChat.id, sender: user })
//     } else {
//       socketRef.current?.emit('group:react', { message_id: messageId, emoji, group_id: selectedChat.id, sender: user })
//     }
//     setEmojiFor(null)
//   }

//   // ── Grouped messages ──────────────────────────────────────────────────────
//   const filteredMsgs = msgSearch
//     ? messages.filter(m => m.content?.toLowerCase().includes(msgSearch.toLowerCase()))
//     : messages

//   const grouped = filteredMsgs.reduce((acc, msg) => {
//     const k = dateLabel(msg.created_at)
//     if (!acc[k]) acc[k] = []
//     acc[k].push(msg)
//     return acc
//   }, {})

//   const groupReactions = (rx = []) =>
//     rx.reduce((acc, r) => { if (!acc[r.emoji]) acc[r.emoji] = []; acc[r.emoji].push(r); return acc }, {})

//   const filteredChats = chats.filter(chat =>
//     !search ||
//     chat.name?.toLowerCase().includes(search.toLowerCase()) ||
//     chat.email?.toLowerCase().includes(search.toLowerCase())
//   )

//   const totalUnread = Object.values(unreadMap).reduce((a, b) => a + b, 0)

//   return (
//     <div style={{
//       height: 'calc(100vh - 56px)',
//       display: 'flex',
//       background: '#fff',
//       fontFamily: "'Google Sans','Segoe UI',sans-serif",
//       overflow: 'hidden',
//       border: '1px solid #e8eaed',
//       borderRadius: 8,
//     }}>
//       <style>{`
//         .chat-user-row:hover { background: #f1f3f4 !important; }
//         .chat-user-row.active { background: #e8f0fe !important; }
//         .chat-msg-row:hover .chat-toolbar { opacity:1!important; }
//         .chat-toolbar { opacity:0; transition:opacity .15s; }
//         .emoji-btn:hover { transform:scale(1.25); }
//         ::-webkit-scrollbar { width:5px; height:5px; }
//         ::-webkit-scrollbar-thumb { background:#dadce0; border-radius:3px; }
//         .send-btn:hover { background:#1557d6 !important; }
//         .quick-reply:hover { background:#e8f0fe !important; border-color:#1a73e8 !important; color:#1a73e8 !important; }
//         .delete-menu { position: absolute; right: 0; bottom: 30px; background: white; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.15); z-index: 100; overflow: hidden; min-width: 140px; }
//         .delete-menu button { display: block; width: 100%; padding: 10px 16px; border: none; background: white; text-align: left; cursor: pointer; font-size: 13px; }
//         .delete-menu button:hover { background: #f1f3f4; }
//         .delete-menu .delete-for-everyone { color: #d93025; border-top: 1px solid #e8eaed; }
//         .group-badge { background: #e8f0fe; color: #1a73e8; border-radius: 4px; font-size: 10px; padding: 2px 6px; margin-left: 8px; }
//         .modal-overlay { position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.5); display: flex; align-items: center; justify-content: center; z-index: 1000; }
//         .modal-content { background: white; border-radius: 12px; width: 450px; max-width: 90%; padding: 24px; }
//         .modal-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; }
//         .modal-title { font-size: 20px; font-weight: 700; }
//         .modal-close { background: none; border: none; font-size: 24px; cursor: pointer; }
//         .member-select { max-height: 300px; overflow-y: auto; margin: 16px 0; border: 1px solid #e8eaed; border-radius: 8px; padding: 8px; }
//         .member-item { display: flex; align-items: center; padding: 8px; cursor: pointer; border-radius: 8px; }
//         .member-item:hover { background: #f1f3f4; }
//         .member-checkbox { margin-right: 12px; }
//       `}</style>

//       {/* ════════════════ LEFT SIDEBAR ════════════════ */}
//       <div style={{
//         width: 320, flexShrink: 0,
//         borderRight: '1px solid #e8eaed',
//         display: 'flex', flexDirection: 'column',
//         background: '#fff',
//       }}>
//         <div style={{ padding: '14px 16px 10px', borderBottom: '1px solid #e8eaed' }}>
//           <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
//             <span style={{ fontSize: 18, fontWeight: 700, color: '#1f1f1f', flex: 1 }}>Chats</span>
//             {totalUnread > 0 && (
//               <span style={{
//                 background: '#1a73e8', color: '#fff', borderRadius: 10,
//                 fontSize: 11, fontWeight: 700, padding: '2px 7px',
//               }}>{totalUnread}</span>
//             )}
//             <button
//               onClick={() => setShowCreateGroup(true)}
//               style={{
//                 background: '#1a73e8',
//                 border: 'none',
//                 borderRadius: 20,
//                 color: '#fff',
//                 cursor: 'pointer',
//                 fontSize: 12,
//                 padding: '6px 12px',
//                 fontWeight: 600
//               }}
//             >
//               + New Group
//             </button>
//             <span style={{
//               width: 8, height: 8, borderRadius: '50%',
//               background: connected ? '#34a853' : '#ea4335',
//               display: 'inline-block',
//             }} title={connected ? 'Connected' : 'Offline'} />
//           </div>
//           <div style={{ position: 'relative' }}>
//             <span style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: '#80868b', fontSize: 14 }}>🔍</span>
//             <input value={search} onChange={e => setSearch(e.target.value)}
//               placeholder="Search chats…"
//               style={{
//                 width: '100%', padding: '7px 10px 7px 30px',
//                 borderRadius: 20, border: '1px solid #e8eaed',
//                 fontSize: 13, outline: 'none', background: '#f8f9fa',
//                 color: '#1f1f1f', boxSizing: 'border-box',
//               }} />
//           </div>
//         </div>

//         <div style={{ flex: 1, overflowY: 'auto' }}>
//           {filteredChats.length === 0 && (
//             <div style={{ padding: 24, textAlign: 'center', color: '#80868b', fontSize: 13 }}>
//               {search ? 'No results' : 'No chats yet'}
//             </div>
//           )}
//           {filteredChats.map(chat => {
//             const isSelected = selectedChat?.id === chat.id
//             const isOnline = chat.type === 'direct' ? (onlineMap[chat.id] ?? false) : false
//             const unread = unreadMap[chat.id] || 0
            
//             return (
//               <div key={`${chat.type}-${chat.id}`}
//                 className={`chat-user-row${isSelected ? ' active' : ''}`}
//                 onClick={() => selectChat(chat)}
//                 style={{
//                   padding: '10px 14px', cursor: 'pointer',
//                   display: 'flex', alignItems: 'center', gap: 10,
//                   background: isSelected ? '#e8f0fe' : 'transparent',
//                   borderLeft: isSelected ? '3px solid #1a73e8' : '3px solid transparent',
//                   transition: 'all .1s',
//                 }}>
//                 <Avatar name={chat.name || chat.email} src={chat.avatar_url} size={36} online={isOnline} />
//                 <div style={{ flex: 1, minWidth: 0 }}>
//                   <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
//                     <span style={{ fontSize: 13, fontWeight: unread > 0 ? 700 : 500, color: '#1f1f1f', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 130 }}>
//                       {chat.name || chat.email}
//                       {chat.type === 'group' && <span className="group-badge">Group</span>}
//                     </span>
//                     <span style={{ fontSize: 11, color: '#80868b', whiteSpace: 'nowrap', marginLeft: 4 }}>
//                       {chat.last_message_at ? timeStr(chat.last_message_at) : ''}
//                     </span>
//                   </div>
//                   <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 2 }}>
//                     <span style={{
//                       fontSize: 12, color: unread > 0 ? '#1f1f1f' : '#80868b',
//                       fontWeight: unread > 0 ? 600 : 400,
//                       overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 150,
//                     }}>
//                       {chat.type === 'group' && chat.member_count && `👥 ${chat.member_count} members · `}
//                       {chat.last_message || (chat.type === 'group' ? 'No messages yet' : (ROLE_META[chat.role]?.label || chat.role))}
//                     </span>
//                     {unread > 0 && (
//                       <span style={{
//                         background: '#1a73e8', color: '#fff', borderRadius: '50%',
//                         width: 18, height: 18, fontSize: 10, fontWeight: 700,
//                         display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
//                       }}>{unread > 9 ? '9+' : unread}</span>
//                     )}
//                   </div>
//                 </div>
//               </div>
//             )
//           })}
//         </div>

//         <div style={{ padding: '10px 14px', borderTop: '1px solid #e8eaed', display: 'flex', alignItems: 'center', gap: 10 }}>
//           <Avatar name={user?.name || user?.email} src={user?.avatar_url} size={32} online={true} />
//           <div style={{ flex: 1, minWidth: 0 }}>
//             <div style={{ fontSize: 12, fontWeight: 600, color: '#1f1f1f', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
//               {user?.name || user?.email}
//             </div>
//             <div style={{ fontSize: 10, color: ROLE_META[user?.role]?.color || '#80868b', fontWeight: 700 }}>
//               {ROLE_META[user?.role]?.label || user?.role}
//             </div>
//           </div>
//         </div>
//       </div>

//       {/* ════════════════ CHAT AREA ════════════════ */}
//       {selectedChat ? (
//         <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
//           {/* Chat Header */}
//           <div style={{
//             height: 58, padding: '0 18px',
//             borderBottom: '1px solid #e8eaed',
//             display: 'flex', alignItems: 'center', gap: 12,
//             background: '#fff', flexShrink: 0,
//           }}>
//             <Avatar name={selectedChat.name || selectedChat.email} src={selectedChat.avatar_url}
//               size={38} online={selectedChat.type === 'direct' ? (onlineMap[selectedChat.id] ?? false) : false} />
//             <div style={{ flex: 1 }}>
//               <div style={{ fontSize: 15, fontWeight: 700, color: '#1f1f1f' }}>
//                 {selectedChat.name || selectedChat.email}
//                 {selectedChat.type === 'group' && selectedChat.member_count && (
//                   <span style={{ fontSize: 12, fontWeight: 400, color: '#80868b', marginLeft: 8 }}>
//                     ({selectedChat.member_count} members)
//                   </span>
//                 )}
//               </div>
//               <div style={{ fontSize: 12, color: '#80868b', display: 'flex', alignItems: 'center', gap: 6 }}>
//                 {selectedChat.type === 'direct' ? (
//                   <>
//                     <span style={{ padding: '1px 7px', borderRadius: 10, fontSize: 10, fontWeight: 700, background: ROLE_META[selectedChat.role]?.bg, color: ROLE_META[selectedChat.role]?.color }}>
//                       {ROLE_META[selectedChat.role]?.label || selectedChat.role}
//                     </span>
//                     {onlineMap[selectedChat.id]
//                       ? <span style={{ color: '#34a853' }}>● Active now</span>
//                       : <span>● Offline</span>}
//                   </>
//                 ) : (
//                   <span>Group Chat</span>
//                 )}
//               </div>
//             </div>
//             <button onClick={() => { setMsgSearchOpen(p => !p); setMsgSearch('') }} style={{
//               background: 'none', border: 'none', cursor: 'pointer',
//               color: msgSearchOpen ? '#1a73e8' : '#80868b', fontSize: 18, padding: 6, borderRadius: 4,
//             }}>🔍</button>
//           </div>

//           {/* Messages Container - Same as before */}
//           <div 
//             ref={messagesContainerRef}
//             onScroll={handleScroll}
//             style={{ flex: 1, overflowY: 'auto', padding: '10px 0', background: '#fff' }}
//             onClick={() => { setEmojiFor(null); setShowDeleteMenu(null) }}>
//             {loadingMsgs ? (
//               <div style={{ textAlign: 'center', padding: 40, color: '#80868b' }}>Loading…</div>
//             ) : (
//               <>
//                 {Object.entries(grouped).map(([date, msgs]) => (
//                   <div key={date}>
//                     <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 20px' }}>
//                       <div style={{ flex: 1, height: 1, background: '#e8eaed' }} />
//                       <span style={{ fontSize: 11, color: '#80868b', fontWeight: 600, whiteSpace: 'nowrap' }}>{date}</span>
//                       <div style={{ flex: 1, height: 1, background: '#e8eaed' }} />
//                     </div>

//                     {msgs.map((msg, i) => {
//                       const isMe = msg.sender_id === myId
//                       const prev = msgs[i - 1]
//                       const sameUser = prev && prev.sender_id === msg.sender_id &&
//                                         (new Date(msg.created_at) - new Date(prev.created_at)) < 120000
//                       const rxGroups = groupReactions(msg.reactions)
//                       const fileUrl = msg.file_url?.startsWith('http')
//                                           ? msg.file_url : `http://localhost:5000${msg.file_url}`
                      
//                       const canDeleteForEveryone = user?.role === 'admin' || msg.sender_id === myId

//                       if (msg.is_deleted_for_everyone) {
//                         return (
//                           <div key={msg.id} style={{ padding: '8px 20px', textAlign: 'center' }}>
//                             <div style={{
//                               display: 'inline-block',
//                               padding: '6px 14px',
//                               background: '#f1f3f4',
//                               borderRadius: 16,
//                               fontSize: 12,
//                               color: '#80868b',
//                               fontStyle: 'italic'
//                             }}>
//                               🗑️ This message was deleted
//                             </div>
//                           </div>
//                         )
//                       }

//                       return (
//                         <div key={msg.id}
//                           className="chat-msg-row"
//                           style={{
//                             display: 'flex',
//                             flexDirection: isMe ? 'row-reverse' : 'row',
//                             padding: sameUser ? '2px 20px' : '8px 20px',
//                             gap: 10, alignItems: 'flex-end', position: 'relative',
//                           }}
//                           onMouseEnter={() => setHoveredMsg(msg.id)}
//                           onMouseLeave={() => { setHoveredMsg(null); setShowDeleteMenu(null) }}>

//                           <div style={{ width: 36, flexShrink: 0 }}>
//                             {!sameUser && !isMe && selectedChat.type === 'direct' && (
//                               <Avatar name={selectedChat.name || selectedChat.email}
//                                 src={selectedChat.avatar_url} size={36} />
//                             )}
//                             {!sameUser && !isMe && selectedChat.type === 'group' && (
//                               <Avatar name={msg.sender_name || msg.sender_email} size={36} />
//                             )}
//                           </div>

//                           <div style={{ maxWidth: '65%', display: 'flex', flexDirection: 'column', alignItems: isMe ? 'flex-end' : 'flex-start' }}>
//                             {!sameUser && !isMe && selectedChat.type === 'group' && (
//                               <div style={{ fontSize: 12, color: '#80868b', marginBottom: 3 }}>
//                                 <b style={{ color: '#1f1f1f' }}>{msg.sender_name || msg.sender_email}</b>
//                                 &nbsp;&nbsp;{timeStr(msg.created_at)}
//                               </div>
//                             )}
//                             {!sameUser && !isMe && selectedChat.type === 'direct' && (
//                               <div style={{ fontSize: 12, color: '#80868b', marginBottom: 3 }}>
//                                 <b style={{ color: '#1f1f1f' }}>{selectedChat.name || selectedChat.email}</b>
//                                 &nbsp;&nbsp;{timeStr(msg.created_at)}
//                               </div>
//                             )}
//                             {!sameUser && isMe && (
//                               <div style={{ fontSize: 12, color: '#80868b', marginBottom: 3, textAlign: 'right' }}>
//                                 {timeStr(msg.created_at)}
//                               </div>
//                             )}

//                             {msg.content && (
//                               <div style={{
//                                 padding: '9px 14px',
//                                 borderRadius: isMe ? '18px 18px 4px 18px' : '18px 18px 18px 4px',
//                                 background: isMe ? '#c2e7ff' : '#f1f3f4',
//                                 color: '#1f1f1f', fontSize: 14, lineHeight: 1.5,
//                                 wordBreak: 'break-word',
//                                 boxShadow: '0 1px 2px rgba(0,0,0,.06)',
//                               }}>
//                                 {msg.content}
//                               </div>
//                             )}

//                             {msg.file_url && (
//                               <div style={{ marginTop: msg.content ? 6 : 0 }}>
//                                 {isImage(msg.file_type) ? (
//                                   <a href={fileUrl} target="_blank" rel="noreferrer">
//                                     <img src={fileUrl} alt={msg.file_name}
//                                       style={{ maxWidth: 240, maxHeight: 180, borderRadius: 12, cursor: 'pointer', border: '1px solid #e8eaed', display: 'block' }} />
//                                   </a>
//                                 ) : (
//                                   <a href={fileUrl} target="_blank" rel="noreferrer" style={{
//                                     display: 'inline-flex', alignItems: 'center', gap: 8,
//                                     padding: '10px 14px', background: isMe ? '#c2e7ff' : '#f1f3f4',
//                                     borderRadius: 12, textDecoration: 'none', color: '#1f1f1f', fontSize: 13,
//                                   }}>
//                                     <span style={{ fontSize: 22 }}>{fileIcon(msg.file_type)}</span>
//                                     <div>
//                                       <div style={{ fontWeight: 600, fontSize: 12 }}>{msg.file_name}</div>
//                                       <div style={{ fontSize: 10, color: '#80868b' }}>Click to open</div>
//                                     </div>
//                                   </a>
//                                 )}
//                               </div>
//                             )}

//                             {Object.keys(rxGroups).length > 0 && (
//                               <div style={{ display: 'flex', gap: 4, marginTop: 4, flexWrap: 'wrap' }}>
//                                 {Object.entries(rxGroups).map(([emoji, users]) => (
//                                   <ReactionPill key={emoji} emoji={emoji} users={users} myId={myId}
//                                     onClick={e => { e.stopPropagation(); react(msg.id, emoji) }} />
//                                 ))}
//                               </div>
//                             )}
//                           </div>

//                           {/* Delete Menu - Only for DMs */}
//                           {hoveredMsg === msg.id && selectedChat.type === 'direct' && (
//                             <div style={{ position: 'relative' }}>
//                               <button
//                                 onClick={(e) => { e.stopPropagation(); setShowDeleteMenu(showDeleteMenu === msg.id ? null : msg.id) }}
//                                 style={{
//                                   background: '#fff', border: '1px solid #e8eaed', borderRadius: 20,
//                                   cursor: 'pointer', fontSize: 14, padding: '4px 8px',
//                                   color: '#5f6368', marginLeft: isMe ? 0 : 8, marginRight: isMe ? 8 : 0,
//                                 }}
//                               >
//                                 ⋮
//                               </button>
                              
//                               {showDeleteMenu === msg.id && (
//                                 <div className="delete-menu" style={{ right: isMe ? 0 : 'auto', left: isMe ? 'auto' : 0 }}>
//                                   <button onClick={() => deleteForMe(msg.id, selectedChat.id)}>
//                                     🗑️ Delete for me
//                                   </button>
//                                   {canDeleteForEveryone && (
//                                     <button className="delete-for-everyone" onClick={() => deleteForEveryone(msg.id)}>
//                                       ⚠️ Delete for everyone
//                                     </button>
//                                   )}
//                                 </div>
//                               )}
//                             </div>
//                           )}

//                           {/* Reaction Toolbar */}
//                           {hoveredMsg === msg.id && (
//                             <div className="chat-toolbar"
//                               style={{
//                                 position: 'absolute',
//                                 [isMe ? 'left' : 'right']: 60,
//                                 bottom: 8,
//                                 background: '#fff', border: '1px solid #e8eaed',
//                                 borderRadius: 20, display: 'flex', gap: 2,
//                                 padding: '3px 6px', boxShadow: '0 2px 8px rgba(0,0,0,.12)', zIndex: 10,
//                               }}
//                               onClick={e => e.stopPropagation()}>
//                               {['👍','❤️','😂'].map(em => (
//                                 <button key={em} className="emoji-btn" onClick={() => react(msg.id, em)} style={{
//                                   background: 'none', border: 'none', cursor: 'pointer',
//                                   fontSize: 17, padding: '2px 3px', transition: 'transform .1s',
//                                 }}>{em}</button>
//                               ))}
//                               <button onClick={e => { e.stopPropagation(); setEmojiFor(emojiFor === msg.id ? null : msg.id) }} style={{
//                                 background: 'none', border: 'none', cursor: 'pointer',
//                                 fontSize: 12, padding: '2px 5px', color: '#5f6368',
//                               }}>😊+</button>
//                               <div style={{ width: 1, background: '#e8eaed', margin: '2px 4px' }} />
//                               <button onClick={() => { setReplyTo(msg); inputRef.current?.focus() }} style={{
//                                 background: 'none', border: 'none', cursor: 'pointer',
//                                 fontSize: 12, padding: '2px 6px', color: '#5f6368',
//                               }}>↩ Reply</button>
//                             </div>
//                           )}

//                           {emojiFor === msg.id && (
//                             <div style={{
//                               position: 'absolute',
//                               [isMe ? 'left' : 'right']: 60,
//                               bottom: 36,
//                               background: '#fff', border: '1px solid #e8eaed',
//                               borderRadius: 12, padding: 10, zIndex: 20,
//                               display: 'flex', flexWrap: 'wrap', gap: 4, width: 210,
//                               boxShadow: '0 4px 20px rgba(0,0,0,.15)',
//                             }} onClick={e => e.stopPropagation()}>
//                               {EMOJI_LIST.map(em => (
//                                 <button key={em} className="emoji-btn" onClick={() => react(msg.id, em)} style={{
//                                   background: 'none', border: 'none', cursor: 'pointer',
//                                   fontSize: 22, padding: 4, borderRadius: 6, transition: 'transform .1s',
//                                 }}>{em}</button>
//                               ))}
//                             </div>
//                           )}
//                         </div>
//                       )
//                     })}
//                   </div>
//                 ))}

//                 {filteredMsgs.length === 0 && !loadingMsgs && (
//                   <div style={{ textAlign: 'center', padding: '60px 20px', color: '#80868b' }}>
//                     <Avatar name={selectedChat.name || selectedChat.email} src={selectedChat.avatar_url} size={64} />
//                     <div style={{ fontSize: 16, fontWeight: 600, marginTop: 14, color: '#1f1f1f' }}>
//                       {selectedChat.name || selectedChat.email}
//                     </div>
//                     <div style={{ fontSize: 13, marginTop: 6 }}>
//                       {msgSearch ? `No messages matching "${msgSearch}"` : 'Start a conversation!'}
//                     </div>
//                   </div>
//                 )}

//                 {typing && (
//                   <div style={{ padding: '4px 20px 8px', display: 'flex', alignItems: 'center', gap: 10 }}>
//                     <Avatar name={selectedChat.name} size={24} />
//                     <div style={{
//                       background: '#f1f3f4', borderRadius: '12px 12px 12px 4px',
//                       padding: '8px 12px', display: 'flex', gap: 4, alignItems: 'center',
//                     }}>
//                       <span style={{ fontSize: 12, color: '#667781' }}>typing</span>
//                       {[0,1,2].map(i => (
//                         <span key={i} style={{
//                           width: 6, height: 6, borderRadius: '50%', background: '#80868b',
//                           display: 'inline-block',
//                           animation: `tdot 1.2s ${i * .2}s infinite ease-in-out`,
//                         }} />
//                       ))}
//                     </div>
//                   </div>
//                 )}
//                 <div ref={bottomRef} />
//               </>
//             )}
//           </div>

//           {/* Input Area - Same as before */}
//           <div style={{ padding: '10px 16px 14px', borderTop: '1px solid #e8eaed', background: '#fff', flexShrink: 0 }}>
//             <div style={{
//               border: '1px solid #dadce0', borderRadius: 24,
//               background: '#f8f9fa', display: 'flex', alignItems: 'flex-end',
//               transition: 'border-color .15s, box-shadow .15s',
//             }}>
//               <textarea
//                 ref={inputRef}
//                 value={input}
//                 onChange={e => { setInput(e.target.value); handleTyping() }}
//                 onKeyDown={handleKey}
//                 placeholder={`Message ${selectedChat.name || selectedChat.email}…`}
//                 rows={1}
//                 style={{
//                   flex: 1, padding: '10px 14px', border: 'none', outline: 'none',
//                   background: 'transparent', fontSize: 14, resize: 'none',
//                   lineHeight: 1.5, maxHeight: 100, overflowY: 'auto',
//                   fontFamily: 'inherit', color: '#1f1f1f',
//                 }}
//               />
//               <button onClick={() => fileRef.current?.click()} disabled={uploading} style={{
//                 background: 'none', border: 'none', cursor: 'pointer',
//                 color: '#80868b', fontSize: 18, padding: '8px 6px',
//                 opacity: uploading ? .5 : 1, transition: 'color .15s',
//               }} title="Attach file">
//                 {uploading ? '⏳' : '📎'}
//               </button>
//               <input ref={fileRef} type="file" style={{ display: 'none' }} onChange={handleFile}
//                 accept="image/*,.pdf,.doc,.docx,.txt,.zip" />
//               <button onClick={() => send()} disabled={!input.trim()} className="send-btn" style={{
//                 background: input.trim() ? '#1a73e8' : 'transparent',
//                 border: 'none', borderRadius: '50%',
//                 width: 36, height: 36, margin: '6px 8px',
//                 cursor: input.trim() ? 'pointer' : 'not-allowed',
//                 color: input.trim() ? '#fff' : '#bdc1c6',
//                 display: 'flex', alignItems: 'center', justifyContent: 'center',
//                 fontSize: 16, flexShrink: 0, transition: 'all .15s',
//               }}>➤</button>
//             </div>
//             <div style={{ fontSize: 11, color: '#80868b', marginTop: 4, paddingLeft: 14 }}>
//               Enter to send · Shift+Enter for new line · 📎 attach files
//             </div>
//           </div>
//         </div>
//       ) : (
//         <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: '#80868b', background: '#f8f9fa' }}>
//           <div style={{ fontSize: 64, marginBottom: 20 }}>💬</div>
//           <div style={{ fontSize: 22, fontWeight: 600, color: '#1f1f1f', marginBottom: 8 }}>
//             Select a conversation
//           </div>
//           <div style={{ fontSize: 14, textAlign: 'center', maxWidth: 300 }}>
//             Choose someone from the left to start chatting. Messages are private and real-time.
//           </div>
//           <button
//             onClick={() => setShowCreateGroup(true)}
//             style={{
//               marginTop: 20,
//               background: '#1a73e8',
//               color: '#fff',
//               border: 'none',
//               borderRadius: 24,
//               padding: '10px 20px',
//               fontSize: 14,
//               fontWeight: 600,
//               cursor: 'pointer'
//             }}
//           >
//             + Create New Group
//           </button>
//         </div>
//       )}

//       {/* Create Group Modal */}
//       {showCreateGroup && (
//         <div className="modal-overlay" onClick={() => setShowCreateGroup(false)}>
//           <div className="modal-content" onClick={e => e.stopPropagation()}>
//             <div className="modal-header">
//               <span className="modal-title">Create New Group</span>
//               <button className="modal-close" onClick={() => setShowCreateGroup(false)}>×</button>
//             </div>
            
//             <input
//               type="text"
//               placeholder="Group Name"
//               value={newGroupName}
//               onChange={(e) => setNewGroupName(e.target.value)}
//               style={{
//                 width: '100%',
//                 padding: '12px',
//                 borderRadius: 8,
//                 border: '1px solid #dadce0',
//                 fontSize: 14,
//                 marginBottom: 16,
//                 boxSizing: 'border-box'
//               }}
//             />
            
//             <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 8, color: '#1f1f1f' }}>
//               Select Members ({selectedMembers.length} selected)
//             </div>
            
//             <div className="member-select">
//               {allUsers.filter(u => u.id !== user?.id).map(member => (
//                 <div
//                   key={member.id}
//                   className="member-item"
//                   onClick={() => {
//                     if (selectedMembers.includes(member.id)) {
//                       setSelectedMembers(selectedMembers.filter(id => id !== member.id))
//                     } else {
//                       setSelectedMembers([...selectedMembers, member.id])
//                     }
//                   }}
//                 >
//                   <input
//                     type="checkbox"
//                     checked={selectedMembers.includes(member.id)}
//                     onChange={() => {}}
//                     className="member-checkbox"
//                   />
//                   <Avatar name={member.name || member.email} size={28} />
//                   <span style={{ marginLeft: 10, fontSize: 14 }}>{member.name || member.email}</span>
//                 </div>
//               ))}
//             </div>
            
//             <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end', marginTop: 20 }}>
//               <button
//                 onClick={() => setShowCreateGroup(false)}
//                 style={{
//                   padding: '8px 16px',
//                   borderRadius: 20,
//                   border: '1px solid #dadce0',
//                   background: '#fff',
//                   cursor: 'pointer',
//                   fontSize: 13
//                 }}
//               >
//                 Cancel
//               </button>
//               <button
//                 onClick={createGroup}
//                 disabled={creatingGroup || !newGroupName.trim() || selectedMembers.length === 0}
//                 style={{
//                   padding: '8px 20px',
//                   borderRadius: 20,
//                   border: 'none',
//                   background: (!newGroupName.trim() || selectedMembers.length === 0) ? '#ccc' : '#1a73e8',
//                   color: '#fff',
//                   cursor: (!newGroupName.trim() || selectedMembers.length === 0) ? 'not-allowed' : 'pointer',
//                   fontSize: 13,
//                   fontWeight: 600
//                 }}
//               >
//                 {creatingGroup ? 'Creating...' : 'Create Group'}
//               </button>
//             </div>
//           </div>
//         </div>
//       )}

//       <style>{`
//         @keyframes tdot {
//           0%,60%,100% { transform:translateY(0); opacity:.6; }
//           30% { transform:translateY(-4px); opacity:1; }
//         }
//       `}</style>
//     </div>
//   )
// }

// export default ChatPage



import React, { useEffect, useRef, useState, useCallback } from 'react'
import { useSearchParams } from 'react-router-dom'
import { io } from 'socket.io-client'
import axios from 'axios'
import { useAuth } from '../../context/AuthContext'

const SOCKET_URL = process.env.REACT_APP_SOCKET_URL || 'http://localhost:5000'
const API        = process.env.REACT_APP_API_URL    || 'http://localhost:5000/api'

const ROLE_META = {
  admin:           { color: '#b45309', bg: '#fef3c7', label: 'Admin' },
  company_manager: { color: '#1558d6', bg: '#e8f0fe', label: 'Company' },
  employee:        { color: '#137333', bg: '#e6f4ea', label: 'Employee' },
}

const QUICK_REPLIES = ['Any issue?', 'Please check', 'Thanks', 'Noted', 'On it!', 'Will update soon']
const EMOJI_LIST    = ['👍','❤️','😂','😮','😢','🎉','🔥','👏','✅','💯','🙌','😍']

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

const Avatar = ({ name, src, size = 36, online }) => {
  const [imgErr, setImgErr] = useState(false)
  const initials = (name || '?').split('@')[0].slice(0, 2).toUpperCase()
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

const ChatPage = () => {
  const { user } = useAuth()
  const [searchParams, setSearchParams] = useSearchParams()

  const [chats, setChats]                 = useState([])
  const [selectedChat, setSelectedChat]   = useState(null)
  const [messages, setMessages]           = useState([])
  const [input, setInput]                 = useState('')
  const [search, setSearch]               = useState('')
  const [msgSearch, setMsgSearch]         = useState('')
  const [msgSearchOpen, setMsgSearchOpen] = useState(false)
  const [connected, setConnected]         = useState(false)
  const [typing, setTyping]               = useState(false)
  const [onlineMap, setOnlineMap]         = useState({})
  const [uploading, setUploading]         = useState(false)
  const [replyTo, setReplyTo]             = useState(null)
  const [hoveredMsg, setHoveredMsg]       = useState(null)
  const [emojiFor, setEmojiFor]           = useState(null)
  const [loadingMsgs, setLoadingMsgs]     = useState(false)
  const [unreadMap, setUnreadMap]         = useState({})
  const [showDeleteMenu, setShowDeleteMenu] = useState(null)
  const [scrollToBottom, setScrollToBottom] = useState(true)
  
  // Group modal states
  const [showCreateGroup, setShowCreateGroup] = useState(false)
  const [newGroupName, setNewGroupName] = useState('')
  const [selectedMembers, setSelectedMembers] = useState([])
  const [allUsers, setAllUsers] = useState([])
  const [creatingGroup, setCreatingGroup] = useState(false)
  
  // View members modal states
  const [showMembersModal, setShowMembersModal] = useState(false)
  const [groupMembers, setGroupMembers] = useState([])
  const [groupInfo, setGroupInfo] = useState(null)

  const socketRef   = useRef(null)
  const bottomRef   = useRef(null)
  const messagesContainerRef = useRef(null)
  const inputRef    = useRef(null)
  const fileRef     = useRef(null)
  const typingTimer      = useRef(null)
  const selectedChatRef  = useRef(null)

  const myId = user?.id

  // Auto-scroll to bottom
  useEffect(() => {
    if (scrollToBottom && bottomRef.current) {
      bottomRef.current.scrollIntoView({ behavior: 'smooth' })
    }
  }, [messages, scrollToBottom])

  const handleScroll = () => {
    if (messagesContainerRef.current) {
      const { scrollTop, scrollHeight, clientHeight } = messagesContainerRef.current
      const isAtBottom = scrollHeight - scrollTop - clientHeight < 50
      setScrollToBottom(isAtBottom)
    }
  }

  const sortChatsByLastMessage = (chatsList) => {
    return [...chatsList].sort((a, b) => {
      const timeA = a.last_message_at ? new Date(a.last_message_at) : new Date(0)
      const timeB = b.last_message_at ? new Date(b.last_message_at) : new Date(0)
      return timeB - timeA
    })
  }

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

    // Handle direct messages
    socket.on('dm:message', (msg) => {
      const current = selectedChatRef.current
      if (current && current.type === 'direct' && (String(msg.sender_id) === String(current.id) || String(msg.receiver_id) === String(current.id))) {
        setMessages(m => {
          if (m.some(x => x.id === msg.id)) return m
          return [...m, msg]
        })
        if (String(msg.sender_id) === String(current.id)) {
          socket.emit('dm:read', { sender_id: current.id })
          setUnreadMap(prev => ({ ...prev, [current.id]: 0 }))
        }
        setScrollToBottom(true)
      } else {
        setUnreadMap(prev => ({ ...prev, [msg.sender_id]: (prev[msg.sender_id] || 0) + 1 }))
        setChats(prev => {
          const updated = prev.map(chat => {
            if (chat.type === 'direct' && chat.id === msg.sender_id) {
              return { ...chat, last_message: msg.content, last_message_at: msg.created_at, unread_count: (chat.unread_count || 0) + 1 }
            }
            return chat
          })
          return sortChatsByLastMessage(updated)
        })
      }
    })

    // Handle group messages
    socket.on('group:message', (msg) => {
      const current = selectedChatRef.current
      if (current && current.type === 'group' && current.id === msg.group_id) {
        setMessages(m => {
          if (m.some(x => x.id === msg.id)) return m
          return [...m, msg]
        })
        setScrollToBottom(true)
      }
      setChats(prev => {
        const updated = prev.map(chat => {
          if (chat.type === 'group' && chat.id === msg.group_id) {
            return { ...chat, last_message: msg.content, last_message_at: msg.created_at }
          }
          return chat
        })
        return sortChatsByLastMessage(updated)
      })
    })

    // Handle group message delete
    socket.on('group:message_deleted_for_everyone', ({ message_id, content }) => {
      setMessages(prev => prev.map(m => 
        m.id === message_id ? { ...m, content: content, is_deleted_for_everyone: true } : m
      ))
    })

    socket.on('dm:reactions_update', ({ message_id, reactions }) => {
      setMessages(prev => prev.map(m => m.id === message_id ? { ...m, reactions } : m))
    })

    socket.on('group:reactions_update', ({ message_id, reactions }) => {
      setMessages(prev => prev.map(m => m.id === message_id ? { ...m, reactions } : m))
    })

    socket.on('dm:message_deleted_for_everyone', ({ message_id, content }) => {
      setMessages(prev => prev.map(m => 
        m.id === message_id ? { ...m, content, is_deleted_for_everyone: true } : m
      ))
    })

    socket.on('dm:typing', ({ from_user_id, name }) => {
      if (selectedChatRef.current?.type === 'direct' && selectedChatRef.current?.id === from_user_id) {
        setTyping(true)
        clearTimeout(typingTimer.current)
        typingTimer.current = setTimeout(() => setTyping(false), 2000)
      }
    })

    socket.on('group:typing', ({ name }) => {
      if (selectedChatRef.current?.type === 'group') {
        setTyping(true)
        clearTimeout(typingTimer.current)
        typingTimer.current = setTimeout(() => setTyping(false), 2000)
      }
    })

    socket.on('dm:online', ({ user_id, online }) => {
      setOnlineMap(prev => ({ ...prev, [user_id]: online }))
    })

    socketRef.current = socket
    return () => { socket.disconnect(); clearTimeout(typingTimer.current) }
  }, [user])

  // ── Fetch all chats ──────────────────────────────────────────────────────
  const fetchAllChats = useCallback(async () => {
    try {
      const usersRes = await axios.get(`${API}/direct-chat/users`, {
        headers: { Authorization: `Bearer ${getToken()}` }
      })
      const usersList = (usersRes.data.data || []).map(u => ({ ...u, type: 'direct' }))
      
      const groupsRes = await axios.get(`${API}/direct-chat/groups`, {
        headers: { Authorization: `Bearer ${getToken()}` }
      })
      const groupsList = (groupsRes.data.data || []).map(g => ({ ...g, type: 'group' }))
      
      const allChats = sortChatsByLastMessage([...usersList, ...groupsList])
      setChats(allChats)
      
      const um = {}
      allChats.forEach(chat => { if (chat.unread_count > 0) um[chat.id] = chat.unread_count })
      setUnreadMap(um)

      const uid = searchParams.get('user')
      if (uid) {
        const found = allChats.find(chat => chat.id === uid)
        if (found) selectChat(found)
      }
    } catch (err) { console.error('[Chat] fetch chats error:', err) }
  }, [searchParams])

  const fetchAllUsers = useCallback(async () => {
    try {
      const res = await axios.get(`${API}/direct-chat/users`, {
        headers: { Authorization: `Bearer ${getToken()}` }
      })
      setAllUsers(res.data.data || [])
    } catch (err) { console.error('[Chat] fetch users error:', err) }
  }, [])

  useEffect(() => { fetchAllChats() }, [fetchAllChats])
  useEffect(() => { fetchAllUsers() }, [])

  // ── Select chat ──────────────────────────────────────────────────────────
  const selectChat = useCallback(async (chat) => {
    setSelectedChat(chat)
    selectedChatRef.current = chat
    setMessages([])
    setLoadingMsgs(true)
    setReplyTo(null)
    setSearchParams({ user: chat.id, type: chat.type })
    setTyping(false)
    setScrollToBottom(true)

    setUnreadMap(prev => ({ ...prev, [chat.id]: 0 }))
    setChats(prev => {
      const updated = prev.map(c => c.id === chat.id ? { ...c, unread_count: 0 } : c)
      return sortChatsByLastMessage(updated)
    })

    try {
      let url
      if (chat.type === 'direct') {
        url = `${API}/direct-chat/messages/${chat.id}`
        socketRef.current?.emit('dm:read', { sender_id: chat.id })
      } else {
        url = `${API}/direct-chat/groups/${chat.id}/messages`
        socketRef.current?.emit('group:join', { group_id: chat.id, user })
      }
      
      const res = await axios.get(url, {
        headers: { Authorization: `Bearer ${getToken()}` }
      })
      setMessages(res.data.data || [])
    } catch (err) { console.error('[Chat] fetch messages:', err) }
    finally { setLoadingMsgs(false); setTimeout(() => inputRef.current?.focus(), 100) }
  }, [setSearchParams, user])

  // ── View group members ───────────────────────────────────────────────────
  const viewGroupMembers = async (groupId) => {
    try {
      const response = await axios.get(`${API}/direct-chat/groups/${groupId}`, {
        headers: { Authorization: `Bearer ${getToken()}` }
      });
      if (response.data.success) {
        setGroupInfo(response.data.data);
        setGroupMembers(response.data.data.members || []);
        setShowMembersModal(true);
      }
    } catch (err) {
      console.error('[Chat] fetch group members error:', err);
      alert('Failed to load group members');
    }
  };

  // ── Send message ──────────────────────────────────────────────────────────
  const send = (extra = {}) => {
    if (!selectedChat) return
    const content = input.trim()
    if (!content && !extra.file_url) return

    if (selectedChat.type === 'direct') {
      socketRef.current?.emit('dm:send', {
        receiver_id: selectedChat.id,
        content,
        sender: user,
        ...extra,
      })
    } else {
      socketRef.current?.emit('group:send', {
        group_id: selectedChat.id,
        content,
        file_url: extra.file_url,
        file_name: extra.file_name,
        file_type: extra.file_type,
        sender: user,
      })
    }
    
    setInput('')
    setReplyTo(null)
    
    setChats(prev => {
      const updated = prev.map(chat =>
        chat.id === selectedChat.id
          ? { ...chat, last_message: content || extra.file_name, last_message_at: new Date().toISOString(), unread_count: 0 }
          : chat
      )
      return sortChatsByLastMessage(updated)
    })
  }

  // ── Create group ──────────────────────────────────────────────────────────
  const createGroup = async () => {
    if (!newGroupName.trim() || selectedMembers.length === 0) {
      alert('Please enter group name and select at least one member')
      return
    }

    setCreatingGroup(true)
    try {
      const response = await axios.post(`${API}/direct-chat/groups`, {
        name: newGroupName,
        description: '',
        member_ids: selectedMembers
      }, {
        headers: { Authorization: `Bearer ${getToken()}` }
      })

      if (response.data.success) {
        setShowCreateGroup(false)
        setNewGroupName('')
        setSelectedMembers([])
        fetchAllChats()
      }
    } catch (err) {
      console.error('[Chat] create group error:', err)
      alert('Failed to create group')
    } finally {
      setCreatingGroup(false)
    }
  }

  // ── Delete DM for me ──────────────────────────────────────────────────────
  const deleteForMe = async (messageId, otherUserId) => {
    try {
      const response = await axios.delete(`${API}/direct-chat/messages/${messageId}/for-me`, {
        headers: { Authorization: `Bearer ${getToken()}` }
      })
      if (response.data.success) {
        setMessages(prev => prev.filter(m => m.id !== messageId))
        socketRef.current?.emit('dm:delete_for_me', { message_id: messageId, receiver_id: otherUserId, sender: user })
      }
    } catch (err) { console.error(err); alert('Failed to delete message') }
    setShowDeleteMenu(null)
  }

  // ── Delete DM for everyone ────────────────────────────────────────────────
  const deleteForEveryone = async (messageId) => {
    const confirm = window.confirm('⚠️ Delete this message for everyone? This action cannot be undone.')
    if (!confirm) return

    try {
      const response = await axios.delete(`${API}/direct-chat/messages/${messageId}/for-everyone`, {
        headers: { Authorization: `Bearer ${getToken()}` }
      })
      if (response.data.success) {
        setMessages(prev => prev.map(m => m.id === messageId ? { ...m, content: 'This message was deleted', is_deleted_for_everyone: true } : m))
        socketRef.current?.emit('dm:delete_for_everyone', { message_id: messageId, receiver_id: selectedChat?.id, sender: user })
      }
    } catch (err) { console.error(err); alert('Failed to delete message') }
    setShowDeleteMenu(null)
  }

  // ── Delete group message for everyone ─────────────────────────────────────
  const deleteGroupMessageForEveryone = async (messageId, groupId) => {
    const confirm = window.confirm('⚠️ Delete this message for everyone? This action cannot be undone.')
    if (!confirm) return

    try {
      const response = await axios.delete(`${API}/direct-chat/groups/messages/${messageId}/for-everyone`, {
        headers: { Authorization: `Bearer ${getToken()}` }
      });
      
      if (response.data.success) {
        setMessages(prev => prev.map(m => 
          m.id === messageId 
            ? { ...m, content: 'This message was deleted', is_deleted_for_everyone: true }
            : m
        ));
        
        socketRef.current?.emit('group:delete_for_everyone', {
          message_id: messageId,
          group_id: groupId,
          sender: user
        });
      }
    } catch (err) {
      console.error('[Chat] delete group message error:', err);
      alert('Failed to delete message');
    }
    setShowDeleteMenu(null);
  };

  const handleKey = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send() }
  }

  const handleTyping = () => {
    if (!selectedChat) return
    if (selectedChat.type === 'direct') {
      socketRef.current?.emit('dm:typing', { receiver_id: selectedChat.id, name: user?.email })
    } else {
      socketRef.current?.emit('group:typing', { group_id: selectedChat.id, name: user?.email })
    }
  }

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

  const react = (messageId, emoji) => {
    if (!selectedChat) return
    if (selectedChat.type === 'direct') {
      socketRef.current?.emit('dm:react', { message_id: messageId, emoji, receiver_id: selectedChat.id, sender: user })
    } else {
      socketRef.current?.emit('group:react', { message_id: messageId, emoji, group_id: selectedChat.id, sender: user })
    }
    setEmojiFor(null)
  }

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

  const filteredChats = chats.filter(chat =>
    !search ||
    chat.name?.toLowerCase().includes(search.toLowerCase()) ||
    chat.email?.toLowerCase().includes(search.toLowerCase())
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
        .delete-menu { position: absolute; right: 0; bottom: 30px; background: white; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.15); z-index: 100; overflow: hidden; min-width: 140px; }
        .delete-menu button { display: block; width: 100%; padding: 10px 16px; border: none; background: white; text-align: left; cursor: pointer; font-size: 13px; }
        .delete-menu button:hover { background: #f1f3f4; }
        .delete-menu .delete-for-everyone { color: #d93025; border-top: 1px solid #e8eaed; }
        .group-badge { background: #e8f0fe; color: #1a73e8; border-radius: 4px; font-size: 10px; padding: 2px 6px; margin-left: 8px; }
        .modal-overlay { position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.5); display: flex; align-items: center; justify-content: center; z-index: 1000; }
        .modal-content { background: white; border-radius: 12px; width: 450px; max-width: 90%; padding: 24px; max-height: 80vh; overflow-y: auto; }
        .modal-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; }
        .modal-title { font-size: 20px; font-weight: 700; }
        .modal-close { background: none; border: none; font-size: 24px; cursor: pointer; }
        .member-select { max-height: 300px; overflow-y: auto; margin: 16px 0; border: 1px solid #e8eaed; border-radius: 8px; padding: 8px; }
        .member-item { display: flex; align-items: center; justify-content: space-between; padding: 8px; border-radius: 8px; }
        .member-item:hover { background: #f1f3f4; }
        .member-info { display: flex; align-items: center; gap: 10px; }
        .member-checkbox { margin-right: 12px; }
        .role-badge { padding: 2px 8px; border-radius: 12px; font-size: 10px; font-weight: 600; }
        .role-creator { background: #fef3c7; color: #b45309; }
        .role-admin { background: #e8f0fe; color: #1a73e8; }
        .role-member { background: #f1f3f4; color: #5f6368; }
      `}</style>

      {/* ════════════════ LEFT SIDEBAR ════════════════ */}
      <div style={{
        width: 320, flexShrink: 0,
        borderRight: '1px solid #e8eaed',
        display: 'flex', flexDirection: 'column',
        background: '#fff',
      }}>
        <div style={{ padding: '14px 16px 10px', borderBottom: '1px solid #e8eaed' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
            <span style={{ fontSize: 18, fontWeight: 700, color: '#1f1f1f', flex: 1 }}>Chats</span>
            {totalUnread > 0 && (
              <span style={{
                background: '#1a73e8', color: '#fff', borderRadius: 10,
                fontSize: 11, fontWeight: 700, padding: '2px 7px',
              }}>{totalUnread}</span>
            )}
            <button
              onClick={() => setShowCreateGroup(true)}
              style={{
                background: '#1a73e8',
                border: 'none',
                borderRadius: 20,
                color: '#fff',
                cursor: 'pointer',
                fontSize: 12,
                padding: '6px 12px',
                fontWeight: 600
              }}
            >
              + New Group
            </button>
            <span style={{
              width: 8, height: 8, borderRadius: '50%',
              background: connected ? '#34a853' : '#ea4335',
              display: 'inline-block',
            }} title={connected ? 'Connected' : 'Offline'} />
          </div>
          <div style={{ position: 'relative' }}>
            <span style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: '#80868b', fontSize: 14 }}>🔍</span>
            <input value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Search chats…"
              style={{
                width: '100%', padding: '7px 10px 7px 30px',
                borderRadius: 20, border: '1px solid #e8eaed',
                fontSize: 13, outline: 'none', background: '#f8f9fa',
                color: '#1f1f1f', boxSizing: 'border-box',
              }} />
          </div>
        </div>

        <div style={{ flex: 1, overflowY: 'auto' }}>
          {filteredChats.length === 0 && (
            <div style={{ padding: 24, textAlign: 'center', color: '#80868b', fontSize: 13 }}>
              {search ? 'No results' : 'No chats yet'}
            </div>
          )}
          {filteredChats.map(chat => {
            const isSelected = selectedChat?.id === chat.id
            const isOnline = chat.type === 'direct' ? (onlineMap[chat.id] ?? false) : false
            const unread = unreadMap[chat.id] || 0
            
            return (
              <div key={`${chat.type}-${chat.id}`}
                className={`chat-user-row${isSelected ? ' active' : ''}`}
                onClick={() => selectChat(chat)}
                style={{
                  padding: '10px 14px', cursor: 'pointer',
                  display: 'flex', alignItems: 'center', gap: 10,
                  background: isSelected ? '#e8f0fe' : 'transparent',
                  borderLeft: isSelected ? '3px solid #1a73e8' : '3px solid transparent',
                  transition: 'all .1s',
                }}>
                <Avatar name={chat.name || chat.email} src={chat.avatar_url} size={36} online={isOnline} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: 13, fontWeight: unread > 0 ? 700 : 500, color: '#1f1f1f', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 130 }}>
                      {chat.name || chat.email}
                      {chat.type === 'group' && <span className="group-badge">Group</span>}
                    </span>
                    <span style={{ fontSize: 11, color: '#80868b', whiteSpace: 'nowrap', marginLeft: 4 }}>
                      {chat.last_message_at ? timeStr(chat.last_message_at) : ''}
                    </span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 2 }}>
                    <span style={{
                      fontSize: 12, color: unread > 0 ? '#1f1f1f' : '#80868b',
                      fontWeight: unread > 0 ? 600 : 400,
                      overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 150,
                    }}>
                      {chat.type === 'group' && `👥 ${chat.member_count || 0} members · `}
                      {chat.last_message || (chat.type === 'group' ? 'No messages yet' : (ROLE_META[chat.role]?.label || chat.role))}
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
      {selectedChat ? (
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
          {/* Chat Header */}
          <div style={{
            height: 58, padding: '0 18px',
            borderBottom: '1px solid #e8eaed',
            display: 'flex', alignItems: 'center', gap: 12,
            background: '#fff', flexShrink: 0,
          }}>
            <Avatar name={selectedChat.name || selectedChat.email} src={selectedChat.avatar_url}
              size={38} online={selectedChat.type === 'direct' ? (onlineMap[selectedChat.id] ?? false) : false} />
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 15, fontWeight: 700, color: '#1f1f1f', display: 'flex', alignItems: 'center', gap: 8 }}>
                {selectedChat.name || selectedChat.email}
                {selectedChat.type === 'group' && selectedChat.member_count !== undefined && (
                  <button
                    onClick={() => viewGroupMembers(selectedChat.id)}
                    style={{
                      background: '#e8f0fe',
                      border: 'none',
                      borderRadius: 16,
                      padding: '4px 12px',
                      fontSize: 11,
                      color: '#1a73e8',
                      cursor: 'pointer',
                      fontWeight: 500
                    }}
                  >
                    {selectedChat.member_count} members
                  </button>
                )}
              </div>
              <div style={{ fontSize: 12, color: '#80868b', display: 'flex', alignItems: 'center', gap: 6 }}>
                {selectedChat.type === 'direct' ? (
                  <>
                    <span style={{ padding: '1px 7px', borderRadius: 10, fontSize: 10, fontWeight: 700, background: ROLE_META[selectedChat.role]?.bg, color: ROLE_META[selectedChat.role]?.color }}>
                      {ROLE_META[selectedChat.role]?.label || selectedChat.role}
                    </span>
                    {onlineMap[selectedChat.id]
                      ? <span style={{ color: '#34a853' }}>● Active now</span>
                      : <span>● Offline</span>}
                  </>
                ) : (
                  <span>Group Chat • {selectedChat.member_count || 0} members</span>
                )}
              </div>
            </div>
            <button onClick={() => { setMsgSearchOpen(p => !p); setMsgSearch('') }} style={{
              background: 'none', border: 'none', cursor: 'pointer',
              color: msgSearchOpen ? '#1a73e8' : '#80868b', fontSize: 18, padding: 6, borderRadius: 4,
            }}>🔍</button>
          </div>

          {msgSearchOpen && (
            <div style={{ padding: '6px 16px', background: '#f8f9fa', borderBottom: '1px solid #e8eaed' }}>
              <input autoFocus value={msgSearch} onChange={e => setMsgSearch(e.target.value)}
                placeholder="Search in conversation…"
                style={{ width: '100%', padding: '6px 12px', borderRadius: 8, border: '1px solid #dadce0', fontSize: 13, outline: 'none', boxSizing: 'border-box' }} />
            </div>
          )}

          {/* Messages Container */}
          <div 
            ref={messagesContainerRef}
            onScroll={handleScroll}
            style={{ flex: 1, overflowY: 'auto', padding: '10px 0', background: '#fff' }}
            onClick={() => { setEmojiFor(null); setShowDeleteMenu(null) }}>
            {loadingMsgs ? (
              <div style={{ textAlign: 'center', padding: 40, color: '#80868b' }}>Loading…</div>
            ) : (
              <>
                {Object.entries(grouped).map(([date, msgs]) => (
                  <div key={date}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 20px' }}>
                      <div style={{ flex: 1, height: 1, background: '#e8eaed' }} />
                      <span style={{ fontSize: 11, color: '#80868b', fontWeight: 600, whiteSpace: 'nowrap' }}>{date}</span>
                      <div style={{ flex: 1, height: 1, background: '#e8eaed' }} />
                    </div>

                    {msgs.map((msg, i) => {
                      const isMe = msg.sender_id === myId
                      const prev = msgs[i - 1]
                      const sameUser = prev && prev.sender_id === msg.sender_id &&
                                        (new Date(msg.created_at) - new Date(prev.created_at)) < 120000
                      const rxGroups = groupReactions(msg.reactions)
                      const fileUrl = msg.file_url?.startsWith('http')
                                          ? msg.file_url : `http://localhost:5000${msg.file_url}`
                      
                      const canDeleteForEveryone = user?.role === 'admin' || msg.sender_id === myId

                      if (msg.is_deleted_for_everyone) {
                        return (
                          <div key={msg.id} style={{ padding: '8px 20px', textAlign: 'center' }}>
                            <div style={{
                              display: 'inline-block',
                              padding: '6px 14px',
                              background: '#f1f3f4',
                              borderRadius: 16,
                              fontSize: 12,
                              color: '#80868b',
                              fontStyle: 'italic'
                            }}>
                              🗑️ This message was deleted
                            </div>
                          </div>
                        )
                      }

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
                          onMouseLeave={() => { setHoveredMsg(null); setShowDeleteMenu(null) }}>

                          <div style={{ width: 36, flexShrink: 0 }}>
                            {!sameUser && !isMe && selectedChat.type === 'direct' && (
                              <Avatar name={selectedChat.name || selectedChat.email}
                                src={selectedChat.avatar_url} size={36} />
                            )}
                            {!sameUser && !isMe && selectedChat.type === 'group' && (
                              <Avatar name={msg.sender_name || msg.sender_email} size={36} />
                            )}
                          </div>

                          <div style={{ maxWidth: '65%', display: 'flex', flexDirection: 'column', alignItems: isMe ? 'flex-end' : 'flex-start' }}>
                            {!sameUser && !isMe && selectedChat.type === 'group' && (
                              <div style={{ fontSize: 12, color: '#80868b', marginBottom: 3 }}>
                                <b style={{ color: '#1f1f1f' }}>{msg.sender_name || msg.sender_email}</b>
                                &nbsp;&nbsp;{timeStr(msg.created_at)}
                              </div>
                            )}
                            {!sameUser && !isMe && selectedChat.type === 'direct' && (
                              <div style={{ fontSize: 12, color: '#80868b', marginBottom: 3 }}>
                                <b style={{ color: '#1f1f1f' }}>{selectedChat.name || selectedChat.email}</b>
                                &nbsp;&nbsp;{timeStr(msg.created_at)}
                              </div>
                            )}
                            {!sameUser && isMe && (
                              <div style={{ fontSize: 12, color: '#80868b', marginBottom: 3, textAlign: 'right' }}>
                                {timeStr(msg.created_at)}
                              </div>
                            )}

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

                            {Object.keys(rxGroups).length > 0 && (
                              <div style={{ display: 'flex', gap: 4, marginTop: 4, flexWrap: 'wrap' }}>
                                {Object.entries(rxGroups).map(([emoji, users]) => (
                                  <ReactionPill key={emoji} emoji={emoji} users={users} myId={myId}
                                    onClick={e => { e.stopPropagation(); react(msg.id, emoji) }} />
                                ))}
                              </div>
                            )}
                          </div>

                          {/* Delete Menu */}
                          {hoveredMsg === msg.id && (
                            <div style={{ position: 'relative' }}>
                              <button
                                onClick={(e) => { e.stopPropagation(); setShowDeleteMenu(showDeleteMenu === msg.id ? null : msg.id) }}
                                style={{
                                  background: '#fff', border: '1px solid #e8eaed', borderRadius: 20,
                                  cursor: 'pointer', fontSize: 14, padding: '4px 8px',
                                  color: '#5f6368', marginLeft: isMe ? 0 : 8, marginRight: isMe ? 8 : 0,
                                }}
                              >
                                ⋮
                              </button>
                              
                              {showDeleteMenu === msg.id && (
                                <div className="delete-menu" style={{ right: isMe ? 0 : 'auto', left: isMe ? 'auto' : 0 }}>
                                  {selectedChat?.type === 'group' ? (
                                    <>
                                      {(user?.role === 'admin' || msg.sender_id === myId) && (
                                        <button className="delete-for-everyone" onClick={() => deleteGroupMessageForEveryone(msg.id, selectedChat.id)}>
                                          ⚠️ Delete for everyone
                                        </button>
                                      )}
                                      {user?.role !== 'admin' && msg.sender_id !== myId && (
                                        <div style={{ padding: '10px 16px', color: '#80868b', fontSize: 12 }}>
                                          Only admins can delete messages
                                        </div>
                                      )}
                                    </>
                                  ) : (
                                    <>
                                      <button onClick={() => deleteForMe(msg.id, selectedChat.id)}>
                                        🗑️ Delete for me
                                      </button>
                                      {(user?.role === 'admin' || msg.sender_id === myId) && (
                                        <button className="delete-for-everyone" onClick={() => deleteForEveryone(msg.id)}>
                                          ⚠️ Delete for everyone
                                        </button>
                                      )}
                                    </>
                                  )}
                                </div>
                              )}
                            </div>
                          )}

                          {/* Reaction Toolbar */}
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

                {filteredMsgs.length === 0 && !loadingMsgs && (
                  <div style={{ textAlign: 'center', padding: '60px 20px', color: '#80868b' }}>
                    <Avatar name={selectedChat.name || selectedChat.email} src={selectedChat.avatar_url} size={64} />
                    <div style={{ fontSize: 16, fontWeight: 600, marginTop: 14, color: '#1f1f1f' }}>
                      {selectedChat.name || selectedChat.email}
                    </div>
                    <div style={{ fontSize: 13, marginTop: 6 }}>
                      {msgSearch ? `No messages matching "${msgSearch}"` : 'Start a conversation!'}
                    </div>
                  </div>
                )}

                {typing && (
                  <div style={{ padding: '4px 20px 8px', display: 'flex', alignItems: 'center', gap: 10 }}>
                    <Avatar name={selectedChat.name} size={24} />
                    <div style={{
                      background: '#f1f3f4', borderRadius: '12px 12px 12px 4px',
                      padding: '8px 12px', display: 'flex', gap: 4, alignItems: 'center',
                    }}>
                      <span style={{ fontSize: 12, color: '#667781' }}>typing</span>
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

          {/* Input Area */}
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
                placeholder={`Message ${selectedChat.name || selectedChat.email}…`}
                rows={1}
                style={{
                  flex: 1, padding: '10px 14px', border: 'none', outline: 'none',
                  background: 'transparent', fontSize: 14, resize: 'none',
                  lineHeight: 1.5, maxHeight: 100, overflowY: 'auto',
                  fontFamily: 'inherit', color: '#1f1f1f',
                }}
              />
              <button onClick={() => fileRef.current?.click()} disabled={uploading} style={{
                background: 'none', border: 'none', cursor: 'pointer',
                color: '#80868b', fontSize: 18, padding: '8px 6px',
                opacity: uploading ? .5 : 1, transition: 'color .15s',
              }} title="Attach file">
                {uploading ? '⏳' : '📎'}
              </button>
              <input ref={fileRef} type="file" style={{ display: 'none' }} onChange={handleFile}
                accept="image/*,.pdf,.doc,.docx,.txt,.zip" />
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
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: '#80868b', background: '#f8f9fa' }}>
          <div style={{ fontSize: 64, marginBottom: 20 }}>💬</div>
          <div style={{ fontSize: 22, fontWeight: 600, color: '#1f1f1f', marginBottom: 8 }}>
            Select a conversation
          </div>
          <div style={{ fontSize: 14, textAlign: 'center', maxWidth: 300 }}>
            Choose someone from the left to start chatting. Messages are private and real-time.
          </div>
          <button
            onClick={() => setShowCreateGroup(true)}
            style={{
              marginTop: 20,
              background: '#1a73e8',
              color: '#fff',
              border: 'none',
              borderRadius: 24,
              padding: '10px 20px',
              fontSize: 14,
              fontWeight: 600,
              cursor: 'pointer'
            }}
          >
            + Create New Group
          </button>
        </div>
      )}

      {/* Create Group Modal */}
      {showCreateGroup && (
        <div className="modal-overlay" onClick={() => setShowCreateGroup(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <span className="modal-title">Create New Group</span>
              <button className="modal-close" onClick={() => setShowCreateGroup(false)}>×</button>
            </div>
            
            <input
              type="text"
              placeholder="Group Name"
              value={newGroupName}
              onChange={(e) => setNewGroupName(e.target.value)}
              style={{
                width: '100%',
                padding: '12px',
                borderRadius: 8,
                border: '1px solid #dadce0',
                fontSize: 14,
                marginBottom: 16,
                boxSizing: 'border-box'
              }}
            />
            
            <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 8, color: '#1f1f1f' }}>
              Select Members ({selectedMembers.length} selected)
            </div>
            
            <div className="member-select">
              {allUsers.filter(u => u.id !== user?.id).map(member => (
                <div
                  key={member.id}
                  className="member-item"
                  onClick={() => {
                    if (selectedMembers.includes(member.id)) {
                      setSelectedMembers(selectedMembers.filter(id => id !== member.id))
                    } else {
                      setSelectedMembers([...selectedMembers, member.id])
                    }
                  }}
                >
                  <div className="member-info">
                    <input
                      type="checkbox"
                      checked={selectedMembers.includes(member.id)}
                      onChange={() => {}}
                      className="member-checkbox"
                    />
                    <Avatar name={member.name || member.email} size={28} />
                    <span style={{ marginLeft: 10, fontSize: 14 }}>{member.name || member.email}</span>
                  </div>
                </div>
              ))}
            </div>
            
            <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end', marginTop: 20 }}>
              <button
                onClick={() => setShowCreateGroup(false)}
                style={{
                  padding: '8px 16px',
                  borderRadius: 20,
                  border: '1px solid #dadce0',
                  background: '#fff',
                  cursor: 'pointer',
                  fontSize: 13
                }}
              >
                Cancel
              </button>
              <button
                onClick={createGroup}
                disabled={creatingGroup || !newGroupName.trim() || selectedMembers.length === 0}
                style={{
                  padding: '8px 20px',
                  borderRadius: 20,
                  border: 'none',
                  background: (!newGroupName.trim() || selectedMembers.length === 0) ? '#ccc' : '#1a73e8',
                  color: '#fff',
                  cursor: (!newGroupName.trim() || selectedMembers.length === 0) ? 'not-allowed' : 'pointer',
                  fontSize: 13,
                  fontWeight: 600
                }}
              >
                {creatingGroup ? 'Creating...' : 'Create Group'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* View Members Modal */}
      {showMembersModal && groupInfo && (
        <div className="modal-overlay" onClick={() => setShowMembersModal(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()} style={{ width: 400 }}>
            <div className="modal-header">
              <span className="modal-title">Group Members • {groupInfo.member_count}</span>
              <button className="modal-close" onClick={() => setShowMembersModal(false)}>×</button>
            </div>
            
            <div style={{ marginBottom: 16 }}>
              <div style={{ fontSize: 15, fontWeight: 600, color: '#1f1f1f', marginBottom: 4 }}>
                {groupInfo.name}
              </div>
              <div style={{ fontSize: 12, color: '#80868b' }}>
                Created {new Date(groupInfo.created_at).toLocaleDateString()}
              </div>
            </div>
            
            <div className="member-select" style={{ maxHeight: 400 }}>
              {groupMembers.map(member => (
                <div key={member.id} className="member-item">
                  <div className="member-info">
                    <Avatar name={member.name || member.email} size={32} />
                    <div>
                      <div style={{ fontSize: 14, fontWeight: 500 }}>{member.name || member.email}</div>
                      <div style={{ fontSize: 11, color: '#80868b' }}>{member.email}</div>
                    </div>
                  </div>
                  <div>
                    {member.is_creator && (
                      <span className="role-badge role-creator">Creator</span>
                    )}
                    {!member.is_creator && member.member_role === 'admin' && (
                      <span className="role-badge role-admin">Admin</span>
                    )}
                    {!member.is_creator && member.member_role === 'member' && (
                      <span className="role-badge role-member">Member</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
            
            <div style={{ marginTop: 20, display: 'flex', justifyContent: 'flex-end' }}>
              <button
                onClick={() => setShowMembersModal(false)}
                style={{
                  padding: '8px 20px',
                  borderRadius: 20,
                  border: '1px solid #dadce0',
                  background: '#fff',
                  cursor: 'pointer',
                  fontSize: 13
                }}
              >
                Close
              </button>
            </div>
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