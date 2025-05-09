import { useState, useRef, useEffect } from 'react';
import { Video, Mic, MicOff, VideoOff, Phone, PhoneOff, Users, MessageSquare, Share2, Copy, ArrowLeft } from 'lucide-react';
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
  
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideosRef = useRef<{ [key: string]: HTMLVideoElement }>({});
  const socketRef = useRef<Socket>();
  const localStreamRef = useRef<MediaStream>();
  const peerConnectionsRef = useRef<{ [key: string]: PeerConnection }>({});

  // Initialize socket connection
  useEffect(() => {
    socketRef.current = io('http://localhost:3001');

    socketRef.current.on('connect', () => {
      console.log('Connected to signaling server');
      if (roomId) {
        socketRef.current?.emit('join-room', roomId);
      }
    });

    socketRef.current.on('user-connected', handleUserConnected);
    socketRef.current.on('user-disconnected', handleUserDisconnected);
    socketRef.current.on('room-users', handleRoomUsers);
    socketRef.current.on('offer', handleOffer);
    socketRef.current.on('answer', handleAnswer);
    socketRef.current.on('ice-candidate', handleIceCandidate);

    return () => {
      socketRef.current?.disconnect();
    };
  }, [roomId]);

  // Initialize local media stream
  useEffect(() => {
    if (isCallActive) {
      // Show loading state
      const initializeMedia = async () => {
        try {
          // First check if we have permission
          const permissions = await navigator.permissions.query({ name: 'camera' });
          const audioPermissions = await navigator.permissions.query({ name: 'microphone' });

          if (permissions.state === 'denied' || audioPermissions.state === 'denied') {
            alert('Please enable camera and microphone access in your browser settings to use video calls.');
            setIsCallActive(false);
            return;
          }

          // Request media with specific constraints
          const stream = await navigator.mediaDevices.getUserMedia({
            video: {
              width: { ideal: 1280 },
              height: { ideal: 720 },
              facingMode: 'user'
            },
            audio: {
              echoCancellation: true,
              noiseSuppression: true,
              autoGainControl: true
            }
          });

          if (localVideoRef.current) {
            localVideoRef.current.srcObject = stream;
            localStreamRef.current = stream;
          }
        } catch (err) {
          console.error('Error accessing media devices:', err);
          let errorMessage = 'Failed to access camera or microphone. ';
          
          if (err instanceof DOMException) {
            switch (err.name) {
              case 'NotFoundError':
                errorMessage += 'No camera or microphone found.';
                break;
              case 'NotAllowedError':
                errorMessage += 'Please allow camera and microphone access in your browser settings.';
                break;
              case 'NotReadableError':
                errorMessage += 'Your camera or microphone is already in use by another application.';
                break;
              default:
                errorMessage += err.message;
            }
          }
          
          alert(errorMessage);
          setIsCallActive(false);
        }
      };

      initializeMedia();
    }

    return () => {
      // Clean up media streams
      if (localStreamRef.current) {
        localStreamRef.current.getTracks().forEach(track => {
          track.stop();
        });
        localStreamRef.current = undefined;
      }
    };
  }, [isCallActive]);

  // Add a function to check device availability
  const checkDevices = async () => {
    try {
      const devices = await navigator.mediaDevices.enumerateDevices();
      const hasVideo = devices.some(device => device.kind === 'videoinput');
      const hasAudio = devices.some(device => device.kind === 'audioinput');

      if (!hasVideo || !hasAudio) {
        alert('Please connect a camera and microphone to use video calls.');
        setIsCallActive(false);
        return false;
      }
      return true;
    } catch (err) {
      console.error('Error checking devices:', err);
      return false;
    }
  };

  const handleUserConnected = (userId: string) => {
    console.log('User connected:', userId);
    createPeerConnection(userId);
  };

  const handleUserDisconnected = (userId: string) => {
    console.log('User disconnected:', userId);
    if (peerConnectionsRef.current[userId]) {
      peerConnectionsRef.current[userId].connection.close();
      delete peerConnectionsRef.current[userId];
    }
    setParticipants(prev => prev.filter(id => id !== userId));
  };

  const handleRoomUsers = (users: string[]) => {
    console.log('Room users:', users);
    setParticipants(users);
    users.forEach(userId => createPeerConnection(userId));
  };

  const createPeerConnection = (peerId: string) => {
    const peerConnection = new RTCPeerConnection({
      iceServers: [
        { urls: 'stun:stun.l.google.com:19302' },
        { urls: 'stun:stun1.l.google.com:19302' }
      ]
    });

    // Add local stream tracks to peer connection
    localStreamRef.current?.getTracks().forEach(track => {
      peerConnection.addTrack(track, localStreamRef.current!);
    });

    // Handle ICE candidates
    peerConnection.onicecandidate = (event) => {
      if (event.candidate) {
        socketRef.current?.emit('ice-candidate', {
          target: peerId,
          candidate: event.candidate
        });
      }
    };

    // Handle incoming streams
    peerConnection.ontrack = (event) => {
      if (remoteVideosRef.current[peerId]) {
        remoteVideosRef.current[peerId].srcObject = event.streams[0];
      }
    };

    peerConnectionsRef.current[peerId] = {
      peerId,
      connection: peerConnection
    };

    // Create and send offer if we're the initiator
    if (participants.length === 0) {
      peerConnection.createOffer()
        .then(offer => peerConnection.setLocalDescription(offer))
        .then(() => {
          socketRef.current?.emit('offer', {
            target: peerId,
            sdp: peerConnection.localDescription
          });
        });
    }

    return peerConnection;
  };

  const handleOffer = async ({ sdp, from }: { sdp: RTCSessionDescriptionInit, from: string }) => {
    const peerConnection = createPeerConnection(from);
    await peerConnection.setRemoteDescription(new RTCSessionDescription(sdp));
    const answer = await peerConnection.createAnswer();
    await peerConnection.setLocalDescription(answer);
    socketRef.current?.emit('answer', {
      target: from,
      sdp: peerConnection.localDescription
    });
  };

  const handleAnswer = async ({ sdp, from }: { sdp: RTCSessionDescriptionInit, from: string }) => {
    const peerConnection = peerConnectionsRef.current[from]?.connection;
    if (peerConnection) {
      await peerConnection.setRemoteDescription(new RTCSessionDescription(sdp));
    }
  };

  const handleIceCandidate = async ({ candidate, from }: { candidate: RTCIceCandidateInit, from: string }) => {
    const peerConnection = peerConnectionsRef.current[from]?.connection;
    if (peerConnection) {
      await peerConnection.addIceCandidate(new RTCIceCandidate(candidate));
    }
  };

  const toggleMute = () => {
    setIsMuted(!isMuted);
    localStreamRef.current?.getAudioTracks().forEach(track => {
      track.enabled = isMuted;
    });
  };

  const toggleVideo = () => {
    setIsVideoOff(!isVideoOff);
    localStreamRef.current?.getVideoTracks().forEach(track => {
      track.enabled = isVideoOff;
    });
  };

  const toggleCall = async () => {
    if (!isCallActive) {
      // Check devices before starting call
      const devicesAvailable = await checkDevices();
      if (!devicesAvailable) return;

      setIsCallActive(true);
      // Generate a random room ID if not provided
      if (!roomId) {
        const newRoomId = Math.random().toString(36).substring(2, 8);
        navigate(`/video/${newRoomId}`);
      }
    } else {
      // Clean up connections when ending call
      Object.values(peerConnectionsRef.current).forEach(({ connection }) => {
        connection.close();
      });
      peerConnectionsRef.current = {};
      setParticipants([]);
      setIsCallActive(false);
    }
  };

  const copyRoomId = () => {
    if (roomId) {
      navigator.clipboard.writeText(roomId);
      setShowRoomId(true);
      setTimeout(() => setShowRoomId(false), 2000);
    }
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

        {/* Room Info */}
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Room Info</h2>
          {roomId && (
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600 dark:text-gray-400">Room ID:</span>
              <div className="flex items-center space-x-2">
                <span className="font-mono text-sm font-medium">{roomId}</span>
                <button
                  onClick={copyRoomId}
                  className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700"
                >
                  <Copy className="h-4 w-4 text-gray-600 dark:text-gray-400" />
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Participants */}
        <div className="flex-1 overflow-y-auto p-4">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Participants</h2>
          <div className="space-y-3">
            {/* Local User */}
            <div className="flex items-center space-x-3 p-2 rounded-lg bg-gray-50 dark:bg-gray-700">
              <div className="h-8 w-8 rounded-full bg-indigo-500 flex items-center justify-center">
                <span className="text-white text-sm font-medium">You</span>
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900 dark:text-white">You</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {isMuted ? 'Muted' : 'Unmuted'} • {isVideoOff ? 'Video Off' : 'Video On'}
                </p>
              </div>
            </div>

            {/* Remote Participants */}
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
        <div className="p-4 border-t border-gray-200 dark:border-gray-700">
          <button className="w-full flex items-center justify-center space-x-2 px-4 py-2 bg-indigo-500 text-white rounded-lg hover:bg-indigo-600 transition-colors">
            <Share2 className="h-4 w-4" />
            <span>Share Screen</span>
          </button>
        </div>
      </div>

      {/* Main Video Area */}
      <div className="flex-1 flex flex-col">
        {/* Room ID Display */}
        {roomId && showRoomId && (
          <div className="bg-green-100 dark:bg-green-900/20 p-2 text-center text-sm text-green-700 dark:text-green-400">
            Room ID copied to clipboard!
          </div>
        )}

        {/* Video Grid */}
        <div className="flex-1 p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 h-full">
            {/* Local Video */}
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
                You {isMuted && '(Muted)'}
              </div>
            </div>

            {/* Remote Videos */}
            {participants.map(peerId => (
              <div key={peerId} className="relative bg-gray-800 dark:bg-gray-700 rounded-xl overflow-hidden">
                <video
                  ref={el => {
                    if (el) remoteVideosRef.current[peerId] = el;
                  }}
                  autoPlay
                  playsInline
                  className="w-full h-full object-cover"
                />
                <div className="absolute bottom-4 left-4 text-white text-sm font-medium">
                  Participant {peerId.slice(0, 4)}
                </div>
              </div>
            ))}

            {/* No Call State */}
            {!isCallActive && participants.length === 0 && (
              <div className="relative bg-gray-800 dark:bg-gray-700 rounded-xl overflow-hidden">
                <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-400 dark:text-gray-500">
                  <p className="text-lg font-medium">No active call</p>
                  <p className="text-sm mt-2">Click the call button to start</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Controls */}
        <div className="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 p-4">
          <div className="max-w-4xl mx-auto">
            <div className="flex items-center justify-between">
              {/* Left Controls */}
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
              </div>

              {/* Center Controls */}
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

              {/* Right Controls */}
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