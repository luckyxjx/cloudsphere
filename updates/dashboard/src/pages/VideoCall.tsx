import { useState, useRef, useEffect } from 'react';
import { Video, Mic, MicOff, VideoOff, Phone, PhoneOff, Users, MessageSquare, Share2, Copy, ArrowLeft, MonitorUp, Webcam } from 'lucide-react';
import { io, Socket } from 'socket.io-client';
import { useParams, useNavigate } from 'react-router-dom';

interface PeerConnection {
  peerId: string;
  connection: RTCPeerConnection;
  stream?: MediaStream;
}

function VideoCall() {
  const { roomId } = useParams<{ roomId: string }>();
  const navigate = useNavigate();
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [isCallActive, setIsCallActive] = useState(false);
  const [participants, setParticipants] = useState<string[]>([]);
  const [showRoomId, setShowRoomId] = useState(false);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [roomInput, setRoomInput] = useState('');
  const [videoDevices, setVideoDevices] = useState<MediaDeviceInfo[]>([]);
  const [audioDevices, setAudioDevices] = useState<MediaDeviceInfo[]>([]);
  const [selectedCamId, setSelectedCamId] = useState<string | undefined>(undefined);
  const [selectedMicId, setSelectedMicId] = useState<string | undefined>(undefined);

  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideosRef = useRef<{ [key: string]: HTMLVideoElement }>({});
  const socketRef = useRef<Socket>();
  const localStreamRef = useRef<MediaStream>();
  const screenStreamRef = useRef<MediaStream | null>(null);
  const peerConnectionsRef = useRef<{ [key: string]: PeerConnection }>({});
  const mySocketIdRef = useRef<string | null>(null);
  const politeRef = useRef<{ [key: string]: boolean }>({});

  const SIGNALING_URL = (import.meta as any).env?.VITE_API_URL?.replace(/\/$/, '')
    || `${window.location.protocol}//${window.location.hostname}:3001`;

  const getIceServers = () => {
    const turnUrl = (import.meta as any).env?.VITE_TURN_URL as string | undefined;
    const turnUser = (import.meta as any).env?.VITE_TURN_USERNAME as string | undefined;
    const turnCred = (import.meta as any).env?.VITE_TURN_CREDENTIAL as string | undefined;
    const servers: RTCIceServer[] = [
      { urls: 'stun:stun.l.google.com:19302' },
      { urls: 'stun:stun1.l.google.com:19302' },
    ];
    if (turnUrl && turnUser && turnCred) {
      servers.push({ urls: turnUrl, username: turnUser, credential: turnCred });
    }
    return servers;
  };

  useEffect(() => {
    socketRef.current = io(SIGNALING_URL, { transports: ['websocket', 'polling'] });

    socketRef.current.on('connect', () => {
      mySocketIdRef.current = socketRef.current?.id || null;
      if (roomId) {
        socketRef.current?.emit('join-room', roomId);
      }
    });

    // When a new user joins, existing users will initiate offers (impolite = false)
    socketRef.current.on('user-connected', async (userId: string) => {
      politeRef.current[userId] = false;
      await ensureLocalMedia();
      await createPeerConnection(userId, true);
    });

    socketRef.current.on('user-disconnected', (userId: string) => {
      teardownPeer(userId);
      setParticipants(prev => prev.filter(id => id !== userId));
    });

    // When we join, we receive current users; we are the polite peer and should not initiate offers
    socketRef.current.on('room-users', async (users: string[]) => {
      setParticipants(users);
      users.forEach(uid => { politeRef.current[uid] = true; });
      await ensureLocalMedia();
      // Do NOT create offers here to avoid glare; existing users will call us
    });

    socketRef.current.on('offer', handleOffer);
    socketRef.current.on('answer', handleAnswer);
    socketRef.current.on('ice-candidate', handleIceCandidate);

    return () => {
      socketRef.current?.disconnect();
      mySocketIdRef.current = null;
    };
  }, [roomId]);

  useEffect(() => {
    const loadDevices = async () => {
      try {
        const devices = await navigator.mediaDevices.enumerateDevices();
        const vids = devices.filter(d => d.kind === 'videoinput');
        const auds = devices.filter(d => d.kind === 'audioinput');
        setVideoDevices(vids);
        setAudioDevices(auds);
        if (!selectedCamId && vids[0]) setSelectedCamId(vids[0].deviceId);
        if (!selectedMicId && auds[0]) setSelectedMicId(auds[0].deviceId);
      } catch {}
    };
    loadDevices();
    navigator.mediaDevices.addEventListener?.('devicechange', loadDevices as any);
    return () => navigator.mediaDevices.removeEventListener?.('devicechange', loadDevices as any);
  }, [selectedCamId, selectedMicId]);

  useEffect(() => {
    if (isCallActive) {
      ensureLocalMedia().catch(() => setIsCallActive(false));
    } else {
      cleanupLocalMedia();
    }
  }, [isCallActive]);

  const ensureLocalMedia = async () => {
    if (localStreamRef.current) return;
    const constraints: MediaStreamConstraints = {
      video: selectedCamId ? { deviceId: { exact: selectedCamId }, width: { ideal: 1280 }, height: { ideal: 720 } } : { width: { ideal: 1280 }, height: { ideal: 720 } },
      audio: selectedMicId ? { deviceId: { exact: selectedMicId }, echoCancellation: true, noiseSuppression: true, autoGainControl: true } : { echoCancellation: true, noiseSuppression: true, autoGainControl: true }
    };
    const stream = await navigator.mediaDevices.getUserMedia(constraints);
    localStreamRef.current = stream;
    if (localVideoRef.current) localVideoRef.current.srcObject = stream;
    stream.getAudioTracks().forEach(t => (t.enabled = !isMuted));
    stream.getVideoTracks().forEach(t => (t.enabled = !isVideoOff));
  };

  const switchCamera = async (deviceId: string) => {
    setSelectedCamId(deviceId);
    if (!localStreamRef.current) return;
    try {
      const newStream = await navigator.mediaDevices.getUserMedia({ video: { deviceId: { exact: deviceId } }, audio: false });
      const newTrack = newStream.getVideoTracks()[0];
      const senders = Object.values(peerConnectionsRef.current).flatMap(p => p.connection.getSenders());
      await Promise.all(senders.filter(s => s.track && s.track.kind === 'video').map(sender => sender.replaceTrack(newTrack)));
      const oldTrack = localStreamRef.current.getVideoTracks()[0];
      oldTrack?.stop();
      localStreamRef.current.removeTrack(oldTrack as MediaStreamTrack);
      localStreamRef.current.addTrack(newTrack);
      if (localVideoRef.current) localVideoRef.current.srcObject = localStreamRef.current;
    } catch (e) {
      console.error('Failed to switch camera', e);
    }
  };

  const switchMicrophone = async (deviceId: string) => {
    setSelectedMicId(deviceId);
    if (!localStreamRef.current) return;
    try {
      const newStream = await navigator.mediaDevices.getUserMedia({ audio: { deviceId: { exact: deviceId }, echoCancellation: true, noiseSuppression: true, autoGainControl: true }, video: false });
      const newTrack = newStream.getAudioTracks()[0];
      const senders = Object.values(peerConnectionsRef.current).flatMap(p => p.connection.getSenders());
      await Promise.all(senders.filter(s => s.track && s.track.kind === 'audio').map(sender => sender.replaceTrack(newTrack)));
      const oldTrack = localStreamRef.current.getAudioTracks()[0];
      oldTrack?.stop();
      localStreamRef.current.removeTrack(oldTrack as MediaStreamTrack);
      localStreamRef.current.addTrack(newTrack);
    } catch (e) {
      console.error('Failed to switch microphone', e);
    }
  };

  const cleanupLocalMedia = () => {
    if (screenStreamRef.current) {
      screenStreamRef.current.getTracks().forEach(t => t.stop());
      screenStreamRef.current = null;
    }
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach(track => track.stop());
      localStreamRef.current = undefined;
    }
  };

  const createPeerConnection = async (peerId: string, isInitiator: boolean) => {
    if (peerConnectionsRef.current[peerId]) return peerConnectionsRef.current[peerId].connection;

    const pc = new RTCPeerConnection({ iceServers: getIceServers() });

    localStreamRef.current?.getTracks().forEach(track => pc.addTrack(track, localStreamRef.current!));

    pc.onicecandidate = (event) => {
      if (event.candidate) {
        socketRef.current?.emit('ice-candidate', { target: peerId, candidate: event.candidate });
      }
    };

    pc.onconnectionstatechange = () => {
      const state = pc.connectionState;
      if (state === 'failed' || state === 'disconnected' || state === 'closed') {
        teardownPeer(peerId);
      }
    };

    pc.ontrack = (event) => {
      if (remoteVideosRef.current[peerId]) {
        remoteVideosRef.current[peerId].srcObject = event.streams[0];
      }
    };

    peerConnectionsRef.current[peerId] = { peerId, connection: pc };

    if (isInitiator) {
      const offer = await pc.createOffer({ offerToReceiveAudio: true, offerToReceiveVideo: true });
      await pc.setLocalDescription(offer);
      socketRef.current?.emit('offer', { target: peerId, sdp: pc.localDescription });
    }

    return pc;
  };

  const teardownPeer = (peerId: string) => {
    const pc = peerConnectionsRef.current[peerId]?.connection;
    if (pc) {
      try { pc.close(); } catch {}
    }
    delete peerConnectionsRef.current[peerId];
  };

  const handleOffer = async ({ sdp, from }: { sdp: RTCSessionDescriptionInit; from: string }) => {
    await ensureLocalMedia();
    const pc = await createPeerConnection(from, false);
    const polite = !!politeRef.current[from];

    // Glare handling (perfect negotiation minimal):
    if (pc.signalingState !== 'stable') {
      if (!polite) {
        // We are impolite and in a conflict; ignore this offer
        console.warn('Glare: ignoring remote offer (impolite)');
        return;
      }
      try {
        await pc.setLocalDescription({ type: 'rollback' } as any);
      } catch (e) {
        console.warn('Rollback failed, continuing', e);
      }
    }

    await pc.setRemoteDescription(new RTCSessionDescription(sdp));
    const answer = await pc.createAnswer();
    await pc.setLocalDescription(answer);
    socketRef.current?.emit('answer', { target: from, sdp: pc.localDescription });
  };

  const handleAnswer = async ({ sdp, from }: { sdp: RTCSessionDescriptionInit; from: string }) => {
    const pc = peerConnectionsRef.current[from]?.connection;
    if (!pc) return;
    // Only apply answer when we have a local offer outstanding
    if (pc.signalingState !== 'have-local-offer') {
      console.warn('Ignoring unexpected answer in state', pc.signalingState);
      return;
    }
    await pc.setRemoteDescription(new RTCSessionDescription(sdp));
  };

  const handleIceCandidate = async ({ candidate, from }: { candidate: RTCIceCandidateInit; from: string }) => {
    const pc = peerConnectionsRef.current[from]?.connection;
    if (!pc) return;
    try {
      await pc.addIceCandidate(new RTCIceCandidate(candidate));
    } catch (e) {
      console.error('Error adding ICE candidate', e);
    }
  };

  const toggleMute = () => {
    const next = !isMuted;
    setIsMuted(next);
    localStreamRef.current?.getAudioTracks().forEach(track => { track.enabled = !next; });
  };

  const toggleVideo = () => {
    const next = !isVideoOff;
    setIsVideoOff(next);
    localStreamRef.current?.getVideoTracks().forEach(track => { track.enabled = !next; });
  };

  const toggleCall = async () => {
    if (!isCallActive) {
      setIsCallActive(true);
      if (!roomId) {
        const newRoomId = Math.random().toString(36).substring(2, 8);
        navigate(`/video/${newRoomId}`);
      } else if (socketRef.current?.connected) {
        socketRef.current.emit('join-room', roomId);
      }
    } else {
      Object.keys(peerConnectionsRef.current).forEach(teardownPeer);
      setParticipants([]);
      setIsCallActive(false);
      socketRef.current?.emit('leave-room');
      cleanupLocalMedia();
    }
  };

  const copyRoomId = () => {
    if (roomId) {
      navigator.clipboard.writeText(roomId);
      setShowRoomId(true);
      setTimeout(() => setShowRoomId(false), 2000);
    }
  };

  const startScreenShare = async () => {
    if (isScreenSharing) {
      stopScreenShare();
      return;
    }
    try {
      const gdm = (navigator.mediaDevices as any).getDisplayMedia;
      if (!gdm) throw new Error('Screen sharing not supported in this environment');
      const displayStream = await gdm({ video: true, audio: false });
      screenStreamRef.current = displayStream;
      const screenTrack = displayStream.getVideoTracks()[0];

      for (const { connection } of Object.values(peerConnectionsRef.current)) {
        const sender = connection.getSenders().find(s => s.track && s.track.kind === 'video');
        if (sender) await sender.replaceTrack(screenTrack);
      }

      if (localVideoRef.current) localVideoRef.current.srcObject = displayStream;

      screenTrack.onended = () => { stopScreenShare(); };
      setIsScreenSharing(true);
    } catch (e) {
      console.error('Failed to share screen:', e);
      alert('Screen sharing is not available here. Use the desktop app or a Chromium-based browser over HTTPS.');
    }
  };

  const stopScreenShare = async () => {
    if (!screenStreamRef.current || !localStreamRef.current) return;
    const camTrack = localStreamRef.current.getVideoTracks()[0];
    for (const { connection } of Object.values(peerConnectionsRef.current)) {
      const sender = connection.getSenders().find(s => s.track && s.track.kind === 'video');
      if (sender && camTrack) await sender.replaceTrack(camTrack);
    }
    if (localVideoRef.current) localVideoRef.current.srcObject = localStreamRef.current;
    screenStreamRef.current.getTracks().forEach(t => t.stop());
    screenStreamRef.current = null;
    setIsScreenSharing(false);
  };

  const joinEnteredRoom = () => {
    const id = roomInput.trim();
    if (!id) return;
    navigate(`/video/${id}`);
  };

  const createNewRoom = () => {
    const id = Math.random().toString(36).substring(2, 8);
    navigate(`/video/${id}`);
  };

  return (
    <div className="w-full h-full flex bg-gray-50 dark:bg-gray-900">
      {/* Sidebar */}
      <div className="w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 flex flex-col">
        {/* Back Button */}
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          <button
            onClick={() => navigate('/')}
            className="flex items-center space-x-2 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors"
          >
            <ArrowLeft className="h-5 w-5" />
            <span>Back to Dashboard</span>
          </button>
        </div>

        {/* Room Actions */}
        <div className="p-4 border-b border-gray-200 dark:border-gray-700 space-y-3">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Room</h2>
          <div className="flex items-center space-x-2">
            <input
              className="flex-1 px-2 py-1 rounded border border-gray-300 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              placeholder="Enter room ID"
              value={roomInput}
              onChange={(e) => setRoomInput(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') joinEnteredRoom(); }}
            />
            <button onClick={joinEnteredRoom} className="px-3 py-1 rounded bg-indigo-500 text-white hover:bg-indigo-600">Join</button>
          </div>
          <button onClick={createNewRoom} className="w-full px-3 py-2 rounded bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-600">Create New</button>
          {roomId && (
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600 dark:text-gray-400">Current:</span>
              <div className="flex items-center space-x-2">
                <span className="font-mono text-sm font-medium">{roomId}</span>
                <button onClick={copyRoomId} className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700">
                  <Copy className="h-4 w-4 text-gray-600 dark:text-gray-400" />
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Device Selection */}
        <div className="p-4 border-b border-gray-200 dark:border-gray-700 space-y-3">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Devices</h2>
          <div className="space-y-2">
            <div>
              <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">Camera</label>
              <select
                className="w-full px-2 py-1 rounded border border-gray-300 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                value={selectedCamId || ''}
                onChange={(e) => switchCamera(e.target.value)}
              >
                {videoDevices.map(d => (
                  <option key={d.deviceId} value={d.deviceId}>{d.label || `Camera ${d.deviceId.slice(0,4)}`}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">Microphone</label>
              <select
                className="w-full px-2 py-1 rounded border border-gray-300 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                value={selectedMicId || ''}
                onChange={(e) => switchMicrophone(e.target.value)}
              >
                {audioDevices.map(d => (
                  <option key={d.deviceId} value={d.deviceId}>{d.label || `Mic ${d.deviceId.slice(0,4)}`}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Participants */}
        <div className="flex-1 overflow-y-auto p-4">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Participants</h2>
          <div className="space-y-3">
            <div className="flex items-center space-x-3 p-2 rounded-lg bg-gray-50 dark:bg-gray-700">
              <div className="h-8 w-8 rounded-full bg-indigo-500 flex items-center justify-center">
                <span className="text-white text-sm font-medium">You</span>
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900 dark:text-white">You</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {isMuted ? 'Muted' : 'Unmuted'} • {isVideoOff ? 'Video Off' : 'Video On'} {isScreenSharing ? '• Sharing' : ''}
                </p>
              </div>
            </div>
            {participants.map(peerId => (
              <div key={peerId} className="flex items-center space-x-3 p-2 rounded-lg bg-gray-50 dark:bg-gray-700">
                <div className="h-8 w-8 rounded-full bg-gray-500 flex items-center justify-center">
                  <span className="text-white text-sm font-medium">{peerId.slice(0, 2)}</span>
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900 dark:text-white">Participant {peerId.slice(0, 4)}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Connected</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Additional Controls */}
        <div className="p-4 border-t border-gray-200 dark:border-gray-700 space-y-2">
          <button onClick={startScreenShare} className="w-full flex items-center justify-center space-x-2 px-4 py-2 bg-indigo-500 text-white rounded-lg hover:bg-indigo-600 transition-colors">
            <Share2 className="h-4 w-4" />
            <span>{isScreenSharing ? 'Stop Sharing' : 'Share Screen'}</span>
          </button>
        </div>
      </div>

      {/* Main Video Area */}
      <div className="flex-1 flex flex-col">
        {roomId && showRoomId && (
          <div className="bg-green-100 dark:bg-green-900/20 p-2 text-center text-sm text-green-700 dark:text-green-400">
            Room ID copied to clipboard!
          </div>
        )}

        <div className="flex-1 p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 h-full">
            <div className="relative bg-gray-800 dark:bg-gray-700 rounded-xl overflow-hidden">
              <video
                ref={localVideoRef}
                autoPlay
                playsInline
                muted={true}
                className={`w-full h-full object-cover ${isVideoOff ? 'hidden' : ''}`}
              />
              {isVideoOff && (
                <div className="absolute inset-0 flex items-center justify-center bg-gray-800 dark:bg-gray-700">
                  <div className="h-20 w-20 rounded-full bg-gray-600 dark:bg-gray-600 flex items-center justify-center">
                    <span className="text-2xl font-bold text-white">You</span>
                  </div>
                </div>
              )}
              <div className="absolute bottom-4 left-4 text-white text-sm font-medium">
                You {isMuted && '(Muted)'} {isScreenSharing && '• Sharing'}
              </div>
            </div>

            {participants.map(peerId => (
              <div key={peerId} className="relative bg-gray-800 dark:bg-gray-700 rounded-xl overflow-hidden">
                <video
                  ref={el => { if (el) remoteVideosRef.current[peerId] = el; }}
                  autoPlay
                  playsInline
                  className="w-full h-full object-cover"
                />
                <div className="absolute bottom-4 left-4 text-white text-sm font-medium">
                  Participant {peerId.slice(0, 4)}
                </div>
              </div>
            ))}

            {!isCallActive && participants.length === 0 && (
              <div className="relative bg-gray-800 dark:bg-gray-700 rounded-xl overflow-hidden">
                <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-400 dark:text-gray-500">
                  <p className="text-lg font-medium">No active call</p>
                  <p className="text-sm mt-2">Enter a room ID or create a new room to start</p>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 p-4">
          <div className="max-w-4xl mx-auto">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <button
                  onClick={toggleMute}
                  className={`p-3 rounded-full transition-colors ${
                    isMuted
                      ? 'bg-red-500 text-white hover:bg-red-600'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                  }`}
                >
                  {isMuted ? <MicOff className="h-6 w-6" /> : <Mic className="h-6 w-6" />}
                </button>
                <button
                  onClick={toggleVideo}
                  className={`p-3 rounded-full transition-colors ${
                    isVideoOff
                      ? 'bg-red-500 text-white hover:bg-red-600'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                  }`}
                >
                  {isVideoOff ? <VideoOff className="h-6 w-6" /> : <Video className="h-6 w-6" />}
                </button>
                <button
                  onClick={startScreenShare}
                  className={`p-3 rounded-full transition-colors ${
                    isScreenSharing
                      ? 'bg-indigo-500 text-white hover:bg-indigo-600'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                  }`}
                  title={isScreenSharing ? 'Stop sharing' : 'Share screen'}
                >
                  <MonitorUp className="h-6 w-6" />
                </button>
              </div>

              <div className="flex items-center space-x-4">
                <button
                  onClick={toggleCall}
                  className={`p-4 rounded-full transition-colors ${
                    isCallActive
                      ? 'bg-red-500 text-white hover:bg-red-600'
                      : 'bg-green-500 text-white hover:bg-green-600'
                  }`}
                >
                  {isCallActive ? <PhoneOff className="h-6 w-6" /> : <Phone className="h-6 w-6" />}
                </button>
              </div>

              <div className="flex items-center space-x-4">
                <button className="p-3 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors">
                  <MessageSquare className="h-6 w-6" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default VideoCall;