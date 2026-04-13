
import React, { useEffect, useRef, useState, useCallback } from 'react';

const ICE_SERVERS = {
  iceServers: [
    { urls: 'stun:stun.l.google.com:19302' },
    { urls: 'stun:stun1.l.google.com:19302' },
  ],
};

const fmt = (s) =>
  `${Math.floor(s / 60).toString().padStart(2, '0')}:${(s % 60).toString().padStart(2, '0')}`;

const WebRTCCall = ({
  mode,      
  callId,
  callType,   
  token,
  apiBase,
  myRole,    
  peerEmail,
  onEnd,
}) => {
  const [status,  setStatus]  = useState(mode === 'caller' ? 'calling' : 'incoming');
  const [seconds, setSeconds] = useState(0);
  const [muted,   setMuted]   = useState(false);
  const [camOff,  setCamOff]  = useState(false);
  const [error,   setError]   = useState(null);

  const pcRef          = useRef(null);
  const localStreamRef = useRef(null);
  const pollRef        = useRef(null);
  const timerRef       = useRef(null);
  const appliedIceRef  = useRef({ caller: 0, callee: 0 });
  const endedRef       = useRef(false);

  const localVideoRef  = useRef(null);
  const remoteVideoRef = useRef(null);

  const rtcMyRole = mode === 'caller' ? 'caller' : 'callee';

  const authHdr = useCallback(() => ({
    Authorization: `Bearer ${token}`,
    'Content-Type': 'application/json',
  }), [token]);
  const api = useCallback((path, opts = {}) => {
    if (!myRole) {
      console.error('WebRTCCall: myRole is undefined!');
      return Promise.reject(new Error('myRole is undefined'));
    }
    return fetch(`${apiBase}/chat/${myRole}/calls/${callId}${path}`, {
      headers: authHdr(), ...opts,
    }).then(r => {
      if (!r.ok) throw new Error(`HTTP ${r.status}`);
      return r.json();
    });
  }, [apiBase, myRole, callId, authHdr]);

  const cleanup = useCallback(() => {
    if (endedRef.current) return;
    endedRef.current = true;
    clearInterval(pollRef.current);
    clearInterval(timerRef.current);
    localStreamRef.current?.getTracks().forEach(t => t.stop());
    pcRef.current?.close();
  }, []);

  const handleEnd = useCallback(async (cancelOnServer = true) => {
    cleanup();
    if (cancelOnServer) {
      try { await api('/cancel', { method: 'POST' }); } catch {}
    }
    onEnd();
  }, [cleanup, api, onEnd]);
  const getMedia = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia(
        callType === 'video' ? { audio: true, video: true } : { audio: true, video: false }
      );
      localStreamRef.current = stream;
      if (localVideoRef.current) localVideoRef.current.srcObject = stream;
      return stream;
    } catch (err) {
      setError('Could not access microphone/camera: ' + err.message);
      return null;
    }
  }, [callType]);
  const createPC = useCallback((stream) => {
    const pc = new RTCPeerConnection(ICE_SERVERS);
    pcRef.current = pc;

    stream?.getTracks().forEach(track => pc.addTrack(track, stream));

    pc.ontrack = (e) => {
      if (remoteVideoRef.current) remoteVideoRef.current.srcObject = e.streams[0];
    };

    pc.onicecandidate = async (e) => {
      if (e.candidate) {
        try {
          await api('/ice', {
            method: 'POST',
            body: JSON.stringify({ candidate: e.candidate, role: rtcMyRole }),
          });
        } catch {}
      }
    };

    pc.onconnectionstatechange = () => {
      if (pc.connectionState === 'connected') {
        setStatus('connected');
        timerRef.current = setInterval(() => setSeconds(s => s + 1), 1000);
      }
      if (['disconnected', 'failed', 'closed'].includes(pc.connectionState)) {
        if (!endedRef.current) handleEnd(false);
      }
    };

    return pc;
  }, [api, rtcMyRole, handleEnd]);


  const applyIce = useCallback(async (candidates, side) => {
    const pc = pcRef.current;
    if (!pc || pc.signalingState === 'closed') return;
    const key = side === 'caller' ? 'caller' : 'callee';
    const start = appliedIceRef.current[key];
    const newOnes = candidates.slice(start);
    for (const c of newOnes) {
      try { await pc.addIceCandidate(new RTCIceCandidate(c)); } catch {}
    }
    appliedIceRef.current[key] = candidates.length;
  }, []);
  const startCaller = useCallback(async () => {
    const stream = await getMedia();
    if (!stream) return;
    const pc = createPC(stream);

    const offer = await pc.createOffer();
    await pc.setLocalDescription(offer);
    for (let i = 0; i < 5; i++) {
      try {
        await api('/offer', { method: 'POST', body: JSON.stringify({ offer }) });
        break;
      } catch {
        if (i === 4) { setError('Failed to post offer to server.'); return; }
        await new Promise(r => setTimeout(r, 1000));
      }
    }

    pollRef.current = setInterval(async () => {
      if (endedRef.current) return;
      try {
        const sig = await api('/signal');
        if (!sig.success) return;

        if (sig.status === 'declined' || sig.status === 'cancelled') {
          setStatus('declined');
          setTimeout(() => handleEnd(false), 2000);
          return;
        }

        if (sig.answer && pc.signalingState === 'have-local-offer') {
          await pc.setRemoteDescription(new RTCSessionDescription(sig.answer));
        }

        if (sig.calleeIce?.length) await applyIce(sig.calleeIce, 'callee');
      } catch {}
    }, 2000);
  }, [getMedia, createPC, api, applyIce, handleEnd]);

 
  const acceptCall = useCallback(async () => {
    setStatus('connecting');
    const stream = await getMedia();
    if (!stream) return;
    const pc = createPC(stream);

  
    let sig = null;
    for (let i = 0; i < 10; i++) {
      if (endedRef.current) return;
      try { sig = await api('/signal'); } catch { break; }
      if (sig?.offer) break;
      await new Promise(r => setTimeout(r, 2000));
    }

    if (!sig?.offer) {
      setError('No offer received. The caller may have hung up.');
      return;
    }

    await pc.setRemoteDescription(new RTCSessionDescription(sig.offer));
    const answer = await pc.createAnswer();
    await pc.setLocalDescription(answer);
    await api('/answer', { method: 'POST', body: JSON.stringify({ answer }) });

    if (sig.callerIce?.length) await applyIce(sig.callerIce, 'caller');

    pollRef.current = setInterval(async () => {
      if (endedRef.current) return;
      try {
        const s = await api('/signal');
        if (s.callerIce?.length) await applyIce(s.callerIce, 'caller');
        if (s.status === 'cancelled' || s.status === 'declined') handleEnd(false);
      } catch {}
    }, 2000);
  }, [getMedia, createPC, api, applyIce, handleEnd]);

  const declineCall = useCallback(async () => {
    cleanup();
    try { await api('/decline', { method: 'POST' }); } catch {}
    onEnd();
  }, [cleanup, api, onEnd]);

  useEffect(() => {
    if (mode === 'caller') startCaller();
    return cleanup;
  }, []); 

  const toggleMute = () => {
    localStreamRef.current?.getAudioTracks().forEach(t => { t.enabled = !t.enabled; });
    setMuted(m => !m);
  };

  const toggleCam = () => {
    localStreamRef.current?.getVideoTracks().forEach(t => { t.enabled = !t.enabled; });
    setCamOff(c => !c);
  };

  const statusText = {
    calling:    'Ringing…',
    incoming:   `Incoming ${callType === 'video' ? 'video' : 'voice'} call`,
    connecting: 'Connecting…',
    connected:  `Connected · ${fmt(seconds)}`,
    declined:   '❌ Call declined / ended',
  };

  return (
    <div style={{
      position: 'fixed', inset: 0, background: 'rgba(10,10,15,.75)',
      backdropFilter: 'blur(10px)', zIndex: 999999,
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
    }}>
    
      {callType === 'video' && status === 'connected' && (
        <div style={{ position: 'fixed', inset: 0, background: '#000', zIndex: -1 }}>
          <video ref={remoteVideoRef} autoPlay playsInline
            style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          <video ref={localVideoRef} autoPlay playsInline muted
            style={{ position: 'absolute', bottom: 120, right: 20, width: 120, height: 90,
                     borderRadius: 10, objectFit: 'cover', border: '2px solid #fff' }} />
        </div>
      )}
   
      <audio ref={remoteVideoRef} autoPlay playsInline style={{ display: 'none' }} />

      <div style={{
        background: '#14141c', border: '1px solid #2a2a38', borderRadius: 20,
        padding: '32px 28px', width: '100%', maxWidth: 340,
        display: 'flex', flexDirection: 'column', alignItems: 'center',
        boxShadow: '0 24px 64px rgba(0,0,0,.5)',
      }}>
    
        <div style={{ position: 'relative', marginBottom: 16 }}>
          {(status === 'calling' || status === 'incoming') && (
            <>
              <div style={{ position: 'absolute', inset: -14, borderRadius: '50%',
                border: '2px solid rgba(99,102,241,.3)',
                animation: 'cbRingPulse 1.8s ease-out infinite' }} />
              <div style={{ position: 'absolute', inset: -26, borderRadius: '50%',
                border: '2px solid rgba(99,102,241,.15)',
                animation: 'cbRingPulse 1.8s ease-out infinite .5s' }} />
            </>
          )}
          <div style={{
            width: 72, height: 72, borderRadius: '50%',
            background: status === 'connected'
              ? 'rgba(74,222,128,.15)'
              : 'linear-gradient(135deg,#6366f1,#818cf8)',
            border: status === 'connected' ? '1px solid rgba(74,222,128,.3)' : 'none',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 28, position: 'relative', zIndex: 1,
          }}>
            {callType === 'video' ? '📹' : '📞'}
          </div>
        </div>

        <div style={{ fontSize: 16, fontWeight: 700, color: '#f0f0f8', marginBottom: 4,
          maxWidth: 260, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', textAlign: 'center' }}>
          {peerEmail || (callType === 'video' ? 'Video Call' : 'Voice Call')}
        </div>

        <div style={{
          fontSize: 12, marginBottom: 28, textAlign: 'center', fontFamily: 'monospace',
          color: status === 'connected' ? '#4ade80'
               : status === 'declined'  ? '#f87171'
               : '#8888a8',
        }}>
          {statusText[status] || status}
        </div>

        {error && (
          <div style={{ fontSize: 11, color: '#f87171', marginBottom: 16, textAlign: 'center' }}>
            {error}
          </div>
        )}

     
        {status === 'incoming' && (
          <div style={{ display: 'flex', gap: 32 }}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
              <button onClick={declineCall} style={{
                width: 58, height: 58, borderRadius: '50%', border: 'none',
                background: '#ef4444', cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                boxShadow: '0 4px 16px rgba(239,68,68,.4)',
              }}>
                <PhoneIcon style={{ transform: 'rotate(135deg)' }} />
              </button>
              <span style={{ fontSize: 11, color: '#55556a', fontFamily: 'monospace' }}>Decline</span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
              <button onClick={acceptCall} style={{
                width: 58, height: 58, borderRadius: '50%', border: 'none',
                background: '#16a34a', cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                boxShadow: '0 4px 16px rgba(22,163,74,.4)',
              }}>
                {callType === 'video' ? <VideoIcon /> : <PhoneIcon />}
              </button>
              <span style={{ fontSize: 11, color: '#16a34a', fontFamily: 'monospace' }}>Accept</span>
            </div>
          </div>
        )}

      
        {status !== 'incoming' && status !== 'declined' && (
          <div style={{ display: 'flex', gap: 20, alignItems: 'center' }}>
            <CtrlBtn onClick={toggleMute} active={muted} title={muted ? 'Unmute' : 'Mute'}>
              {muted ? '🔇' : '🎤'}
            </CtrlBtn>

            <button onClick={() => handleEnd(true)} style={{
              width: 58, height: 58, borderRadius: '50%', border: 'none',
              background: '#ef4444', cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: '0 4px 16px rgba(239,68,68,.4)',
            }}>
              <PhoneIcon style={{ transform: 'rotate(135deg)' }} />
            </button>

            {callType === 'video' && (
              <CtrlBtn onClick={toggleCam} active={camOff} title={camOff ? 'Camera on' : 'Camera off'}>
                {camOff ? '🚫' : '📷'}
              </CtrlBtn>
            )}
          </div>
        )}
      </div>

      <style>{`
        @keyframes cbRingPulse {
          0%  { transform: scale(1);   opacity: .8 }
          100%{ transform: scale(1.7); opacity:  0 }
        }
      `}</style>
    </div>
  );
};

const CtrlBtn = ({ onClick, active, children, title }) => (
  <button onClick={onClick} title={title} style={{
    width: 50, height: 50, borderRadius: '50%', border: '1px solid #2a2a38',
    background: active ? '#374151' : '#1e1e28', color: '#fff', cursor: 'pointer',
    fontSize: 20, display: 'flex', alignItems: 'center', justifyContent: 'center',
    opacity: active ? 0.6 : 1,
  }}>
    {children}
  </button>
);

const PhoneIcon = ({ style = {} }) => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none"
    stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={style}>
    <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.07 9.81
             19.79 19.79 0 011 1.24 2 2 0 013 .06h3a2 2 0 012 1.72c.13.96.36 1.9.7 2.81
             a2 2 0 01-.45 2.11L7.09 7.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45
             c.91.34 1.85.57 2.81.7A2 2 0 0122 14.92z"/>
  </svg>
);

const VideoIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none"
    stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="23 7 16 12 23 17 23 7"/>
    <rect x="1" y="5" width="15" height="14" rx="2" ry="2"/>
  </svg>
);

export default WebRTCCall;